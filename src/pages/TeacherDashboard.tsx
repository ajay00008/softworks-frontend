import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Edit, 
  Download,
  Printer,
  Send,
  Search,
  Filter,
  Clock,
  Award,
  BarChart3,
  Users,
  BookOpen,
  Settings,
  Zap,
  RefreshCw,
  X,
  Plus,
  BookMarked,
  GraduationCap,
  TrendingUp,
  Target,
  FileSpreadsheet,
  PieChart,
  LineChart
} from 'lucide-react';

import { teacherDashboardAPI } from '@/services/api';
import AnswerSheetEvaluation from '@/components/AnswerSheetEvaluation';
import PerformanceAnalytics from '@/components/PerformanceAnalytics';

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

const TeacherDashboard = () => {
  const [teacherAccess, setTeacherAccess] = useState<TeacherAccess | null>(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const [showQuestionPaperDialog, setShowQuestionPaperDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [missingReason, setMissingReason] = useState('');
  const [questionPaperData, setQuestionPaperData] = useState({
    title: '',
    description: '',
    examId: '',
    subjectId: '',
    classId: '',
    markDistribution: {
      oneMark: 0,
      twoMark: 0,
      threeMark: 0,
      fiveMark: 0,
      totalMarks: 0
    },
    bloomsDistribution: [],
    questionTypeDistribution: [],
    aiSettings: {
      useSubjectBook: false,
      customInstructions: '',
      difficultyLevel: 'MODERATE',
      twistedQuestionsPercentage: 0
    }
  });
  const [results, setResults] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTeacherAccess();
  }, []);

  const loadTeacherAccess = async () => {
    try {
      const response = await teacherDashboardAPI.getAccess();
      if (response.success) {
        setTeacherAccess(response.data);
      }
    } catch (error) {
      console.error('Error loading teacher access:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher access permissions",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    setIsUploading(false);
    toast({
      title: "Upload Complete",
      description: `${fileArray.length} answer sheet(s) uploaded successfully`,
    });
  };

  const handleMarkMissing = async () => {
    if (!missingReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for marking as missing",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await teacherDashboardAPI.markStudentStatus({
        studentId: 'student-id', // This would come from the selected student
        examId: 'exam-id', // This would come from the selected exam
        status: 'MISSING',
        reason: missingReason
      });

      if (response.success) {
        toast({
          title: "Marked as Missing",
          description: "Answer sheet has been marked as missing",
        });
        setShowMissingDialog(false);
        setMissingReason('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark as missing",
        variant: "destructive",
      });
    }
  };

  const handleCreateQuestionPaper = async () => {
    try {
      const response = await teacherDashboardAPI.createQuestionPaper(questionPaperData);
      if (response.success) {
        toast({
          title: "Question Paper Created",
          description: "Question paper has been created successfully",
        });
        setShowQuestionPaperDialog(false);
        setQuestionPaperData({
          title: '',
          description: '',
          examId: '',
          subjectId: '',
          classId: '',
          markDistribution: {
            oneMark: 0,
            twoMark: 0,
            threeMark: 0,
            fiveMark: 0,
            totalMarks: 0
          },
          bloomsDistribution: [],
          questionTypeDistribution: [],
          aiSettings: {
            useSubjectBook: false,
            customInstructions: '',
            difficultyLevel: 'MODERATE',
            twistedQuestionsPercentage: 0
          }
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create question paper",
        variant: "destructive",
      });
    }
  };

  const handleEvaluateAnswerSheets = async () => {
    try {
      const response = await teacherDashboardAPI.evaluateAnswerSheets({
        answerSheetId: 'sheet-id', // This would come from the selected sheet
        manualOverrides: []
      });

      if (response.success) {
        toast({
          title: "Evaluation Complete",
          description: "Answer sheets have been evaluated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate answer sheets",
        variant: "destructive",
      });
    }
  };

  const loadResults = async () => {
    try {
      const response = await teacherDashboardAPI.getResults({
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        subjectId: selectedSubject !== 'all' ? selectedSubject : undefined
      });
      if (response.success) {
        setResults(response.data);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const loadPerformanceData = async () => {
    try {
      const response = await teacherDashboardAPI.getPerformanceGraphs({
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        subjectId: selectedSubject !== 'all' ? selectedSubject : undefined
      });
      if (response.success) {
        setPerformanceData(response.data);
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPLOADED': return 'text-blue-600 bg-blue-100';
      case 'PROCESSING': return 'text-yellow-600 bg-yellow-100';
      case 'AI_CORRECTED': return 'text-green-600 bg-green-100';
      case 'MANUALLY_REVIEWED': return 'text-purple-600 bg-purple-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!teacherAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading teacher access permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage question papers, evaluate answer sheets, and track student performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Sheets
          </Button>
          <Button variant="outline" onClick={() => setShowQuestionPaperDialog(true)}>
            <BookOpen className="w-4 h-4 mr-2" />
            Create Questions
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Reports
          </Button>
          <Button>
            <Send className="w-4 h-4 mr-2" />
            Send Results
          </Button>
        </div>
      </div>

      {/* Assigned Classes Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {teacherAccess.classAccess.map((cls) => (
          <Card key={cls.classId} className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{cls.className}</CardTitle>
              <CardDescription>Access Level: {cls.accessLevel}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Can Upload Sheets:</span>
                  <Badge variant={cls.canUploadSheets ? "default" : "secondary"}>
                    {cls.canUploadSheets ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Can Override AI:</span>
                  <Badge variant={cls.canOverrideAI ? "default" : "secondary"}>
                    {cls.canOverrideAI ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assigned Subjects Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {teacherAccess.subjectAccess.map((subject) => (
          <Card key={subject.subjectId} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{subject.subjectName}</CardTitle>
              <CardDescription>Access Level: {subject.accessLevel}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Can Create Questions:</span>
                  <Badge variant={subject.canCreateQuestions ? "default" : "secondary"}>
                    {subject.canCreateQuestions ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Can Upload Syllabus:</span>
                  <Badge variant={subject.canUploadSyllabus ? "default" : "secondary"}>
                    {subject.canUploadSyllabus ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="question-papers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="question-papers">Question Papers</TabsTrigger>
          <TabsTrigger value="answer-sheets">Answer Sheets</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Question Papers Tab */}
        <TabsContent value="question-papers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Question Paper Management
              </CardTitle>
              <CardDescription>
                Create and manage question papers for your assigned subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Create New Question Paper</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate AI-powered question papers with custom settings
                    </p>
                  </div>
                  <Button onClick={() => setShowQuestionPaperDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Question Paper
                  </Button>
                </div>
                
                {/* Question Paper List */}
                <div className="space-y-2">
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No question papers created yet</p>
                    <p className="text-sm">Create your first question paper to get started</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Answer Sheets Tab */}
        <TabsContent value="answer-sheets" className="space-y-6">
          <AnswerSheetEvaluation />
        </TabsContent>

        {/* Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Evaluation & Manual Override
              </CardTitle>
              <CardDescription>
                Review AI evaluations and make manual corrections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Evaluation Status</h4>
                    <p className="text-sm text-muted-foreground">
                      AI-powered evaluation with manual override capabilities
                    </p>
                  </div>
                  <Button onClick={handleEvaluateAnswerSheets}>
                    <Brain className="w-4 h-4 mr-2" />
                    Start Evaluation
                  </Button>
                </div>
                
                {/* Evaluation Results */}
                <div className="space-y-2">
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No evaluations in progress</p>
                    <p className="text-sm">Upload answer sheets to start evaluation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Results & Reports
              </CardTitle>
              <CardDescription>
                View and download student results and performance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Student Results</h4>
                    <p className="text-sm text-muted-foreground">
                      Individual and class performance results
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={loadResults}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                
                {/* Results Display */}
                <div className="space-y-2">
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No results available yet</p>
                    <p className="text-sm">Complete evaluations to view results</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <PerformanceAnalytics />
        </TabsContent>
      </Tabs>

      {/* Upload Answer Sheets Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Answer Sheets</DialogTitle>
            <DialogDescription>
              Upload scanned answer sheets for AI processing and evaluation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Exam</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math-unit-1">Mathematics Unit Test 1</SelectItem>
                  <SelectItem value="physics-mid">Physics Mid-term</SelectItem>
                  <SelectItem value="chemistry-unit-2">Chemistry Unit Test 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload Files</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop answer sheet images here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild>
                    <span>Choose Files</span>
                  </Button>
                </label>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Label>Upload Progress</Label>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {uploadProgress}% complete
                </p>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files</Label>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Question Paper Dialog */}
      <Dialog open={showQuestionPaperDialog} onOpenChange={setShowQuestionPaperDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Question Paper</DialogTitle>
            <DialogDescription>
              Create a new question paper with AI generation settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={questionPaperData.title}
                  onChange={(e) => setQuestionPaperData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter question paper title"
                />
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select
                  value={questionPaperData.subjectId}
                  onValueChange={(value) => setQuestionPaperData(prev => ({ ...prev, subjectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherAccess.subjectAccess.map((subject) => (
                      <SelectItem key={subject.subjectId} value={subject.subjectId}>
                        {subject.subjectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={questionPaperData.description}
                onChange={(e) => setQuestionPaperData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter question paper description"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-medium">Mark Distribution</Label>
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>1 Mark Questions</Label>
                  <Input
                    type="number"
                    value={questionPaperData.markDistribution.oneMark}
                    onChange={(e) => setQuestionPaperData(prev => ({
                      ...prev,
                      markDistribution: { ...prev.markDistribution, oneMark: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>2 Mark Questions</Label>
                  <Input
                    type="number"
                    value={questionPaperData.markDistribution.twoMark}
                    onChange={(e) => setQuestionPaperData(prev => ({
                      ...prev,
                      markDistribution: { ...prev.markDistribution, twoMark: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>3 Mark Questions</Label>
                  <Input
                    type="number"
                    value={questionPaperData.markDistribution.threeMark}
                    onChange={(e) => setQuestionPaperData(prev => ({
                      ...prev,
                      markDistribution: { ...prev.markDistribution, threeMark: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>5 Mark Questions</Label>
                  <Input
                    type="number"
                    value={questionPaperData.markDistribution.fiveMark}
                    onChange={(e) => setQuestionPaperData(prev => ({
                      ...prev,
                      markDistribution: { ...prev.markDistribution, fiveMark: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input
                    type="number"
                    value={questionPaperData.markDistribution.totalMarks}
                    onChange={(e) => setQuestionPaperData(prev => ({
                      ...prev,
                      markDistribution: { ...prev.markDistribution, totalMarks: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-medium">AI Settings</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select
                    value={questionPaperData.aiSettings.difficultyLevel}
                    onValueChange={(value) => setQuestionPaperData(prev => ({
                      ...prev,
                      aiSettings: { ...prev.aiSettings, difficultyLevel: value as any }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MODERATE">Moderate</SelectItem>
                      <SelectItem value="TOUGHEST">Toughest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Twisted Questions %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={questionPaperData.aiSettings.twistedQuestionsPercentage}
                    onChange={(e) => setQuestionPaperData(prev => ({
                      ...prev,
                      aiSettings: { ...prev.aiSettings, twistedQuestionsPercentage: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowQuestionPaperDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateQuestionPaper}>
                Create Question Paper
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark Missing Dialog */}
      <Dialog open={showMissingDialog} onOpenChange={setShowMissingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Missing</DialogTitle>
            <DialogDescription>
              Provide a reason for marking this answer sheet as missing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                placeholder="Enter reason for missing answer sheet..."
                value={missingReason}
                onChange={(e) => setMissingReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowMissingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleMarkMissing}>
                Mark as Missing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
