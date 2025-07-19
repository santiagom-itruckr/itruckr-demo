import { Search, Filter, Calendar, MapPin, User, Clock } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCompaniesStore } from '@/stores/companiesStore';
import { useDriversStore } from '@/stores/driversStore';
import { useLoadsStore } from '@/stores/loadsStore';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-custom-success bg-opacity-20 text-custom-success';
    case 'in_transit':
      return 'bg-blue-500 bg-opacity-20 text-blue-500';
    case 'confirmed':
    case 'pending_driver_confirmation':
    case 'pending_broker_confirmation':
      return 'bg-custom-warning bg-opacity-20 text-custom-warning';
    case 'cancelled':
      return 'bg-custom-error text-custom-error';
    case 'new':
      return 'bg-green-accent text-white';
    default:
      return 'bg-absolut-gray-300';
  }
};

export function Loads() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { loads } = useLoadsStore();
  const { drivers, getDriverById } = useDriversStore();
  const { getCompanyById } = useCompaniesStore();

  const filteredLoads = loads.filter(load => {
    const driver = load.driverId ? getDriverById(load.driverId) : null;
    const broker = getCompanyById(load.brokerCompanyId);

    const matchesSearch =
      load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.pickUpLocation.city
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      load.dropOffLocation.city
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (driver &&
        driver.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (broker && broker.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      load.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDriver =
      driverFilter === 'all' || load.driverId === driverFilter;

    return matchesSearch && matchesStatus && matchesDriver;
  });

  const totalPages = Math.ceil(filteredLoads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLoads = filteredLoads.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const formatLocation = (location: any) => {
    return `${location.city}, ${location.state}`;
  };

  return (
    <div className='flex flex-col gap-5 h-full'>
      {/* Filters */}
      <Card className='bg-custom-surface border-custom-border'>
        <CardHeader>
          <CardTitle className='text-custom-text-primary flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-custom-text-secondary'>
                Search
              </label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-custom-text-disabled' />
                <Input
                  placeholder='Search loads...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10 bg-custom-background border-custom-border text-custom-text-primary'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-custom-text-secondary'>
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='bg-custom-background border-custom-border text-custom-text-primary'>
                  <SelectValue placeholder='All Statuses' />
                </SelectTrigger>
                <SelectContent className='bg-custom-surface border-custom-border'>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='new'>New</SelectItem>
                  <SelectItem value='confirmed'>Confirmed</SelectItem>
                  <SelectItem value='in_transit'>In Transit</SelectItem>
                  <SelectItem value='delivered'>Delivered</SelectItem>
                  <SelectItem value='cancelled'>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-custom-text-secondary'>
                Driver
              </label>
              <Select value={driverFilter} onValueChange={setDriverFilter}>
                <SelectTrigger className='bg-custom-background border-custom-border text-custom-text-primary'>
                  <SelectValue placeholder='All Drivers' />
                </SelectTrigger>
                <SelectContent className='bg-custom-surface border-custom-border'>
                  <SelectItem value='all'>All Drivers</SelectItem>
                  {drivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-custom-text-secondary'>
                Date Range
              </label>
              <Button
                variant='outline'
                className='w-full justify-start border-custom-border text-custom-text-primary hover:bg-custom-surface-hover'
              >
                <Calendar className='h-4 w-4' />
                <span className='ml-2'>Select dates</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loads Table */}
      <Card className='flex flex-col bg-custom-surface border-custom-border flex-1'>
        <CardHeader>
          <CardTitle className='text-custom-text-primary'>
            Current Loads ({filteredLoads.length})
          </CardTitle>
        </CardHeader>
        <CardContent className='flex-1'>
          <Table>
            <TableHeader>
              <TableRow className='border-custom-border'>
                <TableHead className='text-custom-text-secondary'>
                  Load ID
                </TableHead>
                <TableHead className='text-custom-text-secondary'>
                  Route
                </TableHead>
                <TableHead className='text-custom-text-secondary'>
                  Status
                </TableHead>
                <TableHead className='text-custom-text-secondary'>
                  Driver
                </TableHead>
                <TableHead className='text-custom-text-secondary'>
                  Pickup Date
                </TableHead>
                <TableHead className='text-custom-text-secondary'>
                  Delivery Date
                </TableHead>
                <TableHead className='text-custom-text-secondary'>
                  Rate
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLoads.map(load => {
                const driver = load.driverId
                  ? getDriverById(load.driverId)
                  : null;
                return (
                  <TableRow
                    key={load.id}
                    className='border-custom-border hover:bg-custom-surface-hover'
                  >
                    <TableCell className='font-medium text-custom-text-primary text-start'>
                      {load.externalLoadId || load.id}
                    </TableCell>
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-1 text-custom-text-primary'>
                          <MapPin className='h-3 w-3 text-custom-success' />
                          <span className='text-sm'>
                            {formatLocation(load.pickUpLocation)}
                          </span>
                        </div>
                        <div className='flex items-center gap-1 text-custom-text-primary'>
                          <MapPin className='h-3 w-3 text-custom-error' />
                          <span className='text-sm'>
                            {formatLocation(load.dropOffLocation)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell align='left'>
                      <Badge className={getStatusColor(load.status)}>
                        {load.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {driver ? (
                        <div className='flex items-center gap-2'>
                          <User className='h-4 w-4 text-custom-text-secondary' />
                          <span className='text-custom-text-primary'>
                            {driver.name}
                          </span>
                        </div>
                      ) : (
                        <span className='text-custom-text-disabled'>
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4 text-custom-text-secondary' />
                        <span className='text-custom-text-primary'>
                          {formatDate(load.pickUpDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4 text-custom-text-secondary' />
                        <span className='text-custom-text-primary'>
                          {formatDate(load.deliveryDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium text-custom-success text-start'>
                      ${load.rate.total.toLocaleString()} {load.rate.currency}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
        </CardContent>
        <CardFooter className='flex items-center justify-between'>
          <div className='text-sm text-custom-text-secondary'>
            Showing {startIndex + 1} to{' '}
            {Math.min(startIndex + itemsPerPage, filteredLoads.length)} of{' '}
            {filteredLoads.length} loads
          </div>
          {totalPages > 1 && (
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='border-custom-border text-custom-text-primary hover:bg-custom-surface-hover'
              >
                Previous
              </Button>
              <span className='text-sm text-custom-text-primary'>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className='border-custom-border text-custom-text-primary hover:bg-custom-surface-hover'
              >
                Next
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
