import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Crown, 
  Users, 
  Settings, 
  BarChart3,
  UserPlus,
  Activity,
  Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminsAPI, User } from '@/services/api';
import AdminManagement from '@/components/AdminManagement';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAdmins: 0,
    superAdmins: 0,
    regularAdmins: 0,
    systemHealth: 'Good'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await adminsAPI.getAll();
        const admins = response.admins;
        const superAdmins = admins.filter(admin => admin.role === 'super_admin');
        const regularAdmins = admins.filter(admin => admin.role === 'admin');
        
        setStats({
          totalAdmins: admins.length,
          superAdmins: superAdmins.length,
          regularAdmins: regularAdmins.length,
          systemHealth: 'Good'
        });
      } catch (error) {
        } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const quickActions = [
    {
      title: 'Admin Management',
      description: 'Create, edit, and manage system administrators',
      icon: Shield,
      color: 'primary',
      onClick: () => navigate('/dashboard/admin-management'),
      badge: 'Core'
    },
    {
      title: 'System Settings',
      description: 'Configure global system settings and preferences',
      icon: Settings,
      color: 'secondary',
      onClick: () => navigate('/dashboard/settings'),
      badge: null
    },
    {
      title: 'System Analytics',
      description: 'View system performance and admin activity reports',
      icon: BarChart3,
      color: 'accent',
      onClick: () => navigate('/dashboard/analytics'),
      badge: null
    },
    {
      title: 'Admin Activity',
      description: 'Monitor admin actions and system logs',
      icon: Activity,
      color: 'success',
      onClick: () => navigate('/dashboard/admin-activity'),
      badge: null
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-4">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Crown className="w-8 h-8 text-primary" />
              Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Complete system administration and management</p>
          </div>
          <Badge variant="default" className="bg-primary text-primary-foreground flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Super Administrator
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalAdmins}</div>
            <p className="text-xs text-muted-foreground">System administrators</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.superAdmins}</div>
            <p className="text-xs text-muted-foreground">Highest privilege level</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Admins</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.regularAdmins}</div>
            <p className="text-xs text-muted-foreground">Standard administrators</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.systemHealth}</div>
            <p className="text-xs text-muted-foreground">Current status</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Card key={action.title} className="group hover:shadow-lg transition-all duration-200 border-0 bg-card/80 backdrop-blur cursor-pointer" onClick={action.onClick}>
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${action.color}/10 border border-${action.color}/20`}>
                  <action.icon className={`w-6 h-6 text-${action.color}`} />
                </div>
                {action.badge && (
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    {action.badge}
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {action.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Admin Management Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Management Overview
          </CardTitle>
          <CardDescription>
            Manage system administrators and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <h4 className="font-medium">Super Admin Privileges</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Full system control including admin account management
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Create and manage admin accounts</li>
                  <li>• Assign and modify user roles</li>
                  <li>• Access system-wide settings</li>
                  <li>• Monitor admin activity</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-5 h-5 text-accent" />
                  <h4 className="font-medium">System Status</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Current system health and admin activity
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>System Health</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">Operational</Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Active Admins</span>
                    <span className="text-muted-foreground">{stats.totalAdmins}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
