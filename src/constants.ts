import { generateId, getCurrentIsoDate } from './stores/utils';
import { ChatMessage, Driver, Email, Load, Truck } from './types/app';

export const LOAD_PROCESS_STEP_1_AGENT_MESSAGE = {
  id: '001',
  senderId: 'ai_agent',
  senderType: 'ai_agent',
  timestamp: getCurrentIsoDate(),
  content: `## Current Load Details

Here are the details of booked load:

### ℹ️ General Information
| Parameter | Value |
|---|---|
| **Load Number** | 31724985 |
| **Load Status** | ACTIVE |
| **Miles** | 760 |
| **Total Load Value** | $1521 |
| **Weight of the Load** | 46,600 lbs |
| **Broker Name** | PLS |
| **Trailer Type** | OTHER |

### ⬆️ Pickup Details
| Parameter | Value |
|---|---|
| **Contact** | RTW LOGISTICS INC |
| **Pickup Date** | July 25, 2025 |
| **Pickup Window** | 08:00 - 15:00 |
| **Address** | 8203 Fischer Road, Baltimore, MD, 21222 |

### ⬇️ Delivery Details
| Parameter | Value |
|---|---|
| **Contact** | Tsa Processing - Montgomery |
| **Delivery Date** | July 30, 2025 |
| **Delivery Window** | 08:00 - 15:00 |
| **Address** | 325 S Route 31 Suite G103 Building G, Montgomery, IL, 60538 |`,
} as ChatMessage;

export const LOAD_PROCESS_STEP_3_AGENT_MESSAGE = {
  id: '002',
  senderId: 'ai_agent',
  senderType: 'ai_agent',
  timestamp: getCurrentIsoDate(),
  content: `## Current Load Details

Here are the details of booked load:

### ℹ️ General Information
| Parameter | Value |
|---|---|
| **Load Number** | 31724985 |
| **Load Status** | ACTIVE |
| **Miles** | 760 |
| **Total Load Value** | $1521 |
| **Weight of the Load** | 46,600 lbs |
| **Broker Name** | PLS |
| **Trailer Type** | OTHER |

### ⬆️ Pickup Details
| Parameter | Value |
|---|---|
| **Contact** | RTW LOGISTICS INC |
| **Pickup Date** | July 25, 2025 |
| **Pickup Window** | 08:00 - 15:00 |
| **Address** | 8203 Fischer Road, Baltimore, MD, 21222 |

### ⬇️ Delivery Details
| Parameter | Value |
|---|---|
| **Contact** | Tsa Processing - Montgomery |
| **Delivery Date** | July 30, 2025 |
| **Delivery Window** | 08:00 - 15:00 |
| **Address** | 325 S Route 31 Suite G103 Building G, Montgomery, IL, 60538 |`,
} as ChatMessage;

export const LOAD_PROCESS_STEP_3_AGENT_CHAT_MESSAGE = {
  senderId: 'ai_agent',
  senderType: 'ai_agent',
  content: `Hi Camilo,

You’ve been assigned a new load. Please review the details below

**ℹ️ General Information**
* **Truck Assigned:** #[Truck Number]
* **Commodity:** 3 Stainless Steel Coils
* **Weight:** 46600.00 Lbs
* **Miles:** 760.00
* **Rate:** $1521.00

**⬆️ Pickup Details**
* **Contact:** RTW LOGISTICS INC
* **Address:** 8203 Fischer Road, BALTIMORE, MD, 21222
* **Date:** 07/07/2025 08:00
* **Pickup Window:** 8:00 - 15:00

**⬇️ Delivery Details**
* **Name:** Tsa Processing - Montgomery
* **Address:** 325 S Route 31, Suite G103 Building G, MONTGOMERY, IL, 60538
* **Delivery Date:** 07/08/2025 15:00
* **Delivery Window:** 08:00 - 15:00

**📋 Special Instructions**

[Insert any notes here like appointment required, lumpers, or FCFS]

---

Let us know if you have any issues. Drive safe!`,
};

export const LOAD_PROCESS_STEP_6_DRIVER_CHAT_MESSAGE = {
  senderId: 'D-158',
  senderType: 'user',
  content: 'Confirmed!',
};

export const LOAD_PROCESS_STEP_13_DRIVER_CHAT_MESSAGE_1 = {
  senderId: 'D-158',
  senderType: 'user',
  content: "I've arrived. Attaching POD",
};

export const LOAD_PROCESS_STEP_13_DRIVER_CHAT_MESSAGE_2 = {
  senderId: 'D-158',
  senderType: 'user',
  content: 'POD',
};

export const LOAD_PROCESS_STEP_13_AGENT_CHAT_MESSAGE = {
  senderId: 'system',
  senderType: 'system',
  content: 'POD Received & Validated',
};

export const OIL_CHANGE_STEP_1_AGENT_MESSAGE =
  'Hi John Smith, your truck is due for a routine oil change. Want me to help you find a nearby workshop?		';
export const OIL_CHANGE_STEP_2_DRIVER_MESSAGE = 'YES';
export const OIL_CHANGE_STEP_2_AGENT_MESSAGE =
  'Great. I’m checking for workshops near your current location 	';
export const OIL_CHANGE_STEP_3_AGENT_MESSAGE_1 = `Appointment confirmed for 3:00 pm. 

PTR Truck Repair
1415 Bohr Ave, Montgomery, IL 60538"				
				
Location:
<a href="https://maps.app.goo.gl/J6LuzUTeTD6MGJeD8">https://maps.app.goo.gl/J6LuzUTeTD6MGJeD8</a>
`;
export const OIL_CHANGE_STEP_3_AGENT_MESSAGE_2 =
  'All set! Just send me the invoice when you’re finished';
export const OIL_CHANGE_STEP_4_DRIVER_MESSAGE = 'Invoice';

export const EMAIL_RATECON_INBOUND_STEP_5 = {
  id: generateId(),
  subject: 'Rate Confirmation',
  content: `Hello, attached Rate Confirmation.

Please provide Drivers info:

&nbsp;

Name:

Phone Number:

Truck Number:

Trailer Number:

City of previous delivery:

&nbsp;

**Please note: Driver must accept Macro Point to Avoid a Fine**

&nbsp;

DRIVER MUST BE ON TIME ON HIS PU AND DELIVER APPT.`,
  sender: { name: 'iTruckr', email: 'itruckr.testing@gmail.com' },
  recipients: ['inbound@itruckrapp.com'],
  cc: [],
  bcc: [],
  timestamp: new Date(Date.now()).toISOString(),
  isRead: false,
  isStarred: true,
  isArchived: false,
  isDeleted: false,
  isSent: false,
  isDraft: false,
  hasAttachments: true,
  attachments: [
    {
      name: '31724985_rate_agreement_doc_1751571688731.pdf',
      size: '142kb',
      type: 'application/pdf',
      url: '/31724985_rate_agreement_doc_1751571688731.pdf',
    },
  ],
  preview: 'Rate Confirmation',
  threadId: '001',
  labels: ['Rate Confirmation'],
} as Email;

export const EMAIL_RATECON_OUTBOUND_STEP_7 = {
  id: generateId(),
  subject: 'Rate Confirmation',
  content: `Please see Driver's information below:

&nbsp;

Name: John Smith

Phone Number: 9543093895

Truck Number: 58

Trailer Number: 745

City of previous delivery: Washington, DC

---

Refer to the details of the Rate Confirmation:

Invoice Number: 31724985

Total: 1521.00

Description: 3 Stainless Steel Coils

Rate: 1521.00

Quantity: 3

Facility: RTW LOGISTICS INC

Earliest: 07/07/2025 08:00

Latest: 07/07/2025 15:00

Origin: 8203 Fischer Road, Baltimore, Maryland, 21222

Destination: 325 S Route 31, Suite G103 Building G, Montgomery, Illinois, 60538

Size: Flatbed

MC: 4132509

Dispatcher: CAROLINA ESPINOSA ARAMBURO

Phone: (754) 305-9234`,
  sender: { name: 'iTruckr', email: 'inbound@itruckrapp.com' },
  recipients: ['itruckr.testing@gmail.com'],
  cc: [],
  bcc: [],
  timestamp: new Date(Date.now()).toISOString(),
  isRead: true,
  isStarred: true,
  isArchived: false,
  isDeleted: false,
  isSent: true,
  isDraft: false,
  hasAttachments: false,
  attachments: [],
  preview: 'Rate Confirmation',
  threadId: '001',
  labels: ['Rate Confirmation'],
} as Email;

export const EMAIL_POD_OUTBOUND_STEP_10 = {
  id: generateId(),
  subject: 'POD Accepted',
  content: 'Your load was successfully delivered.',
  sender: { name: 'iTruckr', email: 'inbound@itruckrapp.com' },
  recipients: ['itruckr.testing@gmail.com'],
  cc: [],
  bcc: [],
  timestamp: new Date(Date.now()).toISOString(),
  isRead: true,
  isStarred: false,
  isArchived: false,
  isDeleted: false,
  isSent: true,
  isDraft: false,
  hasAttachments: false,
  attachments: [],
  preview:
    'We are pleased to inform you that your load with the following details has been successfully delivered.',
  threadId: generateId(),
  labels: ['Load'],
} as Email;

export const TRUCK_1 = {
  id: 'T-001',
  type: 'dry_van',
  licensePlate: 'ABC-123',
  capacity: {
    weightLbs: 80000,
    volumeCubicFt: 3000,
  },
  companyId: 'C-001',
  status: 'in_transit',
} as Truck;

export const DRIVER_1 = {
  id: 'D-158',
  name: 'John Smith',
  email: 'john@example.com',
  phone: '(555) 123-4567',
  companyId: 'C-001',
  licenseNumber: 'DL123456789',
  truckId: 'T-001',
  isInsuranceValid: true,
  remainingDrivingHours: 8,
  currentLocation: {
    city: 'Philadelphia',
    state: 'PA',
  },
  status: 'in_transit',
  currentLoadId: null,
  nextLoadId: null,
  driverPreferences: {
    expectedRatePerMile: 2.5,
    lowestRatePerMile: 2.0,
    maxDrivingDistanceMiles: 500,
    preferredStateDestinations: ['SC', 'NC', 'GA'],
    bannedStateDestinations: ['TX', 'LA'],
    acceptWeekendDelivery: true,
    acceptOvernightLoads: false,
    maxLayoverHours: 24,
    requiresLoadingAssistance: false,
    preferredPickupTimeRanges: ['08:00-12:00'],
    preferredDeliveryTimeRanges: ['09:00-17:00'],
  },
} as Driver;

export const LOAD_1 = {
  externalLoadId: 'L-2024-001',
  driverId: 'D-158',
  status: 'in_transit',
  dropOffLocation: {
    city: 'Jersey City',
    state: 'NJ',
    zipCode: '07302',
  },
  pickUpLocation: {
    city: 'Orlando',
    state: 'FL',
    zipCode: '32801',
  },
  pickUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  deliveryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
  brokerCompanyId: 'B-001',
  carrierCompanyId: 'c-001',
  factoring: false,
  rate: {
    total: 2450,
    currency: 'USD',
    ratePerMile: 2.45,
  },
  paymentTerms: 'Net 30',
  weightLbs: 45000,
  cargoDescription: 'Electronics',
  specialInstructions: 'Handle with care',
} as Load;

export const LOAD_2 = {
  externalLoadId: 'L-2024-002',
  driverId: 'D-158',
  status: 'new',
  pickUpLocation: {
    city: 'Baltimore',
    state: 'MD',
    zipCode: '21222',
    address: '8203 Fischer Road',
  },
  dropOffLocation: {
    city: 'Montgomery',
    state: 'IL',
    zipCode: '60538',
    address: '325 S Route 31 Suite G103 Building G',
  },
  pickUpDate: 'July 25, 2025',
  deliveryDate: 'July 30, 2025',
  brokerCompanyId: 'B-001',
  carrierCompanyId: 'c-001',
  factoring: false,
  rate: {
    total: 1521,
    currency: 'USD',
    ratePerMile: 1.96,
  },
  weightLbs: 46600,
} as Load;
