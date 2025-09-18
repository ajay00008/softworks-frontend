import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  HelpCircle, 
  Settings, 
  BarChart3, 
  UserCheck,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  Crown,
  Database,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authAPI, User } from '@/services/api';
import ThemeToggle from '@/components/ThemeToggle';

const getNavigation = (userRole?: string) => {
  // Check if user is super admin (handle both 'super_admin' and 'SUPER_ADM(N' cases)
  const isSuperAdmin = userRole === 'super_admin' || userRole?.toLowerCase().includes('super_admin') || userRole?.includes('SUPER_ADM');
  
  // Super admin navigation - only admin management features
  if (isSuperAdmin) {
    return [
      { name: 'Admin Management', href: '/dashboard/admin-management', icon: Shield, section: 'SUPER_ADMIN' },
      { name: 'System Settings', href: '/dashboard/settings', icon: Settings, section: 'SYSTEM' },
      { name: 'System Analytics', href: '/dashboard/analytics', icon: BarChart3, section: 'SYSTEM' },
    ];
  }

  // Regular admin navigation - educational management features
  return [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'MAIN' },
    { name: 'Students', href: '/dashboard/students', icon: Users, section: 'MAIN' },
    { name: 'Teachers', href: '/dashboard/teachers', icon: GraduationCap, section: 'MAIN' },
    // { name: 'Performance Analytics', href: '/dashboard/performance', icon: BarChart3, section: 'ANALYTICS' },
    // { name: 'Teacher Assignment', href: '/dashboard/teacher-assignment', icon: Settings, section: 'MANAGEMENT' },
    // { name: 'Questions', href: '/dashboard/questions', icon: HelpCircle, section: 'CONTENT' },
    // { name: 'Syllabus Management', href: '/dashboard/syllabus', icon: BookOpen, section: 'CONTENT' },
    // { name: 'Absenteeism Tracking', href: '/dashboard/absenteeism', icon: AlertTriangle, section: 'TRACKING' },
    // { name: 'Upload Books', href: '/dashboard/books', icon: BookOpen, section: 'CONTENT' },
    // { name: 'Access Privileges', href: '/dashboard/access', icon: Settings, section: 'SYSTEM' },
    // { name: 'Mirror Login', href: '/dashboard/mirror', icon: UserCheck, section: 'SYSTEM' },
  ];
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get current user role
  const currentUser = authAPI.getCurrentUser();
  const userRole = currentUser?.role;
  console.log(currentUser, userRole),"test";

  // Handle role-based redirection
  React.useEffect(() => {
    console.log('DashboardLayout - User role:', userRole, 'Current path:', location.pathname);
    
    if (!userRole) {
      console.log('No user role, redirecting to login');
      navigate('/login');
      return;
    }

    setIsRedirecting(true);

    // Check if user is super admin (handle both 'super_admin' and 'SUPER_ADM(N' cases)
    const isSuperAdmin = userRole === 'super_admin' || userRole?.toLowerCase().includes('super_admin') || userRole?.includes('SUPER_ADM');

    // If super admin is on regular admin routes, redirect to super admin dashboard
    if (isSuperAdmin && location.pathname === '/dashboard') {
      console.log('Super admin on regular dashboard, redirecting to super admin dashboard');
      navigate('/dashboard/admin-management');
      return;
    }

    // If regular admin tries to access super admin routes, redirect to regular dashboard
    if (userRole === 'admin' && (location.pathname.includes('/super-admin') || location.pathname.includes('/admin-management'))) {
      console.log('Regular admin trying to access super admin routes, redirecting to regular dashboard');
      navigate('/dashboard');
      return;
    }

    console.log('No redirection needed, showing content');
    setIsRedirecting(false);
  }, [userRole, location.pathname, navigate]);

  // Show loading while redirecting
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const navigation = getNavigation(userRole);
  const groupedNavigation = navigation.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navigation>);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">EduAdmin</h1>
                <p className="text-xs text-muted-foreground">Management System</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {Object.entries(groupedNavigation).map(([section, items]) => (
              <div key={section}>
                <h3 className="px-2 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <Button
                      key={item.name}
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      className={`w-full justify-start h-10 px-3 ${
                        isActive(item.href) 
                          ? 'bg-primary/10 text-primary border-primary/20' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => {
                        navigate(item.href);
                        setSidebarOpen(false);
                      }}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-0 lg:ml-72 min-h-screen bg-background">
        {/* Top header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden sm:block">
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                Administrator Access
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{currentUser?.name || 'Admin User'}</p>
              <p className="text-xs text-muted-foreground">
                {(userRole === 'super_admin' || userRole?.toLowerCase().includes('super_admin') || userRole?.includes('SUPER_ADM')) ? 'Super Administrator' : 'Administrator'}
              </p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 min-h-[calc(100vh-4rem)] bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;