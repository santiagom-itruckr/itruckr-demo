import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNavigation } from '@/contexts/NavigationContext';

export function TitleBar() {
  const { activePage, sidebarCollapsed, setSidebarCollapsed } = useNavigation();

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  return (
    <div className='flex items-center justify-between pl-4 pt-5 lg:pl-6'>
      <div className='flex items-center gap-4'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleToggleSidebar}
              className='text-absolute-gray-200 hover:text-absolute-gray-400 hover:bg-absolute-gray-700-hover bg-absolute-black border border-absolute-gray-800 transition-all duration-300 focus:ring-1 focus:ring-green-accent'
              aria-label={
                sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
              }
            >
              {sidebarCollapsed ? (
                <ChevronRight className='h-5 w-5 translate-x-[1px]' />
              ) : (
                <ChevronLeft className='h-5 w-5 translate-x-[-1px]' />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom'>
            {sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </TooltipContent>
        </Tooltip>
        <h1 className='text-3xl font-bold text-custom-text-primary capitalize'>
          {activePage}
        </h1>
      </div>
      <div className='text-sm text-custom-text-secondary'>
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
