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
  Layout,
  X
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
  subjectsAPI,
  syllabusAPI
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

const QuestionManagement = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    id: '',
    question: '',
    explanation: '',
    subject: '',
    class: '',
    difficulty: '',
    bloomsLevel: '',
    questionType: '',
    options: [] as string[],
    correctAnswer: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<QuestionPaperTemplate[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [syllabi, setSyllabi] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionPaperTemplate | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load classes, subjects, and syllabi in parallel
        await Promise.all([
          loadClasses(),
          loadSubjects(),
          loadSyllabi()
        ]);
        
        // Load questions regardless of classes/subjects success
        // This prevents infinite loading if classes/subjects fail
        await loadQuestions();
      } catch (error) {
        console.error('Error initializing data:', error);
        // Still try to load questions even if classes/subjects fail
        await loadQuestions();
      }
    };
    
    initializeData();
  }, []);

  // Fallback: Ensure loading state is resolved after a maximum time
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Loading timeout reached, stopping loading state');
        setIsLoading(false);
        if (questions.length === 0) {
          setError('Loading timeout - please refresh the page');
        }
      }
    }, 15000); // 15 seconds fallback

    return () => clearTimeout(fallbackTimeout);
  }, [isLoading, questions.length]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadQuestions(page, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    loadQuestions(1, newPageSize);
  };

  const loadQuestions = async (page: number = currentPage, limit: number = pageSize, 
    filters?: {
    search?: string;
    subject?: string;
    class?: string;
    difficulty?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      // Build query parameters
      const queryParams: any = {
        page,
        limit
      };
      
      // Use passed filters or fall back to state
      const search = filters?.search ?? searchTerm;
      const subject = filters?.subject ?? selectedSubject;
      const classFilter = filters?.class ?? selectedClass;
      const difficulty = filters?.difficulty ?? selectedDifficulty;
      
      console.log('Filter values:', { search, subject, classFilter, difficulty });
      console.log('Passed filters:', filters);
      console.log('Current state:', { searchTerm, selectedSubject, selectedClass, selectedDifficulty });
      
      // Add search term if provided
      if (search.trim()) {
        queryParams.search = search.trim();
      }
      
      // Add filters if not 'all'
      if (subject !== 'all') {
        queryParams.subjectId = subject;
        console.log('Subject filter applied:', subject);
      }
      if (classFilter !== 'all') {
        queryParams.classId = classFilter;
        console.log('Class filter applied:', classFilter);
      }
      if (difficulty !== 'all') {
        queryParams.difficulty = difficulty.toUpperCase();
        console.log('Difficulty filter applied:', difficulty);
      }
      
      console.log('Filter parameters being sent to API:', queryParams);
      
      const response = await Promise.race([
        questionsAPI.getAll(queryParams),
        timeoutPromise
      ]) as any;
      
      console.log(response,'responseQuestions');
      
      // Handle case where response.questions might be undefined or null
      const questionsData = response?.questions || [];
      
      // Update pagination info
      if (response?.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalQuestions(response.pagination.total || 0);
      } else {
        // Fallback if pagination info is not available
        setTotalPages(1);
        setTotalQuestions(questionsData.length);
      }
      
      // Convert API questions to UI format
      const uiQuestions = questionsData.map((q: any) => ({
        id: q._id,
        question: q.questionText,
        subject: subjects.find(s => s.id === q.subjectId)?.name || (q.subjectId && (q.subjectId as any)?.name) || 'Unknown',
        subjectId: q.subjectId,
        class: classes.find(c => c.classId === q.classId)?.name || (q.classId && (q.classId as any)?.name) || 'Unknown',
        classId: q.classId,
        unit: q.unit,
        bloomsLevel: q.bloomsTaxonomyLevel.toLowerCase(),
        difficulty: q.difficulty,
        isTwisted: q.isTwisted,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        createdAt: q.createdAt.split('T')[0],
        questionType: q.questionType
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
      // Don't set global error for classes, just log it
      // Questions can still be loaded without classes
      setClasses([]);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll(); // Remove the parameter
      setSubjects(response);
    } catch (error) {
      console.error('Error loading subjects:', error);
      // Don't set global error for subjects, just log it
      // Questions can still be loaded without subjects
      setSubjects([]);
    }
  };

  const loadSyllabi = async () => {
    try {
      const response = await syllabusAPI.getAll();
      console.log(response,'responseSyllabi');
      setSyllabi(response || []);
    } catch (error) {
      console.error('Error loading syllabi:', error);
      // Don't set global error for syllabi, just log it
      setSyllabi([]);
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

  // Validate if subjects, classes, and syllabi are available before opening AI dialog
  const handleAIDialogOpen = () => {
    if (subjects.length === 0 || classes.length === 0 || syllabi.length === 0) {
      toast({
        title: "Setup Required",
        description: "Please upload syllabus first to add subjects and classes before using AI generation.",
        variant: "destructive",
      });
      return;
    }
    // Reset form to clean state
    setAiForm({
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
    setShowAIDialog(true);
  };

  // Validate if subjects, classes, and syllabi are available before opening Create Question dialog
  const handleCreateDialogOpen = () => {
    if (subjects.length === 0 || classes.length === 0 || syllabi.length === 0) {
      toast({
        title: "Setup Required",
        description: "Please upload syllabus first to add subjects and classes before creating questions.",
        variant: "destructive",
      });
      return;
    }
    setShowCreateDialog(true);
  };

  const handleAIGeneration = async () => {
    setIsLoading(true);
    try {
      console.log(aiForm,'aiForm');
      // Get subject and class names for display
      const selectedSubject = subjects.find(s => s._id === aiForm.subject);
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
        createdBy: '', // Use actual user ID from auth
        isActive: true,
        language: 'ENGLISH'
      });
      
      console.log('Question created successfully:', newQuestion);

      // Handle both single question and array of questions
      const questionsToAdd = Array.isArray(newQuestion.questions) ? newQuestion.questions : [newQuestion.questions];
      
      // Convert to UI format and add to list
      const uiQuestions = questionsToAdd.map(question => ({
        id: question.id || question._id,
        question: question.questionText,
        subject: selectedSubject.name,
        class: selectedClass.className,
        unit: question.unit,
        bloomsLevel: question.bloomsTaxonomyLevel?.toLowerCase() || 'remember',
        difficulty: question.difficulty?.toLowerCase() || 'moderate',
        isTwisted: question.isTwisted || false,
        options: question.options || [],
        correctAnswer: questionForm.correctAnswer,
        questionType: question.questionType,
        explanation: question.explanation || '',
        createdAt: question.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
      }));

      setQuestions(prev => [...uiQuestions, ...prev]);
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
      setShowDeleteDialog(false);
      setDeletingQuestionId(null);
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

  const handleDeleteClick = (id: string) => {
    setDeletingQuestionId(id);
    setShowDeleteDialog(true);
  };

  const handleEditClick = (question: any) => {
    setEditingQuestion(question);
    
    // Debug: Log the question data
    console.log('Question data:', question);
    console.log('Question ID fields:', {
      id: question.id,
      _id: question._id,
      subjectId: question.subjectId,
      classId: question.classId
    });
    console.log('Available subjects:', subjects);
    console.log('Available classes:', classes);
    
    // Find the correct subject and class IDs
    const subjectId = question.subjectId || subjects.find(s => s.name === question.subject)?.id || 
                     subjects.find(s => s.name === question.subject)?._id || '';
    const classId = question.classId || classes.find(c => c.className === question.class)?._id || 
                   classes.find(c => c.name === question.class)?._id || '';
    
    console.log('Found subjectId:', subjectId, 'Type:', typeof subjectId);
    console.log('Found classId:', classId, 'Type:', typeof classId);
    
    // Ensure IDs are strings
    const validSubjectId = subjectId ? String(subjectId) : '';
    const validClassId = classId ? String(classId) : '';
    
    console.log('Valid subjectId:', validSubjectId, 'Type:', typeof validSubjectId);
    console.log('Valid classId:', validClassId, 'Type:', typeof validClassId);
    
    setEditFormData({
      id: question.id || question._id || '',
      question: question.question || '',
      explanation: question.explanation || '',
      subject: validSubjectId,
      class: validClassId,
      difficulty: question.difficulty || '',
      bloomsLevel: question.bloomsLevel || '',
      questionType: question.questionType || '',
      options: question.options || [],
      correctAnswer: question.correctAnswer || 0
    });
    setShowEditDialog(true);
  };

  const handleUpdateQuestion = async () => {
    console.log('Edit form data:', editFormData);
    console.log('Edit form ID:', editFormData.id);
    
    if (!editFormData.id) {
      toast({
        title: "Error",
        description: "Question ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!editFormData.question.trim()) {
      toast({
        title: "Error",
        description: "Question text is required.",
        variant: "destructive",
      });
      return;
    }

    if (!editFormData.subject) {
      toast({
        title: "Error",
        description: "Subject is required.",
        variant: "destructive",
      });
      return;
    }

    if (!editFormData.class) {
      toast({
        title: "Error",
        description: "Class is required.",
        variant: "destructive",
      });
      return;
    }

    if (!editFormData.difficulty) {
      toast({
        title: "Error",
        description: "Difficulty is required.",
        variant: "destructive",
      });
      return;
    }

    if (!editFormData.questionType) {
      toast({
        title: "Error",
        description: "Question type is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate correct answer
    if (editFormData.options && editFormData.options.length > 0) {
      const correctAnswerText = editFormData.options[editFormData.correctAnswer];
      if (!correctAnswerText || correctAnswerText.trim() === '') {
        toast({
          title: "Error",
          description: "Please select a valid correct answer.",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate that subject and class are strings (not objects)
    if (typeof editFormData.subject !== 'string' || typeof editFormData.class !== 'string') {
      console.error('Subject or class is not a string:', {
        subject: editFormData.subject,
        class: editFormData.class,
        subjectType: typeof editFormData.subject,
        classType: typeof editFormData.class
      });
      toast({
        title: "Error",
        description: "Invalid subject or class selection. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Validate that subject and class IDs are not empty
    if (!editFormData.subject || !editFormData.class) {
      toast({
        title: "Error",
        description: "Please select both subject and class.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Map form data to API format
      const correctAnswerText = editFormData.options && editFormData.options[editFormData.correctAnswer] 
        ? editFormData.options[editFormData.correctAnswer] 
        : editingQuestion.correctAnswer || 'No answer provided';
      
      const updateData = {
        questionText: editFormData.question,
        subjectId: String(editFormData.subject),
        classId: String(editFormData.class),
        difficulty: editFormData.difficulty.toUpperCase(),
        options: editFormData.options,
        correctAnswer: correctAnswerText,
        explanation: editFormData.explanation,
        // Keep existing fields that aren't being edited
        questionType: editFormData.questionType || '',
        unit: editingQuestion.unit || 'General',
        bloomsTaxonomyLevel: editFormData.bloomsLevel.toUpperCase() || 'REMEMBER',
        isTwisted: editingQuestion.isTwisted || false,
        marks: editingQuestion.marks || 1,
        language: editingQuestion.language || 'ENGLISH'
      };

      console.log('Updating question with ID:', editFormData.id);
      console.log('Edit form data:', editFormData);
      console.log('Subject ID type:', typeof editFormData.subject, editFormData.subject);
      console.log('Class ID type:', typeof editFormData.class, editFormData.class);
      console.log('Updating question with data:', updateData);
      
      const updatedQuestion = await questionsAPI.update(editFormData.id, updateData);
      
      // Update the questions list
      setQuestions(prev => prev.map(q => 
        (q._id === editFormData.id || q.id === editFormData.id) ? { ...q, ...updatedQuestion } : q
      ));
      
      setShowEditDialog(false);
      setEditingQuestion(null);
      
      toast({
        title: "Question Updated",
        description: "The question has been successfully updated.",
      });
      
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update the question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportQuestions = async () => {
    try {
      // For export, we need to get all questions, not just the current page
      const allQuestionsResponse = await questionsAPI.getAll({
        page: 1,
        limit: 1000, // Large limit to get all questions
        search: searchTerm.trim() || undefined,
        subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty.toUpperCase() : undefined
      });
      
      const allQuestions = allQuestionsResponse.questions || [];
      const exportData: QuestionExportData[] = allQuestions.map((q: any) => ({
        id: q._id || q.id,
        question: q.questionText,
        subject: subjects.find(s => s.id === q.subjectId)?.name || 'Unknown',
        className: classes.find(c => c.classId === q.classId)?.name || 'Unknown',
        unit: q.unit,
        bloomsLevel: q.bloomsTaxonomyLevel?.toLowerCase() || 'remember',
        difficulty: q.difficulty,
        isTwisted: q.isTwisted,
        options: q.options || [],
        correctAnswer: 0, // Default value for export
        explanation: q.explanation || '',
        createdAt: q.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
      }));

      await PDFExportService.exportQuestionsToPDF(exportData, {
        title: 'Question Bank Export',
        includeAnswers: true,
        includeExplanations: true,
        subject: exportData[0]?.subject || 'Mathematics',
        className: exportData[0]?.className || 'Class V',
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
      // For export, we need to get all questions, not just the current page
      const allQuestionsResponse = await questionsAPI.getAll({
        page: 1,
        limit: 1000, // Large limit to get all questions
        search: searchTerm.trim() || undefined,
        subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty.toUpperCase() : undefined
      });
      
      const allQuestions = allQuestionsResponse.questions || [];
      const exportData: QuestionExportData[] = allQuestions.map((q: any) => ({
        id: q._id || q.id,
        question: q.questionText,
        subject: subjects.find(s => s.id === q.subjectId)?.name || 'Unknown',
        className: classes.find(c => c.classId === q.classId)?.name || 'Unknown',
        unit: q.unit,
        bloomsLevel: q.bloomsTaxonomyLevel?.toLowerCase() || 'remember',
        difficulty: q.difficulty,
        isTwisted: q.isTwisted,
        options: q.options || [],
        correctAnswer: 0, // Default value for export
        explanation: q.explanation || '',
        createdAt: q.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
      }));

      await PDFExportService.exportQuestionPaper(exportData, {
        title: 'Question Paper',
        instructions: 'Answer all questions. Each question carries equal marks.',
        totalMarks: exportData.length,
        subject: exportData[0]?.subject || 'Mathematics',
        className: exportData[0]?.className || 'Class V',
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
      // For export, we need to get all questions, not just the current page
      const allQuestionsResponse = await questionsAPI.getAll({
        page: 1,
        limit: 1000, // Large limit to get all questions
        search: searchTerm.trim() || undefined,
        subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty.toUpperCase() : undefined
      });
      
      const allQuestions = allQuestionsResponse.questions || [];
      const exportData: QuestionExportData[] = allQuestions.map((q: any) => ({
        id: q._id || q.id,
        question: q.questionText,
        subject: subjects.find(s => s.id === q.subjectId)?.name || 'Unknown',
        className: classes.find(c => c.classId === q.classId)?.name || 'Unknown',
        unit: q.unit,
        bloomsLevel: q.bloomsTaxonomyLevel?.toLowerCase() || 'remember',
        difficulty: q.difficulty,
        isTwisted: q.isTwisted,
        options: q.options || [],
        correctAnswer: 0, // Default value for export
        explanation: q.explanation || '',
        createdAt: q.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
      }));

      await PDFExportService.exportAnswerKey(exportData, {
        subject: exportData[0]?.subject || 'Mathematics',
        className: exportData[0]?.className || 'Class V',
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

  // Since we're using server-side pagination, we don't need client-side filtering
  // The questions array already contains the filtered results from the server
  const filteredQuestions = questions || [];
  console.log(filteredQuestions,'filteredQuestions')

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
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Question Management</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create questions based on Blooms Taxonomy with AI assistance
          </p>
        </div>
        <div className="flex flex-col gap-2 min-[375px]:flex-row">
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                onClick={handleAIDialogOpen}
                className={`w-full min-[375px]:w-auto text-xs sm:text-sm ${subjects.length === 0 || classes.length === 0 || syllabi.length === 0 ? "opacity-60" : ""}`}
                title={subjects.length === 0 || classes.length === 0 || syllabi.length === 0 ? "Upload syllabus first to add subjects and classes" : ""}
              >
                <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden min-[375px]:inline">AI Generate</span>
                <span className="min-[375px]:hidden">AI</span>
                {(subjects.length === 0 || classes.length === 0 || syllabi.length === 0) && (
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 text-amber-500" />
                )}
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleCreateDialogOpen}
                className={`w-full min-[375px]:w-auto text-xs sm:text-sm ${subjects.length === 0 || classes.length === 0 || syllabi.length === 0 ? "opacity-60" : ""}`}
                title={subjects.length === 0 || classes.length === 0 || syllabi.length === 0 ? "Upload syllabus first to add subjects and classes" : ""}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden min-[375px]:inline">Create Question</span>
                <span className="min-[375px]:hidden">Create</span>
                {(subjects.length === 0 || classes.length === 0 || syllabi.length === 0) && (
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 text-amber-500" />
                )}
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
            <div className="space-y-2 sm:col-span-2 md:col-span-1 xl:col-span-2">
              <Label>Search</Label>
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                  loadQuestions(1, pageSize, { search: e.target.value });
                }}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={(value) => {
                console.log('Subject selected:', value);
                console.log('Available subjects:', subjects);
                setSelectedSubject(value);
                setCurrentPage(1);
                loadQuestions(1, pageSize, { subject: value });
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={(value) => {
                console.log('Class selected:', value);
                setSelectedClass(value);
                setCurrentPage(1);
                loadQuestions(1, pageSize, { class: value });
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={selectedDifficulty} onValueChange={(value) => {
                setSelectedDifficulty(value);
                setCurrentPage(1);
                loadQuestions(1, pageSize, { difficulty: value });
              }}>
                <SelectTrigger className="w-full">
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
            <div className="space-y-2 sm:col-span-2 md:col-span-1 lg:col-span-1 xl:col-span-2">
              <Label>Actions</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSubject('all');
                    setSelectedClass('all');
                    setSelectedDifficulty('all');
                    setCurrentPage(1);
                    loadQuestions(1, pageSize);
                  }}
                  className="w-full sm:w-auto xl:flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Clear Filters</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto xl:flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Export</span>
                      <span className="sm:hidden">Export</span>
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
                <Button variant="outline" size="sm" className="w-full sm:w-auto xl:flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Import</span>
                  <span className="sm:hidden">Import</span>
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
            <div className="flex items-center justify-center space-x-4 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  loadQuestions();
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Retrying...
                  </>
                ) : (
                  'Retry'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {!isLoading && !error && (
        <div className="space-y-4 max-w-none">
          {filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-4 text-muted-foreground">
                  <HelpCircle className="w-5 h-5" />
                  <span>No questions found. Create your first question!</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsLoading(true);
                      loadQuestions();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Refreshing...
                      </>
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question) => (
              <Card key={question.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="space-y-4 flex-1">
                      {/* Question Header */}
                      <div className="space-y-2">
                        <h3 className="text-base sm:text-lg font-semibold break-words leading-relaxed">{question.question}</h3>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
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
                      
                      {/* question type */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Question Type:</Label>
                        <Badge className="bg-blue-100 text-blue-800">
                          {question.questionType || ''}
                        </Badge>
                      </div>
                      
                      {/* Options - Only show if question has options */}
                      {question.options && question.options.length > 0 && (
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
                      )}

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
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                        <span>Created: {question.createdAt}</span>
                        <span className="break-all">ID: {question.id}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 lg:ml-4 lg:flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClick(question)}
                        className="w-full sm:w-auto hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(question.id)}
                        className="text-destructive hover:text-destructive hover:bg-red-50 w-full sm:w-auto"
                      >
                        <Trash2 className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && totalQuestions > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalQuestions)} of {totalQuestions} questions
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="page-size" className="text-sm whitespace-nowrap">Rows per page:</Label>
              <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {/* Show page numbers on larger screens */}
                <div className="hidden sm:flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                {/* Show current page on mobile */}
                <div className="sm:hidden">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    {currentPage}
                  </Button>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
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
            {/* Setup Required Message */}
            {(subjects.length === 0 || classes.length === 0 || syllabi.length === 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-amber-800">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Setup Required</p>
                    <p className="text-sm">
                      {syllabi.length === 0 
                        ? "Please upload syllabus first to add subjects and classes."
                        : subjects.length === 0 && classes.length === 0 
                        ? "Please upload syllabus first to add subjects and classes."
                        : subjects.length === 0 
                        ? "Please upload syllabus to add subjects."
                        : "Please upload syllabus to add classes."
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Settings */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select 
                  value={aiForm.subject} 
                  onValueChange={(value) => setAiForm(prev => ({ ...prev, subject: value }))}
                  disabled={subjects.length === 0 || syllabi.length === 0}
                >
                  <SelectTrigger className={subjects.length === 0 || syllabi.length === 0 ? "opacity-50" : ""}>
                    <SelectValue placeholder={subjects.length === 0 || syllabi.length === 0 ? "No subjects available" : "Select subject"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select 
                  value={aiForm.class || ""} 
                  onValueChange={(value) => setAiForm(prev => ({ ...prev, class: value }))}
                  disabled={classes.length === 0 || syllabi.length === 0}
                >
                  <SelectTrigger className={classes.length === 0 || syllabi.length === 0 ? "opacity-50" : ""}>
                    <SelectValue placeholder={classes.length === 0 || syllabi.length === 0 ? "No classes available" : "Select class"} />
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
              disabled={isLoading || !aiForm.subject || !aiForm.class || !aiForm.unit || subjects.length === 0 || classes.length === 0 || syllabi.length === 0}
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
          {/* Setup Required Message */}
          {(subjects.length === 0 || classes.length === 0 || syllabi.length === 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Setup Required</p>
                  <p className="text-sm">
                    {syllabi.length === 0 
                      ? "Please upload syllabus first to add subjects and classes."
                      : subjects.length === 0 && classes.length === 0 
                      ? "Please upload syllabus first to add subjects and classes."
                      : subjects.length === 0 
                      ? "Please upload syllabus to add subjects."
                      : "Please upload syllabus to add classes."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

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
              <Select 
                value={questionForm.subject} 
                onValueChange={(value) => setQuestionForm(prev => ({ ...prev, subject: value }))}
                disabled={subjects.length === 0 || syllabi.length === 0}
              >
                <SelectTrigger className={subjects.length === 0 || syllabi.length === 0 ? "opacity-50" : ""}>
                  <SelectValue placeholder={subjects.length === 0 || syllabi.length === 0 ? "No subjects available" : "Select subject"} />
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
              <Select 
                value={questionForm.class} 
                onValueChange={(value) => setQuestionForm(prev => ({ ...prev, class: value }))}
                disabled={classes.length === 0 || syllabi.length === 0}
              >
                <SelectTrigger className={classes.length === 0 || syllabi.length === 0 ? "opacity-50" : ""}>
                  <SelectValue placeholder={classes.length === 0 || syllabi.length === 0 ? "No classes available" : "Select class"} />
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
              disabled={isLoading || subjects.length === 0 || classes.length === 0 || syllabi.length === 0}
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

    {/* Delete Confirmation Modal */}
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Question
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this question? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteDialog(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => deletingQuestionId && handleDeleteQuestion(deletingQuestionId)}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit Question Modal */}
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update the question details below.
          </DialogDescription>
        </DialogHeader>
        {editingQuestion && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-question">Question</Label>
                <Textarea
                  id="edit-question"
                  value={editFormData.question}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, question: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label htmlFor="edit-explanation">Explanation</Label>
                <Textarea
                  id="edit-explanation"
                  value={editFormData.explanation}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                {editFormData.options?.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-6 text-sm font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <Input 
                      value={option} 
                      onChange={(e) => {
                        const newOptions = [...editFormData.options];
                        newOptions[index] = e.target.value;
                        setEditFormData(prev => ({ ...prev, options: newOptions }));
                      }}
                    />
                    <Checkbox 
                      checked={index === editFormData.correctAnswer}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEditFormData(prev => ({ ...prev, correctAnswer: index }));
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-subject">Subject</Label>
                <Select 
                  value={editFormData.subject || ''} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id || subject.id} value={subject._id || subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-class">Class</Label>
                <Select 
                  value={editFormData.class || ''} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, class: value }))}
                >
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
              <div>
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select 
                  value={editFormData.difficulty || ''} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-blooms">Blooms Level</Label>
                <Select 
                  value={editFormData.bloomsLevel || ''} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, bloomsLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Blooms level" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOMS_LEVELS.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-question-type">Question Type</Label>
                <Select 
                  value={editFormData.questionType || ''} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, questionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateQuestion}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Updating...' : 'Update Question'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </div>
);
};

export default QuestionManagement;
