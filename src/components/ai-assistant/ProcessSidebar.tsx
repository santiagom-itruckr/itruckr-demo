import { Search, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCasesStore } from '@/stores/casesStore';
import { useNotificationsStore } from '@/stores/notificationsStore';

import CaseItem from './CaseItem';

function ProcessSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { cases, selectedCaseId, setSelectedCase, createCase } =
    useCasesStore();
  const { addNotification } = useNotificationsStore();

  // For demo purposes, we'll show cases for user '1'
  const currentUserId = '1';
  const userCases = cases.filter(c => c.userId === currentUserId);

  const handleNewCase = () => {
    const title = `General Inquiry ${new Date().toLocaleTimeString()}`;

    const notification = addNotification({
      userId: currentUserId,
      message: 'New Inquiry Created',
      title: 'New Inquiry',
      type: 'system_message',
      status: 'read',
      relatedEntityId: '',
    });

    createCase({
      notificationId: notification.id,
      userId: currentUserId,
      type: 'load_process',
      title,
      description: 'General inquiry case',
      relatedEntityId: '',
    });
  };

  const filteredCases = userCases.filter(
    caseItem =>
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='w-80 border-r border-custom-border flex flex-col'>
      {/* Header */}
      <div className='flex flex-col gap-3 p-4 border-b border-custom-border'>
        <Button
          className='flex gap-2 w-full bg-absolute-black hover:bg-absolute-black-hover text-white'
          size='sm'
          onClick={handleNewCase}
        >
          <Plus className='w-4 h-4' />
          <span>New Inquiry</span>
        </Button>

        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-custom-text-disabled' />
          <Input
            placeholder='Search cases...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-10 bg-custom-background border-custom-border text-custom-text-primary'
          />
        </div>
      </div>

      {/* Cases List */}
      <div className='flex-1'>
        {filteredCases.length === 0 ? (
          <div className='p-4 text-center text-custom-text-secondary text-sm'>
            {searchQuery ? 'No cases found' : 'No cases yet'}
          </div>
        ) : (
          filteredCases.map(caseItem => (
            <CaseItem
              key={caseItem.id}
              case={caseItem}
              isActive={caseItem.id === selectedCaseId} // We'll implement selection state later
              onSelect={() => setSelectedCase(caseItem.id)}
              onDelete={() => {}} // We'll implement deletion later
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ProcessSidebar;
