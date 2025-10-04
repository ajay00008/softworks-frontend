import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  LineChart,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin
} from 'lucide-react';

interface AnswerSheet {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  uploadedAt: string;
  status: 'UPLOADED' | 'PROCESSING' | 'AI_CORRECTED' | 'MANUALLY_REVIEWED' | 'COMPLETED';
  files: string[];
  aiEvaluation?: {
    totalMarks: number;
    confidence: number;
    questionEvaluations: Array<{
      questionId: string;
      questionText: string;
      studentAnswer: string;
      correctAnswer: string;
      awardedMarks: number;
      maxMarks: number;
      confidence: number;
      reasoning: string;
      improvementSuggestions: string;
    }>;
  };
  manualOverrides?: Array<{
    questionId: string;
    awardedMarks: number;
    reason: string;
    improvementSuggestions: string;
  }>;
}

interface StudentStatus {
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: 'PRESENT' | 'ABSENT' | 'MISSING';
  reason?: string;
  markedAt: string;
  markedBy: string;
}

const AnswerSheetEvaluation = () => {
  const [answerSheets, setAnswerSheets] = useState<AnswerSheet[]>([]);
  const [studentStatuses, setStudentStatuses] = useState<StudentStatus[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<AnswerSheet | null>(null);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentStatus | null>(null);
  const [missingReason, setMissingReason] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadAnswerSheets();
    loadStudentStatuses();
  }, []);

  const loadAnswerSheets = async () => {
    // Mock data - replace with actual API call
    const mockSheets: AnswerSheet[] = [
      {
        id: '1',
        studentId: 'student-1',
        studentName: 'John Doe',
        rollNumber: '001',
        examId: 'exam-1',
        examName: 'Mathematics Unit Test',
        subjectId: 'math-1',
        subjectName: 'Mathematics',
        classId: 'class-11a',
        className: 'Class 11A',
        uploadedAt: '2024-01-15T10:30:00Z',
        status: 'AI_CORRECTED',
        files: ['answer-sheet-1.pdf'],
        aiEvaluation: {
          totalMarks: 85,
          confidence: 92,
          questionEvaluations: [
            {
              questionId: 'q1',
              questionText: 'Solve the equation: 2x + 5 = 13',
              studentAnswer: 'x = 4',
              correctAnswer: 'x = 4',
              awardedMarks: 2,
              maxMarks: 2,
              confidence: 95,
              reasoning: 'Correct solution with proper steps',
              improvementSuggestions: 'Good work! Consider showing more detailed steps for complex problems.'
            },
            {
              questionId: 'q2',
              questionText: 'Find the derivative of x² + 3x',
              studentAnswer: '2x + 3',
              correctAnswer: '2x + 3',
              awardedMarks: 3,
              maxMarks: 3,
              confidence: 98,
              reasoning: 'Perfect application of power rule',
              improvementSuggestions: 'Excellent! Keep up the good work.'
            }
          ]
        }
      },
      {
        id: '2',
        studentId: 'student-2',
        studentName: 'Jane Smith',
        rollNumber: '002',
        examId: 'exam-1',
        examName: 'Mathematics Unit Test',
        subjectId: 'math-1',
        subjectName: 'Mathematics',
        classId: 'class-11a',
        className: 'Class 11A',
        uploadedAt: '2024-01-15T11:15:00Z',
        status: 'PROCESSING',
        files: ['answer-sheet-2.pdf']
      }
    ];
    setAnswerSheets(mockSheets);
  };

  const loadStudentStatuses = async () => {
    // Mock data - replace with actual API call
    const mockStatuses: StudentStatus[] = [
      {
        studentId: 'student-3',
        studentName: 'Mike Johnson',
        rollNumber: '003',
        status: 'ABSENT',
        reason: 'Student was absent on exam day',
        markedAt: '2024-01-15T09:00:00Z',
        markedBy: 'Teacher'
      },
      {
        studentId: 'student-4',
        studentName: 'Sarah Wilson',
        rollNumber: '004',
        status: 'MISSING',
        reason: 'Answer sheet not submitted',
        markedAt: '2024-01-15T14:30:00Z',
        markedBy: 'Teacher'
      }
    ];
    setStudentStatuses(mockStatuses);
  };

  const handleEvaluateSheet = async (sheet: AnswerSheet) => {
    setSelectedSheet(sheet);
    setIsEvaluating(true);
    setEvaluationProgress(0);

    // Simulate AI evaluation progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setEvaluationProgress(i);
    }

    setIsEvaluating(false);
    setShowEvaluationDialog(true);
    
    toast({
      title: "Evaluation Complete",
      description: `Answer sheet for ${sheet.studentName} has been evaluated`,
    });
  };

  const handleManualOverride = async (questionId: string, newMarks: number, reason: string) => {
    if (!selectedSheet) return;

    // Update the sheet with manual override
    const updatedSheets = answerSheets.map(sheet => {
      if (sheet.id === selectedSheet.id) {
        const manualOverrides = sheet.manualOverrides || [];
        const existingOverride = manualOverrides.find(override => override.questionId === questionId);
        
        if (existingOverride) {
          existingOverride.awardedMarks = newMarks;
          existingOverride.reason = reason;
        } else {
          manualOverrides.push({
            questionId,
            awardedMarks: newMarks,
            reason,
            improvementSuggestions: ''
          });
        }

        return {
          ...sheet,
          manualOverrides,
          status: 'MANUALLY_REVIEWED' as const
        };
      }
      return sheet;
    });

    setAnswerSheets(updatedSheets);
    
    toast({
      title: "Manual Override Applied",
      description: "Marks have been manually adjusted",
    });
  };

  const handleMarkMissing = async (student: StudentStatus) => {
    setSelectedStudent(student);
    setShowMissingDialog(true);
  };

  const handleSubmitMissing = async () => {
    if (!missingReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for marking as missing",
        variant: "destructive",
      });
      return;
    }

    if (!selectedStudent) return;

    const updatedStatus = {
      ...selectedStudent,
      status: 'MISSING' as const,
      reason: missingReason,
      markedAt: new Date().toISOString(),
      markedBy: 'Teacher'
    };

    setStudentStatuses(prev => 
      prev.map(status => 
        status.studentId === selectedStudent.studentId ? updatedStatus : status
      )
    );

    toast({
      title: "Marked as Missing",
      description: "Student has been marked as missing",
    });

    setShowMissingDialog(false);
    setMissingReason('');
    setSelectedStudent(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPLOADED': return 'text-blue-600 bg-blue-100';
      case 'PROCESSING': return 'text-yellow-600 bg-yellow-100';
      case 'AI_CORRECTED': return 'text-green-600 bg-green-100';
      case 'MANUALLY_REVIEWED': return 'text-purple-600 bg-purple-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'ABSENT': return 'text-red-600 bg-red-100';
      case 'MISSING': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Answer Sheet Evaluation</h1>
          </div>
          <p className="text-muted-foreground">
            AI-powered evaluation with manual override capabilities
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sheets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{answerSheets.length}</div>
            <p className="text-xs text-muted-foreground">
              Answer sheets uploaded
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Evaluated</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {answerSheets.filter(sheet => sheet.status === 'AI_CORRECTED' || sheet.status === 'MANUALLY_REVIEWED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully evaluated
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentStatuses.filter(status => status.status === 'ABSENT').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Students absent
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Sheets</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentStatuses.filter(status => status.status === 'MISSING').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sheets not submitted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Answer Sheets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Answer Sheets
          </CardTitle>
          <CardDescription>
            Review and evaluate uploaded answer sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {answerSheets.map((sheet) => (
              <div key={sheet.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{sheet.studentName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Roll: {sheet.rollNumber} • {sheet.examName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sheet.className} • {sheet.subjectName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded: {new Date(sheet.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(sheet.status)}>
                    {sheet.status.replace('_', ' ')}
                  </Badge>
                  {sheet.aiEvaluation && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {sheet.aiEvaluation.totalMarks}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Marks</div>
                      <div className={`text-sm font-medium ${getConfidenceColor(sheet.aiEvaluation.confidence)}`}>
                        {sheet.aiEvaluation.confidence}% confidence
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {sheet.status === 'UPLOADED' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEvaluateSheet(sheet)}
                        disabled={isEvaluating}
                      >
                        <Brain className="w-4 h-4" />
                      </Button>
                    )}
                    {sheet.status === 'AI_CORRECTED' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedSheet(sheet);
                          setShowEvaluationDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Status List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Student Status
          </CardTitle>
          <CardDescription>
            Track absent students and missing answer sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studentStatuses.map((status) => (
              <div key={status.studentId} className={`flex items-center justify-between p-4 border rounded-lg ${
                status.status === 'ABSENT' ? 'border-red-200 bg-red-50' : 
                status.status === 'MISSING' ? 'border-orange-200 bg-orange-50' : ''
              }`}>
                <div className="flex items-center space-x-4">
                  <AlertTriangle className={`w-6 h-6 ${
                    status.status === 'ABSENT' ? 'text-red-500' : 'text-orange-500'
                  }`} />
                  <div>
                    <h4 className={`font-medium ${
                      status.status === 'ABSENT' ? 'text-red-900' : 'text-orange-900'
                    }`}>
                      {status.studentName}
                    </h4>
                    <p className={`text-sm ${
                      status.status === 'ABSENT' ? 'text-red-700' : 'text-orange-700'
                    }`}>
                      Roll: {status.rollNumber} • {status.status}
                    </p>
                    <p className={`text-xs ${
                      status.status === 'ABSENT' ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      Reason: {status.reason}
                    </p>
                    <p className={`text-xs ${
                      status.status === 'ABSENT' ? 'text-red-500' : 'text-orange-500'
                    }`}>
                      Marked: {new Date(status.markedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMarkMissing(status)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Notify Admin
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Dialog */}
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Answer Sheet Evaluation</DialogTitle>
            <DialogDescription>
              Review AI evaluation and make manual adjustments if needed
            </DialogDescription>
          </DialogHeader>
          {selectedSheet && selectedSheet.aiEvaluation && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <User className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-medium">{selectedSheet.studentName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Roll: {selectedSheet.rollNumber} • {selectedSheet.examName}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-bold text-primary">
                    {selectedSheet.aiEvaluation.totalMarks}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Marks</div>
                  <div className={`text-sm font-medium ${getConfidenceColor(selectedSheet.aiEvaluation.confidence)}`}>
                    {selectedSheet.aiEvaluation.confidence}% AI Confidence
                  </div>
                </div>
              </div>

              {/* Question Evaluations */}
              <div className="space-y-4">
                <h4 className="font-medium">Question-wise Evaluation</h4>
                {selectedSheet.aiEvaluation.questionEvaluations.map((evaluation, index) => (
                  <div key={evaluation.questionId} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium">Question {index + 1}</h5>
                        <p className="text-sm text-muted-foreground mb-2">
                          {evaluation.questionText}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Student Answer:</span> {evaluation.studentAnswer}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Correct Answer:</span> {evaluation.correctAnswer}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-primary">
                          {evaluation.awardedMarks}/{evaluation.maxMarks}
                        </div>
                        <div className="text-sm text-muted-foreground">Marks</div>
                        <div className={`text-sm font-medium ${getConfidenceColor(evaluation.confidence)}`}>
                          {evaluation.confidence}% confidence
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">AI Reasoning:</Label>
                        <p className="text-sm text-muted-foreground">{evaluation.reasoning}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Improvement Suggestions:</Label>
                        <p className="text-sm text-muted-foreground">{evaluation.improvementSuggestions}</p>
                      </div>
                    </div>

                    {/* Manual Override Section */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium">Manual Override</Label>
                      <div className="flex space-x-2 mt-2">
                        <Input
                          type="number"
                          placeholder="New marks"
                          min="0"
                          max={evaluation.maxMarks}
                          className="w-24"
                        />
                        <Input
                          placeholder="Reason for change"
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => {
                          // Handle manual override
                          const newMarks = 0; // Get from input
                          const reason = ''; // Get from input
                          handleManualOverride(evaluation.questionId, newMarks, reason);
                        }}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              <Button onClick={handleSubmitMissing}>
                Mark as Missing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnswerSheetEvaluation;
