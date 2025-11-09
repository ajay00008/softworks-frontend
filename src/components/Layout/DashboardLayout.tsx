import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  BookMarked,
  Upload,
  Brain,
  Award,
  Trash2,
  XCircle,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authAPI, User, teacherDashboardAPI } from '@/services/api';
import ThemeToggle from '@/components/ThemeToggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { notificationService } from '@/services/notifications';

const getNavigation = (userRole?: string, teacherAccess?: { 
  subjectAccess?: Array<{ canCreateQuestions?: boolean }>;
  globalPermissions?: { canAccessQuestionPapers?: boolean };
} | null) => {
  // Check if user is super admin (handle both 'super_admin' and 'SUPER_ADM(N' cases)
  const isSuperAdmin = userRole === 'super_admin' || userRole?.toLowerCase().includes('super_admin') || userRole?.includes('SUPER_ADM');
  
  // Check if user is teacher
  const isTeacher = userRole === 'TEACHER' || userRole?.toLowerCase().includes('teacher');
  
  // Super admin navigation - only admin management features
  if (isSuperAdmin) {
    return [
      { name: 'Admin Management', href: '/dashboard/admin-management', icon: Shield, section: 'SUPER_ADMIN' },
      { name: 'Subject Management', href: '/dashboard/subject-management', icon: BookOpen, section: 'SUPER_ADMIN' },
      { name: 'System Settings', href: '/dashboard/settings', icon: Settings, section: 'SYSTEM' },
      { name: 'System Analytics', href: '/dashboard/analytics', icon: BarChart3, section: 'SYSTEM' },
    ];
  }

  // Teacher navigation - teacher-specific features
  if (isTeacher) {
    // Check if teacher has canCreateQuestions permission for any subject
    const hasQuestionPaperAccess = teacherAccess?.subjectAccess?.some(
      (subject) => subject.canCreateQuestions === true
    ) ?? false;
    
    const navigationItems = [
      { name: 'Teacher Dashboard', href: '/dashboard/teacher-dashboard', icon: GraduationCap, section: 'MAIN' },
      { name: 'My Students', href: '/dashboard/teacher/students', icon: Users, section: 'MAIN' },
      { name: 'Upload Answer Sheets', href: '/dashboard/teacher/upload-sheets', icon: Upload, section: 'TEACHING' },
      { name: 'AI Answer Checking', href: '/dashboard/teacher/ai-checking', icon: Brain, section: 'TEACHING' },
      // Show admin question paper page if teacher has canCreateQuestions permission
      ...(hasQuestionPaperAccess ? [{ name: 'Question Papers', href: '/dashboard/question-papers', icon: BookOpen, section: 'TEACHING' }] : []),
      { name: 'Results', href: '/dashboard/teacher/results', icon: Award, section: 'ANALYTICS' },
    ];
    
    return navigationItems;
  }

  // Regular admin navigation - educational management features
  return [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'MAIN' },
    { name: 'Students', href: '/dashboard/students', icon: Users, section: 'MAIN' },
    { name: 'Teachers', href: '/dashboard/teachers', icon: GraduationCap, section: 'MAIN' },
    { name: 'Class & Subject Management', href: '/dashboard/class-subject-management', icon: BookMarked, section: 'MANAGEMENT' },
    { name: 'Question Papers', href: '/dashboard/question-papers', icon: BookOpen, section: 'CONTENT' },
    { name: 'Exams', href: '/dashboard/exams', icon: GraduationCap, section: 'CONTENT' },
    { name: 'Absenteeism Tracking', href: '/dashboard/absenteeism', icon: AlertTriangle, section: 'TRACKING' },
    { name: 'Access Privileges', href: '/dashboard/access-privileges', icon: Settings, section: 'SYSTEM' },
  ];
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [newNotificationDialog, setNewNotificationDialog] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [teacherAccess, setTeacherAccess] = useState<{ 
    subjectAccess?: Array<{ canCreateQuestions?: boolean }>;
    globalPermissions?: { canAccessQuestionPapers?: boolean };
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get current user role
  const currentUser = authAPI.getCurrentUser();
  const userRole = currentUser?.role;
  const isTeacher = userRole === 'TEACHER' || userRole?.toLowerCase().includes('teacher');

  // Load notifications
  const loadNotifications = async () => {
    try {
      const fetchedNotifications = await notificationService.getNotifications({ limit: 5 });
      // Transform API response to handle both id and _id fields
      const transformedNotifications = (fetchedNotifications || []).map((notif: any) => ({
        id: notif.id || notif._id?.toString() || notif._id, // Handle both id and _id
        type: notif.type,
        title: notif.title,
        message: notif.message,
        priority: notif.priority,
        status: notif.status || 'UNREAD',
        createdAt: notif.createdAt || new Date().toISOString(),
        readAt: notif.readAt // Include readAt timestamp for read status display
      }));
      setNotifications(transformedNotifications);
    } catch (error) {
      // Error loading notifications - silent
    }
  };

  // Load teacher access if user is a teacher
  useEffect(() => {
    const loadTeacherAccess = async () => {
      if (isTeacher) {
        try {
          const response = await teacherDashboardAPI.getAccess();
          if (response.success && response.data) {
            setTeacherAccess(response.data);
          }
        } catch (error) {
          console.error('Failed to load teacher access:', error);
          // Don't show error toast - just log it
        }
      }
    };
    
    loadTeacherAccess();
  }, [isTeacher]);

  // Load notifications on mount and when popover opens
  useEffect(() => {
    loadNotifications();
    
    // Ensure socket connection is established when dashboard loads
    // This is important when accessing from another device via IP
    const ensureSocketConnection = () => {
      try {
        if (!notificationService.isConnected()) {
          console.log('[SOCKET] 🔄 Re-initializing socket connection on dashboard load', {
            timestamp: new Date().toISOString()
          });
          notificationService.reinitializeSocket();
        }
      } catch (error) {
        console.error('[SOCKET] ⚠️ Error ensuring socket connection', { error });
      }
    };

    // Try to connect immediately
    ensureSocketConnection();

    // Also try after a short delay to ensure auth token is available
    const timeoutId = setTimeout(ensureSocketConnection, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (notificationsOpen) {
      loadNotifications();
    }
  }, [notificationsOpen]);

  // Listen for new notifications
  useEffect(() => {
    const handleNotificationEvent = (event: CustomEvent) => {
      // Add new notification to the list
      const newNotif = {
        id: event.detail.id,
        type: event.detail.type,
        title: event.detail.title,
        message: event.detail.message,
        priority: event.detail.priority,
        status: 'UNREAD',
        createdAt: event.detail.createdAt || new Date().toISOString()
      };
      
      setNotifications(prev => [newNotif, ...prev].slice(0, 5)); // Keep only latest 5
      
      // Show popup dialog for new notification
      setCurrentNotification(newNotif);
      setNewNotificationDialog(true);
      
      // Reload if popover is open
      if (notificationsOpen) {
        loadNotifications();
      }
    };

    window.addEventListener('notification', handleNotificationEvent as EventListener);
    return () => {
      window.removeEventListener('notification', handleNotificationEvent as EventListener);
    };
  }, [notificationsOpen]);

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the onClick on parent div
    if (!notificationId) {
      toast({
        title: "Error",
        description: "Notification ID is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await notificationService.deleteNotification(notificationId);
      if (success) {
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
        toast({
          title: "Deleted",
          description: "Notification has been deleted",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete notification",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting notification', { notificationId, error });
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  // Handle clear all notifications
  const handleClearAllNotifications = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notifications.length === 0) {
      return;
    }

    if (!window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await notificationService.clearAllNotifications();
      if (success) {
        setNotifications([]);
        await loadNotifications();
        toast({
          title: "Cleared",
          description: "All notifications have been cleared",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to clear notifications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error clearing all notifications', { error });
      toast({
        title: "Error",
        description: "Failed to clear notifications",
        variant: "destructive",
      });
    }
  };

  // Validate token on every route change and periodically
  React.useEffect(() => {
    const validateToken = async () => {
      const { validateAndCleanToken, isTokenExpired } = await import('@/utils/tokenUtils');
      const token = localStorage.getItem('auth-token');
      
      if (!token || isTokenExpired(token)) {
        validateAndCleanToken();
        navigate('/login');
        return;
      }
    };

    // Validate immediately
    validateToken();

    // Validate on every route change
    const interval = setInterval(() => {
      validateToken();
    }, 60000); // Check every minute

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [location.pathname, navigate]);

  // Handle role-based redirection
  React.useEffect(() => {
    // First check if token is valid
    const checkAuth = async () => {
      const { validateAndCleanToken, isTokenExpired } = await import('@/utils/tokenUtils');
      const token = localStorage.getItem('auth-token');
      
      if (!token || isTokenExpired(token)) {
        validateAndCleanToken();
        navigate('/login');
        return;
      }
    };

    checkAuth();

    if (!userRole) {
      navigate('/login');
      return;
    }

    setIsRedirecting(true);

    // Check if user is super admin (handle both 'super_admin' and 'SUPER_ADM(N' cases)
    const isSuperAdmin = userRole === 'super_admin' || userRole?.toLowerCase().includes('super_admin') || userRole?.includes('SUPER_ADM');

    // If super admin is on regular admin routes, redirect to super admin dashboard
    if (isSuperAdmin && location.pathname === '/dashboard') {
      navigate('/dashboard/super-admin');
      return;
    }

    // If regular admin tries to access super admin routes, redirect to regular dashboard
    if (userRole === 'admin' && (location.pathname.includes('/super-admin') || location.pathname.includes('/admin-management'))) {
      navigate('/dashboard');
      return;
    }

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
      // Clear authentication
      const { clearAuth } = await import('@/utils/tokenUtils');
      clearAuth();
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/login');
    } catch (error) {
      // Even if there's an error, clear local storage
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const navigation = getNavigation(userRole, teacherAccess);
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
        <header className="h-16 bg-card border-b flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
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
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 max-w-[90vw] p-0" align="end" sideOffset={5}>
                <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                  <h3 className="font-semibold text-sm sm:text-base">Notifications</h3>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllNotifications}
                      className="h-7 sm:h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Clear All</span>
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[calc(100vh-200px)] sm:h-[400px] max-h-[60vh]">
                  {notifications.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center text-muted-foreground">
                      <Bell className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs sm:text-sm">No notifications</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-2 sm:p-3 rounded-lg mb-2 cursor-pointer hover:bg-primary hover:text-white transition-all duration-200 group ${
                            notification.status === 'UNREAD' ? 'bg-accent/50' : ''
                          }`}
                          onClick={async () => {
                            if (notification.status === 'UNREAD' && notification.id) {
                              console.log('[SOCKET] 📤 Frontend: Attempting to mark notification as read', {
                                notificationId: notification.id,
                                notification,
                                timestamp: new Date().toISOString()
                              });
                              await notificationService.markAsRead(notification.id);
                              loadNotifications();
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="text-xs sm:text-sm font-medium break-words group-hover:text-white">{notification.title}</p>
                                {notification.status === 'UNREAD' && (
                                  <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 group-hover:bg-white transition-colors" title="Unread"></span>
                                )}
                                {notification.status === 'READ' && (
                                  <Badge variant="outline" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5 bg-gray-50 text-gray-600 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30">
                                    Read
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] sm:text-xs text-muted-foreground group-hover:text-white/90 line-clamp-2 break-words">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                                <p className="text-[10px] sm:text-xs text-muted-foreground group-hover:text-white/80">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                                {notification.status === 'READ' && (notification as any).readAt && (
                                  <>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground group-hover:text-white/80 hidden sm:inline">•</span>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground group-hover:text-white/80 hidden sm:block">
                                      Read: {new Date((notification as any).readAt).toLocaleString()}
                                    </p>
                                  </>
                                )}
                                {notification.status === 'READ' && !(notification as any).readAt && (
                                  <>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground group-hover:text-white/80 hidden sm:inline">•</span>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground group-hover:text-white/80 hidden sm:block">
                                      Read
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                              <Badge 
                                variant={notification.priority === 'HIGH' || notification.priority === 'URGENT' ? 'destructive' : 'secondary'}
                                className="text-[10px] sm:text-xs flex-shrink-0 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30"
                              >
                                {notification.priority}
                              </Badge>
                              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 sm:text-white sm:hover:text-white sm:hover:bg-white/20 sm:border-white/30"
                                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{currentUser?.name || 'Admin User'}</p>
              <p className="text-xs text-muted-foreground">
                {(userRole === 'super_admin' || userRole?.toLowerCase().includes('super_admin') || userRole?.includes('SUPER_ADM')) ? 'Super Administrator' : 'Administrator'}
              </p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-4 md:p-6 min-h-[calc(100vh-4rem)] bg-background">
          <Outlet />
        </main>
      </div>

      {/* New Notification Popup - Positioned in top-right corner, responsive */}
      {newNotificationDialog && currentNotification && (
        <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 w-[calc(100vw-1rem)] sm:w-full sm:max-w-sm animate-in slide-in-from-top-5">
          <Card className="shadow-xl border-2 border-primary/20">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-base font-semibold leading-tight break-words">
                      {currentNotification.title || 'New Notification'}
                    </CardTitle>
                    {currentNotification.priority && (
                      <Badge 
                        variant={currentNotification.priority === 'HIGH' || currentNotification.priority === 'URGENT' ? 'destructive' : 'secondary'}
                        className="mt-1.5 text-[10px] sm:text-xs"
                      >
                        {currentNotification.priority}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() => setNewNotificationDialog(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2 sm:pb-3 px-3 sm:px-6">
              <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3 break-words">
                {currentNotification.message || 'You have received a new notification.'}
              </p>
              {currentNotification.createdAt && (
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                  {new Date(currentNotification.createdAt).toLocaleString()}
                </p>
              )}
            </CardContent>
            <CardFooter className="gap-2 pt-2 sm:pt-3 px-3 sm:px-6 flex-col sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                onClick={async () => {
                  if (currentNotification.id) {
                    await notificationService.markAsRead(currentNotification.id);
                    loadNotifications();
                  }
                  setNewNotificationDialog(false);
                }}
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Mark as Read
              </Button>
              <Button
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                onClick={() => {
                  setNewNotificationDialog(false);
                  setNotificationsOpen(true);
                }}
              >
                View All
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;