import React, { createContext, useContext, useState } from 'react';

type Page =
  | 'itruckr'
  | 'loadboard'
  | 'chat'
  | 'email'
  | 'loads'
  | 'payments'
  | 'registration';

interface NavigationContextType {
  activePage: Page;
  setActivePage: (page: Page) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activePage, setActivePage] = useState<Page>('itruckr');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <NavigationContext.Provider
      value={{
        activePage,
        setActivePage,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
