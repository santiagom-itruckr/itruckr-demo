import {
  Truck,
  MessageCircle,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  Fuel,
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProcessesStore } from '@/stores/processesStore';
import { Case } from '@/types/app';

interface CaseItemProps {
  case: Case;
  isActive: boolean;
  onSelect: (caseId: string) => void;
  onDelete: (caseId: string) => void;
}

function CaseItem({
  case: caseItem,
  isActive,
  onSelect,
  onDelete,
}: CaseItemProps) {
  const { getProcessesByCaseId } = useProcessesStore();

  const handleDeleteCase = (e: React.MouseEvent, caseId: string) => {
    e.stopPropagation();
    onDelete(caseId);
  };

  const getProcessTypeIcon = (className: string) => {
    switch (caseItem.type) {
      case 'load_process':
        return <Truck className={className} />;
      case 'oil_change':
        return <Fuel className={className} />;
      default:
        return <MessageCircle className={className} />;
    }
  };

  const getProcessTypeBadgeColor = () => {
    switch (caseItem.type) {
      case 'load_process':
        return 'bg-blue-500 bg-opacity-20 text-blue-500';
      case 'oil_change':
        return 'bg-orange-500 bg-opacity-20 text-orange-500';
      default:
        return 'bg-custom-text-disabled bg-opacity-20 text-custom-text-disabled';
    }
  };

  const getStatusIcon = () => {
    switch (caseItem.status) {
      case 'resolved':
        return <CheckCircle className='w-3 h-3 text-custom-success' />;
      case 'in_progress':
        return <Clock className='w-3 h-3 text-custom-warning' />;
      case 'open':
        return <AlertCircle className='w-3 h-3 text-blue-500' />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Get current process step if available
  const processes = getProcessesByCaseId(caseItem.id);
  const currentProcess = processes[0]; // Assuming one process per case
  const currentStep = currentProcess?.steps[currentProcess.currentStepIndex];

  return (
    <div
      className={cn(
        'group flex flex-col gap-4 py-4 px-5 border-b border-x-4 border-x-transparent cursor-pointer',
        isActive ? 'border-l-green-accent bg-green-accent/50' : ''
      )}
      onClick={() => onSelect(caseItem.id)}
    >
      <div className='flex items-center gap-2'>
        <div className='flex-shrink-0 text-absolute-gray-400 p-2 rounded-lg border border-absolute-gray-200'>
          {getProcessTypeIcon('w-6 h-6')}
        </div>
        <h4 className='font-medium text-md  apitalize text-start line-clamp-2 flex-1 text-custom-text-primary'>
          {caseItem.title}
        </h4>
        <Button
          size='icon'
          onClick={e => handleDeleteCase(e, caseItem.id)}
          className='opacity-0 group-hover:opacity-100 bg-red-100 hover:bg-red-200 transition-opacity'
          aria-label='Delete case'
        >
          <Trash2 className='w-3 h-3 text-red-500' />
        </Button>
      </div>

      <p className='text-start text-xs text-custom-text-secondary line-clamp-3'>
        {caseItem.description}
      </p>

      <div className='flex items-center gap-2'>
        <Badge
          variant='outline'
          className={cn('text-xs', getProcessTypeBadgeColor())}
        >
          {caseItem.type === 'load_process' ? 'Load Process' : 'Road Support'}
        </Badge>

        {currentStep && (
          <Badge
            variant='outline'
            className='text-xs text-custom-text-secondary'
          >
            {currentStep.name.replace(/_/g, ' ')}
          </Badge>
        )}

        {getStatusIcon()}

        <span className='justify-self-end text-xs text-custom-text-disabled'>
          {formatTimestamp(caseItem.updatedAt)}
        </span>
      </div>
    </div>
  );
}

export default CaseItem;
