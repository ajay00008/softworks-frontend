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
import { absenteeismAPI } from '@/services/api';
import { notificationService } from '@/services/notifications';
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

const AbsenteeismTracking = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
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

  // Load absenteeism reports from API
  const loadReports = async () => {
    try {
      setIsLoadingData(true);
      const params: any = {};
      if (selectedStatus !== 'all') params.status = selectedStatus.toUpperCase();
      if (selectedPriority !== 'all') params.priority = selectedPriority.toUpperCase();
      
      console.log('[AbsenteeismTracking] Loading reports with params:', params);
      const response = await absenteeismAPI.getAll({ ...params, limit: 100 });
      
      console.log('[AbsenteeismTracking] API Response:', response);
      
      if (response.success && response.data) {
        // Transform API data to match UI format
        const transformedReports = response.data.map((report: any) => {
          const exam = report.examId || {};
          // Handle Mongoose document structure - extract from _doc if present
          let student = report.studentId || {};
          if (student._doc) {
            student = { ...student._doc, ...student }; // Merge _doc with top-level properties (like rollNumber)
          }
          const reportedBy = report.reportedBy || {};
          
          // Get class info - exam might have classId populated or we need to get it from exam
          let className = 'Unknown';
          if (exam.classId) {
            className = exam.classId.displayName || exam.classId.name || 'Unknown';
          } else if (exam.classId && typeof exam.classId === 'string') {
            // If classId is just an ID string, we can't get the name here
            className = 'Unknown';
          }
          
          // Get subject info
          let subjectName = 'Unknown';
          if (Array.isArray(exam.subjectIds) && exam.subjectIds.length > 0) {
            subjectName = exam.subjectIds[0]?.name || 'Unknown';
          } else if (exam.subjectIds && !Array.isArray(exam.subjectIds)) {
            subjectName = exam.subjectIds.name || 'Unknown';
          }
          
          return {
            id: String(report._id),
            studentId: student.rollNumber || String(student._id || student) || 'Unknown',
            studentName: student.name || 'Unknown',
            class: className,
            subject: subjectName,
            examType: exam.examType || 'Unknown',
            examDate: exam.scheduledDate ? new Date(exam.scheduledDate).toISOString().split('T')[0] : '',
            reportType: report.type === 'MISSING_SHEET' ? 'missing_answer_sheet' : 'absent',
            reportedBy: reportedBy.name || 'Unknown',
            reportedAt: report.reportedAt || new Date().toISOString(),
            status: report.status?.toLowerCase() || 'pending',
            priority: report.priority?.toLowerCase() || 'medium',
            description: report.reason || '',
            adminNotes: report.adminRemarks || '',
            acknowledgedAt: report.acknowledgedAt || null,
            resolvedAt: report.resolvedAt || null,
            isRedFlag: report.status === 'PENDING' || report.priority === 'HIGH' || report.priority === 'URGENT',
            // Store original data for API calls - CRITICAL for acknowledge/resolve
            _original: report,
            _originalId: String(report._id) // Direct access to MongoDB ID for API calls
          };
        });
        
        console.log('[AbsenteeismTracking] Transformed reports:', transformedReports.length);
        setReports(transformedReports);
      } else {
        console.warn('[AbsenteeismTracking] No data in response or response not successful');
        setReports([]);
      }
    } catch (error: any) {
      console.error('[AbsenteeismTracking] Error loading reports:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load absenteeism reports",
        variant: "destructive",
      });
      setReports([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load reports on mount and when filters change
  useEffect(() => {
    loadReports();
  }, [selectedStatus, selectedPriority]);

  // Listen for socket notifications for missing answer sheets
  useEffect(() => {
    const handleNotificationEvent = (event: CustomEvent) => {
      const notification = event.detail;
      
      // Only handle MISSING_ANSWER_SHEET notifications
      if (notification.type === 'MISSING_ANSWER_SHEET' && notification.metadata?.missingStudents) {
        const missingStudents = notification.metadata.missingStudents;
        const examInfo = {
          examId: notification.metadata.examId,
          examTitle: notification.metadata.examTitle,
          examType: notification.metadata.examType || 'Unknown',
          examDate: notification.metadata.examDate || new Date().toISOString().split('T')[0]
        };

        // Create report entries for each missing student
        const newReports = missingStudents.map((student: any) => ({
          id: `temp-${Date.now()}-${student.studentId}`,
          studentId: student.rollNumber || student.studentId,
          studentName: student.studentName || 'Unknown',
          class: student.className || 'Unknown',
          subject: student.subjectName || 'Unknown',
          examType: examInfo.examType,
          examDate: examInfo.examDate,
          reportType: 'missing_answer_sheet',
          reportedBy: 'Teacher',
          reportedAt: new Date().toISOString(),
          status: 'pending',
          priority: 'high',
          description: `Answer sheet not submitted for ${examInfo.examTitle}`,
          adminNotes: '',
          acknowledgedAt: null,
          resolvedAt: null,
          isRedFlag: true,
          _isNew: true // Flag to highlight new reports
        }));

        // Add new reports to the list temporarily
        setReports(prev => [...newReports, ...prev]);
        
        // Reload reports from API to get real data with _original field
        // This ensures reports have the proper structure for admin actions
        setTimeout(async () => {
          try {
            await loadReports();
          } catch (error) {
            console.error('Error reloading reports after socket notification:', error);
          }
        }, 1000);
        
        toast({
          title: "New Missing Answer Sheets",
          description: `${missingStudents.length} student(s) reported with missing answer sheets`,
        });
      }
    };

    window.addEventListener('notification', handleNotificationEvent as EventListener);

    return () => {
      window.removeEventListener('notification', handleNotificationEvent as EventListener);
    };
  }, [toast]);

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
      // Use selectedReport directly, or find it if not available
      const report = selectedReport || reports.find(r => r.id === reportId);
      
      console.log('[AbsenteeismTracking] handleAdminAction - report:', report);
      console.log('[AbsenteeismTracking] handleAdminAction - reportId:', reportId);
      console.log('[AbsenteeismTracking] handleAdminAction - selectedReport:', selectedReport);
      
      if (!report) {
        console.error('[AbsenteeismTracking] Report not found in state');
        toast({
          title: "Error",
          description: "Report not found. Please refresh the page.",
          variant: "destructive",
        });
        return;
      }

      // Get the actual absenteeism ID - prioritize _originalId, then _original._id, then report.id
      let absenteeismId: string;
      
      if (report._originalId) {
        // Direct ID stored during transformation
        absenteeismId = report._originalId;
        console.log('[AbsenteeismTracking] Using _originalId:', absenteeismId);
      } else if (report._original && report._original._id) {
        // Report from API has _original field with _id
        absenteeismId = String(report._original._id);
        console.log('[AbsenteeismTracking] Using _original._id:', absenteeismId);
      } else if (report.id && !report.id.startsWith('temp-') && !report.id.startsWith('report-')) {
        // Report ID is the actual MongoDB ID (from API transformation)
        absenteeismId = report.id;
        console.log('[AbsenteeismTracking] Using report.id:', absenteeismId);
      } else {
        // This is a temporary report - try to find it in the database
        console.log('[AbsenteeismTracking] Temporary report detected, fetching from API...');
        const freshResponse = await absenteeismAPI.getAll({ limit: 100 });
        
        if (freshResponse.success && freshResponse.data) {
          // Find matching report by student and exam details
          const matchingReport = freshResponse.data.find((r: any) => {
            const exam = r.examId || {};
            const student = r.studentId || {};
            const studentName = student.name || '';
            const studentRoll = student.rollNumber || '';
            
            return (studentName === report.studentName || studentRoll === report.studentId) &&
                   exam.scheduledDate && 
                   new Date(exam.scheduledDate).toISOString().split('T')[0] === report.examDate;
          });
          
          if (matchingReport && matchingReport._id) {
            absenteeismId = String(matchingReport._id);
            console.log('[AbsenteeismTracking] Found matching report in DB:', absenteeismId);
          } else {
            console.error('[AbsenteeismTracking] Could not find matching report in database');
            toast({
              title: "Error",
              description: "Report not found in database. Please wait a moment and try again, or refresh the page.",
              variant: "destructive",
            });
            return;
          }
        } else {
          console.error('[AbsenteeismTracking] Failed to fetch reports from API');
          toast({
            title: "Error",
            description: "Failed to load reports. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      console.log('[AbsenteeismTracking] Calling API with absenteeismId:', absenteeismId);
      console.log('[AbsenteeismTracking] Action:', adminActionForm.action);
      console.log('[AbsenteeismTracking] Notes:', adminActionForm.notes);

      let response;
      if (adminActionForm.action === 'acknowledge') {
        response = await absenteeismAPI.acknowledge(absenteeismId, adminActionForm.notes);
      } else {
        response = await absenteeismAPI.resolve(absenteeismId, adminActionForm.notes);
      }

      console.log('[AbsenteeismTracking] API Response:', response);

      if (response.success) {
        // Reload reports to get updated data
        await loadReports();
        setSelectedReport(null);
        setAdminActionForm({ action: 'acknowledge', notes: '' });

        toast({
          title: "Action Completed",
          description: `Report has been ${adminActionForm.action === 'acknowledge' ? 'acknowledged' : 'resolved'}`,
        });
      } else {
        throw new Error(response.error || 'Failed to update report');
      }
    } catch (error: any) {
      console.error('[AbsenteeismTracking] Error in handleAdminAction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to perform action",
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
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'acknowledged':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs"><Eye className="w-3 h-3 mr-1" />Acknowledged</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs"><AlertTriangle className="w-3 h-3 mr-1" />High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs"><Clock className="w-3 h-3 mr-1" />Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{priority}</Badge>;
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            <h1 className="text-2xl sm:text-3xl font-bold">Absenteeism Tracking</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track student absenteeism and missing answer sheets with red flag system
          </p>
        </div>
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-500 hover:bg-red-600 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Report Absenteeism</span>
              <span className="sm:hidden">Report</span>
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-red-800">Red Flag Reports</CardTitle>
            <Flag className="h-4 w-4 text-red-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{redFlagReports}</div>
            <p className="text-xs text-red-600/70">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-yellow-800">Pending Reports</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{pendingReports}</div>
            <p className="text-xs text-yellow-600/70">Awaiting admin action</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-blue-800">Total Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{reports.length}</div>
            <p className="text-xs text-blue-600/70">All time reports</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-800">Resolved Reports</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
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
        {isLoadingData ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading reports...</p>
            </CardContent>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No reports found</p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
          <Card 
            key={report.id} 
            className={`border-l-4 ${report.isRedFlag ? 'border-l-red-500 bg-red-50/50' : 'border-l-primary'}`}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-4 flex-1 w-full">
                  {/* Report Header */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {getReportTypeIcon(report.reportType)}
                      <h3 className="text-base sm:text-lg font-semibold">{report.studentName}</h3>
                      {report.isRedFlag && (
                        <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse text-xs">
                          <Flag className="w-3 h-3 mr-1" />
                          RED FLAG
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {report.studentId}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {report.class}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        {report.subject}
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                        {report.examType}
                      </Badge>
                      {getStatusBadge(report.status)}
                      {getPriorityBadge(report.priority)}
                    </div>
                  </div>

                  {/* Report Details */}
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-4">
                  {report.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                      className="w-full sm:w-auto"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Take Action</span>
                      <span className="sm:hidden">Action</span>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Eye className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Create Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
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
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
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

