import {
  BadgeDollarSign,
  UserCheck,
  ClipboardCheck,
  Truck,
  PackageCheck,
  ArrowRight,
  MapPin,
  FileUp,
  Check,
  AlertTriangle,
  Search,
  CheckCircle2,
  PackageSearch,
  PackagePlus,
  Mail,
  CalendarPlus,
  BellRing,
  RefreshCcw
} from 'lucide-react'

import {
  ProcessStep,
  LoadProcessStepName,
  OilChangeProcessStepName,
  Email,
  Load,
} from "../types/app";
import { generateId, getCurrentIsoDate } from "../stores/utils"; // Assuming utils.ts is in store folder
import { DRIVER_1, EMAIL_POD_STEP_10, EMAIL_RATECON_STEP_4, LOAD_2, MessageDriver3LoadProcess, MessageStep1LoadProcess, MessageStep3LoadProcess } from '@/constants';

/**
 * Generates the initial steps for a Load Process.
 * @returns An array of ProcessStep objects specific to a Load Process.
 */
export function getLoadProcessSteps(): ProcessStep<LoadProcessStepName>[] {
  return [
    {
      id: generateId(),
      name: "waiting_dispatcher_confirmation",
      title: "Dispatcher Confirmation",
      status: "pending",
      description: "Driver D-158 is near their destination. A new load search can start.",
      messages: [
        {
          id: '001',
          senderId: 'system',
          senderType: 'system',
          content: MessageStep1LoadProcess,
          timestamp: getCurrentIsoDate()
        }
      ],
      aiAgentAssigned: "Operations Agent",
      requiredUserInput: ["review_load_details", "accept_or_decline"],
      nextStepOptions: [
        { label: "Accept Search", action: "complete_step", data: { actionType: "accept_load" } },
        { label: "Decline Search", action: "complete_step", data: { actionType: "decline_load" } },
      ],
      startedAt: "",
      lucideIcon: PackagePlus,
    },
    {
      id: generateId(),
      name: "looking_for_loads",
      title: "Looking for Loads",
      status: "pending",
      description: "The load search is active, based on the driver's preferences and location.",
      messages: [],
      aiAgentAssigned: "Rate Negotiator",
      // awaitFor: 1000,
      triggersApiCall: {
        endpoint: "https://itruckrlabs.app.n8n.cloud/webhook/gestion-llamadas",
        method: "GET",
        expect: { status_call: "call ended" }
      },
      startedAt: "",
      lucideIcon: PackageSearch
    },
    {
      id: generateId(),
      name: "load_booked",
      title: "Load Booked",
      status: "completed",
      description: "A load matching the driver's preferences & location has been found and it has been booked.",
      messages: [
        {
          id: '001',
          senderId: 'system',
          senderType: 'system',
          content: MessageStep3LoadProcess,
          timestamp: getCurrentIsoDate()
        }
      ],
      requiredUserInput: ["review_load_details", "accept_or_decline"],
      nextStepOptions: [
        { label: "Confirm Load", action: "complete_step", data: { actionType: "accept_load" } },
        { label: "Decline Load", action: "complete_step", data: { actionType: "decline_load" } },
      ],
      aiAgentAssigned: "Operations Agent",
      createsEntities: [{
        entityType: "load",
        newEntity: LOAD_2 as Load
      }],
      startedAt: "",
      lucideIcon: Search
    },
    {
      id: generateId(),
      name: "waiting_rate_confirmation",
      title: "Waiting for Rate Confirmation",
      status: "pending",
      description: "Awaiting final rate confirmation from the broker.",
      messages: [],
      aiAgentAssigned: "Rate Negotiator",
      // awaitFor: 1000,
      triggersApiCall: {
        endpoint: "https://itruckrlabs.app.n8n.cloud/webhook/arrived-rateconfirmation",
        method: "GET",
        expect: { message: "message sent" }
      },
      startedAt: "",
      lucideIcon: BadgeDollarSign
    },
    {
      id: generateId(),
      name: "load_confirmed_broker",
      title: "Rate Confirmation Received",
      status: "pending",
      description: "Load details confirmed with the broker. Ready for driver assignment.",
      messages: [],
      aiAgentAssigned: "Operations Agent",
      createsEntities: [
        {
          entityType: "email", //Recibe ratecon
          newEntity: EMAIL_RATECON_STEP_4 as Email
        },
        {
          entityType: "email", // Se le responde al broker
          newEntity: EMAIL_RATECON_STEP_4 as Email // RESPUESTA al broker
        }
      ],
      updatesEntities: [
        {
          entityType: "load",
          entityId: LOAD_2.id,
          updateData: { status: "confirmed" },
        },
      ],
      startedAt: "",
      lucideIcon: CheckCircle2
    },
    {
      id: generateId(),
      name: "waiting_driver_confirmation",
      title: "Waiting for Driver Confirmation",
      status: "pending",
      description: "Driver has been notified and is expected to confirm the load.",
      messages: [],
      aiAgentAssigned: "Operations Agent",
      awaitFor: 30000,
      updatesEntities: [
        {
          entityType: "conversation",
          entityId: "",
          updateData: {
            message: MessageDriver3LoadProcess,
            senderId: 'agent',
            senderType: 'agent'
          },
        },
        {
          entityType: "conversation",
          entityId: "",
          updateData: {
            senderId: 'D-158',
            senderType: 'user',
            message: "Confirmed!",
          },
          withDelay: 5000
        },
      ],
      startedAt: "",
      lucideIcon: UserCheck
    },
    {
      id: generateId(),
      name: "load_confirmed_driver",
      title: "Load Confirmed with Driver",
      status: "pending",
      description: "Driver has confirmed the load. Preparing for pickup.",
      messages: [],
      aiAgentAssigned: "Operations Agent",
      startedAt: "",
      lucideIcon: ClipboardCheck
    },
    {
      id: generateId(),
      name: "in_transit_pickup",
      title: "In Transit to Pickup",
      status: "pending",
      description: "Driver is en route to the pickup location.",
      messages: [],
      aiAgentAssigned: "General Assistant",
      updatesEntities: [
        {
          entityType: "load",
          entityId: LOAD_2.id,
          updateData: { status: "in_transit" },
        },
      ],
      startedAt: "",
      lucideIcon: Truck
    },
    {
      id: generateId(),
      name: "at_pickup_location",
      title: "At Pickup Location",
      status: "pending",
      description: "Driver has arrived at the pickup location.",
      messages: [],
      aiAgentAssigned: "General Assistant",
      startedAt: "",
      lucideIcon: MapPin
    },
    {
      id: generateId(),
      name: "load_picked_up",
      title: "Load Picked Up",
      status: "pending",
      description: "Cargo has been successfully picked up by the driver.",
      messages: [],
      aiAgentAssigned: "General Assistant",
      startedAt: "",
      lucideIcon: PackageCheck
    },
    {
      id: generateId(),
      name: "in_transit_delivery",
      title: "In Transit to Delivery",
      status: "pending",
      description: "Driver is en route to the delivery location with the cargo.",
      messages: [],
      aiAgentAssigned: "General Assistant",
      startedAt: "",
      lucideIcon: ArrowRight
    },
    {
      id: generateId(),
      name: "at_delivery_location",
      title: "At Delivery Location",
      status: "pending",
      description: "Driver has arrived at the delivery location.",
      messages: [],
      // awaitFor: 1000,
      triggersApiCall: {
        endpoint: "https://itruckrlabs.app.n8n.cloud/webhook/submitted-image",
        method: "GET",
        expect: { message: "Email POD Accepted" }
      },
      aiAgentAssigned: "General Assistant",
      startedAt: "",
      lucideIcon: MapPin
    },
    {
      id: generateId(),
      name: "document_upload_pending",
      title: "POD Received",
      status: "completed",
      description: "Proof of Delivery document have been sent by the driver.",
      messages: [],
      awaitFor: 1000,
      createsEntities: [{
        entityType: "email",
        newEntity: EMAIL_POD_STEP_10 as Email
      }],
      updatesEntities: [
        {
          entityType: "conversation",
          entityId: "",
          updateData: { message: "I've arrived. Attaching POD", senderId: 'D-158', senderType: 'user' },
        },
        {
          entityType: "conversation",
          entityId: "",
          updateData: { message: "Image", senderId: 'D-158', senderType: 'user' },
        },
        {
          entityType: "conversation",
          entityId: "",
          updateData: { message: "### POD Received & Validated", senderId: 'system', senderType: 'system' },
          withDelay: 2000
        },
      ],
      aiAgentAssigned: "Operations Agent",
      startedAt: "",
      lucideIcon: FileUp
    },
    {
      id: generateId(),
      name: "load_completed",
      title: "Load Completed",
      status: "pending",
      description: "The load process has been successfully completed and billed.",
      messages: [],
      aiAgentAssigned: "General Assistant",
      createsEntities: [{ entityType: 'notification' }],
      updatesEntities: [
        {
          entityType: "load",
          entityId: LOAD_2.id,
          updateData: { status: "billed" },
        },
        {
          entityType: "driver",
          entityId: DRIVER_1.id,
          updateData: { currentLoadId: null, status: "available" },
        },
      ],
      startedAt: "",
      lucideIcon: Check
    },
  ];
}

/**
 * Generates the initial steps for a Road Emergency Process.
 * @returns An array of ProcessStep objects specific to a Road Emergency Process.
 */
export function getOilChangeProcessSteps(): ProcessStep<OilChangeProcessStepName>[] {
  return [
    {
      id: generateId(),
      name: "oil_change_needed",
      title: "Oil Change Needed",
      status: "pending",
      description: "The system has detected that an oil change is due for a truck based on mileage or time.",
      messages: [
        {
          id: "001",
          senderId: "system",
          senderType: "system",
          timestamp: getCurrentIsoDate(),
          content: "# Maintenance Alert: Oil Change Due",
        },
      ],
      aiAgentAssigned: "Maintenance Support Agent",
      updatesEntities: [
        {
          entityType: "Truck", // Assuming a 'Truck' entity
          entityId: "",
          updateData: { maintenanceStatus: "oil_change_due" },
        },
      ],
      lucideIcon: AlertTriangle,
      startedAt: ''
    },
    {
      id: generateId(),
      name: "initial_driver_notification_sent",
      title: "Driver Notified",
      status: "pending",
      description: "An automated notification has been sent to the truck driver regarding the upcoming oil change.",
      messages: [],
      aiAgentAssigned: "Maintenance Support Agent",
      // triggersApiCall: {
      //   endpoint: "https://itruckrlabs.app.n8n.cloud/webhook/gestion-llamadas",
      //   method: "GET",
      //   expect: { status_call: "call ended" }
      // },
      lucideIcon: Mail,
      startedAt: ''
    },
    {
      id: generateId(),
      name: "scheduling_appointment",
      title: "Looking for near Workshops",
      status: "pending",
      description: "The process of finding and booking a suitable oil change appointment for the truck.",
      messages: [],
      aiAgentAssigned: "Maintenance Support Agent",
      // triggersApiCall: {
      //   endpoint: "/api/appointments/find_slots",
      //   method: "GET",
      //   data: { truckId: "${truckId}", serviceType: "oil_change" },
      // },
      lucideIcon: CalendarPlus,
      startedAt: ''
    },
    {
      id: generateId(),
      name: "driver_notified_of_appointment",
      title: "Driver Notified of Appointment",
      status: "pending",
      description: "The truck driver has been informed about the details of the confirmed oil change appointment.",
      messages: [],
      aiAgentAssigned: "Maintenance Support Agent",
      // triggersApiCall: {
      //   endpoint: "/api/notifications/send",
      //   method: "POST",
      //   data: {
      //     recipient: "${driverId}",
      //     type: "appointment_details",
      //     message: "Your oil change is scheduled for [Date] at [Time] at [Location].",
      //   },
      // },
      lucideIcon: BellRing,
      startedAt: ''
    },
    {
      id: generateId(),
      name: "service_in_progress",
      title: "Driver at Workshop Location",
      status: "pending",
      description: "The Driver is currently at Total Truck Care and Maintenance Montgomery, IL",
      messages: [],
      aiAgentAssigned: "Maintenance Support Agent",
      updatesEntities: [
        {
          entityType: "Truck",
          entityId: "${truckId}",
          updateData: { locationStatus: "at_service_center" },
        },
      ],
      lucideIcon: RefreshCcw,
      startedAt: ''
    },
    {
      id: generateId(),
      name: "service_completed",
      title: "Invoice Received & Oil Change Confirmed",
      status: "pending",
      description: "The oil change service has been successfully completed.",
      messages: [],
      aiAgentAssigned: "Maintenance Support Agent",
      updatesEntities: [
        {
          entityType: "Truck",
          entityId: "${truckId}",
          updateData: { maintenanceStatus: "oil_change_done", lastOilChange: getCurrentIsoDate() },
        },
      ],
      lucideIcon: CheckCircle2,
      startedAt: ''
    },
  ];
}

/**
 * 
 * 1. Se crea el caso
 * 2. Driver Notified. Se le escribe al driver y le pregunta si quiere buscar &  El Driver confirma que quiere que le busquen un workshop
 * 3. Looking for near Workshops & Trigger de la llamada.
 * 4. Oil Change Appointment Confirmend
 * 5. Driver Notified of Appointment
 * 6. Driver at Workshop Location | Total Truck Care and Maintenance Montgomery, IL
 * 7. Invoice Received & Oil Change Confirmed | New Load for Driver
 * 
 */