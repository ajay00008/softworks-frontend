import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Download,
  Search,
  Filter,
  Clock,
  Users,
  BookOpen,
  RefreshCw,
  X,
  Target,
  Award,
  TrendingUp,
  FileText,
  Scan,
  Zap,
  UploadCloud
} from 'lucide-react';
import { teacherDashboardAPI } from '@/services/api';

interface TeacherAccess {
  classAccess: Array<{
    classId: string;
    className: string;
    accessLevel: string;
    canUploadSheets: boolean;
    canMarkAbsent: boolean;
    canMarkMissing: boolean;
    canOverrideAI: boolean;
  }>;
  subjectAccess: Array<{
    subjectId: string;
    subjectName: string;
    accessLevel: string;
    canCreateQuestions: boolean;
    canUploadSyllabus: boolean;
  }>;
  globalPermissions: {
    canViewAllClasses: boolean;
    canViewAllSubjects: boolean;
    canAccessAnalytics: boolean;
    canPrintReports: boolean;
    canSendNotifications: boolean;
  };
}

interface Exam {
  _id: string;
  title: string;
  subjectId: {
    _id: string;
    name: string;
  };
  classId: {
    _id: string;
    name: string;
  };
  examType: string;
  scheduledDate: string;
  duration: number;
  totalMarks: number;
}

interface AnswerSheet {
  _id: string;
  examId: string;
  studentId: {
    _id: string;
    name: string;
    rollNumber: string;
  };
  status: string;
  aiCorrectionResults?: {
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    questionWiseResults: Array<{
      questionNumber: number;
      correctAnswer: string;
      studentAnswer: string;
      isCorrect: boolean;
      marksObtained: number;
      maxMarks: number;
      feedback: string;
    }>;
    overallFeedback: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  manualOverride?: {
    totalMarks: number;
    obtainedMarks: number;
    reason: string;
    overriddenBy: string;
    overriddenAt: string;
  };
  scanQuality: string;
  isAligned: boolean;
  rollNumberDetected: boolean;
  uploadedAt: string;
}

const AIAnswerChecking = () => {
  const [teacherAccess, setTeacherAccess] = useState<TeacherAccess | null>(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedExam, setSelectedExam] = useState('');
  const [answerSheets, setAnswerSheets] = useState<AnswerSheet[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [processingSheets, setProcessingSheets] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeacherAccess();
  }, []);

  useEffect(() => {
    if (teacherAccess) {
      loadExams();
      setSelectedExam(''); // Reset exam selection when filters change
    }
  }, [teacherAccess, selectedClass, selectedSubject]);

  useEffect(() => {
    if (teacherAccess && selectedExam) {
      loadAnswerSheets();
    }
  }, [teacherAccess, selectedExam]);

  const loadTeacherAccess = async () => {
    try {
      const response = await teacherDashboardAPI.getAccess();
      setTeacherAccess(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load teacher access",
        variant: "destructive",
      });
    }
  };

  const loadExams = async () => {
    try {
      setLoadingExams(true);
      const response = await teacherDashboardAPI.getExams({
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
      });
      setExams(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exams",
        variant: "destructive",
      });
    } finally {
      setLoadingExams(false);
    }
  };

  const loadAnswerSheets = async () => {
    if (!selectedExam) return;

    try {
      setLoadingSheets(true);
      const response = await teacherDashboardAPI.getAnswerSheets(selectedExam);
      setAnswerSheets(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load answer sheets",
        variant: "destructive",
      });
    } finally {
      setLoadingSheets(false);
    }
  };

  const processAnswerSheet = async (sheetId: string) => {
    try {
      setProcessingSheets(prev => [...prev, sheetId]);
      const response = await teacherDashboardAPI.processAnswerSheet(sheetId);
      
      toast({
        title: "Success",
        description: "Answer sheet processed successfully",
      });
      
      // Reload answer sheets to get updated results
      await loadAnswerSheets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process answer sheet",
        variant: "destructive",
      });
    } finally {
      setProcessingSheets(prev => prev.filter(id => id !== sheetId));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      UPLOADED: { color: 'bg-blue-100 text-blue-800', icon: UploadCloud },
      PROCESSING: { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw },
      CORRECTED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      ERROR: { color: 'bg-red-100 text-red-800', icon: X },
      OVERRIDDEN: { color: 'bg-purple-100 text-purple-800', icon: Award },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.UPLOADED;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getQualityBadge = (quality: string) => {
    const qualityConfig = {
      EXCELLENT: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      GOOD: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      FAIR: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      POOR: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      UNREADABLE: { color: 'bg-red-100 text-red-800', icon: X },
    };

    const config = qualityConfig[quality as keyof typeof qualityConfig] || qualityConfig.POOR;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {quality}
      </Badge>
    );
  };

  const filteredSheets = answerSheets.filter(sheet => {
    const studentName = sheet.studentId?.name || 'Unknown Student';
    const studentRollNumber = sheet.studentId?.rollNumber || 'N/A';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        studentRollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sheet.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!teacherAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teacher access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Answer Checking</h1>
          <p className="text-gray-600">
            Review and manage AI-corrected answer sheets
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadAnswerSheets}
            disabled={loadingSheets}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingSheets ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {teacherAccess.classAccess?.map((cls) => (
                    <SelectItem key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {teacherAccess.subjectAccess?.map((subject) => (
                    <SelectItem key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectName}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="exam">Exam {exams.length > 0 && `(${exams.length} found)`}</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingExams ? "Loading exams..." : "Select Exam"} />
                </SelectTrigger>
                <SelectContent>
                  {exams.length === 0 && !loadingExams ? (
                    <SelectItem value="no-exams" disabled>
                      No exams found for selected filters
                    </SelectItem>
                  ) : (
                    exams.map((exam) => (
                      <SelectItem key={exam._id} value={exam._id}>
                        {exam.title} - {exam.subjectId?.name || 'Unknown Subject'} ({exam.classId?.name || 'Unknown Class'})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="UPLOADED">Uploaded</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="CORRECTED">Corrected</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="OVERRIDDEN">Overridden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="search">Search Students</Label>
            <Input
              id="search"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Answer Sheets List */}
      {loadingSheets ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading answer sheets...</span>
            </div>
          </CardContent>
        </Card>
      ) : filteredSheets.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No answer sheets found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedExam ? 'No answer sheets found for this exam.' : 'Please select an exam to view answer sheets.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSheets.map((sheet) => (
            <Card key={sheet._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{sheet.studentId?.name || 'Unknown Student'}</CardTitle>
                    <CardDescription>
                      Roll Number: {sheet.studentId?.rollNumber || 'N/A'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(sheet.status)}
                    {getQualityBadge(sheet.scanQuality)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-500">Uploaded:</span>
                      <div>{new Date(sheet.uploadedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Alignment:</span>
                      <div className="flex items-center gap-1">
                        {sheet.isAligned ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        )}
                        <span>{sheet.isAligned ? 'Aligned' : 'Needs Alignment'}</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Roll Number:</span>
                      <div className="flex items-center gap-1">
                        {sheet.rollNumberDetected ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span>{sheet.rollNumberDetected ? 'Detected' : 'Not Detected'}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Results */}
                  {sheet.aiCorrectionResults && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">AI Correction Results</div>
                      <div className="text-sm">
                        <span className="text-gray-500">Marks:</span>
                        <div className="font-medium">
                          {sheet.aiCorrectionResults.obtainedMarks} / {sheet.aiCorrectionResults.totalMarks}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Percentage:</span>
                        <div className="font-medium">{sheet.aiCorrectionResults.percentage}%</div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Questions:</span>
                        <div>{sheet.aiCorrectionResults.questionWiseResults.length} questions</div>
                      </div>
                    </div>
                  )}

                  {/* Manual Override */}
                  {sheet.manualOverride && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-purple-600">Manual Override</div>
                      <div className="text-sm">
                        <span className="text-gray-500">Marks:</span>
                        <div className="font-medium">
                          {sheet.manualOverride.obtainedMarks} / {sheet.manualOverride.totalMarks}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Reason:</span>
                        <div>{sheet.manualOverride.reason}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => processAnswerSheet(sheet._id)}
                    disabled={processingSheets.includes(sheet._id)}
                  >
                    {processingSheets.includes(sheet._id) ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    {processingSheets.includes(sheet._id) ? 'Processing...' : 'Process with AI'}
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAnswerChecking;
