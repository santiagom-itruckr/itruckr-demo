import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, DollarSign, Calendar, User, Building } from 'lucide-react';

const driverPayments = [
  {
    id: 'DP-2024-001',
    driver: 'John Smith',
    amount: '$2,450.00',
    date: '2024-01-15',
    status: 'Paid',
    loadId: 'L-2024-001',
    method: 'Direct Deposit'
  },
  {
    id: 'DP-2024-002',
    driver: 'Sarah Wilson',
    amount: '$1,890.00',
    date: '2024-01-14',
    status: 'Pending',
    loadId: 'L-2024-002',
    method: 'Check'
  },
  {
    id: 'DP-2024-003',
    driver: 'Mike Johnson',
    amount: '$1,650.00',
    date: '2024-01-13',
    status: 'Paid',
    loadId: 'L-2024-003',
    method: 'Direct Deposit'
  },
  {
    id: 'DP-2024-004',
    driver: 'Lisa Chen',
    amount: '$1,580.00',
    date: '2024-01-12',
    status: 'Processing',
    loadId: 'L-2024-004',
    method: 'Direct Deposit'
  }
];

const companyPayments = [
  {
    id: 'CP-2024-001',
    company: 'ABC Logistics',
    amount: '$15,420.00',
    date: '2024-01-15',
    status: 'Received',
    invoice: 'INV-2024-001',
    method: 'Wire Transfer'
  },
  {
    id: 'CP-2024-002',
    company: 'XYZ Freight',
    amount: '$8,750.00',
    date: '2024-01-14',
    status: 'Pending',
    invoice: 'INV-2024-002',
    method: 'ACH'
  },
  {
    id: 'CP-2024-003',
    company: 'Global Shipping Co',
    amount: '$12,300.00',
    date: '2024-01-13',
    status: 'Overdue',
    invoice: 'INV-2024-003',
    method: 'Check'
  },
  {
    id: 'CP-2024-004',
    company: 'Fast Track Delivery',
    amount: '$6,890.00',
    date: '2024-01-12',
    status: 'Received',
    invoice: 'INV-2024-004',
    method: 'Wire Transfer'
  }
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'received':
      return 'bg-custom-success bg-opacity-20 text-custom-success';
    case 'pending':
    case 'processing':
      return 'bg-custom-warning bg-opacity-20 text-custom-warning';
    case 'overdue':
      return 'bg-custom-error bg-opacity-20 text-custom-error';
    default:
      return 'bg-custom-text-disabled bg-opacity-20 text-custom-text-disabled';
  }
};

function PaymentTable({
  payments,
  type,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter
}: {
  payments: any[];
  type: 'driver' | 'company';
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}) {
  const filteredPayments = payments.filter(payment => {
    const searchField = type === 'driver' ? payment.driver : payment.company;
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchField.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-custom-text-secondary">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-custom-text-disabled" />
            <Input
              placeholder={`Search ${type} payments...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-custom-background border-custom-border text-custom-text-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-custom-text-secondary">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-custom-background border-custom-border text-custom-text-primary">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-custom-surface border-custom-border">
              <SelectItem value="all">All Statuses</SelectItem>
              {type === 'driver' ? (
                <>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-custom-text-secondary">Date Range</label>
          <Button variant="outline" className="w-full justify-start border-custom-border text-custom-text-primary hover:bg-custom-surface-hover">
            <Calendar className="h-4 w-4 mr-2" />
            Select dates
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-custom-border">
              <TableHead className="text-custom-text-secondary">Payment ID</TableHead>
              <TableHead className="text-custom-text-secondary">
                {type === 'driver' ? 'Driver' : 'Company'}
              </TableHead>
              <TableHead className="text-custom-text-secondary">Amount</TableHead>
              <TableHead className="text-custom-text-secondary">Date</TableHead>
              <TableHead className="text-custom-text-secondary">Status</TableHead>
              <TableHead className="text-custom-text-secondary">
                {type === 'driver' ? 'Load ID' : 'Invoice'}
              </TableHead>
              <TableHead className="text-custom-text-secondary">Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id} className="border-custom-border hover:bg-custom-surface-hover">
                <TableCell className="font-medium text-custom-text-primary">{payment.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {type === 'driver' ? (
                      <User className="h-4 w-4 text-custom-text-secondary" />
                    ) : (
                      <Building className="h-4 w-4 text-custom-text-secondary" />
                    )}
                    <span className="text-custom-text-primary">
                      {type === 'driver' ? payment.driver : payment.company}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-custom-success">{payment.amount}</TableCell>
                <TableCell className="text-custom-text-primary">{payment.date}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-custom-text-primary">
                  {type === 'driver' ? payment.loadId : payment.invoice}
                </TableCell>
                <TableCell className="text-custom-text-secondary">{payment.method}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function Payments() {
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState('all');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState('all');

  const totalDriverPayments = driverPayments.reduce((sum, payment) =>
    sum + parseFloat(payment.amount.replace('$', '').replace(',', '')), 0
  );

  const totalCompanyPayments = companyPayments.reduce((sum, payment) =>
    sum + parseFloat(payment.amount.replace('$', '').replace(',', '')), 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-custom-text-primary">Payments</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="border-custom-border text-custom-text-primary hover:bg-custom-surface-hover">
            <Download className="h-4 w-4" />
            <span className="ml-2">Export</span>
            Export
          </Button>
          <Button className="bg-custom-primary-accent hover:bg-custom-primary-hover text-black">
            <DollarSign className="h-4 w-4" />
            <span className="ml-2">Process Payment</span>
            Process Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-custom-surface border-custom-border">
          <CardHeader>
            <CardTitle className="text-custom-text-primary flex items-center gap-2">
              <User className="h-5 w-5" />
              Driver Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-custom-success">
              ${totalDriverPayments.toLocaleString()}
            </div>
            <p className="text-sm text-custom-text-secondary">Total paid this month</p>
          </CardContent>
        </Card>

        <Card className="bg-custom-surface border-custom-border">
          <CardHeader>
            <CardTitle className="text-custom-text-primary flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-custom-success">
              ${totalCompanyPayments.toLocaleString()}
            </div>
            <p className="text-sm text-custom-text-secondary">Total received this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Tabs */}
      <Card className="bg-custom-surface border-custom-border">
        <CardContent className="p-0">
          <Tabs defaultValue="driver" className="w-full">
            <div className="border-b border-custom-border">
              <TabsList className="grid w-full grid-cols-2 bg-transparent">
                <TabsTrigger
                  value="driver"
                  className="data-[state=active]:bg-custom-primary-accent data-[state=active]:text-black"
                >
                  Driver Payments
                </TabsTrigger>
                <TabsTrigger
                  value="company"
                  className="data-[state=active]:bg-custom-primary-accent data-[state=active]:text-black"
                >
                  Company Payments
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="driver" className="mt-0">
                <PaymentTable
                  payments={driverPayments}
                  type="driver"
                  searchTerm={driverSearchTerm}
                  setSearchTerm={setDriverSearchTerm}
                  statusFilter={driverStatusFilter}
                  setStatusFilter={setDriverStatusFilter}
                />
              </TabsContent>

              <TabsContent value="company" className="mt-0">
                <PaymentTable
                  payments={companyPayments}
                  type="company"
                  searchTerm={companySearchTerm}
                  setSearchTerm={setCompanySearchTerm}
                  statusFilter={companyStatusFilter}
                  setStatusFilter={setCompanyStatusFilter}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}