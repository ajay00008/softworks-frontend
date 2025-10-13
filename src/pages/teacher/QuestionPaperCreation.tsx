import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Clock,
  Award,
  BookOpen,
  RefreshCw,
  X,
  Brain,
  Zap,
  Target,
  Settings,
  Save,
  Eye,
  Download
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

interface QuestionPaper {
  _id: string;
  title: string;
  description: string;
  examId: string;
  subjectId: string;
  classId: string;
  markDistribution: {
    oneMark: number;
    twoMark: number;
    threeMark: number;
    fiveMark: number;
    totalMarks: number;
  };
  bloomsDistribution: Array<{
    level: string;
    percentage: number;
  }>;
  questionTypeDistribution: {
    oneMark: Array<{
      type: string;
      percentage: number;
    }>;
    twoMark: Array<{
      type: string;
      percentage: number;
    }>;
    threeMark: Array<{
      type: string;
      percentage: number;
    }>;
    fiveMark: Array<{
      type: string;
      percentage: number;
    }>;
  };
  aiSettings: {
    useSubjectBook: boolean;
    customInstructions: string;
    difficultyLevel: string;
    twistedQuestionsPercentage: number;
  };
  status: string;
  createdAt: string;
}

const QuestionPaperCreation = () => {
  const [teacherAccess, setTeacherAccess] = useState<TeacherAccess | null>(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<QuestionPaper | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  // Form data for creating new question paper
  const [formData, setFormData] = useState({
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
    bloomsDistribution: [
      { level: 'REMEMBER', percentage: 20 },
      { level: 'UNDERSTAND', percentage: 30 },
      { level: 'APPLY', percentage: 25 },
      { level: 'ANALYZE', percentage: 15 },
      { level: 'EVALUATE', percentage: 7 },
      { level: 'CREATE', percentage: 3 }
    ],
    questionTypeDistribution: {
      oneMark: [
        { type: 'CHOOSE_BEST_ANSWER', percentage: 40 },
        { type: 'FILL_BLANKS', percentage: 20 },
        { type: 'SHORT_ANSWER', percentage: 20 },
        { type: 'LONG_ANSWER', percentage: 20 }
      ],
      twoMark: [
        { type: 'CHOOSE_BEST_ANSWER', percentage: 40 },
        { type: 'FILL_BLANKS', percentage: 20 },
        { type: 'SHORT_ANSWER', percentage: 20 },
        { type: 'LONG_ANSWER', percentage: 20 }
      ],
      threeMark: [
        { type: 'CHOOSE_BEST_ANSWER', percentage: 40 },
        { type: 'FILL_BLANKS', percentage: 20 },
        { type: 'SHORT_ANSWER', percentage: 20 },
        { type: 'LONG_ANSWER', percentage: 20 }
      ],
      fiveMark: [
        { type: 'CHOOSE_BEST_ANSWER', percentage: 40 },
        { type: 'FILL_BLANKS', percentage: 20 },
        { type: 'SHORT_ANSWER', percentage: 20 },
        { type: 'LONG_ANSWER', percentage: 20 }
      ]
    },
    aiSettings: {
      useSubjectBook: false,
      customInstructions: '',
      difficultyLevel: 'MODERATE',
      twistedQuestionsPercentage: 0
    }
  });

  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  useEffect(() => {
    loadTeacherAccess();
  }, []);

  useEffect(() => {
    if (teacherAccess) {
      loadQuestionPapers();
      loadExams();
    }
  }, [teacherAccess, selectedClass, selectedSubject]);

  const loadTeacherAccess = async () => {
    try {
      const response = await teacherDashboardAPI.getAccess();
      setTeacherAccess(response.data);
    } catch (error) {
      console.error('Error loading teacher access:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher access",
        variant: "destructive",
      });
    }
  };

  const loadQuestionPapers = async () => {
    try {
      setLoadingPapers(true);
      const response = await teacherDashboardAPI.getQuestionPapers({
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
      });
      setQuestionPapers(response.data || []);
    } catch (error) {
      console.error('Error loading question papers:', error);
      toast({
        title: "Error",
        description: "Failed to load question papers",
        variant: "destructive",
      });
    } finally {
      setLoadingPapers(false);
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
      console.error('Error loading exams:', error);
      toast({
        title: "Error",
        description: "Failed to load exams",
        variant: "destructive",
      });
    } finally {
      setLoadingExams(false);
    }
  };

  const handleCreateQuestionPaper = async () => {
    try {
      const response = await teacherDashboardAPI.createQuestionPaper(formData);
      
      toast({
        title: "Success",
        description: "Question paper created successfully",
      });
      
      setShowCreateDialog(false);
      setFormData({
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
        bloomsDistribution: [
          { level: 'REMEMBER', percentage: 20 },
          { level: 'UNDERSTAND', percentage: 30 },
          { level: 'APPLY', percentage: 25 },
          { level: 'ANALYZE', percentage: 15 },
          { level: 'EVALUATE', percentage: 7 },
          { level: 'CREATE', percentage: 3 }
        ],
        questionTypeDistribution: {
          oneMark: [
            { type: 'CHOOSE_BEST_ANSWER', percentage: 40 },
            { type: 'FILL_BLANKS', percentage: 20 },
            { type: 'SHORT_ANSWER', percentage: 20 },
            { type: 'LONG_ANSWER', percentage: 20 }
          ],
          twoMark: [
            { type: 'CHOOSE_BEST_ANSWER', percentage: 40 },
            { type: 'FILL_BLANKS', percentage: 20 },
            { type: 'SHORT_ANSWER', percentage: 20 },
            { type: 'LONG_ANSWER', percentage: 20 }
          ],
          threeMark: [
            { type: 'CHOOSE_BEST_ANSWER', percentage: 40 },
            { type: 'FILL_BLANKS', percentage: 20 },
            { type: 'SHORT_ANSWER', percentage: 20 },
            { type: 'LONG_ANSWER', percentage: 20 }
          ],
          fiveMark: [
            { type: 'CHOOSE_BEST_ANSWER', percentage: 40 },
            { type: 'FILL_BLANKS', percentage: 20 },
            { type: 'SHORT_ANSWER', percentage: 20 },
            { type: 'LONG_ANSWER', percentage: 20 }
          ]
        },
        aiSettings: {
          useSubjectBook: false,
          customInstructions: '',
          difficultyLevel: 'MODERATE',
          twistedQuestionsPercentage: 0
        }
      });
      
      await loadQuestionPapers();
    } catch (error) {
      console.error('Error creating question paper:', error);
      toast({
        title: "Error",
        description: "Failed to create question paper",
        variant: "destructive",
      });
    }
  };

  const handleGenerateQuestions = async (paperId: string) => {
    try {
      const response = await teacherDashboardAPI.generateAIQuestionPaper(paperId);
      
      toast({
        title: "Success",
        description: "Questions generated successfully",
      });
      
      await loadQuestionPapers();
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate questions",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      GENERATED: { color: 'bg-blue-100 text-blue-800', icon: Brain },
      REVIEWED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      PUBLISHED: { color: 'bg-purple-100 text-purple-800', icon: Award },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const filteredPapers = questionPapers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        paper.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || paper.status === filterStatus;
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
          <h1 className="text-3xl font-bold">Question Paper Creation</h1>
          <p className="text-gray-600">
            Create and manage question papers with AI assistance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadQuestionPapers}
            disabled={loadingPapers}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingPapers ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Question Paper
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
                  {teacherAccess.classAccess.map((cls) => (
                    <SelectItem key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </SelectItem>
                  ))}
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
                  {teacherAccess.subjectAccess.map((subject) => (
                    <SelectItem key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectName}
                    </SelectItem>
                  ))}
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
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="GENERATED">Generated</SelectItem>
                  <SelectItem value="REVIEWED">Reviewed</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search question papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Papers List */}
      {loadingPapers ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading question papers...</span>
            </div>
          </CardContent>
        </Card>
      ) : filteredPapers.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No question papers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first question paper to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPapers.map((paper) => (
            <Card key={paper._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{paper.title}</CardTitle>
                    <CardDescription>{paper.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(paper.status)}
                    <Badge variant="outline">
                      {paper.markDistribution.totalMarks} marks
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Mark Distribution</div>
                    <div className="text-sm">
                      1M: {paper.markDistribution.oneMark}, 2M: {paper.markDistribution.twoMark}, 
                      3M: {paper.markDistribution.threeMark}, 5M: {paper.markDistribution.fiveMark}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">AI Settings</div>
                    <div className="text-sm">
                      Difficulty: {paper.aiSettings.difficultyLevel}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Created</div>
                    <div className="text-sm">
                      {new Date(paper.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateQuestions(paper._id)}
                    disabled={paper.status === 'GENERATED' || paper.status === 'REVIEWED' || paper.status === 'PUBLISHED'}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Questions
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Question Paper Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Question Paper</CardTitle>
              <CardDescription>
                Set up the structure and requirements for your question paper
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter question paper title"
                  />
                </div>
                <div>
                  <Label htmlFor="exam">Exam</Label>
                  <Select value={formData.examId} onValueChange={(value) => setFormData(prev => ({ ...prev, examId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam._id} value={exam._id}>
                          {exam.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter question paper description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="oneMark">1 Mark Questions</Label>
                  <Input
                    id="oneMark"
                    type="number"
                    value={formData.markDistribution.oneMark}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      markDistribution: { 
                        ...prev.markDistribution, 
                        oneMark: parseInt(e.target.value) || 0,
                        totalMarks: (parseInt(e.target.value) || 0) + prev.markDistribution.twoMark + prev.markDistribution.threeMark + prev.markDistribution.fiveMark
                      } 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="twoMark">2 Mark Questions</Label>
                  <Input
                    id="twoMark"
                    type="number"
                    value={formData.markDistribution.twoMark}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      markDistribution: { 
                        ...prev.markDistribution, 
                        twoMark: parseInt(e.target.value) || 0,
                        totalMarks: prev.markDistribution.oneMark + (parseInt(e.target.value) || 0) + prev.markDistribution.threeMark + prev.markDistribution.fiveMark
                      } 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="threeMark">3 Mark Questions</Label>
                  <Input
                    id="threeMark"
                    type="number"
                    value={formData.markDistribution.threeMark}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      markDistribution: { 
                        ...prev.markDistribution, 
                        threeMark: parseInt(e.target.value) || 0,
                        totalMarks: prev.markDistribution.oneMark + prev.markDistribution.twoMark + (parseInt(e.target.value) || 0) + prev.markDistribution.fiveMark
                      } 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="fiveMark">5 Mark Questions</Label>
                  <Input
                    id="fiveMark"
                    type="number"
                    value={formData.markDistribution.fiveMark}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      markDistribution: { 
                        ...prev.markDistribution, 
                        fiveMark: parseInt(e.target.value) || 0,
                        totalMarks: prev.markDistribution.oneMark + prev.markDistribution.twoMark + prev.markDistribution.threeMark + (parseInt(e.target.value) || 0)
                      } 
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateQuestionPaper}>
                  <Save className="w-4 h-4 mr-2" />
                  Create Question Paper
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuestionPaperCreation;
