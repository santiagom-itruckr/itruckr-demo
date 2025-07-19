import { useEffect } from 'react';

import { MainContent } from '@/components/layout/MainContent';
import { SideBar } from '@/components/layout/SideBar';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './App.css';

// Initialize some demo data
import { useCompaniesStore } from '@/stores/companiesStore';
import { useConversationsStore } from '@/stores/conversationsStore';
import { useDriversStore } from '@/stores/driversStore';
import { useLoadsStore } from '@/stores/loadsStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useTrucksStore } from '@/stores/trucksStore';

import { TitleBar } from './components/layout/TitleBar';
import { DRIVER_1, LOAD_1, TRUCK_1 } from './constants';
import { NotificationDefinitions } from './notifications/notificationDefinitions';

function App() {
  const { addNotification } = useNotificationsStore();
  const { addLoad } = useLoadsStore();
  const { addDriver, updateDriver } = useDriversStore();
  const { addCompany } = useCompaniesStore();
  const { addTruck } = useTrucksStore();
  const { addConversation } = useConversationsStore();

  useEffect(() => {
    addCompany({
      id: 'B-001',
      name: 'ABC Logistics',
      email: 'contact@abclogistics.com',
      phone: '(555) 111-2222',
      status: 'active',
      companyType: 'broker',
    });

    addCompany({
      id: 'C-001',
      name: 'ABC Carriers',
      email: 'contact@abclogistics.com',
      phone: '(555) 111-2222',
      status: 'active',
      companyType: 'carrier',
    });

    const truck1 = addTruck(TRUCK_1);
    const driver1 = addDriver(DRIVER_1);
    const load1 = addLoad(LOAD_1);

    updateDriver(driver1.id, { currentLoadId: load1.id });

    const loadProcessNotification =
      NotificationDefinitions.createNewLoadProcess({
        driver: driver1,
        truck: truck1,
        load: load1,
      });

    setTimeout(
      () =>
        addNotification({
          userId: '1',
          type: loadProcessNotification.type,
          title: loadProcessNotification.title,
          message: loadProcessNotification.message,
          relatedEntityType: loadProcessNotification.relatedEntityType,
          relatedEntityId: driver1.id,
        }),
      1000
    );

    // Create a demo conversation for John Smith (driverId: 'D-158')
    addConversation('D-158', [] as any);
  }, []);

  return (
    <ThemeProvider>
      <NavigationProvider>
        <TooltipProvider>
          <div className='h-screen p-3 rounded-sm overflow-hidden bg-custom-background grid grid-cols-1 lg:grid-rows-[auto_1fr] lg:grid-cols-[auto_1fr]'>
            <SideBar />
            <TitleBar />
            <MainContent />
            <Toaster />
          </div>
        </TooltipProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}

export default App;
