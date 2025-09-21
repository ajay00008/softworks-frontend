import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  Brain, 
  Settings, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Archive,
  Trash2,
  Send,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'MISSING_SHEET' | 'ABSENT_STUDENT' | 'AI_CORRECTION_COMPLETE' | 'MANUAL_REVIEW_REQUIRED' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'UNREAD' | 'READ' | 'ACKNOWLEDGED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;
  relatedEntityId?: string;
  relatedEntityType?: 'EXAM' | 'STUDENT' | 'ANSWER_SHEET';
  senderId?: string;
  senderName?: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

// Mock data - replace with actual API calls
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'MISSING_SHEET',
    title: 'Missing Answer Sheet',
    message: 'Student John Doe (Roll: 11A001) - Mathematics Unit Test answer sheet is missing',
    priority: 'HIGH',
    status: 'UNREAD',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    relatedEntityId: 'exam-123',
    relatedEntityType: 'EXAM',
    senderId: 'teacher-1',
    senderName: 'Ms. Smith',
    isAcknowledged: false
  },
  {
    id: '2',
    type: 'ABSENT_STUDENT',
    title: 'Student Absent',
    message: 'Student Jane Smith (Roll: 11A002) was absent during Physics Mid-term exam',
    priority: 'MEDIUM',
    status: 'READ',
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    relatedEntityId: 'student-456',
    relatedEntityType: 'STUDENT',
    senderId: 'teacher-2',
    senderName: 'Mr. Johnson',
    isAcknowledged: false
  },
  {
    id: '3',
    type: 'AI_CORRECTION_COMPLETE',
    title: 'AI Correction Complete',
    message: 'Chemistry Unit Test - 25 answer sheets have been processed by AI',
    priority: 'LOW',
    status: 'ACKNOWLEDGED',
    createdAt: '2024-01-15T08:45:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    relatedEntityId: 'exam-789',
    relatedEntityType: 'EXAM',
    senderId: 'system',
    senderName: 'AI System',
    isAcknowledged: true,
    acknowledgedBy: 'admin-1',
    acknowledgedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '4',
    type: 'MANUAL_REVIEW_REQUIRED',
    title: 'Manual Review Required',
    message: '5 answer sheets require manual review due to low AI confidence scores',
    priority: 'HIGH',
    status: 'UNREAD',
    createdAt: '2024-01-15T11:20:00Z',
    updatedAt: '2024-01-15T11:20:00Z',
    relatedEntityId: 'exam-456',
    relatedEntityType: 'EXAM',
    senderId: 'ai-system',
    senderName: 'AI System',
    isAcknowledged: false
  },
  {
    id: '5',
    type: 'SYSTEM_ALERT',
    title: 'System Maintenance',
    message: 'Scheduled system maintenance will occur tonight from 11 PM to 1 AM',
    priority: 'MEDIUM',
    status: 'READ',
    createdAt: '2024-01-15T07:00:00Z',
    updatedAt: '2024-01-15T07:00:00Z',
    senderId: 'system',
    senderName: 'System Administrator',
    isAcknowledged: false
  }
];

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotification, setNewNotification] = useState({
    type: 'SYSTEM_ALERT' as Notification['type'],
    title: '',
    message: '',
    priority: 'MEDIUM' as Notification['priority'],
    recipientId: ''
  });
  const { toast } = useToast();

  // Filter notifications based on selected tab and filters
  useEffect(() => {
    let filtered = notifications;

    // Filter by tab
    if (selectedTab !== 'all') {
      filtered = filtered.filter(notification => {
        switch (selectedTab) {
          case 'unread':
            return notification.status === 'UNREAD';
          case 'urgent':
            return notification.priority === 'URGENT' || notification.priority === 'HIGH';
          case 'missing':
            return notification.type === 'MISSING_SHEET' || notification.type === 'ABSENT_STUDENT';
          case 'ai':
            return notification.type === 'AI_CORRECTION_COMPLETE' || notification.type === 'MANUAL_REVIEW_REQUIRED';
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(notification => notification.priority === priorityFilter);
    }

    setFilteredNotifications(filtered);
  }, [notifications, selectedTab, searchTerm, priorityFilter]);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, status: 'READ' as const, updatedAt: new Date().toISOString() }
          : notification
      )
    );
    toast({
      title: "Marked as Read",
      description: "Notification has been marked as read",
    });
  };

  const handleAcknowledge = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { 
              ...notification, 
              status: 'ACKNOWLEDGED' as const, 
              isAcknowledged: true,
              acknowledgedBy: 'current-user',
              acknowledgedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : notification
      )
    );
    toast({
      title: "Acknowledged",
      description: "Notification has been acknowledged",
    });
  };

  const handleDismiss = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, status: 'DISMISSED' as const, updatedAt: new Date().toISOString() }
          : notification
      )
    );
    toast({
      title: "Dismissed",
      description: "Notification has been dismissed",
    });
  };

  const handleCreateNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const notification: Notification = {
      id: Date.now().toString(),
      type: newNotification.type,
      title: newNotification.title,
      message: newNotification.message,
      priority: newNotification.priority,
      status: 'UNREAD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      senderId: 'current-user',
      senderName: 'Current User',
      isAcknowledged: false
    };

    setNotifications(prev => [notification, ...prev]);
    setNewNotification({
      type: 'SYSTEM_ALERT',
      title: '',
      message: '',
      priority: 'MEDIUM',
      recipientId: ''
    });
    setShowCreateDialog(false);
    toast({
      title: "Notification Created",
      description: "New notification has been created and sent",
    });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'MISSING_SHEET':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'ABSENT_STUDENT':
        return <Users className="w-5 h-5 text-orange-500" />;
      case 'AI_CORRECTION_COMPLETE':
        return <Brain className="w-5 h-5 text-blue-500" />;
      case 'MANUAL_REVIEW_REQUIRED':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'SYSTEM_ALERT':
        return <Settings className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-800 bg-red-100 border-red-200';
      case 'HIGH':
        return 'text-orange-800 bg-orange-100 border-orange-200';
      case 'MEDIUM':
        return 'text-yellow-800 bg-yellow-100 border-yellow-200';
      case 'LOW':
        return 'text-green-800 bg-green-100 border-green-200';
      default:
        return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: Notification['status']) => {
    switch (status) {
      case 'UNREAD':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      case 'READ':
        return <Eye className="w-4 h-4 text-gray-400" />;
      case 'ACKNOWLEDGED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'DISMISSED':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;
  const urgentCount = notifications.filter(n => n.priority === 'URGENT' || n.priority === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Center</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage system notifications and alerts
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Send className="w-4 h-4 mr-2" />
            Create Notification
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Acknowledged</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.isAcknowledged).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="urgent">Urgent ({urgentCount})</TabsTrigger>
          <TabsTrigger value="missing">Missing Sheets</TabsTrigger>
          <TabsTrigger value="ai">AI Related</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600">No notifications match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card key={notification.id} className={`${
                notification.status === 'UNREAD' ? 'border-l-4 border-l-blue-500' : ''
              } ${notification.priority === 'URGENT' ? 'border-red-200 bg-red-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          {getStatusIcon(notification.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>From: {notification.senderName}</span>
                          <span>•</span>
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          {notification.acknowledgedAt && (
                            <>
                              <span>•</span>
                              <span className="text-green-600">
                                Acknowledged: {new Date(notification.acknowledgedAt).toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {notification.status === 'UNREAD' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      {!notification.isAcknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(notification.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismiss(notification.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Notification Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Notification</DialogTitle>
            <DialogDescription>
              Send a notification to users in the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newNotification.type} onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value as Notification['type'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MISSING_SHEET">Missing Sheet</SelectItem>
                    <SelectItem value="ABSENT_STUDENT">Absent Student</SelectItem>
                    <SelectItem value="AI_CORRECTION_COMPLETE">AI Correction Complete</SelectItem>
                    <SelectItem value="MANUAL_REVIEW_REQUIRED">Manual Review Required</SelectItem>
                    <SelectItem value="SYSTEM_ALERT">System Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newNotification.priority} onValueChange={(value) => setNewNotification(prev => ({ ...prev, priority: value as Notification['priority'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter notification title..."
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Enter notification message..."
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNotification}>
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationCenter;
