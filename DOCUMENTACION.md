# Plataforma iTruckr — Documentación para Desarrolladores

Esta guía explica en detalle el funcionamiento interno del repositorio, su arquitectura, el flujo de datos, cómo desarrollar nuevas funcionalidades y buenas prácticas. Está orientada a que un nuevo desarrollador pueda ser productivo rápidamente.


## 1. Descripción general

- Aplicación SPA construida con React + TypeScript y Vite.
- UI con TailwindCSS y componentes Radix/shadcn.
- Estado centralizado con Zustand (stores en `src/stores/`).
- Enrutamiento interno básico por paneles/estado de navegación (no `react-router`).
- Motor de procesos orquestados ("workflows") que simula/hace llamadas a APIs, crea/actualiza entidades y avanza pasos automáticamente o por input del usuario.

Archivos clave:
- `src/App.tsx`: bootstrap de datos demo y layout principal.
- `src/components/ai-assistant/ProcessArea.tsx`: motor de ejecución de pasos del proceso (automatizaciones/reintentos/creación-actualización de entidades/chat).
- `src/processes/processDefinitions.ts`: definición de procesos y sus pasos (Load Process, Oil Change Process).
- `src/stores/*.ts`: stores de dominio (cases, companies, conversations, drivers, loads, emails, notifications, processes, trucks).
- `src/constants.ts`: datos de ejemplo, mensajes predefinidos y emails del flujo.
- `src/types/app.d.ts`: tipos de dominio y contratos de los procesos.
- `vite.config.ts` y `tsconfig.app.json`: configuración del bundler y alias de imports.


## 2. Stack y configuración

- React 18 + TypeScript 5
- Vite 5 (`vite.config.ts`):
  - Alias `@` → `./src`.
  - `base: '/'` (ajústese si se despliega bajo subruta, ver `DEPLOYMENT.md`).
- Tailwind 3 (`tailwind.config.js`, `postcss.config.js`).
- ESLint/Prettier/Husky/Lint-Staged (ver `LINTING.md`).
- Dependencias UI: Radix, `lucide-react`, `react-resizable-panels`, `sonner`.
- Estado: `zustand`.

Scripts (`package.json`):
- `dev`: arranque local con Vite.
- `build`: `tsc -b` + `vite build`.
- `preview`: vista previa de build.
- `lint`, `lint:fix`, `format`, `format:check`, `type-check`.

TypeScript:
- `tsconfig.app.json` define strict mode, JSX, `baseUrl`, `paths` con alias `@/*`.
- Nota: existe `tsconfig.json` con `paths` adicionales; en runtime de app prevalece `tsconfig.app.json`.


## 3. Estructura de carpetas

```
platform-2/
├─ src/
│  ├─ components/
│  │  ├─ ai-assistant/         # UI + ejecución del proceso (timeline, input)
│  │  ├─ layout/               # SideBar, TitleBar, MainContent
│  │  ├─ pages/                # Páginas/Secciones
│  │  └─ ui/                   # Componentes shadcn/radix
│  ├─ contexts/                # Auth, Theme, Navigation
│  ├─ hooks/
│  ├─ lib/
│  ├─ notifications/
│  ├─ processes/               # Definiciones de procesos
│  ├─ stores/                  # Zustand stores
│  ├─ types/                   # Tipos de dominio
│  ├─ constants.ts             # Datos/mensajes/email demo
│  ├─ mock-data.ts             # Datos de demo adicionales
│  ├─ App.tsx, main.tsx, index.css
│  └─ vite-env.d.ts
├─ LINTING.md
├─ DEPLOYMENT.md
├─ README.md
└─ vite.config.ts, tailwind.config.js, eslint.config.js, etc.
```


## 4. Contextos de aplicación

- `src/contexts/AuthContext.tsx`: autenticación simulada. Expone `useAuth()` para saber si el usuario está autenticado; el login muestra `LoginPage` si no lo está.
- `src/contexts/ThemeContext.tsx`: tema (claro/oscuro).
- `src/contexts/NavigationContext.tsx`: estado de navegación de paneles/selecciones.

`App.tsx` envuelve la app con estos providers.


## 5. Stores de dominio (Zustand)

Ubicación: `src/stores/`. Principales métodos por store:

- `casesStore.ts`
  - Crea casos que referencian procesos y entidades relacionadas.
  - `createCase()`, `getCaseById()`, `selectedCaseId`.
- `processesStore.ts`
  - Mantiene procesos y su estado de ejecución: pasos, `currentStepIndex`, mensajes por paso.
  - `getProcessById(id)`, `advanceProcessStep(pid, sid, source)`, `addMessageToStep(pid, sid, userId, senderType, content)`, `updateProcessStepExecution(pid, sid, executionId)`.
- `loadsStore.ts`, `driversStore.ts`, `trucksStore.ts`
  - CRUD de entidades de logística.
  - `addLoad()`, `updateLoad(id, data)`, `addDriver()`, `updateDriver()`, etc.
- `notificationsStore.ts`
  - Cola de notificaciones de negocio.
  - `addNotification()`.
- `emailStore.ts`
  - Buzón simulado de emails (entrantes/salientes), con metadatos y adjuntos.
- `companiesStore.ts`, `conversationsStore.ts`
  - Conversaciones por entidad (`addMessageToConversation(conversationId, message)`).

Utilidades:
- `stores/utils.ts`: `generateId()`, fechas y helpers.


## 6. Tipos de dominio

Archivo: `src/types/app.d.ts`.

- Entidades: `Driver`, `Truck`, `Load`, `Email`, `ConversationMessage`.
- Proceso: `ProcessStep<TStepName>` define el contrato de un paso.
- Enums de pasos: `LoadProcessStepName`, `OilChangeProcessStepName`.
- Configuraciones de acciones por paso:
  - `requiredUserInput`, `nextStepOptions`.
  - `awaitFor`: milisegundos de espera antes de continuar.
  - `triggersApiCall`: `{ endpoint, method, expect }`.
  - `createsEntities`: creación diferida de `load`/`email`/`notification`.
  - `updatesEntities`: actualizaciones sobre `load`/`conversation` con `withDelay` opcional.


## 7. Motor de procesos (Workflows)

- Definiciones en `src/processes/processDefinitions.ts`:
  - `getLoadProcessSteps(step: 1 | 2)`: pasos de un flujo de cargas (búsqueda, negociación, confirmaciones, tránsito, entrega, POD, billing).
  - `getOilChangeProcessSteps()`: flujo de mantenimiento (cambio de aceite) con chat y notificaciones.
  - Cada paso define:
    - `name`, `title`, `status` (pending/completed), `description`.
    - `messages`: mensajes de chat iniciales (agente/usuario).
    - `requiredUserInput` y `nextStepOptions` (para UI de acciones).
    - `awaitFor`: retraso antes de ejecutar efectos automáticos.
    - `triggersApiCall`: endpoint + `expect` para validar respuesta.
    - `createsEntities`: alta de `load`/`email`/`notification`.
    - `updatesEntities`: cambios sobre `load`/`driver`/`conversation`.
    - `lucideIcon`: icono de UI.

- Ejecutor en `src/components/ai-assistant/ProcessArea.tsx`:
  - Observa `process.currentStepIndex` y ejecuta efectos del paso actual.
  - Evita re-ejecuciones con `executionId` por paso (`updateProcessStepExecution`).
  - Acciones por paso (orden):
    1) `createsEntities` (no bloqueante; puede tener `withDelay`).
    2) Si hay `triggersApiCall`: muestra loading, espera `awaitFor` (si existe) y hace fetch al `endpoint`.
       - Compara `response.json()` con `expect` usando `deepEqual`.
       - Si coincide: aplica `updatesEntities`, avanza paso y apaga loading.
       - Si no: reintenta cada 10s, hasta 60 veces (backoff simple).
    3) Si no hay API pero hay `awaitFor`: espera, hace `updatesEntities` y avanza.
    4) Si nada requiere input: aplica `updatesEntities`, espera mínima, y avanza.
  - Aislamiento de estado de carga por proceso (`loadingByProcess[process.id]`) para evitar fugas entre casos.
  - Maneja actualizaciones de conversaciones: calcula `senderType`/`senderId` si falta y enruta al `conversationId` correcto.
  - Expone `completeStep` que puede llamar el timeline o la UI (acciones del usuario).

- Mensajería en pasos:
  - `addMessageToStep(pid, sid, userId, senderType, content)` agrega mensajes del usuario o del agente.
  - `handleSendMessage()` en `ProcessArea.tsx` simula respuesta del agente con mensajes predefinidos.


## 8. Carga de datos de demo y notificaciones

`src/App.tsx`:
- Al autenticarse, crea compañías, trucks y drivers demo (`TRUCK_1`, `DRIVER_1`, etc. de `constants.ts`).
- Pre-carga un caso realista para el driver Robert con un proceso y fija el paso actual.
- Agenda notificaciones simuladas:
  - Notificación para iniciar nuevo proceso de carga a los 15s (`NotificationDefinitions.createNewLoadProcess`).
  - Notificación de cambio de aceite a los 5s (`creatOilChangeNotification`).
- Crea conversaciones iniciales para drivers.


## 9. UI principal y navegación

- `src/components/layout/SideBar.tsx`, `TitleBar.tsx`, `MainContent.tsx`: layout base y contenedores.
- `src/components/ai-assistant/`:
  - `IntegratedProcessTimeline`: visualiza pasos y permite completar los que requieren input.
  - `ProcessInput`: entrada de chat/acciones.
  - `ProcessArea.tsx`: renderiza timeline, input y ejecuta el motor del proceso.


## 10. Emails y adjuntos

- `src/emailStore.ts`: gestiona emails con flags (`isRead`, `isSent`, `hasAttachments`, etc.) y adjuntos.
- `src/constants.ts` define plantillas:
  - `EMAIL_RATECON_INBOUND_STEP_5`, `EMAIL_RATECON_OUTBOUND_STEP_7`, `EMAIL_POD_OUTBOUND_STEP_10`.
- `createsEntities` en pasos puede generar emails con adjuntos (por ejemplo POD.pdf/JPEG) que se ven en el buzón.


## 11. Notificaciones de negocio

- `src/notifications/notificationDefinitions.ts` (si aplica) y `notificationsStore.ts`:
  - Crear notificaciones con: `addNotification({ userId, step, type, title, message, relatedEntityType, relatedEntityId })`.
  - En procesos: `createsEntities` puede emitir notificaciones dirigidas a la entidad relacionada del caso o al driver actual.


## 12. Cómo ejecutar localmente

1) Requisitos: Node 18+.
2) Instalar deps: `npm install`.
3) Desarrollo: `npm run dev`.
4) Compilar: `npm run build`.
5) Previsualizar build: `npm run preview`.

Ver `DEPLOYMENT.md` para despliegue (GitHub Pages) y base URL.


## 13. Linting, formato y convenciones

- Ver `LINTING.md` para reglas ESLint, Prettier y hooks de Husky.
- Recomendado antes de commit:
  - `npm run lint:fix`
  - `npm run format`
  - `npm run type-check`


## 14. Extender el sistema

### 14.1. Agregar un nuevo proceso
1) Definir pasos en `src/processes/*.ts` (o en un archivo nuevo) exportando una función tipo `getXProcessSteps()` que devuelva `ProcessStep<YourStepName>[]`.
2) Tipar `YourStepName` en `src/types/app.d.ts`.
3) Cada paso puede incluir:
   - `messages`: mensajes iniciales (agente/usuario) si aplica.
   - `requiredUserInput` + `nextStepOptions` para acciones en UI.
   - `awaitFor` para esperas temporizadas.
   - `triggersApiCall` si requiere polling de un webhook/servicio externo con validación `expect`.
   - `createsEntities` y `updatesEntities` para efectos de dominio.
4) Crear un `case` que instancie un `process` con esos pasos usando `processesStore`.
5) Probar en UI: al seleccionar el caso, `ProcessArea` ejecutará los pasos.

### 14.2. Integrar una API real
- En `triggersApiCall` de un paso, especificar:
  ```ts
  triggersApiCall: {
    endpoint: 'https://tu-servicio/webhook',
    method: 'GET' | 'POST',
    expect: { message: 'ok' },
  }
  ```
- `ProcessArea` hará fetch y comparará el JSON de respuesta con `expect` (igualdad profunda). Si no coincide, reintenta cada 10s hasta 60 veces.
- Para manejar autenticación/cabeceras, expandir el `fetch` en `performApiCall()` (añadir headers/token) o inyectar un cliente.

### 14.3. Crear/actualizar entidades desde pasos
- `createsEntities`: crea `load`, `email` o `notification`. Soporta `withDelay`.
- `updatesEntities`: modifica `load`, `driver` o envía mensajes a `conversation`.
  - Para `conversation` sin `entityId`, el sistema resuelve el ID objetivo a partir del caso o driver asociado.

### 14.4. Evitar re-ejecución de efectos
- Cada paso marca `executionId = "${process.id}-${step.id}-${process.currentStepIndex}"` mediante `updateProcessStepExecution()`.
- Si un effect se vuelve a montar, `ProcessArea` detecta `executionId` ya aplicado y no re-ejecuta.

### 14.5. Personalizar UI de acciones por paso
- Use `requiredUserInput` y `nextStepOptions` en el paso. `IntegratedProcessTimeline` y `ProcessArea` permiten completar pasos manualmente llamando a `advanceProcessStep()` o `completeStep()`.


## 15. Buenas prácticas

- Mantener lógica de orquestación en definiciones de proceso y en el ejecutor (`ProcessArea`), no en componentes de presentación.
- Declarar efectos de dominio (crear/actualizar entidades) vía `createsEntities`/`updatesEntities` para que el motor pueda secuenciarlos y reintentar APIs.
- Mantener stores simples y tipados; no mezclar efectos de red en stores.
- Para datos reales, sustituir mock/constantes por servicios y controlar errores en `performApiCall`.
- Añadir logs claros para depuración (ya hay `console.log` estratégicos).


## 16. Solución de problemas

- "No avanza el paso": verificar `requiredUserInput`/acciones o que el `expect` del webhook coincida con la respuesta real.
- "Reintenta indefinidamente": ajustar `expect`, endpoint o revisar CORS/errores en red.
- "Mensajes no aparecen": confirmar `conversationId` resuelto y `senderType/senderId`.
- "Estados no cambian": revisar `updatesEntities` y que IDs (`entityId`) existan.


## 17. Roadmap sugerido

- Extraer `performApiCall()` a un servicio con cancelación y backoff exponencial.
- Añadir tests unitarios de stores y del motor de procesos.
- Internacionalización (i18n) de UI y mensajes.
- Persistencia (localStorage o backend real) de stores.
- Integrar router si crece la navegación.


## 18. Referencias

- `src/App.tsx`: bootstrap y timers de notificaciones.
- `src/components/ai-assistant/ProcessArea.tsx`: ejecución de pasos, chat, reintentos.
- `src/processes/processDefinitions.ts`: contratos de pasos y ejemplos reales.
- `src/stores/*.ts`: API de estado por dominio.
- `src/constants.ts`: mensajes/emails/loads demo.
- `DEPLOYMENT.md` y `LINTING.md`.
