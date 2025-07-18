import { generateId } from "./stores/utils";
import { Driver, Email, Load, Truck } from "./types/app"

export const MessageStep1LoadProcess = `## Load Search Configuration

Your load search has been configured with the following parameters:

### 💰 Rate Requirements
| Parameter | Value |
|-----------|-------|
| **Expected Rate** | $2.50/mile |
| **Minimum Rate** | $2.00/mile |

### 🚛 Equipment & Capacity
| Parameter | Value |
|---|---|
| **Truck Type** | Dry Van |
| **Max Weight** | 38.0000 lbs |
| **Insurance Status** | ✅ Valid |

### ⏰ Availability & Schedule
| Parameter | Value |
|---|---|
| **Remaining Hours** | 12 hours |
| **Max Distance** | 500 miles |
| **Weekend Delivery** | ✅ Yes |
| **Overnight Loads** | ✅ Yes |
| **Max Layover** | 24 hours |

### 📍 Location Preferences
| Parameter | Value |
|---|---|
| **Current Location** | Savana, GA |
| **Preferred Destinations** | SC, NC, GA |
| **Banned States** | TX, LA |

### ⚙️ Operational Preferences
| Parameter | Value |
|---|---|
| **Loading Assistance** | Not Required |
| **Preferred Pickup Times** | 08:00-12:00 |
| **Preferred Delivery Times** | 09:00-17:00 |

---

**Ready to search for loads matching these criteria. Please approve to proceed with the load search.**`

export const MessageStep3LoadProcess = `## Current Load Details

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
| **Address** | 325 S Route 31 Suite G103 Building G, Montgomery, IL, 60538 |`

export const MessageDriver3LoadProcess = `Hi Camilo,

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

Let us know if you have any issues. Drive safe!`

export const emailTemplate = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
                <header>
                    <div style="max-width: 700px; margin: 0 auto;">
                        <table style="max-width: 700px; margin: 0 auto;" role="presentation">
                            <tbody>
                                <tr>
                                    <td align="center">
                                        <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
                                            <table style="max-width: 700px;" role="presentation">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <div style="color: #000000 !important;font-family:Helvetica,sans-serif;font-size:14px;font-weight:400;line-height:1.8;letter-spacing:0px;text-align:start;text-transform:none;">
                                                                <h4 style="color: #000000 !important;">Dear $brokerName,</h4>
                                                                <p style="color: #000000 !important; text-align: justify;">We are pleased to inform you that your load with the following details has been successfully delivered:</p>
                                                                
                                                                <p style="color: #000000 !important; margin-top: 20px; margin-bottom: 0;"><b>Load Number:</b> $loadNo</p>
                                                                <p style="color: #000000 !important; margin: 0;"><b>Delivery Location:</b> $deliveryAddress</p>
                                                                <p style="color: #000000 !important; margin: 0;"><b>Delivery Time:</b> $pickupOrDeliveryDate</p>
                                    
                                                                <p style="color: #000000 !important;">Best regards,</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </header>
            </body>
        </html>`;


export const EMAIL_RATECON_STEP_4 = {
  id: generateId(),
  subject: 'Rate Confirmation',
  content: emailTemplate,
  sender: { name: 'Broker X', email: 'agent@broker-x.com' },
  recipients: ['operations@itruckrapp.com'],
  cc: [],
  bcc: [],
  timestamp: new Date(Date.now() - 86400000).toISOString(),
  isRead: false,
  isStarred: false,
  isArchived: false,
  isDeleted: false,
  isSent: false,
  isDraft: false,
  hasAttachments: false,
  attachments: [],
  preview: 'Rate Confirmation',
  threadId: generateId(),
  labels: ['Rate Confirmation'],
} as Email;

export const EMAIL_POD_STEP_10 = {
  id: generateId(),
  subject: 'Load Delivered Sucessfully',
  content: emailTemplate,
  sender: { name: 'iTruckr', email: 'operations@itruckrapp.com' },
  recipients: ['you@company.com'],
  cc: [],
  bcc: [],
  timestamp: new Date(Date.now() - 86400000).toISOString(),
  isRead: true,
  isStarred: false,
  isArchived: false,
  isDeleted: false,
  isSent: true,
  isDraft: false,
  hasAttachments: false,
  attachments: [],
  preview: 'We are pleased to inform you that your load with the following details has been successfully delivered.',
  threadId: generateId(),
  labels: ['Load'],
} as Email;

export const TRUCK_1 = {
  id: 'T-001',
  type: 'dry_van',
  licensePlate: 'ABC-123',
  capacity: {
    weightLbs: 80000,
    volumeCubicFt: 3000
  },
  companyId: 'C-001',
  status: 'in_transit'
} as Truck

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
    state: 'PA'
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
    preferredDeliveryTimeRanges: ['09:00-17:00']
  }
} as Driver

export const LOAD_1 = {
  externalLoadId: 'L-2024-001',
  driverId: 'D-158',
  status: 'in_transit',
  dropOffLocation: {
    city: 'Jersey City',
    state: 'NJ',
    zipCode: '07302'
  },
  pickUpLocation: {
    city: 'Orlando',
    state: 'FL',
    zipCode: '32801'
  },
  pickUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  deliveryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
  brokerCompanyId: 'B-001',
  carrierCompanyId: 'c-001',
  factoring: false,
  rate: {
    total: 2450,
    currency: 'USD',
    ratePerMile: 2.45
  },
  paymentTerms: 'Net 30',
  weightLbs: 45000,
  cargoDescription: 'Electronics',
  specialInstructions: 'Handle with care'
} as Load

export const LOAD_2 = {
  externalLoadId: 'L-2024-002',
  driverId: 'D-158',
  status: 'new',
  pickUpLocation: {
    city: 'Baltimore',
    state: 'MD',
    zipCode: '21222',
    address: '8203 Fischer Road'
  },
  dropOffLocation: {
    city: 'Montgomery',
    state: 'IL',
    zipCode: '60538',
    address: '325 S Route 31 Suite G103 Building G'
  },
  pickUpDate: 'July 25, 2025',
  deliveryDate: 'July 30, 2025',
  brokerCompanyId: 'B-001',
  carrierCompanyId: 'c-001',
  factoring: false,
  rate: {
    total: 1521,
    currency: 'USD',
    ratePerMile: 1.96
  },
  weightLbs: 46600,
} as Load