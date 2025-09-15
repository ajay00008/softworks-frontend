import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  UserX, 
  FileX, 
  CheckCircle, 
  Clock, 
  Search,
  Plus,
  Eye,
  MessageSquare,
  Calendar,
  Users,
  BookOpen,
  Bell,
  Flag
} from 'lucide-react';

// Mock data
const mockAbsenteeismReports = [
  {
    id: '1',
    studentId: '001',
    studentName: 'John Doe',
    class: '11A',
    subject: 'Mathematics',
    examType: 'Unit Test 1',
    examDate: '2024-01-20',
    reportType: 'absent',
    reportedBy: 'Dr. Sarah Johnson',
    reportedAt: '2024-01-20T10:30:00',
    status: 'pending',
    priority: 'high',
    description: 'Student was absent during the Mathematics Unit Test 1. No prior notification received.',
    adminNotes: '',
    acknowledgedAt: null,
    resolvedAt: null,
    isRedFlag: true
  },
  {
    id: '2',
    studentId: '002',
    studentName: 'Jane Smith',
    class: '11A',
    subject: 'Physics',
    examType: 'Mid Term Exam',
    examDate: '2024-01-18',
    reportType: 'missing_answer_sheet',
    reportedBy: 'Prof. Michael Chen',
    reportedAt: '2024-01-18T14:15:00',
    status: 'acknowledged',
    priority: 'medium',
    description: 'Answer sheet for Physics Mid Term Exam is missing. Student claims to have submitted it.',
    adminNotes: 'Contacted student and parents. Investigation in progress.',
    acknowledgedAt: '2024-01-19T09:00:00',
    resolvedAt: null,
    isRedFlag: true
  },
  {
    id: '3',
    studentId: '003',
    studentName: 'Mike Johnson',
    class: '11B',
    subject: 'Chemistry',
    examType: 'Quiz 3',
    examDate: '2024-01-15',
    reportType: 'absent',
    reportedBy: 'Ms. Emily Davis',
    reportedAt: '2024-01-15T11:45:00',
    status: 'resolved',
    priority: 'low',
    description: 'Student was absent due to medical emergency. Medical certificate provided.',
    adminNotes: 'Medical certificate verified. Student allowed to take makeup exam.',
    acknowledgedAt: '2024-01-16T08:30:00',
    resolvedAt: '2024-01-17T16:00:00',
    isRedFlag: false
  }
];

const AbsenteeismTracking = () => {
  const [reports, setReports] = useState(mockAbsenteeismReports);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Report form state
  const [reportForm, setReportForm] = useState({
    studentId: '',
    studentName: '',
    class: '',
    subject: '',
    examType: '',
    examDate: '',
    reportType: 'absent',
    description: ''
  });

  // Admin action form state
  const [adminActionForm, setAdminActionForm] = useState({
    action: 'acknowledge',
    notes: ''
  });

  const handleCreateReport = async () => {
    if (!reportForm.studentId || !reportForm.studentName || !reportForm.class || !reportForm.subject) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newReport = {
        id: `report-${Date.now()}`,
        ...reportForm,
        reportedBy: 'Current User', // Replace with actual user
        reportedAt: new Date().toISOString(),
        status: 'pending',
        priority: 'medium',
        adminNotes: '',
        acknowledgedAt: null,
        resolvedAt: null,
        isRedFlag: true
      };

      setReports(prev => [newReport, ...prev]);
      setShowReportDialog(false);
      setReportForm({
        studentId: '',
        studentName: '',
        class: '',
        subject: '',
        examType: '',
        examDate: '',
        reportType: 'absent',
        description: ''
      });

      toast({
        title: "Report Created",
        description: "Absenteeism report has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAction = async (reportId: string) => {
    if (!adminActionForm.notes.trim()) {
      toast({
        title: "Error",
        description: "Please add notes for the action",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedReports = reports.map(report => {
        if (report.id === reportId) {
          const now = new Date().toISOString();
          return {
            ...report,
            status: adminActionForm.action === 'acknowledge' ? 'acknowledged' : 'resolved',
            adminNotes: adminActionForm.notes,
            acknowledgedAt: adminActionForm.action === 'acknowledge' ? now : report.acknowledgedAt,
            resolvedAt: adminActionForm.action === 'resolve' ? now : report.resolvedAt,
            isRedFlag: adminActionForm.action === 'resolve' ? false : report.isRedFlag
          };
        }
        return report;
      });

      setReports(updatedReports);
      setSelectedReport(null);
      setAdminActionForm({ action: 'acknowledge', notes: '' });

      toast({
        title: "Action Completed",
        description: `Report has been ${adminActionForm.action === 'acknowledge' ? 'acknowledged' : 'resolved'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform action",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || report.priority === selectedPriority;
    const matchesClass = selectedClass === 'all' || report.class === selectedClass;

    return matchesSearch && matchesStatus && matchesPriority && matchesClass;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'acknowledged':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Eye className="w-3 h-3 mr-1" />Acknowledged</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" />High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getReportTypeIcon = (type: string) => {
    return type === 'absent' ? <UserX className="w-4 h-4" /> : <FileX className="w-4 h-4" />;
  };

  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const redFlagReports = reports.filter(r => r.isRedFlag).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold">Absenteeism Tracking</h1>
          </div>
          <p className="text-muted-foreground">
            Track student absenteeism and missing answer sheets with red flag system
          </p>
        </div>
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Report Absenteeism
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Red Flag Reports</CardTitle>
            <Flag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{redFlagReports}</div>
            <p className="text-xs text-red-600/70">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pending Reports</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReports}</div>
            <p className="text-xs text-yellow-600/70">Awaiting admin action</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
            <p className="text-xs text-blue-600/70">All time reports</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Resolved Reports</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'resolved').length}
            </div>
            <p className="text-xs text-green-600/70">Successfully resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search & Filter Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="11A">Class 11A</SelectItem>
                  <SelectItem value="11B">Class 11B</SelectItem>
                  <SelectItem value="11C">Class 11C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card 
            key={report.id} 
            className={`border-l-4 ${report.isRedFlag ? 'border-l-red-500 bg-red-50/50' : 'border-l-primary'}`}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  {/* Report Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getReportTypeIcon(report.reportType)}
                        <h3 className="text-lg font-semibold">{report.studentName}</h3>
                        {report.isRedFlag && (
                          <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
                            <Flag className="w-3 h-3 mr-1" />
                            RED FLAG
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className="bg-blue-100 text-blue-800">
                          {report.studentId}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {report.class}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          {report.subject}
                        </Badge>
                        <Badge className="bg-orange-100 text-orange-800">
                          {report.examType}
                        </Badge>
                        {getStatusBadge(report.status)}
                        {getPriorityBadge(report.priority)}
                      </div>
                    </div>
                  </div>

                  {/* Report Details */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Exam Information:</span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Exam Date:</strong> {report.examDate}</p>
                        <p><strong>Report Type:</strong> {report.reportType === 'absent' ? 'Student Absent' : 'Missing Answer Sheet'}</p>
                        <p><strong>Reported by:</strong> {report.reportedBy}</p>
                        <p><strong>Reported at:</strong> {new Date(report.reportedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Description:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {report.adminNotes && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Admin Notes:</span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {report.adminNotes}
                      </p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Timeline:</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Reported: {new Date(report.reportedAt).toLocaleString()}</p>
                      {report.acknowledgedAt && (
                        <p>Acknowledged: {new Date(report.acknowledgedAt).toLocaleString()}</p>
                      )}
                      {report.resolvedAt && (
                        <p>Resolved: {new Date(report.resolvedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  {report.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Take Action
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Report Absenteeism
            </DialogTitle>
            <DialogDescription>
              Create a new absenteeism or missing answer sheet report
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Student ID *</Label>
                <Input
                  placeholder="Enter student ID"
                  value={reportForm.studentId}
                  onChange={(e) => setReportForm(prev => ({ ...prev, studentId: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Student Name *</Label>
                <Input
                  placeholder="Enter student name"
                  value={reportForm.studentName}
                  onChange={(e) => setReportForm(prev => ({ ...prev, studentName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select value={reportForm.class} onValueChange={(value) => setReportForm(prev => ({ ...prev, class: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11A">Class 11A</SelectItem>
                    <SelectItem value="11B">Class 11B</SelectItem>
                    <SelectItem value="11C">Class 11C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={reportForm.subject} onValueChange={(value) => setReportForm(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Input
                  placeholder="e.g., Unit Test 1, Mid Term"
                  value={reportForm.examType}
                  onChange={(e) => setReportForm(prev => ({ ...prev, examType: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Exam Date</Label>
                <Input
                  type="date"
                  value={reportForm.examDate}
                  onChange={(e) => setReportForm(prev => ({ ...prev, examDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportForm.reportType} onValueChange={(value) => setReportForm(prev => ({ ...prev, reportType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="absent">Student Absent</SelectItem>
                  <SelectItem value="missing_answer_sheet">Missing Answer Sheet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the absenteeism or missing answer sheet situation..."
                value={reportForm.description}
                onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowReportDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateReport}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600"
              >
                {isLoading ? "Creating..." : "Create Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Action Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Admin Action Required
            </DialogTitle>
            <DialogDescription>
              Take action on the absenteeism report for {selectedReport?.studentName}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Report Details:</h4>
                <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
              </div>

              <div className="space-y-2">
                <Label>Action *</Label>
                <Select value={adminActionForm.action} onValueChange={(value) => setAdminActionForm(prev => ({ ...prev, action: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acknowledge">Acknowledge Report</SelectItem>
                    <SelectItem value="resolve">Resolve Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Admin Notes *</Label>
                <Textarea
                  placeholder="Add your notes about the action taken..."
                  value={adminActionForm.notes}
                  onChange={(e) => setAdminActionForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAdminAction(selectedReport.id)}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : adminActionForm.action === 'acknowledge' ? "Acknowledge" : "Resolve"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AbsenteeismTracking;

