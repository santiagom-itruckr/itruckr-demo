import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Truck,
  MapPin,
  Calendar,
  Weight,
  Clock,
  Filter,
  Search,
  Star,
  Phone,
  Mail,
  AlertCircle,
  Zap
} from 'lucide-react';

// Type definitions for better type safety
interface Broker {
  name: string;
  rating: number;
  phone: string | null;
  email: string | null;
}

interface Load {
  id: string;
  origin: { city: string; state: string; zip: string };
  destination: { city: string; state: string; zip: string };
  pickupDate: string;
  deliveryDate: string;
  rate: number;
  ratePerMile: number;
  miles: number;
  weight: number;
  equipmentType: string;
  commodity: string;
  broker: Broker;
  postedTime: string;
  urgency: string;
  status: string;
  autobooking: boolean;
}

// Simulated DAT loadboard data with autobooking capabilities
const generateLoadboardData = (): Load[] => [
  {
    id: 'DAT-2024-001',
    origin: { city: 'Los Angeles', state: 'CA', zip: '90210' },
    destination: { city: 'Phoenix', state: 'AZ', zip: '85001' },
    pickupDate: '2024-07-05',
    deliveryDate: '2024-07-06',
    rate: 2850,
    ratePerMile: 2.45,
    miles: 372,
    weight: 45000,
    equipmentType: 'Dry Van',
    commodity: 'Electronics',
    broker: {
      name: 'Prime Logistics',
      rating: 4.8,
      phone: '(555) 123-4567',
      email: 'dispatch@primelogistics.com'
    },
    postedTime: '2 hours ago',
    urgency: 'high',
    status: 'available',
    autobooking: true
  },
  {
    id: 'DAT-2024-002',
    origin: { city: 'Chicago', state: 'IL', zip: '60601' },
    destination: { city: 'Atlanta', state: 'GA', zip: '30301' },
    pickupDate: '2024-07-04',
    deliveryDate: '2024-07-05',
    rate: 3200,
    ratePerMile: 2.89,
    miles: 717,
    weight: 38000,
    equipmentType: 'Reefer',
    commodity: 'Food Products',
    broker: {
      name: 'FreightMax Solutions',
      rating: 4.6,
      phone: null,
      email: 'loads@freightmax.com'
    },
    postedTime: '45 minutes ago',
    urgency: 'medium',
    status: 'available',
    autobooking: false
  },
  {
    id: 'DAT-2024-003',
    origin: { city: 'Dallas', state: 'TX', zip: '75201' },
    destination: { city: 'Denver', state: 'CO', zip: '80201' },
    pickupDate: '2024-07-06',
    deliveryDate: '2024-07-07',
    rate: 2650,
    ratePerMile: 2.12,
    miles: 781,
    weight: 42000,
    equipmentType: 'Flatbed',
    commodity: 'Construction Materials',
    broker: {
      name: 'Southwest Freight',
      rating: 4.3,
      phone: '(555) 456-7890',
      email: null
    },
    postedTime: '1 hour ago',
    urgency: 'low',
    status: 'available',
    autobooking: false
  },
  {
    id: 'DAT-2024-004',
    origin: { city: 'Miami', state: 'FL', zip: '33101' },
    destination: { city: 'New York', state: 'NY', zip: '10001' },
    pickupDate: '2024-07-05',
    deliveryDate: '2024-07-07',
    rate: 4200,
    ratePerMile: 3.15,
    miles: 1280,
    weight: 35000,
    equipmentType: 'Dry Van',
    commodity: 'Retail Goods',
    broker: {
      name: 'East Coast Express',
      rating: 4.9,
      phone: null,
      email: null
    },
    postedTime: '30 minutes ago',
    urgency: 'high',
    status: 'available',
    autobooking: true
  },
  {
    id: 'DAT-2024-005',
    origin: { city: 'Seattle', state: 'WA', zip: '98101' },
    destination: { city: 'Portland', state: 'OR', zip: '97201' },
    pickupDate: '2024-07-04',
    deliveryDate: '2024-07-04',
    rate: 850,
    ratePerMile: 4.89,
    miles: 173,
    weight: 28000,
    equipmentType: 'Dry Van',
    commodity: 'Paper Products',
    broker: {
      name: 'Pacific Northwest Logistics',
      rating: 4.4,
      phone: null,
      email: null
    },
    postedTime: '3 hours ago',
    urgency: 'medium',
    status: 'available',
    autobooking: true
  },
  {
    id: 'DAT-2024-006',
    origin: { city: 'Houston', state: 'TX', zip: '77001' },
    destination: { city: 'Memphis', state: 'TN', zip: '38101' },
    pickupDate: '2024-07-05',
    deliveryDate: '2024-07-06',
    rate: 1850,
    ratePerMile: 2.78,
    miles: 665,
    weight: 41000,
    equipmentType: 'Dry Van',
    commodity: 'Manufacturing Parts',
    broker: {
      name: 'Central Freight Hub',
      rating: 4.2,
      phone: '(555) 789-0123',
      email: 'dispatch@centralfreight.com'
    },
    postedTime: '4 hours ago',
    urgency: 'medium',
    status: 'available',
    autobooking: false
  }
];

export function Loadboard() {
  const [loads] = useState<Load[]>(generateLoadboardData());
  const [filteredLoads, setFilteredLoads] = useState<Load[]>(loads);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [sortBy, setSortBy] = useState('rate');

  useEffect(() => {
    let filtered = loads;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (load) =>
          load.origin.city
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          load.destination.city
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          load.commodity.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Equipment filter
    if (selectedEquipment !== 'all') {
      filtered = filtered.filter((load) =>
        load.equipmentType.toLowerCase() === selectedEquipment.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rate':
          return b.rate - a.rate;
        case 'ratePerMile':
          return b.ratePerMile - a.ratePerMile;
        case 'miles':
          return a.miles - b.miles;
        case 'pickupDate':
          return (
            new Date(a.pickupDate).getTime() -
            new Date(b.pickupDate).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredLoads(filtered);
  }, [loads, searchTerm, selectedEquipment, sortBy]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-custom-error';
      case 'medium':
        return 'text-custom-warning';
      case 'low':
        return 'text-custom-success';
      default:
        return 'text-custom-text-secondary';
    }
  };

  const handleBookNow = (loadId: string) => {
    console.log('Booking load:', loadId);
    // Implement autobooking logic here
  };

  const handleNegotiatePhone = (loadId: string, phone: string) => {
    console.log('Calling broker for load:', loadId, phone);
    // Implement phone negotiation logic here
  };

  const handleNegotiateEmail = (loadId: string, email: string) => {
    console.log('Emailing broker for load:', loadId, email);
    // Implement email negotiation logic here
  };

  const renderActionButtons = (load: Load) => {
    const buttonConfigs = [];

    // Build button configurations in priority order
    if (load.autobooking) {
      buttonConfigs.push({
        key: 'book',
        label: 'Book Now',
        icon: Zap,
        onClick: () => handleBookNow(load.id)
      });
    }

    if (load.broker.phone) {
      buttonConfigs.push({
        key: 'phone',
        label: 'Negotiate Load',
        icon: Phone,
        onClick: () => handleNegotiatePhone(load.id, load.broker.phone!)
      });
    }

    if (load.broker.email) {
      buttonConfigs.push({
        key: 'email',
        label: 'Negotiate Load',
        icon: Mail,
        onClick: () => handleNegotiateEmail(load.id, load.broker.email!)
      });
    }

    // If no buttons are available
    if (buttonConfigs.length === 0) {
      return (
        <div className="text-sm text-custom-text-secondary italic">
          No contact info available
        </div>
      );
    }

    // Render buttons with first one getting primary styling
    return (
      <div className="flex flex-col gap-2">
        {buttonConfigs.map((config, index) => {
          const IconComponent = config.icon;
          const isPrimary = index === 0;

          return (
            <button
              key={config.key}
              onClick={config.onClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${isPrimary
                ? 'bg-custom-primary-accent text-black hover:bg-custom-primary-accent/90'
                : 'border border-custom-border text-custom-text-primary hover:bg-custom-surface-hover'
                }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-custom-surface border-custom-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-custom-text-secondary" />
              <input
                type="text"
                placeholder="Search by city or commodity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-custom-border rounded-lg bg-custom-background text-custom-text-primary placeholder-custom-text-secondary focus:outline-none focus:ring-2 focus:ring-custom-primary-accent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-custom-text-secondary" />
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="px-3 py-2 border border-custom-border rounded-lg bg-custom-background text-custom-text-primary focus:outline-none focus:ring-2 focus:ring-custom-primary-accent"
              >
                <option value="all">All Equipment</option>
                <option value="dry van">Dry Van</option>
                <option value="reefer">Reefer</option>
                <option value="flatbed">Flatbed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-custom-text-secondary">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-custom-border rounded-lg bg-custom-background text-custom-text-primary focus:outline-none focus:ring-2 focus:ring-custom-primary-accent"
              >
                <option value="rate">Total Rate</option>
                <option value="ratePerMile">Rate per Mile</option>
                <option value="miles">Distance</option>
                <option value="pickupDate">Pickup Date</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-custom-text-secondary">
              Showing {filteredLoads.length} of {loads.length} loads
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Load Cards */}
      {filteredLoads.length === 0 ? (
        <Card className="bg-custom-surface border-custom-border">
          <CardContent className="p-8 text-center">
            <Truck className="h-12 w-12 text-custom-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-custom-text-primary mb-2">
              No loads found
            </h3>
            <p className="text-custom-text-secondary">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLoads.map((load) => (
            <Card
              key={load.id}
              className="bg-custom-surface border-custom-border hover:shadow-lg transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Route Info */}
                  <div className="lg:col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="font-semibold text-custom-text-primary">
                          {load.origin.city}
                        </p>
                        <p className="text-sm text-custom-text-secondary">
                          {load.origin.state}
                        </p>
                      </div>
                      <div className="flex-1 flex items-center">
                        <div className="w-full border-t-2 border-dashed border-custom-border relative">
                          <Truck className="h-4 w-4 text-custom-primary-accent absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-custom-surface" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-custom-text-primary">
                          {load.destination.city}
                        </p>
                        <p className="text-sm text-custom-text-secondary">
                          {load.destination.state}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-custom-text-secondary">
                      <span>{load.miles} miles</span>
                      <span>{load.equipmentType}</span>
                      {load.autobooking && (
                        <span className="flex items-center gap-1 text-custom-primary-accent">
                          <Zap className="h-3 w-3" />
                          Auto-book
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Load Details */}
                  <div className="flex flex-col items-start gap-1 lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-custom-text-secondary" />
                      <span className="text-sm text-custom-text-primary">
                        Pick: {new Date(load.pickupDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-custom-text-secondary" />
                      <span className="text-sm text-custom-text-primary">
                        Del:{' '}
                        {new Date(load.deliveryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-custom-text-secondary" />
                      <span className="text-sm text-custom-text-primary">
                        {load.weight.toLocaleString()} lbs
                      </span>
                    </div>
                  </div>

                  {/* Broker Info */}
                  <div className="flex flex-col items-center lg:col-span-2">
                    <p className="font-medium text-custom-text-primary">
                      {load.broker.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm text-custom-text-secondary">
                        {load.broker.rating}
                      </span>
                    </div>
                    <p className="text-xs text-custom-text-secondary">
                      {load.commodity}
                    </p>
                  </div>

                  {/* Rate Info */}
                  <div className="flex flex-col items-center lg:col-span-2 text-center">
                    <p className="text-2xl font-bold text-custom-success">
                      ${load.rate.toLocaleString()}
                    </p>
                    <p className="text-sm text-custom-text-secondary">
                      ${load.ratePerMile}/mile
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-2">
                    {renderActionButtons(load)}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-custom-border flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-custom-text-secondary">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Posted {load.postedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle
                        className={`h-3 w-3 ${getUrgencyColor(load.urgency)}`}
                      />
                      <span className={getUrgencyColor(load.urgency)}>
                        {load.urgency.charAt(0).toUpperCase() +
                          load.urgency.slice(1)}{' '}
                        Priority
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-custom-text-secondary">
                    Load ID: {load.id}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
      }
    </div>
  );
}