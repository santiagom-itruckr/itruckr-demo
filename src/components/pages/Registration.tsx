import {
  Building,
  Edit,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompaniesStore } from '@/stores/companiesStore';
import { useDriversStore } from '@/stores/driversStore';

const getStatusColor = (status: string) => {
  return status === 'active'
    ? 'bg-green-accent bg-opacity-20 text-white'
    : 'bg-custom-text-disabled bg-opacity-20 text-custom-text-disabled';
};

function UserTable({
  users,
  userType,
  searchTerm,
  setSearchTerm,
  onAdd,
  onEdit,
  onDelete,
}: {
  users: any[];
  userType: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAdd: () => void;
  onEdit: (user: any) => void;
  onDelete: (userId: string) => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsDialogOpen(true);
    onEdit(user);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
    onAdd();
  };

  const getIcon = () => {
    switch (userType) {
      case 'drivers':
        return User;
      case 'companies':
        return Building;
      case 'dispatchers':
        return Users;
      case 'admins':
        return Shield;
      default:
        return User;
    }
  };

  const Icon = getIcon();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon className='h-5 w-5 text-custom-primary-accent' />
          <h3 className='text-lg font-semibold text-custom-text-primary capitalize'>
            {userType} ({filteredUsers.length})
          </h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAdd}
              className='bg-custom-primary-accent hover:bg-custom-primary-hover text-black'
            >
              <Plus className='h-4 w-4' />
              <span className='ml-2'>Add {userType.slice(0, -1)}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className='bg-custom-surface border-gray-300'>
            <DialogHeader>
              <DialogTitle className='text-custom-text-primary'>
                {editingUser ? 'Edit' : 'Add'} {userType.slice(0, -1)}
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label className='text-gray-600'>Name</Label>
                <Input
                  placeholder='Enter name'
                  defaultValue={editingUser?.name || ''}
                  className='bg-custom-background border-gray-300 text-custom-text-primary'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-gray-600'>Email</Label>
                <Input
                  type='email'
                  placeholder='Enter email'
                  defaultValue={editingUser?.email || ''}
                  className='bg-custom-background border-gray-300 text-custom-text-primary'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-gray-600'>Phone</Label>
                <Input
                  placeholder='Enter phone number'
                  defaultValue={editingUser?.phone || ''}
                  className='bg-custom-background border-gray-300 text-custom-text-primary'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-gray-600'>Status</Label>
                <Select defaultValue={editingUser?.status || 'active'}>
                  <SelectTrigger className='bg-custom-background border-gray-300 text-custom-text-primary'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-custom-surface border-gray-300'>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsDialogOpen(false)}
                  className='border-gray-300 text-custom-text-primary hover:bg-custom-surface-hover'
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className='bg-custom-primary-accent hover:bg-custom-primary-hover text-black'
                >
                  {editingUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-custom-text-disabled' />
        <Input
          placeholder={`Search ${userType}...`}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='pl-10 bg-custom-background border-gray-300 text-custom-text-primary'
        />
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='border-gray-300'>
              <TableHead className='text-gray-600'>Name</TableHead>
              <TableHead className='text-gray-600'>
                Email
              </TableHead>
              <TableHead className='text-gray-600'>
                Phone
              </TableHead>
              <TableHead className='text-gray-600'>
                Status
              </TableHead>
              <TableHead className='text-gray-600'>
                Join Date
              </TableHead>
              <TableHead className='text-gray-600'>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow
                key={user.id}
                className='text-start border-gray-300 hover:bg-custom-surface-hover'
              >
                <TableCell className='font-medium text-custom-text-primary'>
                  {user.name}
                </TableCell>
                <TableCell className='text-custom-text-primary'>
                  {user.email}
                </TableCell>
                <TableCell className='text-custom-text-primary'>
                  {user.phone}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className='text-custom-text-primary'>
                  {formatDate(
                    user.joinDate || user.createdAt || new Date().toISOString()
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEdit(user)}
                      className='text-gray-600 hover:text-custom-text-primary hover:bg-custom-surface-hover'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onDelete(user.id)}
                      className='text-custom-error hover:text-custom-error hover:bg-custom-surface-hover'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function Registration() {
  const [driversSearch, setDriversSearch] = useState('');
  const [companiesSearch, setCompaniesSearch] = useState('');
  const [dispatchersSearch, setDispatchersSearch] = useState('');
  const [adminsSearch, setAdminsSearch] = useState('');

  const { drivers, deleteDriver } = useDriversStore();
  const { companies, deleteCompany } = useCompaniesStore();

  // Mock dispatchers and admins for now - in a real app these would come from a users store
  const mockDispatchers = [
    {
      id: '1',
      name: 'Lisa Chen',
      email: 'lisa@company.com',
      phone: '(555) 555-6666',
      status: 'active',
      joinDate: '2024-01-03',
    },
    {
      id: '2',
      name: 'Robert Brown',
      email: 'robert@company.com',
      phone: '(555) 777-8888',
      status: 'active',
      joinDate: '2023-12-20',
    },
  ];

  const mockAdmins = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@company.com',
      phone: '(555) 999-0000',
      status: 'active',
      joinDate: '2023-01-01',
    },
  ];

  const handleDriverAdd = () => {
    console.log('Add driver');
    // Implementation would go here
  };

  const handleDriverEdit = (driver: any) => {
    console.log('Edit driver', driver);
    // Implementation would go here
  };

  const handleDriverDelete = (driverId: string) => {
    deleteDriver(driverId);
  };

  const handleCompanyAdd = () => {
    console.log('Add company');
    // Implementation would go here
  };

  const handleCompanyEdit = (company: any) => {
    console.log('Edit company', company);
    // Implementation would go here
  };

  const handleCompanyDelete = (companyId: string) => {
    deleteCompany(companyId);
  };

  return (
    <Card className='bg-custom-surface border-gray-300 h-full'>
      <Tabs defaultValue='drivers' className='flex flex-col w-full h-full'>
        <TabsList className='border-b border-gray-300 grid w-full h-fit grid-cols-4 bg-transparent'>
          <TabsTrigger
            value='drivers'
            className='py-2 data-[state=active]:bg-green-accent data-[state=active]:text-absolute-black'
          >
            Drivers
          </TabsTrigger>
          <TabsTrigger
            value='companies'
            className='py-2 data-[state=active]:bg-green-accent data-[state=active]:text-absolute-black'
          >
            Companies
          </TabsTrigger>
          <TabsTrigger
            value='dispatchers'
            className='py-2 data-[state=active]:bg-green-accent data-[state=active]:text-absolute-black'
          >
            Dispatchers
          </TabsTrigger>
          <TabsTrigger
            value='admins'
            className='py-2 data-[state=active]:bg-green-accent data-[state=active]:text-absolute-black'
          >
            Admins
          </TabsTrigger>
        </TabsList>

        <div className='flex-1 p-6'>
          <TabsContent value='drivers' className='h-full'>
            <UserTable
              users={drivers}
              userType='drivers'
              searchTerm={driversSearch}
              setSearchTerm={setDriversSearch}
              onAdd={handleDriverAdd}
              onEdit={handleDriverEdit}
              onDelete={handleDriverDelete}
            />
          </TabsContent>

          <TabsContent value='companies' className='h-full'>
            <UserTable
              users={companies}
              userType='companies'
              searchTerm={companiesSearch}
              setSearchTerm={setCompaniesSearch}
              onAdd={handleCompanyAdd}
              onEdit={handleCompanyEdit}
              onDelete={handleCompanyDelete}
            />
          </TabsContent>

          <TabsContent value='dispatchers' className='h-full'>
            <UserTable
              users={mockDispatchers}
              userType='dispatchers'
              searchTerm={dispatchersSearch}
              setSearchTerm={setDispatchersSearch}
              onAdd={() => console.log('Add dispatcher')}
              onEdit={dispatcher =>
                console.log('Edit dispatcher', dispatcher)
              }
              onDelete={id => console.log('Delete dispatcher', id)}
            />
          </TabsContent>

          <TabsContent value='admins' className='h-full'>
            <UserTable
              users={mockAdmins}
              userType='admins'
              searchTerm={adminsSearch}
              setSearchTerm={setAdminsSearch}
              onAdd={() => console.log('Add admin')}
              onEdit={admin => console.log('Edit admin', admin)}
              onDelete={id => console.log('Delete admin', id)}
            />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
