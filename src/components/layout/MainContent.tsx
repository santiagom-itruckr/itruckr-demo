import { useNavigation } from '@/contexts/NavigationContext';
import { ITruckr } from '@/components/pages/ITruckr';
import { Loads } from '@/components/pages/Loads';
import { Payments } from '@/components/pages/Payments';
import { Registration } from '@/components/pages/Registration';
import { Chat } from '@/components/pages/Chat';
import { Email } from '@/components/pages/Email';
import { Loadboard } from '../pages/Loadboard';

export function MainContent() {
  const renderPage = () => {
    const { activePage } = useNavigation();

    switch (activePage) {
      case 'itruckr':
        return <ITruckr />;
      case 'loadboard':
        return <Loadboard />;
      case 'loads':
        return <Loads />;
      case 'payments':
        return <Payments />;
      case 'registration':
        return <Registration />;
      case 'chat':
        return <Chat />;
      case 'email':
        return <Email />;
      default:
        return <ITruckr />;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto rounded-tl-xl pl-4 pt-4 lg:pl-6 lg:pt-6 transition-all duration-300">
      {renderPage()}
    </main>
  );
}