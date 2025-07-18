import { Card } from '@/components/ui/card';
import Notifications from '@/components/notifications/Notifications';
import AiAssistant from '@/components/ai-assistant/AiAssistant';

export function ITruckr() {
  return (
    <section className="grid grid-cols-1 grid-rows-1 lg:grid-cols-[1fr_auto] gap-5 h-full w-full">
      <Card className="border-custom-border flex">
        <AiAssistant />
      </Card>

      <Card className="border-custom-border flex flex-col w-80">
        <Notifications />
      </Card>
    </section>
  );
}