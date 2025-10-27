import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ViewButton } from '@/components/ui/view-button';
import { ViewTabs } from '@/components/ui/view-tabs';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  HelpCircle, 
  BarChart3, 
  Settings, 
  Upload,
  Download,
  Printer,
  Send,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  Award,
  TrendingUp,
  Target,
  Shield,
  Bell
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// Mock data for demonstration
const mockDashboardData = {
  overview: {
    totalStudents: 1000,
    totalTeachers: 45,
    activeExams: 12,
    pendingSheets: 8,
    averagePerformance: 82.5,
    topPerformingClass: '11A',
    recentNotifications: 5
  },
  gradeDistribution: [
    { grade: 'A+', count: 45, percentage: 4.5, color: '#10B981' },
    { grade: 'A', count: 120, percentage: 12.0, color: '#3B82F6' },
    { grade: 'A-', count: 180, percentage: 18.0, color: '#8B5CF6' },
    { grade: 'B+', count: 200, percentage: 20.0, color: '#F59E0B' },
    { grade: 'B', count: 150, percentage: 15.0, color: '#EF4444' },
    { grade: 'C+', count: 100, percentage: 10.0, color: '#F97316' },
    { grade: 'C', count: 80, percentage: 8.0, color: '#84CC16' },
    { grade: 'D', count: 60, percentage: 6.0, color: '#06B6D4' },
    { grade: 'F', count: 65, percentage: 6.5, color: '#DC2626' }
  ],
  classPerformance: [
    { class: '11A', average: 85.2, students: 30, rank: 1 },
    { class: '11B', average: 82.8, students: 28, rank: 2 },
    { class: '11C', average: 79.5, students: 32, rank: 3 },
    { class: '11D', average: 76.3, students: 29, rank: 4 }
  ],
  subjectPerformance: [
    { subject: 'Mathematics', average: 78.5, highest: 95, lowest: 45 },
    { subject: 'Physics', average: 82.3, highest: 98, lowest: 52 },
    { subject: 'Chemistry', average: 85.7, highest: 96, lowest: 58 },
    { subject: 'English', average: 88.2, highest: 97, lowest: 65 },
    { subject: 'Biology', average: 80.1, highest: 94, lowest: 48 }
  ],
  recentNotifications: [
    { id: 1, type: 'MISSING_SHEET', title: 'Missing Answer Sheet', message: 'Student John Doe (Roll: 001) - Mathematics Unit Test', priority: 'HIGH', time: '2 hours ago' },
    { id: 2, type: 'ABSENT_STUDENT', title: 'Student Absent', message: 'Student Jane Smith (Roll: 002) - Physics Mid-term', priority: 'MEDIUM', time: '4 hours ago' },
    { id: 3, type: 'AI_CORRECTION_COMPLETE', title: 'AI Correction Complete', message: 'Chemistry Unit Test - 25 sheets processed', priority: 'LOW', time: '6 hours ago' }
  ]
};

const AdminDashboard = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('current');
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const { toast } = useToast();

  const handlePrintReport = () => {
    window.print();
    toast({
      title: "Printing",
      description: "Report is being prepared for printing",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Data export has been initiated",
    });
  };

  const handleSendNotifications = () => {
    setShowNotificationDialog(true);
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A+') return 'text-green-600 bg-green-100';
    if (grade === 'A') return 'text-blue-600 bg-blue-100';
    if (grade === 'A-') return 'text-purple-600 bg-purple-100';
    if (grade === 'B+' || grade === 'B') return 'text-yellow-600 bg-yellow-100';
    if (grade === 'C+' || grade === 'C') return 'text-orange-600 bg-orange-100';
    if (grade === 'D') return 'text-cyan-600 bg-cyan-100';
    if (grade === 'F') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Complete administrative control and oversight
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrintReport}>
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={handleSendNotifications}>
            <Send className="w-4 h-4 mr-2" />
            Send Notifications
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {mockDashboardData.overview.totalStudents.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/20 border-accent/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teaching Staff</CardTitle>
            <GraduationCap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {mockDashboardData.overview.totalTeachers}
            </div>
            <p className="text-xs text-muted-foreground">Active teachers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/20 border-success/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {mockDashboardData.overview.averagePerformance}%
            </div>
            <p className="text-xs text-muted-foreground">School average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/20 border-warning/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Sheets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {mockDashboardData.overview.pendingSheets}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student Database</TabsTrigger>
          <TabsTrigger value="questions">Question Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Grade Distribution
                </CardTitle>
                <CardDescription>
                  Current academic performance distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    grade: { label: "Grade" },
                    count: { label: "Number of Students" }
                  }}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={mockDashboardData.gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ grade, count }) => `${grade}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {mockDashboardData.gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Class Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Class Performance
                </CardTitle>
                <CardDescription>
                  Average performance by class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    class: { label: "Class" },
                    average: { label: "Average %" }
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={mockDashboardData.classPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="average" fill="#8884d8" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Subject Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Subject-wise Performance
              </CardTitle>
              <CardDescription>
                Average marks across all subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  subject: { label: "Subject" },
                  average: { label: "Average %" }
                }}
                className="h-[300px]"
              >
                <LineChart data={mockDashboardData.subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="average" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Database Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Student Database Management
              </CardTitle>
              <CardDescription>
                Complete student information with enhanced fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Search Students</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, roll number, or email..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Class Filter</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="11A">Class 11A</SelectItem>
                        <SelectItem value="11B">Class 11B</SelectItem>
                        <SelectItem value="11C">Class 11C</SelectItem>
                        <SelectItem value="11D">Class 11D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Actions</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Student List Placeholder */}
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Student database management interface will be integrated here</p>
                  <p className="text-sm">This will include all student fields: roll number, name, father name, DOB, parents' name, WhatsApp, email, address</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Question Management Tab */}
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Advanced Question Creation
              </CardTitle>
              <CardDescription>
                Blooms Taxonomy-based question creation with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enhanced question management with Blooms Taxonomy support</p>
                <p className="text-sm">Features: AI generation, difficulty levels, twisted questions, multilingual support</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Comprehensive Analytics
              </CardTitle>
              <CardDescription>
                Detailed performance analytics with grade buckets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Advanced analytics dashboard with grade buckets</p>
                <p className="text-sm">Features: Red/orange highlights for fail grades, graphical charts, performance trends</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                System Notifications
              </CardTitle>
              <CardDescription>
                Missing sheets, absent students, and system alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDashboardData.recentNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {notification.type === 'MISSING_SHEET' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        {notification.type === 'ABSENT_STUDENT' && <Users className="w-5 h-5 text-yellow-500" />}
                        {notification.type === 'AI_CORRECTION_COMPLETE' && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Notifications Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Notifications</DialogTitle>
            <DialogDescription>
              Send notifications to parents via WhatsApp, Email, or both
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Notification sending interface will be implemented here</p>
              <p className="text-sm">Features: WhatsApp integration, Email templates, bulk sending</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
