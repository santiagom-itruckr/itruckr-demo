import {
  DollarSign,
  MessageCircle,
  Package,
  Users
} from 'lucide-react';
import { useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useConversationsStore } from '@/stores/conversationsStore';
import { useDriversStore } from '@/stores/driversStore';
import { useEmailStore } from '@/stores/emailStore';
import { useLoadsStore } from '@/stores/loadsStore';
import { useTrucksStore } from '@/stores/trucksStore';


// Types for better organization
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  gradient: string;
  iconColor: string;
}

interface DashboardMetrics {
  totalEmails: number;
  totalMessages: number;
  totalLoads: number;
  activeLoads: number;
  totalIncome: number;
  monthlyIncome: number;
  activeTrucks: number;
  totalDrivers: number;
  unreadEmails: number;
  loadCompletionRate: number;
  truckUtilization: number;
  avgLoadsPerDriver: number;
}

// Reusable Metric Card Component
function MetricCard({ title, value, subtitle, icon: Icon, gradient, iconColor }: MetricCardProps) {
  return (
    <Card className={`relative overflow-hidden border-0 text-start ${gradient}`}>
      <CardContent className="flex flex-col p-6">
        <p className="text-sm font-medium text-current/70">{title}</p>
        <div className='flex'>
          <div className='flex-1'>
            <p className="text-3xl font-bold text-current">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-current/70 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <Icon width={24} className={iconColor} />
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { currentUser } = useAuth();
  const { emails } = useEmailStore();
  const { conversations } = useConversationsStore();
  const { loads } = useLoadsStore();
  const { trucks } = useTrucksStore();
  const { drivers } = useDriversStore();

  // Calculate all metrics
  const metrics: DashboardMetrics = useMemo(() => {
    const totalEmails = emails.length;
    const totalMessages = conversations.reduce(
      (acc, conv) => acc + conv.messages.length,
      0
    );
    const totalLoads = loads.length;
    const activeLoads = loads.filter(load =>
      ['confirmed', 'ready_for_pickup', 'in_transit'].includes(load.status)
    ).length;
    const totalIncome = loads
      .filter(load => load.status === 'delivered')
      .reduce((acc, load) => acc + load.rate.total, 0);
    const activeTrucks = trucks.filter(truck =>
      truck.status === 'available' || truck.status === 'in_transit'
    ).length;
    const totalDrivers = drivers.length;

    // Calculate monthly income
    const currentMonth = new Date().getMonth();
    const monthlyIncome = loads
      .filter(load => {
        const loadDate = new Date(load.createdDate);
        return loadDate.getMonth() === currentMonth && load.status === 'delivered';
      })
      .reduce((acc, load) => acc + load.rate.total, 0);

    const unreadEmails = emails.filter(e => !e.isRead).length;
    const loadCompletionRate = Math.round(
      (loads.filter(load => load.status === 'delivered').length / loads.length) * 100
    );
    const truckUtilization = Math.round((activeTrucks / trucks.length) * 100);
    const avgLoadsPerDriver = Math.round(totalLoads / totalDrivers);

    return {
      totalEmails,
      totalMessages,
      totalLoads,
      activeLoads,
      totalIncome,
      monthlyIncome,
      activeTrucks,
      totalDrivers,
      unreadEmails,
      loadCompletionRate,
      truckUtilization,
      avgLoadsPerDriver,
    };
  }, [emails, conversations, loads, trucks, drivers]);

  // Metric cards data
  const metricCards = [
    {
      title: 'Messages Handled',
      value: metrics.totalMessages,
      icon: MessageCircle,
      gradient: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Loads',
      value: metrics.totalLoads,
      subtitle: `${metrics.activeLoads} active`,
      icon: Package,
      gradient: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Monthly Income',
      value: `$${metrics.monthlyIncome.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Total Drivers',
      value: metrics.totalDrivers,
      icon: Users,
      gradient: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900',
      iconColor: 'text-indigo-600',
    },
  ];


  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentUser?.profilePicture} alt={currentUser?.name} />
              <AvatarFallback className="bg-green-accent text-black text-2xl font-bold">
                {currentUser?.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome, {currentUser?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {currentUser?.role} • Ready to manage your fleet operations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <MetricCard key={index} {...card} />
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Utilization */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Fleet Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Truck Utilization</span>
                <span>{metrics.truckUtilization}%</span>
              </div>
              <Progress value={metrics.truckUtilization} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Load Completion Rate</span>
                <span>{metrics.loadCompletionRate}%</span>
              </div>
              <Progress value={metrics.loadCompletionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loads.slice(0, 5).map((load) => (
                <div key={load.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Load {load.externalLoadId}</p>
                    <p className="text-xs text-muted-foreground">
                      {load.pickUpLocation.city}, {load.pickUpLocation.state} → {load.dropOffLocation.city}, {load.dropOffLocation.state}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {load.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
