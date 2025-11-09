import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Search,
  Filter,
  Clock,
  RefreshCw,
  Download,
  Eye,
  BarChart3,
  PieChart,
  Target,
  CheckCircle,
  AlertTriangle,
  X
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
  subjectId?: {
    _id: string;
    name: string;
  };
  subjectIds?: Array<{
    _id: string;
    name: string;
  }>;
  classId: {
    _id: string;
    name: string;
  };
  examType: string;
  scheduledDate: string;
  duration: number;
  totalMarks: number;
}

interface StudentResult {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    rollNumber: string;
  };
  examId: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  rank: number;
  status: string;
  aiCorrectionResults?: {
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
  submittedAt: string;
  correctedAt: string;
}

interface ClassStats {
  totalStudents: number;
  appearedStudents: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passPercentage: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}

const TeacherResults = () => {
  const [teacherAccess, setTeacherAccess] = useState<TeacherAccess | null>(null);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamData, setSelectedExamData] = useState<Exam | null>(null);
  const [examSubjects, setExamSubjects] = useState<Array<{ _id: string; name: string }>>([]);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [sortBy, setSortBy] = useState('rank');
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTeacherAccess();
  }, []);

  useEffect(() => {
    if (teacherAccess) {
      loadExams();
    }
  }, [teacherAccess]);

  useEffect(() => {
    if (selectedExam) {
      const exam = exams.find(e => e._id === selectedExam);
      if (exam) {
        setSelectedExamData(exam);
        // Extract subjects from exam (handle both subjectId and subjectIds)
        const subjects: Array<{ _id: string; name: string }> = [];
        if (exam.subjectIds && Array.isArray(exam.subjectIds)) {
          subjects.push(...exam.subjectIds);
        } else if (exam.subjectId) {
          subjects.push(exam.subjectId);
        }
        setExamSubjects(subjects);
        // Reset subject selection when exam changes
        setSelectedSubject('all');
      }
      loadResults();
      loadClassStats();
    } else {
      // Reset results when exam is cleared
      setStudentResults([]);
      setClassStats(null);
      setSelectedExamData(null);
      setExamSubjects([]);
      setSelectedSubject('all');
    }
  }, [selectedExam, exams]);

  // Filter results by selected subject
  useEffect(() => {
    // Results are already loaded, we'll filter them in the render
  }, [selectedSubject]);

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
      const response = await teacherDashboardAPI.getExams({});
      setExams(response.data || []);
      
      // Reset selected exam if it's no longer in the list
      if (selectedExam && !response.data.find((e: Exam) => e._id === selectedExam)) {
        setSelectedExam('');
      }
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

  const loadResults = async () => {
    if (!selectedExam) return;

    try {
      setLoadingResults(true);
      const response = await teacherDashboardAPI.getExamResults(selectedExam);
      setStudentResults(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load results",
        variant: "destructive",
      });
    } finally {
      setLoadingResults(false);
    }
  };

  const loadClassStats = async () => {
    if (!selectedExam) return;

    try {
      const response = await teacherDashboardAPI.getClassStats(selectedExam);
      setClassStats(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load class statistics",
        variant: "destructive",
      });
    }
  };

  const getGradeBadge = (grade: string) => {
    const gradeConfig = {
      A: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: Award },
      B: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', icon: CheckCircle },
      C: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: AlertTriangle },
      D: { color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300', icon: AlertTriangle },
      F: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: X },
    };

    const config = gradeConfig[grade as keyof typeof gradeConfig] || gradeConfig.F;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        Grade {grade}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PASSED: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: CheckCircle },
      FAILED: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: X },
      ABSENT: { color: 'bg-muted text-muted-foreground', icon: Clock },
      PENDING: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const handleViewDetails = (result: StudentResult) => {
    setSelectedResult(result);
    setViewDetailsOpen(true);
  };

  const handleDownloadReport = async (result: StudentResult) => {
    try {
      // Get API base URL using the same method as api.ts
      const getApiBaseUrl = () => {
        const envUrl = import.meta.env.VITE_API_BASE_URL;
        
        if (envUrl) {
          return envUrl.startsWith('http') ? envUrl : `http://${envUrl}`;
        }
        
        if (typeof window !== 'undefined') {
          const protocol = window.location.protocol;
          const hostname = window.location.hostname;
          const port = window.location.port;
          const apiPort = port === '8080' || port === '5173' || port === '3000' ? '4000' : (port || '4000');
          return `${protocol}//${hostname}:${apiPort}/api`;
        }
        
        return 'http://localhost:4000/api';
      };

      const API_BASE_URL = getApiBaseUrl();
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to download reports",
          variant: "destructive",
        });
        return;
      }

      console.log('[DOWNLOAD] Starting download:', {
        examId: result.examId,
        studentId: result.studentId._id,
        apiUrl: API_BASE_URL
      });

      // Step 1: Find the answer sheet ID for this student and exam
      const answerSheetsUrl = `${API_BASE_URL}/teacher/answer-sheets/${result.examId}`;
      const answerSheetsResponse = await fetch(answerSheetsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!answerSheetsResponse.ok) {
        console.error('[DOWNLOAD] Failed to fetch answer sheets:', answerSheetsResponse.status);
        // Fallback to results download endpoint
        const resultsDownloadUrl = `${API_BASE_URL}/teacher/results/download?examId=${result.examId}&format=PDF&studentId=${result.studentId._id}`;
        const resultsResponse = await fetch(resultsDownloadUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!resultsResponse.ok) {
          throw new Error(`Failed to download: ${resultsResponse.status}`);
        }

        const data = await resultsResponse.json();
        if (data.success && data.data?.downloadUrl) {
          const fullDownloadUrl = data.data.downloadUrl.startsWith('http') 
            ? data.data.downloadUrl 
            : `${API_BASE_URL.replace('/api', '')}${data.data.downloadUrl}`;
          window.open(fullDownloadUrl, '_blank');
          toast({
            title: "Download Started",
            description: "Report download has started",
          });
          return;
        } else {
          throw new Error(data.error || 'Download URL not provided');
        }
      }

      const answerSheetsData = await answerSheetsResponse.json();
      const answerSheet = answerSheetsData.data?.find((sheet: any) => 
        sheet.studentId?._id === result.studentId._id || 
        sheet.studentId?.toString() === result.studentId._id
      );

      if (!answerSheet || !answerSheet._id) {
        toast({
          title: "Error",
          description: "Answer sheet not found for this student",
          variant: "destructive",
        });
        return;
      }

      console.log('[DOWNLOAD] Found answer sheet:', answerSheet._id);

      // Step 2: Use the printing endpoint to generate PDF
      const printUrl = `${API_BASE_URL}/prints/answer-sheet/${answerSheet._id}`;
      const printResponse = await fetch(printUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          includeFeedback: true,
          includePerformanceAnalysis: true,
          includeAnswerSheetImage: false,
          includeStepMarks: true,
          includeDeductions: true,
          format: 'PDF'
        })
      });

      if (!printResponse.ok) {
        const errorText = await printResponse.text();
        console.error('[DOWNLOAD] Print endpoint error:', errorText);
        throw new Error(`Failed to generate PDF: ${printResponse.status}`);
      }

      const printData = await printResponse.json();
      console.log('[DOWNLOAD] Print response:', printData);

      if (printData.success && printData.data?.downloadUrl) {
        // Construct full download URL (same pattern as question paper download)
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || 
          (typeof window !== 'undefined' 
            ? `${window.location.protocol}//${window.location.hostname}:4000`
            : 'http://localhost:4000');
        
        const fullDownloadUrl = printData.data.downloadUrl.startsWith('http')
          ? printData.data.downloadUrl
          : `${baseUrl}${printData.data.downloadUrl}`;

        // Open PDF in new tab (like question paper download)
        window.open(fullDownloadUrl, '_blank');
        
        toast({
          title: "Success",
          description: "Report is opening in a new tab",
        });
      } else {
        throw new Error(printData.error || 'Download URL not provided by server');
      }
    } catch (error) {
      console.error('[DOWNLOAD] Download error:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Network Error",
          description: "Unable to connect to server. Please check your connection and try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredResults = studentResults.filter(result => {
    const matchesSearch = result.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        result.studentId.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'all' || result.grade === filterGrade;
    
    // Filter by selected subject if exam is selected and subject filter is active
    let matchesSubject = true;
    if (selectedExam && selectedSubject !== 'all' && selectedExamData) {
      // For now, we'll show all results for the exam since results are already filtered by exam
      // Subject filtering can be added if needed based on result data structure
      matchesSubject = true;
    }
    
    return matchesSearch && matchesGrade && matchesSubject;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'rank':
        return a.rank - b.rank;
      case 'marks':
        return b.obtainedMarks - a.obtainedMarks;
      case 'percentage':
        return b.percentage - a.percentage;
      case 'name':
        return a.studentId.name.localeCompare(b.studentId.name);
      default:
        return a.rank - b.rank;
    }
  });

  if (!teacherAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading teacher access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Exam Results</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and analyze student performance and results
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={loadResults}
            disabled={loadingResults}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingResults ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export Results</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Exam Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
          <CardDescription>Choose an exam to view results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exam">Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam} disabled={loadingExams}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingExams ? "Loading exams..." : "Select an exam"} />
                </SelectTrigger>
                <SelectContent>
                  {exams.length === 0 ? (
                    <SelectItem value="no-exams" disabled>
                      No exams found
                    </SelectItem>
                  ) : (
                    exams.map((exam) => (
                      <SelectItem key={exam._id} value={exam._id}>
                        {exam.title} - {new Date(exam.scheduledDate).toLocaleDateString()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedExam && examSubjects.length > 0 && (
              <div>
                <Label htmlFor="subject">Subject {examSubjects.length > 1 ? '(Optional)' : ''}</Label>
                <Select 
                  value={selectedSubject || "all"} 
                  onValueChange={(value) => setSelectedSubject(value === "all" ? "all" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {examSubjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters - Only show when exam is selected */}
      {selectedExam && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Select value={filterGrade} onValueChange={setFilterGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="A">Grade A</SelectItem>
                    <SelectItem value="B">Grade B</SelectItem>
                    <SelectItem value="C">Grade C</SelectItem>
                    <SelectItem value="D">Grade D</SelectItem>
                    <SelectItem value="F">Grade F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sort">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rank">Rank</SelectItem>
                    <SelectItem value="marks">Marks</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="search">Search Students</Label>
                <Input
                  id="search"
                  placeholder="Search by name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Statistics */}
      {classStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Students</p>
                  <p className="text-xl sm:text-2xl font-bold">{classStats.totalStudents}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Appeared</p>
                  <p className="text-xl sm:text-2xl font-bold">{classStats.appearedStudents}</p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Average Marks</p>
                  <p className="text-xl sm:text-2xl font-bold">{classStats.averageMarks.toFixed(1)}</p>
                </div>
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Pass Percentage</p>
                  <p className="text-xl sm:text-2xl font-bold">{classStats.passPercentage.toFixed(1)}%</p>
                </div>
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grade Distribution */}
      {classStats && (
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Object.entries(classStats.gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">{count}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Grade {grade}</div>
                  <Progress 
                    value={(count / classStats.totalStudents) * 100} 
                    className="mt-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results List */}
      {loadingResults ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading results...</span>
            </div>
          </CardContent>
        </Card>
      ) : sortedResults.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No results found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedExam ? 'No results found for this exam.' : 'Please select an exam to view results.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedResults.map((result) => (
            <Card key={result._id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">{result.studentId.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      <span className="block sm:inline">Roll: {result.studentId.rollNumber}</span>
                      <span className="hidden sm:inline"> | </span>
                      <span className="block sm:inline">Rank: #{result.rank}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    {getGradeBadge(result.grade)}
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Marks Obtained</div>
                    <div className="text-base sm:text-lg font-bold">
                      {result.obtainedMarks} / {result.totalMarks}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Percentage</div>
                    <div className="text-base sm:text-lg font-bold">{result.percentage.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Grade</div>
                    <div className="text-base sm:text-lg font-bold">{result.grade}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Status</div>
                    <div className="text-base sm:text-lg font-bold">{result.status}</div>
                  </div>
                </div>

                {result.aiCorrectionResults && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">AI Feedback</div>
                    <div className="text-sm text-blue-700 dark:text-blue-200">{result.aiCorrectionResults.overallFeedback}</div>
                  </div>
                )}

                {result.manualOverride && (
                  <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">Manual Override</div>
                    <div className="text-sm text-purple-700 dark:text-purple-200">
                      Reason: {result.manualOverride.reason}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(result)}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">Details</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReport(result)}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Download Report</span>
                    <span className="sm:hidden">Download</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Result Details
            </DialogTitle>
            <DialogDescription>
              Detailed analysis for {selectedResult?.studentId.name}
            </DialogDescription>
          </DialogHeader>

          {selectedResult && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 min-w-0">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="questions" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 min-w-0">
                  <span className="hidden sm:inline">Question Details</span>
                  <span className="sm:hidden">Questions</span>
                </TabsTrigger>
                <TabsTrigger value="analysis" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 min-w-0">
                  Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="text-xs sm:text-sm text-muted-foreground">Total Marks</div>
                      <div className="text-xl sm:text-2xl font-bold">
                        {selectedResult.obtainedMarks} / {selectedResult.totalMarks}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="text-xs sm:text-sm text-muted-foreground">Percentage</div>
                      <div className="text-xl sm:text-2xl font-bold">{selectedResult.percentage.toFixed(1)}%</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="text-xs sm:text-sm text-muted-foreground">Grade</div>
                      <div className="text-xl sm:text-2xl font-bold">{selectedResult.grade}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="text-xs sm:text-sm text-muted-foreground">Rank</div>
                      <div className="text-xl sm:text-2xl font-bold">#{selectedResult.rank}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Name</div>
                        <div className="font-medium">{selectedResult.studentId.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Roll Number</div>
                        <div className="font-medium">{selectedResult.studentId.rollNumber}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div>{getStatusBadge(selectedResult.status)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Corrected At</div>
                        <div className="font-medium">
                          {selectedResult.correctedAt 
                            ? new Date(selectedResult.correctedAt).toLocaleString()
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedResult.aiCorrectionResults?.overallFeedback && (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Overall Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedResult.aiCorrectionResults.overallFeedback}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedResult.manualOverride && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Manual Override</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-muted-foreground">Reason</div>
                          <div className="font-medium">{selectedResult.manualOverride.reason}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Overridden At</div>
                          <div className="font-medium">
                            {new Date(selectedResult.manualOverride.overriddenAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="questions" className="space-y-4 mt-4">
                {selectedResult.aiCorrectionResults?.questionWiseResults && 
                 selectedResult.aiCorrectionResults.questionWiseResults.length > 0 ? (
                  <div className="space-y-4">
                    {selectedResult.aiCorrectionResults.questionWiseResults.map((qResult, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <CardTitle className="text-sm sm:text-base">Question {qResult.questionNumber}</CardTitle>
                            <Badge 
                              className={
                                qResult.isCorrect 
                                  ? 'bg-green-100 text-green-800 text-xs' 
                                  : 'bg-red-100 text-red-800 text-xs'
                              }
                            >
                              {qResult.marksObtained} / {qResult.maxMarks} Marks
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-foreground mb-1">Student Answer:</div>
                            <div className="text-sm bg-muted p-2 rounded">{qResult.studentAnswer}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground mb-1">Correct Answer:</div>
                            <div className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">{qResult.correctAnswer}</div>
                          </div>
                          {qResult.feedback && (
                            <div>
                              <div className="text-sm font-medium text-foreground mb-1">Feedback:</div>
                              <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">{qResult.feedback}</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No question-wise details available
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4 mt-4">
                {selectedResult.aiCorrectionResults ? (
                  <div className="space-y-4">
                    {selectedResult.aiCorrectionResults.strengths && 
                     selectedResult.aiCorrectionResults.strengths.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-green-700">Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedResult.aiCorrectionResults.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm">{strength}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    
                    {selectedResult.aiCorrectionResults.weaknesses && 
                     selectedResult.aiCorrectionResults.weaknesses.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-orange-700">Areas for Improvement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedResult.aiCorrectionResults.weaknesses.map((weakness, idx) => (
                              <li key={idx} className="text-sm">{weakness}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    
                    {selectedResult.aiCorrectionResults.suggestions && 
                     selectedResult.aiCorrectionResults.suggestions.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-blue-700">Suggestions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedResult.aiCorrectionResults.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-sm">{suggestion}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No analysis data available
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherResults;
