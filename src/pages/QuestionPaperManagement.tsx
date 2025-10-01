import { useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Edit, Trash2, Search, Brain,
  BookOpen, GraduationCap, Settings,
  Download, FileText, Wand2, Upload as UploadIcon,
  Eye, MoreHorizontal, Target, BarChart3,
  CheckCircle, Clock, AlertCircle, Archive
} from 'lucide-react';
import {
  QuestionPaper,
  CreateQuestionPaperRequest,
  questionPaperAPI,
  subjectManagementAPI,
  classManagementAPI,
  examsAPI
} from '@/services/api';

// Question Types
const QUESTION_TYPES = [
  { id: 'CHOOSE_BEST_ANSWER', name: 'Choose the best answer', description: 'Multiple choice with one correct answer' },
  { id: 'FILL_BLANKS', name: 'Fill in the blanks', description: 'Complete missing words or phrases' },
  { id: 'ONE_WORD_ANSWER', name: 'One word answer', description: 'Answer in one word' },
  { id: 'TRUE_FALSE', name: 'True or False', description: 'Select true or false' },
  { id: 'CHOOSE_MULTIPLE_ANSWERS', name: 'Choose multiple answers', description: 'Select multiple correct answers' },
  { id: 'MATCHING_PAIRS', name: 'Matching pairs', description: 'Match items using arrows' },
  { id: 'DRAWING_DIAGRAM', name: 'Drawing/Diagram', description: 'Draw diagrams and mark parts' },
  { id: 'MARKING_PARTS', name: 'Marking parts', description: 'Mark correct objects or parts' },
  { id: 'SHORT_ANSWER', name: 'Short answer', description: 'Brief text response' },
  { id: 'LONG_ANSWER', name: 'Long answer', description: 'Detailed text response' }
];

// Blooms Taxonomy Levels
const BLOOMS_LEVELS = [
  { id: 'REMEMBER', name: 'Remember', description: 'Recall facts and basic concepts', color: 'bg-blue-100 text-blue-800' },
  { id: 'UNDERSTAND', name: 'Understand', description: 'Explain ideas or concepts', color: 'bg-green-100 text-green-800' },
  { id: 'APPLY', name: 'Apply', description: 'Use information in new situations', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'ANALYZE', name: 'Analyze', description: 'Draw connections among ideas', color: 'bg-orange-100 text-orange-800' },
  { id: 'EVALUATE', name: 'Evaluate', description: 'Justify a stand or decision', color: 'bg-purple-100 text-purple-800' },
  { id: 'CREATE', name: 'Create', description: 'Produce new or original work', color: 'bg-red-100 text-red-800' }
];

export default function QuestionPaperManagement() {
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedQuestionPaper, setSelectedQuestionPaper] = useState<QuestionPaper | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<CreateQuestionPaperRequest>({
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
      totalQuestions: 0,
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
    questionTypeDistribution: [
      { type: 'CHOOSE_BEST_ANSWER', percentage: 40 },
      { type: 'FILL_BLANKS', percentage: 20 },
      { type: 'SHORT_ANSWER', percentage: 20 },
      { type: 'LONG_ANSWER', percentage: 20 }
    ],
    aiSettings: {
      useSubjectBook: false,
      customInstructions: '',
      difficultyLevel: 'MODERATE',
      twistedQuestionsPercentage: 0
    }
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Debug: Log current state
  useEffect(() => {
    console.log('Current state:', {
      subjects: subjects.length,
      classes: classes.length,
      exams: exams.length,
      questionPapers: questionPapers.length,
      loading
    });
  }, [subjects, classes, exams, questionPapers, loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // For now, use mock data since backend has compilation issues
      // TODO: Replace with actual API calls when backend is fixed
      
      // Mock subjects
      setSubjects([
        { _id: '1', name: 'Mathematics', code: 'MATH' },
        { _id: '2', name: 'Physics', code: 'PHY' },
        { _id: '3', name: 'Chemistry', code: 'CHEM' },
        { _id: '4', name: 'Biology', code: 'BIO' },
        { _id: '5', name: 'English', code: 'ENG' }
      ]);
      
      // Mock classes
      setClasses([
        { _id: '1', name: 'Class 10A', displayName: 'Class 10A' },
        { _id: '2', name: 'Class 10B', displayName: 'Class 10B' },
        { _id: '3', name: 'Class 11A', displayName: 'Class 11A' },
        { _id: '4', name: 'Class 11B', displayName: 'Class 11B' },
        { _id: '5', name: 'Class 12A', displayName: 'Class 12A' }
      ]);
      
      // Mock exams
      setExams([
        { _id: '1', title: 'Mid Term Exam', examType: 'MID_TERM' },
        { _id: '2', title: 'Unit Test 1', examType: 'UNIT_TEST' },
        { _id: '3', title: 'Final Exam', examType: 'FINAL' },
        { _id: '4', title: 'Quiz 1', examType: 'QUIZ' }
      ]);
      
      // Mock question papers
      setQuestionPapers([
        {
          _id: '1',
          id: '1',
          title: 'Mathematics Mid Term Exam',
          description: 'Comprehensive mathematics exam for Class 10A',
          examId: '1',
          subjectId: '1',
          classId: '1',
          type: 'AI_GENERATED',
          status: 'GENERATED',
          markDistribution: {
            oneMark: 20,
            twoMark: 15,
            threeMark: 10,
            fiveMark: 5,
            totalQuestions: 50,
            totalMarks: 100
          },
          bloomsDistribution: [
            { level: 'REMEMBER', percentage: 20 },
            { level: 'UNDERSTAND', percentage: 30 },
            { level: 'APPLY', percentage: 25 },
            { level: 'ANALYZE', percentage: 15 },
            { level: 'EVALUATE', percentage: 7 },
            { level: 'CREATE', percentage: 3 }
          ],
          questionTypeDistribution: [
            { type: 'CHOOSE_BEST_ANSWER', percentage: 40 },
            { type: 'FILL_BLANKS', percentage: 20 },
            { type: 'SHORT_ANSWER', percentage: 20 },
            { type: 'LONG_ANSWER', percentage: 20 }
          ],
          generatedPdf: {
            fileName: 'math-midterm-2024.pdf',
            filePath: '/question-papers/math-midterm-2024.pdf',
            fileSize: 1024000,
            generatedAt: new Date().toISOString(),
            downloadUrl: '/question-papers/math-midterm-2024.pdf'
          },
          aiSettings: {
            useSubjectBook: true,
            customInstructions: 'Focus on algebra and geometry',
            difficultyLevel: 'MODERATE',
            twistedQuestionsPercentage: 10
          },
          createdBy: 'admin1',
          isActive: true,
          questions: ['q1', 'q2', 'q3', 'q4', 'q5'], // Mock question IDs
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          id: '2',
          title: 'Physics Unit Test',
          description: 'Physics unit test for Class 11A',
          examId: '2',
          subjectId: '2',
          classId: '3',
          type: 'AI_GENERATED',
          status: 'DRAFT',
          markDistribution: {
            oneMark: 15,
            twoMark: 10,
            threeMark: 8,
            fiveMark: 3,
            totalQuestions: 36,
            totalMarks: 80
          },
          bloomsDistribution: [
            { level: 'REMEMBER', percentage: 15 },
            { level: 'UNDERSTAND', percentage: 25 },
            { level: 'APPLY', percentage: 30 },
            { level: 'ANALYZE', percentage: 20 },
            { level: 'EVALUATE', percentage: 7 },
            { level: 'CREATE', percentage: 3 }
          ],
          questionTypeDistribution: [
            { type: 'CHOOSE_BEST_ANSWER', percentage: 50 },
            { type: 'FILL_BLANKS', percentage: 15 },
            { type: 'SHORT_ANSWER', percentage: 20 },
            { type: 'LONG_ANSWER', percentage: 15 }
          ],
          aiSettings: {
            useSubjectBook: false,
            customInstructions: '',
            difficultyLevel: 'MODERATE',
            twistedQuestionsPercentage: 5
          },
          createdBy: 'admin1',
          isActive: true,
          questions: ['q6', 'q7', 'q8', 'q9', 'q10'], // Mock question IDs
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
      
      console.log('Mock data loaded successfully');
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestionPaper = async () => {
    try {
      // For now, just add to mock data
      const newQuestionPaper = {
        _id: Date.now().toString(),
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        examId: formData.examId,
        subjectId: formData.subjectId,
        classId: formData.classId,
        type: 'AI_GENERATED' as const,
        status: 'DRAFT' as const,
        markDistribution: formData.markDistribution,
        bloomsDistribution: formData.bloomsDistribution,
        questionTypeDistribution: formData.questionTypeDistribution,
        aiSettings: formData.aiSettings,
        createdBy: 'admin1',
        isActive: true,
        questions: [], // Empty questions array for new question paper
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setQuestionPapers(prev => [newQuestionPaper, ...prev]);
      
      toast({ 
        title: "Success",
        description: "Question paper created successfully"
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating question paper:', error);
      toast({
        title: "Error",
        description: "Failed to create question paper",
        variant: "destructive"
      });
    }
  };

  const handleGenerateQuestionPaper = async (questionPaper: QuestionPaper) => {
    try {
      // Mock generation - update status and add PDF info
      setQuestionPapers(prev => prev.map(paper => 
        paper._id === questionPaper._id 
          ? {
              ...paper,
              status: 'GENERATED',
              generatedPdf: {
                fileName: `${paper.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`,
                filePath: `/question-papers/${paper.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`,
                fileSize: 1024000,
                generatedAt: new Date().toISOString(),
                downloadUrl: `/question-papers/${paper.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`
              }
            }
          : paper
      ));
      
      toast({ 
        title: "Success",
        description: "Question paper generated successfully"
      });
    } catch (error) {
      console.error('Error generating question paper:', error);
      toast({
        title: "Error",
        description: "Failed to generate question paper",
        variant: "destructive"
      });
    }
  };

  const handleDownloadQuestionPaper = async (questionPaper: QuestionPaper) => {
    try {
      if (questionPaper.generatedPdf) {
        // Mock download - just show a message
        toast({
          title: "Download Started",
          description: `Downloading ${questionPaper.generatedPdf.fileName}`
        });
        // In a real app, this would trigger the actual download
        console.log('Would download:', questionPaper.generatedPdf.downloadUrl);
      } else {
        toast({
          title: "Error",
          description: "No PDF available for download",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error downloading question paper:', error);
      toast({
        title: "Error",
        description: "Failed to download question paper",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuestionPaper = async (questionPaper: QuestionPaper) => {
    try {
      // Mock deletion - remove from state
      setQuestionPapers(prev => prev.filter(paper => paper._id !== questionPaper._id));
      
      toast({
        title: "Success",
        description: "Question paper deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting question paper:', error);
      toast({ 
        title: "Error",
        description: "Failed to delete question paper",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
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
        totalQuestions: 0,
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
      questionTypeDistribution: [
        { type: 'CHOOSE_BEST_ANSWER', percentage: 40 },
        { type: 'FILL_BLANKS', percentage: 20 },
        { type: 'SHORT_ANSWER', percentage: 20 },
        { type: 'LONG_ANSWER', percentage: 20 }
      ],
      aiSettings: {
        useSubjectBook: false,
        customInstructions: '',
        difficultyLevel: 'MODERATE',
        twistedQuestionsPercentage: 0
      }
    });
  };

  const updateMarkDistribution = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      markDistribution: {
        ...prev.markDistribution,
        [field]: value
      }
    }));
  };

  const updateBloomsDistribution = (level: string, percentage: number) => {
    setFormData(prev => ({
      ...prev,
      bloomsDistribution: prev.bloomsDistribution.map(dist => 
        dist.level === level ? { ...dist, percentage } : dist
      )
    }));
  };

  const updateQuestionTypeDistribution = (type: string, percentage: number) => {
    setFormData(prev => ({
      ...prev,
      questionTypeDistribution: prev.questionTypeDistribution.map(dist => 
        dist.type === type ? { ...dist, percentage } : dist
      )
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { color: 'bg-gray-100 text-gray-800', icon: FileText },
      'GENERATED': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      'PUBLISHED': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'ARCHIVED': { color: 'bg-yellow-100 text-yellow-800', icon: Archive }
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

  const filteredQuestionPapers = questionPapers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || selectedType === 'all' || paper.type === selectedType;
    const matchesStatus = !selectedStatus || selectedStatus === 'all' || paper.status === selectedStatus;
    const matchesSubject = !selectedSubject || selectedSubject === 'all' || paper.subjectId === selectedSubject;
    const matchesClass = !selectedClass || selectedClass === 'all' || paper.classId === selectedClass;
    const matchesExam = !selectedExam || selectedExam === 'all' || paper.examId === selectedExam;
    
    return matchesSearch && matchesType && matchesStatus && matchesSubject && matchesClass && matchesExam;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question papers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Question Paper Management</h1>
          <p className="text-gray-600">Create and manage question papers with AI generation</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Question Paper
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search question papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="AI_GENERATED">AI Generated</SelectItem>
                  <SelectItem value="PDF_UPLOADED">PDF Uploaded</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="GENERATED">Generated</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
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
                  {subjects.map(subject => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
                          <div>
              <Label htmlFor="exam">Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="All Exams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {exams.map(exam => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                          </div>
                        </div>
        </CardContent>
      </Card>

      {/* Question Papers List */}
      {filteredQuestionPapers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Question Papers Found</h3>
            <p className="text-gray-600 text-center mb-4">
              {questionPapers.length === 0 
                ? "You haven't created any question papers yet. Create your first question paper to get started."
                : "No question papers match your current filters. Try adjusting your search criteria."
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Question Paper
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestionPapers.map(paper => (
          <Card key={paper._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{paper.title}</CardTitle>
                  <CardDescription>{paper.description}</CardDescription>
                      </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedQuestionPaper(paper)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {paper.status === 'DRAFT' && (
                      <DropdownMenuItem onClick={() => handleGenerateQuestionPaper(paper)}>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate with AI
                      </DropdownMenuItem>
                    )}
                    {paper.status === 'GENERATED' && paper.generatedPdf && (
                      <DropdownMenuItem onClick={() => handleDownloadQuestionPaper(paper)}>
                        <Download className="w-4 h-4 mr-2" />
                          Download PDF
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleDeleteQuestionPaper(paper)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {getStatusBadge(paper.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <Badge variant="outline">{paper.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Questions</span>
                  <span className="font-medium">{paper.markDistribution.totalQuestions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Marks</span>
                  <span className="font-medium">{paper.markDistribution.totalMarks}</span>
                </div>
                {paper.generatedPdf && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">PDF Generated</span>
                    <span className="text-sm text-green-600">✓ Available</span>
                      </div>
                )}
                    </div>
            </CardContent>
                  </Card>
                ))}
              </div>
            )}

      {/* Create Question Paper Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Question Paper</DialogTitle>
            <DialogDescription>
              Configure the question paper settings and AI generation parameters
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="marks">Mark Distribution</TabsTrigger>
              <TabsTrigger value="blooms">Blooms Taxonomy</TabsTrigger>
              <TabsTrigger value="types">Question Types</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
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
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map(exam => (
                        <SelectItem key={exam._id} value={exam._id}>
                          {exam.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={formData.subjectId} onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Select value={formData.classId} onValueChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls._id} value={cls._id}>
                          {cls.name}
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
            </TabsContent>
            
            <TabsContent value="marks" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="oneMark">1 Mark Questions</Label>
                  <Input
                    id="oneMark"
                    type="number"
                    value={formData.markDistribution.oneMark}
                    onChange={(e) => updateMarkDistribution('oneMark', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="twoMark">2 Mark Questions</Label>
                  <Input
                    id="twoMark"
                    type="number"
                    value={formData.markDistribution.twoMark}
                    onChange={(e) => updateMarkDistribution('twoMark', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="threeMark">3 Mark Questions</Label>
                  <Input
                    id="threeMark"
                    type="number"
                    value={formData.markDistribution.threeMark}
                    onChange={(e) => updateMarkDistribution('threeMark', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="fiveMark">5 Mark Questions</Label>
                  <Input
                    id="fiveMark"
                    type="number"
                    value={formData.markDistribution.fiveMark}
                    onChange={(e) => updateMarkDistribution('fiveMark', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalQuestions">Total Questions</Label>
                  <Input
                    id="totalQuestions"
                    type="number"
                    value={formData.markDistribution.totalQuestions}
                    onChange={(e) => updateMarkDistribution('totalQuestions', parseInt(e.target.value) || 0)}
                    min="1"
                    max="100"
              />
            </div>
            <div>
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    value={formData.markDistribution.totalMarks}
                    onChange={(e) => updateMarkDistribution('totalMarks', parseInt(e.target.value) || 0)}
                    min="1"
                    max="1000"
                  />
            </div>
          </div>
            </TabsContent>
            
            <TabsContent value="blooms" className="space-y-4">
              <div className="space-y-4">
                {BLOOMS_LEVELS.map(level => (
                  <div key={level.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="font-medium">{level.name}</Label>
                        <p className="text-sm text-gray-600">{level.description}</p>
                      </div>
                      <span className="text-sm font-medium">
                        {formData.bloomsDistribution.find(d => d.level === level.id)?.percentage || 0}%
                      </span>
                    </div>
                    <Slider
                      value={[formData.bloomsDistribution.find(d => d.level === level.id)?.percentage || 0]}
                      onValueChange={([value]) => updateBloomsDistribution(level.id, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="types" className="space-y-4">
              <div className="space-y-4">
                {QUESTION_TYPES.map(type => (
                  <div key={type.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="font-medium">{type.name}</Label>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                      <span className="text-sm font-medium">
                        {formData.questionTypeDistribution.find(d => d.type === type.id)?.percentage || 0}%
                      </span>
                    </div>
                    <Slider
                      value={[formData.questionTypeDistribution.find(d => d.type === type.id)?.percentage || 0]}
                      onValueChange={([value]) => updateQuestionTypeDistribution(type.id, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateQuestionPaper} className="bg-blue-600 hover:bg-blue-700">
              Create Question Paper
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Paper Details Dialog */}
      {selectedQuestionPaper && (
        <Dialog open={!!selectedQuestionPaper} onOpenChange={() => setSelectedQuestionPaper(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedQuestionPaper.title}</DialogTitle>
              <DialogDescription>{selectedQuestionPaper.description}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedQuestionPaper.status)}</div>
                </div>
                <div>
                  <Label className="font-medium">Type</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedQuestionPaper.type}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Total Questions</Label>
                  <div className="mt-1">{selectedQuestionPaper.markDistribution.totalQuestions}</div>
                </div>
                <div>
                  <Label className="font-medium">Total Marks</Label>
                  <div className="mt-1">{selectedQuestionPaper.markDistribution.totalMarks}</div>
                </div>
              </div>
              
              {selectedQuestionPaper.generatedPdf && (
                <div className="flex justify-center">
                  <Button onClick={() => handleDownloadQuestionPaper(selectedQuestionPaper)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}