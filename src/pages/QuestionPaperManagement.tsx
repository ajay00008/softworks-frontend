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

  // Reload data when filters change
  useEffect(() => {
    loadData();
  }, [searchTerm, selectedType, selectedStatus, selectedSubject, selectedClass, selectedExam]);

  const loadData = async () => {
    try {
      setLoading(true);   
      
      // Build filter parameters for question papers
      const questionPaperFilters: any = {};
      if (searchTerm) questionPaperFilters.search = searchTerm;
      if (selectedType && selectedType !== 'all') questionPaperFilters.type = selectedType;
      if (selectedStatus && selectedStatus !== 'all') questionPaperFilters.status = selectedStatus;
      if (selectedSubject && selectedSubject !== 'all') questionPaperFilters.subjectId = selectedSubject;
      if (selectedClass && selectedClass !== 'all') questionPaperFilters.classId = selectedClass;
      if (selectedExam && selectedExam !== 'all') questionPaperFilters.examId = selectedExam;
      
      const [examsResponse, questionPapersResponse, subjectsResponse, classesResponse] = await Promise.all([
        examsAPI.getAll().catch(() => null),
        questionPaperAPI.getAll(questionPaperFilters).catch(() => null),
        subjectManagementAPI.getAll().catch(() => null),
        classManagementAPI.getAll().catch(() => null)
      ]);
      setExams(examsResponse?.data || []);
      setQuestionPapers(questionPapersResponse?.questionPapers || []);
      setSubjects(subjectsResponse?.subjects || []);
      setClasses(classesResponse?.classes || []);
      console.log("examsResponse", examsResponse);
      console.log("questionPapersResponse", questionPapersResponse);
      console.log("subjectsResponse", subjectsResponse);
      console.log("classesResponse", classesResponse);
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
      if (!formData.title || !formData.examId) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Validate mark distribution
      const totalFromQuestions = (formData.markDistribution.oneMark * 1) + 
                                (formData.markDistribution.twoMark * 2) + 
                                (formData.markDistribution.threeMark * 3) + 
                                (formData.markDistribution.fiveMark * 5);
      
      if (formData.markDistribution.totalMarks === 100 && totalFromQuestions !== 100) {
        toast({
          title: "Validation Error",
          description: `Total marks from questions (${totalFromQuestions}) must equal exactly 100 when total marks is set to 100`,
          variant: "destructive"
        });
        return;
      }

      // Validate Blooms Taxonomy distribution
      const bloomsTotal = formData.bloomsDistribution.reduce((sum, dist) => sum + dist.percentage, 0);
      if (bloomsTotal !== 100) {
        toast({
          title: "Validation Error",
          description: `Blooms taxonomy percentages must add up to exactly 100%. Current total: ${bloomsTotal}%`,
          variant: "destructive"
        });
        return;
      }

      // Get exam details to extract subject and class IDs
      const selectedExam = exams.find(exam => exam._id === formData.examId);
      
      if (!selectedExam) {
        toast({
          title: "Error",
          description: "Please select a valid exam",
          variant: "destructive"
        });
        return;
      }

      // Generate question paper directly using AI
      const aiRequest = {
        title: formData.title,
        description: formData.description,
        examId: formData.examId,
        subjectId: selectedExam.subjectId || selectedExam.subjectId?._id,
        classId: selectedExam.classId || selectedExam.classId?._id,
        markDistribution: formData.markDistribution,
        bloomsDistribution: formData.bloomsDistribution,
        questionTypeDistribution: formData.questionTypeDistribution,
        aiSettings: formData.aiSettings
      };

      const generatedQuestionPaper = await questionPaperAPI.generateCompleteAI(aiRequest as any);
      
      setQuestionPapers(prev => [generatedQuestionPaper, ...prev]);
      
      toast({ 
        title: "Success",
        description: "Question paper generated successfully with AI"
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error generating question paper:', error);
      toast({
        title: "Error",
        description: "Failed to generate question paper",
        variant: "destructive"
      });
    }
  };

  const handleGenerateQuestionPaper = async (questionPaper: QuestionPaper) => {
    try {
      // Generate question paper using AI
      const result = await questionPaperAPI.generateAI(questionPaper._id);
      
      // Update the question paper in state
      setQuestionPapers(prev => prev.map(paper => 
        paper._id === questionPaper._id 
          ? result
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
        // Use the download URL from the generated PDF
        const downloadUrl = questionPaper.generatedPdf.downloadUrl;
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = questionPaper.generatedPdf.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download Started",
          description: `Downloading ${questionPaper.generatedPdf.fileName}`
        });
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
      // Delete question paper using API
      await questionPaperAPI.delete(questionPaper._id);
      
      // Remove from state
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
    setFormData(prev => {
      const newMarkDistribution = {
        ...prev.markDistribution,
        [field]: value
      };
      
      // Calculate total marks from individual mark questions
      const totalFromQuestions = (newMarkDistribution.oneMark * 1) + 
                                (newMarkDistribution.twoMark * 2) + 
                                (newMarkDistribution.threeMark * 3) + 
                                (newMarkDistribution.fiveMark * 5);
      
      // If total marks is set to 100, validate that question marks equal exactly 100
      if (newMarkDistribution.totalMarks === 100 && totalFromQuestions !== 100) {
        toast({
          title: "Validation Error",
          description: `Total marks from questions (${totalFromQuestions}) must equal exactly 100 when total marks is set to 100`,
          variant: "destructive"
        });
        return prev; // Don't update if validation fails
      }
      
      return {
        ...prev,
        markDistribution: newMarkDistribution
      };
    });
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

  // Backend filtering is now handled in loadData function

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
      {questionPapers.length === 0 ? (
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
          {questionPapers.map(paper => (
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="marks">Mark Distribution & Settings</TabsTrigger>
              <TabsTrigger value="blooms">Blooms Taxonomy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-4">
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter question paper description"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="marks" className="space-y-6">
              {/* Basic Mark Distribution */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mark Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="oneMark">1 Mark Questions</Label>
                    <Input
                      id="oneMark"
                      type="number"
                      value={formData.markDistribution.oneMark || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
                        updateMarkDistribution('oneMark', value);
                      }}
                      onFocus={(e) => e.target.select()}
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twoMark">2 Mark Questions</Label>
                    <Input
                      id="twoMark"
                      type="number"
                      value={formData.markDistribution.twoMark || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
                        updateMarkDistribution('twoMark', value);
                      }}
                      onFocus={(e) => e.target.select()}
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="threeMark">3 Mark Questions</Label>
                    <Input
                      id="threeMark"
                      type="number"
                      value={formData.markDistribution.threeMark || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
                        updateMarkDistribution('threeMark', value);
                      }}
                      onFocus={(e) => e.target.select()}
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fiveMark">5 Mark Questions</Label>
                    <Input
                      id="fiveMark"
                      type="number"
                      value={formData.markDistribution.fiveMark || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
                        updateMarkDistribution('fiveMark', value);
                      }}
                      onFocus={(e) => e.target.select()}
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      value={formData.markDistribution.totalMarks || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 1);
                        updateMarkDistribution('totalMarks', value);
                      }}
                      onFocus={(e) => e.target.select()}
                      min="1"
                      max="1000"
                      placeholder="100"
                    />
                  </div>
                </div>
                
                {/* Mark Distribution Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Mark Distribution Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">1 Mark Questions:</span>
                      <span className="ml-2 font-medium">{formData.markDistribution.oneMark} × 1 = {formData.markDistribution.oneMark * 1} marks</span>
                    </div>
                    <div>
                      <span className="text-gray-600">2 Mark Questions:</span>
                      <span className="ml-2 font-medium">{formData.markDistribution.twoMark} × 2 = {formData.markDistribution.twoMark * 2} marks</span>
                    </div>
                    <div>
                      <span className="text-gray-600">3 Mark Questions:</span>
                      <span className="ml-2 font-medium">{formData.markDistribution.threeMark} × 3 = {formData.markDistribution.threeMark * 3} marks</span>
                    </div>
                    <div>
                      <span className="text-gray-600">5 Mark Questions:</span>
                      <span className="ml-2 font-medium">{formData.markDistribution.fiveMark} × 5 = {formData.markDistribution.fiveMark * 5} marks</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Marks from Questions:</span>
                      <span className={`font-medium ${
                        ((formData.markDistribution.oneMark * 1) + 
                         (formData.markDistribution.twoMark * 2) + 
                         (formData.markDistribution.threeMark * 3) + 
                         (formData.markDistribution.fiveMark * 5)) !== 100 && 
                        formData.markDistribution.totalMarks === 100 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {(formData.markDistribution.oneMark * 1) + 
                         (formData.markDistribution.twoMark * 2) + 
                         (formData.markDistribution.threeMark * 3) + 
                         (formData.markDistribution.fiveMark * 5)}
                      </span>
                    </div>
                    {formData.markDistribution.totalMarks === 100 && 
                     ((formData.markDistribution.oneMark * 1) + 
                      (formData.markDistribution.twoMark * 2) + 
                      (formData.markDistribution.threeMark * 3) + 
                      (formData.markDistribution.fiveMark * 5)) !== 100 && (
                      <div className="mt-2 text-red-600 text-sm">
                        ⚠️ Total marks from questions must equal exactly 100. Please adjust the distribution.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Type Distribution */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Question Type Distribution</h3>
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
              </div>

            </TabsContent>
            
            <TabsContent value="blooms" className="space-y-6">
              {/* Blooms Taxonomy Distribution */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Blooms Taxonomy Distribution</h3>
                <p className="text-sm text-gray-600">
                  Configure the distribution of questions across different cognitive levels according to Bloom's Taxonomy.
                </p>
                
                {/* Blooms Distribution Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Distribution Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {BLOOMS_LEVELS.map(level => {
                      const percentage = formData.bloomsDistribution.find(d => d.level === level.id)?.percentage || 0;
                      return (
                        <div key={level.id} className="flex justify-between">
                          <span className="text-gray-600">{level.name}:</span>
                          <span className={`font-medium ${percentage > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total:</span>
                      <span className={`font-bold ${
                        formData.bloomsDistribution.reduce((sum, dist) => sum + dist.percentage, 0) === 100 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formData.bloomsDistribution.reduce((sum, dist) => sum + dist.percentage, 0)}%
                      </span>
                    </div>
                    {formData.bloomsDistribution.reduce((sum, dist) => sum + dist.percentage, 0) !== 100 && (
                      <div className="mt-2 text-red-600 text-sm">
                        ⚠️ Blooms taxonomy percentages must add up to exactly 100%. Please adjust the distribution.
                      </div>
                    )}
                  </div>
                </div>
                
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
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateQuestionPaper} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                !formData.title || 
                !formData.examId ||
                (formData.markDistribution.totalMarks === 100 && 
                 ((formData.markDistribution.oneMark * 1) + 
                  (formData.markDistribution.twoMark * 2) + 
                  (formData.markDistribution.threeMark * 3) + 
                  (formData.markDistribution.fiveMark * 5)) !== 100) ||
                formData.bloomsDistribution.reduce((sum, dist) => sum + dist.percentage, 0) !== 100
              }
            >
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