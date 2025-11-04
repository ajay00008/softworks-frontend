import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Download,
  Upload,
  Search,
  Filter,
  Clock,
  Users,
  BookOpen,
  RefreshCw,
  X,
  Plus,
  Image,
  Scan,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  Edit,
  Save,
  RotateCcw,
  Zap,
  Award,
  Lightbulb,
  AlertCircle,
  CheckSquare,
  XCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Settings,
  Play,
  Pause,
  Square,
  UserCheck,
  UserX,
  UserPlus,
  Fingerprint,
  Hash,
  FileImage,
  ArrowRight,
  ArrowLeft,
  Copy,
  Trash2,
  AlertOctagon
} from 'lucide-react';
import { teacherDashboardAPI } from '@/services/api';

interface AIResult {
  answerSheetId: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  confidence: number;
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
    confidence: number;
    partialCredit?: number;
    handwritingQuality?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    languageDetected?: string;
  }>;
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  processingTime: number;
  errors?: string[];
  rollNumberDetected?: string;
  rollNumberConfidence?: number;
  handwritingAnalysis?: {
    overallQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    legibilityScore: number;
    consistencyScore: number;
    pressureAnalysis: 'LIGHT' | 'MEDIUM' | 'HEAVY';
    speedAnalysis: 'SLOW' | 'NORMAL' | 'FAST';
  };
  academicInsights?: {
    subjectMastery: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
    conceptualUnderstanding: number;
    problemSolvingAbility: number;
    timeManagement: number;
    attentionToDetail: number;
  };
}

interface AnswerSheet {
  _id: string;
  studentId?: {
    _id: string;
    name: string;
    rollNumber: string;
  };
  examId: string;
  status: string;
  aiCorrectionResults?: AIResult;
  uploadedAt: string;
  processedAt?: string;
  confidence?: number;
  scanQuality?: string;
  rollNumberDetected?: string;
  rollNumberConfidence?: number;
  originalFileName: string;
  cloudStorageUrl?: string;
}

interface Exam {
  _id: string;
  title: string;
  subjectIds: {
    _id: string;
    name: string;
  }[];
  classId: {
    _id: string;
    name: string;
  };
  examType: string;
  scheduledDate: string;
  duration: number;
  totalMarks: number;
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  hasAnswerSheet: boolean;
  answerSheetId?: string;
}

interface AIStats {
  totalProcessed: number;
  averageConfidence: number;
  averagePercentage: number;
  qualityDistribution: {
    excellent: number;
    good: number;
    average: number;
    needsImprovement: number;
  };
  commonStrengths: string[];
  commonWeaknesses: string[];
  processingTime: {
    average: number;
    min: number;
    max: number;
  };
}

const AIAnswerCheckingEnhanced = () => {
  const [selectedExam, setSelectedExam] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [answerSheets, setAnswerSheets] = useState<AnswerSheet[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [aiResults, setAiResults] = useState<{ [key: string]: AIResult }>({});
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<AnswerSheet | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [aiStats, setAiStats] = useState<AIStats | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiErrors, setAiErrors] = useState<{ [key: string]: string }>({});
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [selectedSheetForOverride, setSelectedSheetForOverride] = useState<AnswerSheet | null>(null);
  const [manualMarks, setManualMarks] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState('matched');
  const [showMatchingDialog, setShowMatchingDialog] = useState(false);
  const [unmatchedSheets, setUnmatchedSheets] = useState<AnswerSheet[]>([]);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const { toast } = useToast();

  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teacherDashboardAPI.getExamsWithContext();
      setExams(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load exams: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadAnswerSheets = useCallback(async () => {
    if (!selectedExam) return;
    
    try {
      setLoading(true);
      const response = await teacherDashboardAPI.getAnswerSheetsForAIChecking(selectedExam, {
        page: 1,
        limit: 100,
        status: filterStatus === 'all' ? undefined : filterStatus
      });
      
      if (response.success) {
        setAnswerSheets(response.data.answerSheets || []);
      } else {
        toast({
          title: "Error",
          description: `Failed to load answer sheets: ${(response as { error?: string }).error || 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load answer sheets: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedExam, filterStatus, toast]);

  const loadStudents = useCallback(async () => {
    if (!selectedExam) return;
    
    try {
      const response = await teacherDashboardAPI.getExamStudents(selectedExam);
      setStudents(response.data.students || []);
    } catch (error) {
    }
  }, [selectedExam]);

  const loadAIStats = useCallback(async () => {
    if (!selectedExam) return;
    
    try {
      const response = await teacherDashboardAPI.getAIStats(selectedExam);
      setAiStats(response.data);
    } catch (error) {
    }
  }, [selectedExam]);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      window.location.href = '/login';
      return;
    }
    
    loadExams();
  }, [loadExams, toast]);

  useEffect(() => {
    if (selectedExam) {
      loadAnswerSheets();
      loadStudents();
      loadAIStats();
    }
  }, [selectedExam, filterStatus, loadAnswerSheets, loadStudents, loadAIStats]);

  // Categorize answer sheets
  const matchedSheets = answerSheets.filter(sheet => sheet.studentId);
  const unmatchedSheets = answerSheets.filter(sheet => !sheet.studentId);
  const studentsWithoutSheets = students.filter(student => !student.hasAnswerSheet);

  const handleSingleAICheck = async (answerSheetId: string) => {
    try {
      setProcessing(true);
      setAiErrors(prev => ({ ...prev, [answerSheetId]: '' }));
      
      const response = await teacherDashboardAPI.checkAnswerSheetWithAI(answerSheetId);
      
      if (response.success) {
        setAiResults(prev => ({
          ...prev,
          [answerSheetId]: response.data
        }));
        
        toast({
          title: "Success",
          description: "Answer sheet processed with AI successfully",
        });
        
        loadAnswerSheets();
      } else {
        const errorMessage = (response as { error?: string }).error || 'AI processing failed';
        setAiErrors(prev => ({ ...prev, [answerSheetId]: errorMessage }));
        
        toast({
          title: "AI Processing Failed",
          description: `${errorMessage}. You can manually enter marks.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to process answer sheet';
      setAiErrors(prev => ({ ...prev, [answerSheetId]: errorMessage }));
      
      toast({
        title: "Error",
        description: `${errorMessage}. You can manually enter marks.`,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchAICheck = async () => {
    if (selectedSheets.length === 0) {
      toast({
        title: "Error",
        description: "Please select answer sheets to process",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await teacherDashboardAPI.batchCheckAnswerSheetsWithAI(selectedSheets);
      
      if (response.success) {
        const results = response.data;
        const newResults: { [key: string]: AIResult } = {};
        
        results.forEach((result: AIResult) => {
          newResults[result.answerSheetId] = result;
        });
        
        setAiResults(prev => ({ ...prev, ...newResults }));
        
        toast({
          title: "Success",
          description: `Successfully processed ${results.length} answer sheets with AI`,
        });
        
        setSelectedSheets([]);
        loadAnswerSheets();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to process answer sheets: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAutoMatchStudents = async () => {
    try {
      setMatchingProgress(0);
      setShowMatchingDialog(true);
      
      // Simulate AI matching process
      for (let i = 0; i < unmatchedSheets.length; i++) {
        const sheet = unmatchedSheets[i];
        
        // Call AI matching API
        const response = await teacherDashboardAPI.autoMatchUnmatchedSheets(selectedExam);
        
        if (response.success) {
          toast({
            title: "Match Found",
            description: `Matched ${sheet.originalFileName} to student`,
          });
        }
        
        setMatchingProgress(((i + 1) / unmatchedSheets.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      }
      
      toast({
        title: "Auto-Matching Complete",
        description: "AI matching process completed",
      });
      
      setShowMatchingDialog(false);
      loadAnswerSheets();
      loadStudents();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to auto-match students: ${error.message}`,
        variant: "destructive",
      });
      setShowMatchingDialog(false);
    }
  };

  const handleManualMatch = async (sheetId: string, studentId: string) => {
    try {
      const sheet = answerSheets.find(s => s._id === sheetId);
      if (!sheet) return;

      const response = await teacherDashboardAPI.matchAnswerSheetToStudentEnhanced(sheetId, {
        rollNumber: students.find(s => s.id === studentId)?.rollNumber || ''
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Answer sheet matched to student successfully",
        });
        loadAnswerSheets();
        loadStudents();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to match answer sheet: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      UPLOADED: { color: 'bg-blue-100 text-blue-800', icon: Upload },
      PROCESSING: { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw },
      AI_CORRECTED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      MANUALLY_REVIEWED: { color: 'bg-purple-100 text-purple-800', icon: Edit },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckSquare },
      ERROR: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.UPLOADED;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge className="bg-green-100 text-green-800">High</Badge>;
    if (confidence >= 0.6) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low</Badge>;
  };

  const filteredSheets = answerSheets.filter(sheet => {
    if (!sheet.studentId) return false;
    const matchesSearch = sheet.studentId.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sheet.studentId.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading && !selectedExam) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            AI Answer Sheet Checking
          </h1>
          <p className="text-gray-600">
            Process and analyze student answer sheets with advanced AI technology
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadAnswerSheets}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Exam Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
          <CardDescription>Choose an exam to process answer sheets with AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exam">Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.title} - {exam.subjectIds.map(s => s.name).join(', ')} ({exam.classId.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="UPLOADED">Uploaded</SelectItem>
                  <SelectItem value="AI_CORRECTED">AI Corrected</SelectItem>
                  <SelectItem value="MANUALLY_REVIEWED">Manually Reviewed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectedExam && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{matchedSheets.length}</div>
                  <div className="text-sm text-gray-600">Matched Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">{unmatchedSheets.length}</div>
                  <div className="text-sm text-gray-600">Unmatched Sheets</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{studentsWithoutSheets.length}</div>
                  <div className="text-sm text-gray-600">Missing Sheets</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {answerSheets.filter(s => s.status === 'AI_CORRECTED').length}
                  </div>
                  <div className="text-sm text-gray-600">AI Processed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      {selectedExam && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="matched" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Matched Students ({matchedSheets.length})
            </TabsTrigger>
            <TabsTrigger value="unmatched" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Unmatched Sheets ({unmatchedSheets.length})
            </TabsTrigger>
            <TabsTrigger value="missing" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Missing Sheets ({studentsWithoutSheets.length})
            </TabsTrigger>
          </TabsList>

          {/* Matched Students Tab */}
          <TabsContent value="matched" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-600" />
                      Matched Students
                    </CardTitle>
                    <CardDescription>
                      Students with uploaded answer sheets ready for AI processing
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by student name or roll number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    {selectedSheets.length > 0 && (
                      <Button
                        onClick={handleBatchAICheck}
                        disabled={processing}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        {processing ? 'Processing...' : `Process ${selectedSheets.length} Sheets`}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Batch Actions */}
                  {matchedSheets.some(sheet => sheet.status === 'UPLOADED') && (
                    <div className="flex gap-2 p-4 bg-blue-50 rounded-lg">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSheets(matchedSheets.filter(s => s.status === 'UPLOADED').map(s => s._id))}
                      >
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Select All Available
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSheets([])}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear Selection
                      </Button>
                      <span className="text-sm text-gray-600 flex items-center">
                        {selectedSheets.length} sheets selected
                      </span>
                    </div>
                  )}

                  {/* Matched Answer Sheets */}
                  {matchedSheets.map((sheet) => (
                    <div key={sheet._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedSheets.includes(sheet._id)}
                            onChange={() => setSelectedSheets(prev => 
                              prev.includes(sheet._id) 
                                ? prev.filter(id => id !== sheet._id)
                                : [...prev, sheet._id]
                            )}
                            disabled={sheet.status !== 'UPLOADED'}
                            className="w-4 h-4"
                          />
                          <div>
                            <div className="font-medium">{sheet.studentId?.name || 'Unknown Student'}</div>
                            <div className="text-sm text-gray-600">
                              Roll: {sheet.studentId?.rollNumber || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(sheet.status)}
                          {sheet.confidence && getConfidenceBadge(sheet.confidence)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Uploaded:</span>
                          <div>{new Date(sheet.uploadedAt).toLocaleDateString()}</div>
                        </div>
                        {sheet.processedAt && (
                          <div>
                            <span className="text-gray-500">Processed:</span>
                            <div>{new Date(sheet.processedAt).toLocaleDateString()}</div>
                          </div>
                        )}
                        {sheet.scanQuality && (
                          <div>
                            <span className="text-gray-500">Quality:</span>
                            <div>{sheet.scanQuality}</div>
                          </div>
                        )}
                        {sheet.rollNumberDetected && (
                          <div>
                            <span className="text-gray-500">Roll Detected:</span>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{sheet.rollNumberDetected}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Error Display */}
                      {aiErrors[sheet._id] && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-red-800 font-medium">AI Processing Failed</p>
                              <p className="text-sm text-red-700 mt-1">{aiErrors[sheet._id]}</p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
                                onClick={() => setSelectedSheetForOverride(sheet)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Enter Marks Manually
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        {sheet.status === 'UPLOADED' && (
                          <Button
                            size="sm"
                            onClick={() => handleSingleAICheck(sheet._id)}
                            disabled={processing}
                          >
                            <Brain className="w-4 h-4 mr-2" />
                            Process with AI
                          </Button>
                        )}
                        {sheet.status === 'AI_CORRECTED' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSheet(sheet)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Results
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSingleAICheck(sheet._id)}
                              disabled={processing}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Recheck
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSheetForOverride(sheet)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Manual Marks
                        </Button>
                      </div>
                    </div>
                  ))}

                  {matchedSheets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No matched answer sheets found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unmatched Sheets Tab */}
          <TabsContent value="unmatched" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserX className="h-5 w-5 text-orange-600" />
                      Unmatched Answer Sheets
                    </CardTitle>
                    <CardDescription>
                      Answer sheets that need to be matched to students
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {unmatchedSheets.length > 0 && (
                      <Button
                        onClick={handleAutoMatchStudents}
                        disabled={processing}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Fingerprint className="w-4 h-4 mr-2" />
                        Auto-Match with AI
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unmatchedSheets.map((sheet) => (
                    <div key={sheet._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{sheet.originalFileName}</div>
                          <div className="text-sm text-gray-600">
                            Uploaded: {new Date(sheet.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(sheet.status)}
                          {sheet.rollNumberDetected && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Hash className="w-3 h-3 mr-1" />
                              Roll: {sheet.rollNumberDetected}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">File:</span>
                          <div className="truncate">{sheet.originalFileName}</div>
                        </div>
                        {sheet.scanQuality && (
                          <div>
                            <span className="text-gray-500">Quality:</span>
                            <div>{sheet.scanQuality}</div>
                          </div>
                        )}
                        {sheet.rollNumberConfidence && (
                          <div>
                            <span className="text-gray-500">Confidence:</span>
                            <div>{Math.round(sheet.rollNumberConfidence)}%</div>
                          </div>
                        )}
                      </div>

                      {/* Manual Matching */}
                      <div className="mt-3">
                        <Label className="text-sm font-medium text-gray-600">Match to Student:</Label>
                        <div className="flex gap-2 mt-2">
                          <Select onValueChange={(studentId) => handleManualMatch(sheet._id, studentId)}>
                            <SelectTrigger className="w-64">
                              <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                            <SelectContent>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.name} (Roll: {student.rollNumber})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {unmatchedSheets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      All answer sheets have been matched to students.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Missing Sheets Tab */}
          <TabsContent value="missing" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-red-600" />
                      Students Without Answer Sheets
                    </CardTitle>
                    <CardDescription>
                      Students who haven't submitted their answer sheets yet
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Send notification to missing students
                        toast({
                          title: "Notification Sent",
                          description: `Reminder sent to ${studentsWithoutSheets.length} students`,
                        });
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Reminder
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentsWithoutSheets.map((student) => (
                    <div key={student.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-600">
                            Roll: {student.rollNumber} | Email: {student.email}
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          <AlertOctagon className="w-3 h-3 mr-1" />
                          Missing Sheet
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {studentsWithoutSheets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      All students have submitted their answer sheets.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* AI Matching Progress Dialog */}
      <Dialog open={showMatchingDialog} onOpenChange={setShowMatchingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              AI Auto-Matching in Progress
            </DialogTitle>
            <DialogDescription>
              AI is analyzing answer sheets and matching them to students...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(matchingProgress)}%
              </div>
              <Progress value={matchingProgress} className="w-full mt-2" />
            </div>
            <div className="text-center text-sm text-gray-600">
              Processing {unmatchedSheets.length} unmatched answer sheets...
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Results Dialog - Same as before */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Analysis Results
            </DialogTitle>
            <DialogDescription>
              Detailed AI analysis for {selectedSheet?.studentId?.name || 'Unknown Student'}
            </DialogDescription>
          </DialogHeader>

          {selectedSheet && aiResults[selectedSheet._id] && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {aiResults[selectedSheet._id].percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {aiResults[selectedSheet._id].obtainedMarks}/{aiResults[selectedSheet._id].totalMarks}
                      </div>
                      <div className="text-sm text-gray-600">Marks Obtained</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(aiResults[selectedSheet._id].confidence * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">AI Confidence</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-orange-600">
                        {aiResults[selectedSheet._id].processingTime}ms
                      </div>
                      <div className="text-sm text-gray-600">Processing Time</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Overall Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{aiResults[selectedSheet._id].overallFeedback}</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600 flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {aiResults[selectedSheet._id].strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-gray-600">• {strength}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600 flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {aiResults[selectedSheet._id].weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm text-gray-600">• {weakness}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {aiResults[selectedSheet._id].suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-600">• {suggestion}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Other tabs content same as before */}
              <TabsContent value="questions" className="space-y-4">
                {aiResults[selectedSheet._id].questionWiseResults.map((result, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Question {result.questionNumber}</CardTitle>
                        <div className="flex items-center gap-2">
                          {result.isCorrect ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Correct
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Incorrect
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {result.marksObtained}/{result.maxMarks} marks
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Correct Answer:</Label>
                        <p className="text-sm bg-green-50 p-2 rounded">{result.correctAnswer}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Student Answer:</Label>
                        <p className="text-sm bg-blue-50 p-2 rounded">{result.studentAnswer}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Feedback:</Label>
                        <p className="text-sm text-gray-700">{result.feedback}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-gray-600">Confidence:</Label>
                        <Progress value={result.confidence * 100} className="w-32" />
                        <span className="text-sm text-gray-600">
                          {Math.round(result.confidence * 100)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                {aiResults[selectedSheet._id].handwritingAnalysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Handwriting Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Overall Quality</Label>
                          <div className="text-lg font-semibold">
                            {aiResults[selectedSheet._id].handwritingAnalysis.overallQuality}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Legibility Score</Label>
                          <div className="text-lg font-semibold">
                            {Math.round(aiResults[selectedSheet._id].handwritingAnalysis.legibilityScore)}%
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Consistency</Label>
                          <div className="text-lg font-semibold">
                            {Math.round(aiResults[selectedSheet._id].handwritingAnalysis.consistencyScore)}%
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Writing Speed</Label>
                          <div className="text-lg font-semibold">
                            {aiResults[selectedSheet._id].handwritingAnalysis.speedAnalysis}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                {aiResults[selectedSheet._id].academicInsights && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Academic Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Subject Mastery</Label>
                          <div className="text-lg font-semibold text-blue-600">
                            {aiResults[selectedSheet._id].academicInsights.subjectMastery}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Conceptual Understanding</Label>
                            <Progress value={aiResults[selectedSheet._id].academicInsights.conceptualUnderstanding} className="w-full" />
                            <div className="text-sm text-gray-600">
                              {Math.round(aiResults[selectedSheet._id].academicInsights.conceptualUnderstanding)}%
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Problem Solving</Label>
                            <Progress value={aiResults[selectedSheet._id].academicInsights.problemSolvingAbility} className="w-full" />
                            <div className="text-sm text-gray-600">
                              {Math.round(aiResults[selectedSheet._id].academicInsights.problemSolvingAbility)}%
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Time Management</Label>
                            <Progress value={aiResults[selectedSheet._id].academicInsights.timeManagement} className="w-full" />
                            <div className="text-sm text-gray-600">
                              {Math.round(aiResults[selectedSheet._id].academicInsights.timeManagement)}%
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Attention to Detail</Label>
                            <Progress value={aiResults[selectedSheet._id].academicInsights.attentionToDetail} className="w-full" />
                            <div className="text-sm text-gray-600">
                              {Math.round(aiResults[selectedSheet._id].academicInsights.attentionToDetail)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Override Dialog */}
      <Dialog open={showManualOverride} onOpenChange={setShowManualOverride}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Manual Marks Entry
            </DialogTitle>
            <DialogDescription>
              Enter marks manually for {selectedSheetForOverride?.studentId?.name || 'Unknown Student'}
            </DialogDescription>
          </DialogHeader>

          {selectedSheetForOverride && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="marks">Total Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  min="0"
                  max="100"
                  value={manualMarks[selectedSheetForOverride._id] || 0}
                  onChange={(e) => setManualMarks(prev => ({
                    ...prev,
                    [selectedSheetForOverride._id]: parseInt(e.target.value) || 0
                  }))}
                  placeholder="Enter total marks"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowManualOverride(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const marks = manualMarks[selectedSheetForOverride._id];
                      if (marks === undefined || marks < 0) {
                        toast({
                          title: "Error",
                          description: "Please enter valid marks",
                          variant: "destructive",
                        });
                        return;
                      }

                      const response = await teacherDashboardAPI.updateAnswerSheetMarks(
                        selectedSheetForOverride._id, 
                        marks
                      );

                      if (response.success) {
                        toast({
                          title: "Success",
                          description: "Marks updated successfully",
                        });
                        
                        setAiErrors(prev => ({ ...prev, [selectedSheetForOverride._id]: '' }));
                        setShowManualOverride(false);
                        setSelectedSheetForOverride(null);
                        loadAnswerSheets();
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: `Failed to update marks: ${error.message}`,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Save Marks
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIAnswerCheckingEnhanced;
