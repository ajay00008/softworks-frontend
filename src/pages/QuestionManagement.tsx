import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Brain,
  Target,
  BookOpen,
  GraduationCap,
  Settings,
  Upload,
  Download,
  Zap,
  AlertTriangle,
  CheckCircle,
  FileText,
  Play,
  Save,
  Layout
} from 'lucide-react';
import { 
  questionPaperTemplatesAPI, 
  QuestionPaperTemplate, 
  GeneratedQuestion,
  QuestionPaperGenerationResponse,
  questionsAPI,
  Question,
  QuestionGenerationRequest,
  classesAPI,
  subjectsAPI
} from '@/services/api';
import { PDFExportService, QuestionExportData } from '@/utils/pdfExport';

// Blooms Taxonomy Levels
const BLOOMS_LEVELS = [
  { id: 'remember', name: 'Remember', description: 'Recall facts and basic concepts', color: 'bg-blue-100 text-blue-800' },
  { id: 'understand', name: 'Understand', description: 'Explain ideas or concepts', color: 'bg-green-100 text-green-800' },
  { id: 'apply', name: 'Apply', description: 'Use information in new situations', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'analyze', name: 'Analyze', description: 'Draw connections among ideas', color: 'bg-orange-100 text-orange-800' },
  { id: 'evaluate', name: 'Evaluate', description: 'Justify a stand or decision', color: 'bg-purple-100 text-purple-800' },
  { id: 'create', name: 'Create', description: 'Produce new or original work', color: 'bg-red-100 text-red-800' }
];

const DIFFICULTY_LEVELS = [
  { id: 'easy', name: 'Easy', description: 'Remember & Understand levels', color: 'bg-green-100 text-green-800' },
  { id: 'moderate', name: 'Moderate', description: 'Apply & Analyze levels', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'toughest', name: 'Toughest', description: 'Evaluate & Create levels', color: 'bg-red-100 text-red-800' }
];

const QuestionManagement = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<QuestionPaperTemplate[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionPaperTemplate | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, []);

  // Load questions after classes and subjects are loaded
  useEffect(() => {
    if (classes.length > 0 && subjects.length > 0) {
      loadQuestions();
    }
  }, [classes, subjects]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await questionsAPI.getAll();
      // Convert API questions to UI format
      const uiQuestions = response.questions.map(q => ({
        id: q.id,
        question: q.questionText,
        subject: subjects.find(s => s.id === q.subjectId)?.name || (q.subjectId && (q.subjectId as any)?.name) || 'Unknown',
        class: classes.find(c => c.id === q.classId)?.name || (q.classId && (q.classId as any)?.name) || 'Unknown',
        unit: q.unit,
        bloomsLevel: q.bloomsTaxonomyLevel.toLowerCase(),
        difficulty: q.difficulty,
        isTwisted: q.isTwisted,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        createdAt: q.createdAt.split('T')[0]
      }));
      setQuestions(uiQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('Failed to load questions');
      // Set empty array on error to prevent blank screen
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      setClasses(response);
    } catch (error) {
      console.error('Error loading classes:', error);
      setError('Failed to load classes');
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll(11); // Assuming level 1
      setSubjects(response);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError('Failed to load subjects');
    }
  };

  // AI Generation Form
  const [aiForm, setAiForm] = useState({
    subject: '',
    class: '',
    unit: '',
    totalQuestions: 10,
    bloomsDistribution: {
      remember: 20,
      understand: 20,
      apply: 20,
      analyze: 20,
      evaluate: 10,
      create: 10
    },
    twistedPercentage: 10,
    language: 'english'
  });

  // Manual Question Form
  const [questionForm, setQuestionForm] = useState({
    question: '',
    subject: '',
    class: '',
    unit: '',
    bloomsLevel: '',
    difficulty: '',
    isTwisted: false,
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const handleAIGeneration = async () => {
    setIsLoading(true);
    try {
      // Get subject and class names for display
      const selectedSubject = subjects.find(s => s.id === aiForm.subject);
      const selectedClass = classes.find(c => c.classId === aiForm.class);
      
      if (!selectedSubject || !selectedClass) {
        toast({
          title: "Error",
          description: "Please select valid subject and class",
          variant: "destructive",
        });
        return;
      }

      // Create question distribution from Blooms taxonomy
      const questionDistribution = Object.entries(aiForm.bloomsDistribution).map(([level, percentage]) => ({
        bloomsLevel: level.toUpperCase(),
        difficulty: level === 'remember' || level === 'understand' ? 'EASY' : 
                   level === 'apply' || level === 'analyze' ? 'MODERATE' : 'TOUGHEST',
        percentage: percentage,
        twistedPercentage: aiForm.twistedPercentage
      }));

      // Use the questions API for AI generation
      const generatedQuestions = await questionsAPI.generate({
        subjectId: aiForm.subject,
        classId: aiForm.class,
        unit: aiForm.unit,
        questionDistribution,
        totalQuestions: aiForm.totalQuestions,
        language: aiForm.language.toUpperCase()
      });

      // Convert generated questions to the format expected by the UI
      const convertedQuestions = generatedQuestions.map((q, index) => ({
        id: `ai-${Date.now()}-${index}`,
        question: q.questionText,
        subject: selectedSubject.name,
        class: selectedClass.className,
        unit: aiForm.unit,
        bloomsLevel: q.bloomsTaxonomyLevel.toLowerCase(),
        difficulty: q.difficulty.toLowerCase(),
        isTwisted: q.isTwisted,
        options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: q.explanation || `Explanation for AI generated question ${index + 1}`,
        createdAt: new Date().toISOString().split('T')[0]
      }));

      setQuestions(prev => [...convertedQuestions, ...prev]);
      setShowAIDialog(false);

      toast({
        title: "Questions Generated",
        description: `Successfully generated ${aiForm.totalQuestions} questions using AI`,
      });
    } catch (error) {
      console.error('AI Generation Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate questions using AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateGeneration = async () => {
    if (!selectedTemplate) return;
    
    setIsLoading(true);
    try {
      const response = await questionPaperTemplatesAPI.generate({
        templateId: selectedTemplate.id
      });

      setGeneratedQuestions(response.questions);
      setShowGenerateDialog(true);

      toast({
        title: "Question Paper Generated",
        description: `Successfully generated ${response.questions.length} questions from template`,
      });
    } catch (error) {
      console.error('Template Generation Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate questions from template",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!questionForm.question || !questionForm.subject || !questionForm.class) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get subject and class names for display
      const selectedSubject = subjects.find(s => s.id === questionForm.subject);
      const selectedClass = classes.find(c => c.classId === questionForm.class);
      
      if (!selectedSubject || !selectedClass) {
        toast({
          title: "Error",
          description: "Please select valid subject and class",
          variant: "destructive",
        });
        return;
      }

      // Create question using the API
      console.log('Creating question with data:', {
        questionText: questionForm.question,
        subjectId: questionForm.subject,
        classId: questionForm.class,
        unit: questionForm.unit,
        bloomsTaxonomyLevel: questionForm.bloomsLevel.toUpperCase(),
        difficulty: questionForm.difficulty.toUpperCase()
      });
      
      const newQuestion = await questionsAPI.create({
        questionText: questionForm.question,
        questionType: 'MULTIPLE_CHOICE',
        subjectId: questionForm.subject,
        classId: questionForm.class,
        unit: questionForm.unit,
        bloomsTaxonomyLevel: questionForm.bloomsLevel.toUpperCase(),
        difficulty: questionForm.difficulty.toUpperCase(),
        isTwisted: questionForm.isTwisted,
        options: questionForm.options.filter(opt => opt.trim() !== ''),
        correctAnswer: questionForm.options[questionForm.correctAnswer],
        explanation: questionForm.explanation,
        marks: 1,
        createdBy: '68d194e556fc30334c2c537b', // Use actual user ID from auth
        isActive: true,
        language: 'ENGLISH'
      });
      
      console.log('Question created successfully:', newQuestion);

      // Convert to UI format and add to list
      const uiQuestion = {
        id: newQuestion.id,
        question: newQuestion.questionText,
        subject: selectedSubject.name,
        class: selectedClass.className,
        unit: newQuestion.unit,
        bloomsLevel: newQuestion.bloomsTaxonomyLevel.toLowerCase(),
        difficulty: newQuestion.difficulty.toLowerCase(),
        isTwisted: newQuestion.isTwisted,
        options: newQuestion.options || [],
        correctAnswer: questionForm.correctAnswer,
        explanation: newQuestion.explanation,
        createdAt: newQuestion.createdAt.split('T')[0]
      };

      setQuestions(prev => [uiQuestion, ...prev]);
      setShowCreateDialog(false);
      setQuestionForm({
        question: '',
        subject: '',
        class: '',
        unit: '',
        bloomsLevel: '',
        difficulty: '',
        isTwisted: false,
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      });

      toast({
        title: "Question Created",
        description: "Successfully created new question",
      });
    } catch (error) {
      console.error('Create Question Error:', error);
      toast({
        title: "Error",
        description: "Failed to create question",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await questionsAPI.delete(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast({
        title: "Question Deleted",
        description: "Question has been removed",
      });
    } catch (error) {
      console.error('Delete Question Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleExportQuestions = async () => {
    try {
      const exportData: QuestionExportData[] = filteredQuestions.map(q => ({
        id: q.id,
        question: q.question,
        subject: q.subject,
        className: q.class,
        unit: q.unit,
        bloomsLevel: q.bloomsLevel,
        difficulty: q.difficulty,
        isTwisted: q.isTwisted,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        createdAt: q.createdAt
      }));

      await PDFExportService.exportQuestionsToPDF(exportData, {
        title: 'Question Bank Export',
        includeAnswers: true,
        includeExplanations: true,
        subject: exportData[0]?.subject || 'Mathematics',
        className: exportData[0]?.class || 'Class V',
        chapter: `Chapter ${exportData[0]?.unit || '1'}`
      });

      toast({
        title: "Export Successful",
        description: "Questions exported to PDF successfully",
      });
    } catch (error) {
      console.error('Export Error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export questions to PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportQuestionPaper = async () => {
    try {
      const exportData: QuestionExportData[] = filteredQuestions.map(q => ({
        id: q.id,
        question: q.question,
        subject: q.subject,
        className: q.class,
        unit: q.unit,
        bloomsLevel: q.bloomsLevel,
        difficulty: q.difficulty,
        isTwisted: q.isTwisted,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        createdAt: q.createdAt
      }));

      await PDFExportService.exportQuestionPaper(exportData, {
        title: 'Question Paper',
        instructions: 'Answer all questions. Each question carries equal marks.',
        totalMarks: exportData.length,
        subject: exportData[0]?.subject || 'Mathematics',
        className: exportData[0]?.class || 'Class V',
        chapter: `Chapter ${exportData[0]?.unit || '1'}`
      });

      toast({
        title: "Question Paper Generated",
        description: "Question paper exported to PDF successfully",
      });
    } catch (error) {
      console.error('Export Error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export question paper to PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportAnswerKey = async () => {
    try {
      const exportData: QuestionExportData[] = filteredQuestions.map(q => ({
        id: q.id,
        question: q.question,
        subject: q.subject,
        className: q.class,
        unit: q.unit,
        bloomsLevel: q.bloomsLevel,
        difficulty: q.difficulty,
        isTwisted: q.isTwisted,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        createdAt: q.createdAt
      }));

      await PDFExportService.exportAnswerKey(exportData, {
        subject: exportData[0]?.subject || 'Mathematics',
        className: exportData[0]?.class || 'Class V',
        chapter: `Chapter ${exportData[0]?.unit || '1'}`
      });

      toast({
        title: "Answer Key Generated",
        description: "Answer key exported to PDF successfully",
      });
    } catch (error) {
      console.error('Export Error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export answer key to PDF",
        variant: "destructive",
      });
    }
  };

  const filteredQuestions = (questions || []).filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.unit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || question.subject === selectedSubject;
    const matchesClass = selectedClass === 'all' || question.class === selectedClass;
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesClass && matchesDifficulty;
  });

  const getBloomsBadge = (level: string) => {
    const bloomsLevel = BLOOMS_LEVELS.find(l => l.id === level);
    return (
      <Badge className={bloomsLevel?.color || 'bg-gray-100 text-gray-800'}>
        {bloomsLevel?.name || level}
      </Badge>
    );
  };
  console.log(filteredQuestions,'filteredQuestions')

  const getDifficultyBadge = (difficulty: string) => {
    const diffLevel = DIFFICULTY_LEVELS.find(d => d.id === difficulty);
    return (
      <Badge className={diffLevel?.color || 'bg-gray-100 text-gray-800'}>
        {diffLevel?.name || difficulty}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Question Management</h1>
          </div>
          <p className="text-muted-foreground">
            Create questions based on Blooms Taxonomy with AI assistance
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Layout className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Brain className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Question
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search & Filter Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="English">English</SelectItem>
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
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="toughest">Toughest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExportQuestions}>
                      <FileText className="w-4 h-4 mr-2" />
                      Export Questions (with answers)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportQuestionPaper}>
                      <FileText className="w-4 h-4 mr-2" />
                      Export Question Paper
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportAnswerKey}>
                      <FileText className="w-4 h-4 mr-2" />
                      Export Answer Key
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading questions...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <HelpCircle className="w-5 h-5" />
                  <span>No questions found. Create your first question!</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question) => (
          <Card key={question.id} className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  {/* Question Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{question.question}</h3>
                      <div className="flex items-center space-x-4">
                        <Badge className="bg-blue-100 text-blue-800">
                          {question.subject}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {question.class}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          {question.unit}
                        </Badge>
                        {getBloomsBadge(question.bloomsLevel)}
                        {getDifficultyBadge(question.difficulty)}
                        {question.isTwisted && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Twisted
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* question type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Question Type:</Label>
                    <Badge className="bg-blue-100 text-blue-800">
                      {question.questionType || 'Multiple Choice'}
                    </Badge>
                  </div>
                  {/* Options */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Options:</Label>
                    <div className="grid gap-2">
                      {question.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-sm font-medium w-6">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className={`text-sm ${option === question.correctAnswer ? 'text-green-600 font-semibold' : ''}`}>
                            {option}
                            {option == question.correctAnswer && (
                              <CheckCircle className="w-4 h-4 inline ml-2 text-green-600" />
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Explanation:</Label>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {question.explanation}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Created: {question.createdAt}</span>
                    <span>ID: {question.id}</span>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            ))
          )}
        </div>
      )}

      {/* AI Generation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Question Generation
            </DialogTitle>
            <DialogDescription>
              Generate questions using AI based on Blooms Taxonomy distribution
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={aiForm.subject} onValueChange={(value) => setAiForm(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select value={aiForm.class} onValueChange={(value) => setAiForm(prev => ({ ...prev, class: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.classId} value={cls.classId}>
                        {cls.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Unit/Topic *</Label>
              <Input
                placeholder="Enter unit or topic"
                value={aiForm.unit}
                onChange={(e) => setAiForm(prev => ({ ...prev, unit: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Total Questions: {aiForm.totalQuestions}</Label>
              <Slider
                value={[aiForm.totalQuestions]}
                onValueChange={(value) => setAiForm(prev => ({ ...prev, totalQuestions: value[0] }))}
                max={50}
                min={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Blooms Taxonomy Distribution */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Blooms Taxonomy Distribution (%)</Label>
              {BLOOMS_LEVELS.map((level) => (
                <div key={level.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-sm font-medium">{level.name}</Label>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {aiForm.bloomsDistribution[level.id as keyof typeof aiForm.bloomsDistribution]}%
                    </span>
                  </div>
                  <Slider
                    value={[aiForm.bloomsDistribution[level.id as keyof typeof aiForm.bloomsDistribution]]}
                    onValueChange={(value) => setAiForm(prev => ({
                      ...prev,
                      bloomsDistribution: {
                        ...prev.bloomsDistribution,
                        [level.id]: value[0]
                      }
                    }))}
                    max={50}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          ))}

          {/* Twisted Questions */}
          <div className="space-y-2">
            <Label>Twisted Questions Percentage: {aiForm.twistedPercentage}%</Label>
            <Slider
              value={[aiForm.twistedPercentage]}
              onValueChange={(value) => setAiForm(prev => ({ ...prev, twistedPercentage: value[0] }))}
              max={30}
              min={0}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Percentage of questions that will be twisted/complex variations
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowAIDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAIGeneration}
              disabled={isLoading || !aiForm.subject || !aiForm.class || !aiForm.unit}
            >
              {isLoading ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Manual Question Creation Dialog */}
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create New Question
          </DialogTitle>
          <DialogDescription>
            Create a question manually based on Blooms Taxonomy
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Question *</Label>
            <Textarea
              placeholder="Enter your question..."
              value={questionForm.question}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select value={questionForm.subject} onValueChange={(value) => setQuestionForm(prev => ({ ...prev, subject: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select value={questionForm.class} onValueChange={(value) => setQuestionForm(prev => ({ ...prev, class: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Unit/Topic</Label>
            <Input
              placeholder="Enter unit or topic"
              value={questionForm.unit}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, unit: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Blooms Level *</Label>
              <Select value={questionForm.bloomsLevel} onValueChange={(value) => setQuestionForm(prev => ({ ...prev, bloomsLevel: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Blooms level" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOMS_LEVELS.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} - {level.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty *</Label>
              <Select value={questionForm.difficulty} onValueChange={(value) => setQuestionForm(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} - {level.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="twisted"
              checked={questionForm.isTwisted}
              onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, isTwisted: !!checked }))}
            />
            <Label htmlFor="twisted">This is a twisted/complex question</Label>
          </div>

          <div className="space-y-4">
            <Label>Answer Options *</Label>
            {questionForm.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm font-medium w-6">
                  {String.fromCharCode(65 + index)}.
                </span>
                <Input
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...questionForm.options];
                    newOptions[index] = e.target.value;
                    setQuestionForm(prev => ({ ...prev, options: newOptions }));
                  }}
                />
                <Checkbox
                  checked={questionForm.correctAnswer === index}
                  onCheckedChange={() => setQuestionForm(prev => ({ ...prev, correctAnswer: index }))}
                />
                <Label className="text-sm">Correct</Label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Explanation</Label>
            <Textarea
              placeholder="Explain the correct answer..."
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateQuestion}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Question"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Question Paper Templates Dialog */}
    <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Layout className="w-5 h-5 mr-2" />
            Question Paper Templates
          </DialogTitle>
          <DialogDescription>
            Select a template to generate questions or create a new template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template List */}
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <Badge variant="outline">{template.gradeLevel}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Total Marks:</span>
                      <span className="font-medium">{template.totalMarks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span className="font-medium">{template.duration} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Usage Count:</span>
                      <span className="font-medium">{template.usageCount}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedTemplate(template);
                        handleTemplateGeneration();
                      }}
                      disabled={isLoading}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create New Template Button */}
          <div className="flex justify-center">
            <Button variant="outline" className="w-full max-w-md">
              <Plus className="w-4 h-4 mr-2" />
              Create New Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Generated Questions Preview Dialog */}
    <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Generated Question Paper
          </DialogTitle>
          <DialogDescription>
            Preview the generated questions from template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {generatedQuestions.map((question, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <Badge variant="outline">{question.questionType}</Badge>
                  </div>
                  
                  <p className="text-sm">{question.questionText}</p>
                  
                  {question.options && question.options.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Options:</Label>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="text-xs text-muted-foreground">
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Marks: {question.marks}</span>
                    <span>Time: {question.timeLimit} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
            Close
          </Button>
          <Button onClick={() => {
            // Add generated questions to the main list
            const convertedQuestions = generatedQuestions.map((q, index) => ({
              id: `template-${Date.now()}-${index}`,
              question: q.questionText,
              subject: selectedTemplate?.subjectId || 'Unknown',
              class: selectedTemplate?.classId || 'Unknown',
              unit: 'Template Generated',
              bloomsLevel: 'remember',
              difficulty: 'moderate',
              isTwisted: false,
              options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 0,
              explanation: q.explanation || 'Generated from template',
              createdAt: new Date().toISOString().split('T')[0]
            }));
            
            setQuestions(prev => [...convertedQuestions, ...prev]);
            setShowGenerateDialog(false);
            
            toast({
              title: "Questions Added",
              description: `Added ${generatedQuestions.length} questions to your question bank`,
            });
          }}>
            <Save className="w-4 h-4 mr-2" />
            Add to Question Bank
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
);
};

export default QuestionManagement;
