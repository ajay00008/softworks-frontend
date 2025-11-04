import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  Download,
  CheckCircle,
  Wand2,
  AlertCircle
} from 'lucide-react';
import { teacherDashboardAPI, questionPaperTemplateAPI } from '@/services/api';
import AutoFetchMarks from '@/components/AutoFetchMarks';

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
  generatedPdf?: {
    fileName: string;
    filePath: string;
    downloadUrl: string;
  };
  examId?: {
    _id: string;
    title: string;
    examType: string;
    scheduledDate: string;
  };
  subjectId?: {
    _id: string;
    name: string;
    code: string;
  };
  classId?: {
    _id: string;
    name: string;
    displayName: string;
  };
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
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [paperToView, setPaperToView] = useState<QuestionPaper | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentStep, setCurrentStep] = useState(1);
  const [customMarks, setCustomMarks] = useState<{ mark: number; count: number }[]>([]);
  const [uploadedPattern, setUploadedPattern] = useState<File | null>(null);
  const [uploadedPatternId, setUploadedPatternId] = useState<string | null>(null);
  const [isAutoFetchDialogOpen, setIsAutoFetchDialogOpen] = useState(false);
  const [hasTemplates, setHasTemplates] = useState<boolean>(false);
  const [isCheckingTemplates, setIsCheckingTemplates] = useState(false);
  const { toast } = useToast();

  // Question Types (same as admin)
  const QUESTION_TYPES = [
    {
      id: "CHOOSE_BEST_ANSWER",
      name: "Choose the best answer",
      description: "Multiple choice with one correct answer",
      availableForMarks: [1],
    },
    {
      id: "FILL_BLANKS",
      name: "Fill in the blanks",
      description: "Complete missing words or phrases",
      availableForMarks: [1],
    },
    {
      id: "ONE_WORD_ANSWER",
      name: "One word answer",
      description: "Answer in one word",
      availableForMarks: [1],
    },
    {
      id: "TRUE_FALSE",
      name: "True or False",
      description: "Select true or false",
      availableForMarks: [1],
    },
    {
      id: "CHOOSE_MULTIPLE_ANSWERS",
      name: "Choose multiple answers",
      description: "Select multiple correct answers",
      availableForMarks: [1],
    },
    {
      id: "MATCHING_PAIRS",
      name: "Matching pairs",
      description: "Match items using arrows",
      availableForMarks: [1],
    },
    {
      id: "DRAWING_DIAGRAM",
      name: "Drawing/Diagram",
      description: "Draw diagrams and mark parts",
      availableForMarks: [1],
    },
    {
      id: "MARKING_PARTS",
      name: "Marking parts",
      description: "Mark correct objects or parts",
      availableForMarks: [1],
    },
    {
      id: "SHORT_ANSWER",
      name: "Short answer",
      description: "Brief text response",
      availableForMarks: [1, 2, 3, 5],
    },
    {
      id: "LONG_ANSWER",
      name: "Long answer",
      description: "Detailed text response",
      availableForMarks: [1, 2, 3, 5],
    },
  ];

  // Helper function to get available question types for a specific mark value
  const getAvailableQuestionTypes = (markValue: number) => {
    return QUESTION_TYPES.filter(type => type.availableForMarks.includes(markValue));
  };

  // Blooms Taxonomy Levels (same as admin)
  const BLOOMS_LEVELS = [
    { id: "REMEMBER", name: "Remember", description: "Recall facts and basic concepts" },
    { id: "UNDERSTAND", name: "Understand", description: "Explain ideas or concepts" },
    { id: "APPLY", name: "Apply", description: "Use information in new situations" },
    { id: "ANALYZE", name: "Analyze", description: "Draw connections among ideas" },
    { id: "EVALUATE", name: "Evaluate", description: "Justify a stand or decision" },
    { id: "CREATE", name: "Create", description: "Produce new or original work" },
  ];

  // Helper function to get blooms distribution
  const getBloomsDistribution = (distribution: any) => {
    if (Array.isArray(distribution)) {
      return distribution;
    }
    return BLOOMS_LEVELS.map(level => ({
      level: level.id,
      percentage: formData.bloomsDistribution.find(d => d.level === level.id)?.percentage || 0
    }));
  };

  // Update blooms distribution
  const updateBloomsDistribution = (levelId: string, percentage: number) => {
    setFormData(prev => ({
      ...prev,
      bloomsDistribution: prev.bloomsDistribution.map(d => 
        d.level === levelId ? { ...d, percentage } : d
      )
    }));
  };

  // Update mark distribution (same as admin - includes custom marks)
  const updateMarkDistribution = (field: string, value: number) => {
    setFormData((prev) => {
      const newMarkDistribution = {
        ...prev.markDistribution,
        [field]: value,
      };

      // Calculate total marks from individual mark questions
      const totalFromQuestions =
        newMarkDistribution.oneMark * 1 +
        newMarkDistribution.twoMark * 2 +
        newMarkDistribution.threeMark * 3 +
        newMarkDistribution.fiveMark * 5;

      // Add custom marks
      const customMarksTotal = customMarks.reduce(
        (sum, custom) => sum + custom.mark * custom.count,
        0
      );
      const totalFromAllQuestions = totalFromQuestions + customMarksTotal;

      // Always auto-fill total marks
      newMarkDistribution.totalMarks = totalFromAllQuestions;

      // If total marks is set to 100, validate that question marks equal exactly 100
      if (
        newMarkDistribution.totalMarks === 100 &&
        totalFromAllQuestions !== 100
      ) {
        toast({
          title: "Validation Error",
          description: `Total marks from questions (${totalFromAllQuestions}) must equal exactly 100 when total marks is set to 100`,
          variant: "destructive",
        });
        return prev; // Don't update if validation fails
      }

      return {
        ...prev,
        markDistribution: newMarkDistribution,
      };
    });
  };

  // Custom marks functions (same as admin)
  const addCustomMark = () => {
    setCustomMarks((prev) => [...prev, { mark: 0, count: 0 }]);
  };

  const updateCustomMark = (
    index: number,
    field: "mark" | "count",
    value: number
  ) => {
    setCustomMarks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Calculate total marks from all questions including custom marks
      const totalFromQuestions =
        formData.markDistribution.oneMark * 1 +
        formData.markDistribution.twoMark * 2 +
        formData.markDistribution.threeMark * 3 +
        formData.markDistribution.fiveMark * 5;

      const customMarksTotal = updated.reduce(
        (sum, custom) => sum + custom.mark * custom.count,
        0
      );
      const totalFromAllQuestions = totalFromQuestions + customMarksTotal;

      // Update total marks in form data
      setFormData((prev) => ({
        ...prev,
        markDistribution: {
          ...prev.markDistribution,
          totalMarks: totalFromAllQuestions,
        },
      }));

      return updated;
    });
  };

  const removeCustomMark = (index: number) => {
    setCustomMarks((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      // Calculate total marks from all questions including remaining custom marks
      const totalFromQuestions =
        formData.markDistribution.oneMark * 1 +
        formData.markDistribution.twoMark * 2 +
        formData.markDistribution.threeMark * 3 +
        formData.markDistribution.fiveMark * 5;

      const customMarksTotal = updated.reduce(
        (sum, custom) => sum + custom.mark * custom.count,
        0
      );
      const totalFromAllQuestions = totalFromQuestions + customMarksTotal;

      // Update total marks in form data
      setFormData((prev) => ({
        ...prev,
        markDistribution: {
          ...prev.markDistribution,
          totalMarks: totalFromAllQuestions,
        },
      }));

      return updated;
    });
  };

  // Question type distribution functions (same as admin - with counts)
  const updateQuestionTypeDistribution = (
    mark: string,
    type: string,
    questionCount: number
  ) => {
    setFormData((prev) => {
      const distributions = { ...prev.questionTypeDistribution };
      let dists = distributions[mark] || [];
      const existingIndex = dists.findIndex((d: any) => d.type === type);

      // Calculate current total for this mark category (excluding the current type being updated)
      const currentTotal = dists.reduce((sum: number, d: any) => {
        if (d.type === type) return sum; // Exclude current type
        return sum + (d.questionCount || 0);
      }, 0);

      // Get maximum allowed questions for this mark category
      const maxQuestions = getMaxQuestionsForMark(mark);

      // Validate that the new total doesn't exceed the maximum
      const newTotal = currentTotal + questionCount;
      if (newTotal > maxQuestions) {
        // Show validation error
        toast({
          title: "Validation Error",
          description: `Total questions for ${mark} cannot exceed ${maxQuestions}. Current total would be ${newTotal}.`,
          variant: "destructive",
        });
        return prev; // Don't update if validation fails
      }

      if (existingIndex !== -1) {
        if (questionCount === 0) {
          dists = dists.filter((_, index) => index !== existingIndex);
        } else {
          dists[existingIndex] = { ...dists[existingIndex], questionCount };
        }
      } else if (questionCount > 0) {
        dists.push({ type, questionCount });
      }

      distributions[mark] = dists;

      return {
        ...prev,
        questionTypeDistribution: distributions,
      };
    });
  };

  const getQuestionTypeCount = (mark: string, type: string) => {
    return (
      formData.questionTypeDistribution[mark]?.find((d: any) => d.type === type)
        ?.questionCount || 0
    );
  };

  const getQuestionTypeTotal = (mark: string) => {
    return (formData.questionTypeDistribution[mark] || []).reduce(
      (sum: number, d: any) => sum + (d.questionCount || 0),
      0
    );
  };

  const getMaxQuestionsForMark = (mark: string) => {
    if (mark === "oneMark") return formData.markDistribution.oneMark;
    if (mark === "twoMark") return formData.markDistribution.twoMark;
    if (mark === "threeMark") return formData.markDistribution.threeMark;
    if (mark === "fiveMark") return formData.markDistribution.fiveMark;

    // For custom marks, find the corresponding custom mark
    const customMark = customMarks.find((custom) => {
      if (custom.mark <= 2) return mark === "oneMark" || mark === "twoMark";
      if (custom.mark <= 4) return mark === "threeMark";
      return mark === "fiveMark";
    });

    return customMark ? customMark.count : 0;
  };

  // Template checking and auto-fetch (same as admin)
  const checkTemplatesForExam = async (examId: string) => {
    try {
      setIsCheckingTemplates(true);
      const result = await questionPaperTemplateAPI.checkTemplatesExist(examId);
      setHasTemplates(result.hasTemplates || false);
    } catch (error) {
      setHasTemplates(false);
    } finally {
      setIsCheckingTemplates(false);
    }
  };

  const handleAutoFetchMarks = (markDistribution: any, bloomsDistribution: any, customMarks?: Array<{mark: number, count: number}>, patternId?: string) => {
    // Update main form data
    setFormData(prev => ({
      ...prev,
      markDistribution: {
        ...prev.markDistribution,
        ...markDistribution
      },
      // Only update blooms distribution if provided, otherwise keep existing
      ...(bloomsDistribution && { bloomsDistribution })
    }));
    
    // Update custom marks if provided
    if (customMarks && customMarks.length > 0) {
      setCustomMarks(customMarks);
    }
    
    // If template includes a pattern file, set it as uploadedPatternId
    if (patternId) {
      setUploadedPatternId(patternId);
      toast({
        title: "Template pattern loaded",
        description: "Template file will be used as pattern for question paper generation",
      });
    }
  };

  // Validation functions (same as admin)
  const validateStep1 = () => {
    const errors: string[] = [];
    if (!formData.title.trim()) {
      errors.push("Title is required");
    }
    if (!formData.examId) {
      errors.push("Exam selection is required");
    } else {
      const selectedExam = exams.find((exam) => exam._id === formData.examId);
      if (!selectedExam) {
        errors.push("Selected exam is not valid or not found");
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validateStep2 = () => {
    const errors: string[] = [];

    const totalFromQuestions =
      formData.markDistribution.oneMark * 1 +
      formData.markDistribution.twoMark * 2 +
      formData.markDistribution.threeMark * 3 +
      formData.markDistribution.fiveMark * 5;

    const customMarksTotal = customMarks.reduce(
      (sum, custom) => sum + custom.mark * custom.count,
      0
    );
    const totalFromAllQuestions = totalFromQuestions + customMarksTotal;

    const totalQuestions =
      formData.markDistribution.oneMark +
      formData.markDistribution.twoMark +
      formData.markDistribution.threeMark +
      formData.markDistribution.fiveMark +
      customMarks.reduce((sum, custom) => sum + custom.count, 0);

    if (totalQuestions === 0) {
      errors.push("At least one question must be configured");
    }

    if (formData.markDistribution.totalMarks <= 0) {
      errors.push("Total marks must be greater than 0");
    }

    if (
      formData.markDistribution.totalMarks === 100 &&
      totalFromAllQuestions !== 100
    ) {
      errors.push(
        `When total marks is 100, question marks must add up to exactly 100. Current total: ${totalFromAllQuestions}`
      );
    }

    // Validate Blooms taxonomy totals 100%
    const bloomsTotal = formData.bloomsDistribution.reduce(
      (sum, dist) => sum + dist.percentage,
      0
    );
    if (bloomsTotal !== 100) {
      errors.push(
        `Blooms taxonomy percentages must add up to exactly 100%. Current total: ${bloomsTotal}%`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validateStep3 = () => {
    // Step 3 (AI Settings) doesn't require validation as all fields are optional
    return {
      isValid: true,
      errors: [],
    };
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const validation = validateStep1();
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(". "),
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 2) {
      const validation = validateStep2();
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(". "),
          variant: "destructive",
        });
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

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
      oneMark: [],
      twoMark: [],
      threeMark: [],
      fiveMark: []
    } as any, // Same as admin - empty arrays initially
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
      // Validate before submitting
      if (!formData.title || !formData.examId) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Get exam to extract subjectId and classId
      const selectedExam = exams.find(e => e._id === formData.examId);
      if (!selectedExam) {
        toast({
          title: "Error",
          description: "Selected exam not found",
          variant: "destructive",
        });
        return;
      }

      // Extract subject and class from exam (for teachers, exam should have one subject)
      const subjectId = typeof selectedExam.subjectId === 'object' 
        ? selectedExam.subjectId._id 
        : selectedExam.subjectId || (selectedExam.subjectIds?.[0]?._id || selectedExam.subjectIds?.[0]);
      const classId = typeof selectedExam.classId === 'object' 
        ? selectedExam.classId._id 
        : selectedExam.classId;

      // Convert questionTypeDistribution from object format to match admin format
      // Convert question counts to percentages for backend compatibility (same as admin)
      const convertedQuestionTypeDistribution: any = {};
      const markCategories = ["oneMark", "twoMark", "threeMark", "fiveMark"] as const;

      markCategories.forEach((category) => {
        const questionCount = formData.markDistribution[category] || 0;
        const questionTypes = formData.questionTypeDistribution[category] || [];
        
        if (questionCount > 0 && questionTypes.length > 0) {
          // Calculate total question count from all types
          const totalQuestionTypeCount = questionTypes.reduce((sum: number, qt: any) => sum + (qt.questionCount || qt.count || 0), 0);
          
          if (totalQuestionTypeCount > 0) {
            // Convert to percentages based on the actual distribution
            convertedQuestionTypeDistribution[category] = questionTypes.map((qt: any) => ({
              type: qt.type,
              percentage: Math.round(((qt.questionCount || qt.count || 0) / totalQuestionTypeCount) * 100)
            }));
          } else {
            // If no specific question types are set, use default distribution
            convertedQuestionTypeDistribution[category] = [];
          }
        } else {
          convertedQuestionTypeDistribution[category] = [];
        }
      });

      // Prepare AI request (same format as admin)
      const aiRequest = {
        title: formData.title,
        description: formData.description,
        examId: formData.examId,
        subjectId: subjectId,
        classId: classId,
        markDistribution: {
          ...formData.markDistribution,
          totalMarks: formData.markDistribution.totalMarks || 
            (formData.markDistribution.oneMark * 1 +
             formData.markDistribution.twoMark * 2 +
             formData.markDistribution.threeMark * 3 +
             formData.markDistribution.fiveMark * 5)
        },
        bloomsDistribution: formData.bloomsDistribution,
        questionTypeDistribution: convertedQuestionTypeDistribution,
        aiSettings: formData.aiSettings,
        // Add patternId if available (from template or uploaded)
        ...(uploadedPatternId && { patternId: uploadedPatternId }),
      };

      // Use generateCompleteAI (same as admin) - creates and generates in one step
      const response = await teacherDashboardAPI.generateCompleteAI(aiRequest);
      
      // Extract question paper from response (same as admin)
      const responseData = response as any;
      const createdQuestionPaper = responseData?.questionPaper || responseData;
      
      toast({
        title: "Success",
        description: "Question paper generated successfully with AI",
      });
      
      setShowCreateDialog(false);
      setCurrentStep(1);
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
          oneMark: [],
          twoMark: [],
          threeMark: [],
          fiveMark: []
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
      console.error('Error generating question paper:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate question paper",
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
      toast({
        title: "Error",
        description: "Failed to generate questions",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (paper: QuestionPaper) => {
    setPaperToView(paper);
    setViewDetailsOpen(true);
  };

  const handleDownloadPDF = async (paper: QuestionPaper) => {
    try {
      if (!paper.generatedPdf) {
        toast({
          title: "Error",
          description: "PDF not generated yet. Please generate questions first.",
          variant: "destructive",
        });
        return;
      }

      // Always use API endpoint for teachers to ensure proper headers and auth
      // This prevents blank page issues by using res.download() which sets correct Content-Type
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
          description: "Please log in to download PDFs",
          variant: "destructive",
        });
        return;
      }

      // Use teacher download endpoint with token in query parameter
      // Using API endpoint ensures proper Content-Type headers via res.download()
      const downloadUrl = `${API_BASE_URL}/teacher/question-papers/${paper._id}/download?token=${encodeURIComponent(token)}`;
      
      // Open PDF directly in a new tab/window
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "Download Started",
        description: `Opening ${paper.title}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open PDF. Please try again.",
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
          {exams.length === 0 && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> No exams are available. Please create an exam first before creating question papers.
              </p>
            </div>
          )}
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
          <Button 
            onClick={() => setShowCreateDialog(true)}
            disabled={exams.length === 0}
            title={exams.length === 0 ? "No exams available. Please create an exam first." : ""}
          >
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
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(paper)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadPDF(paper)}
                    disabled={!paper.generatedPdf}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{paperToView?.title || 'Question Paper Details'}</DialogTitle>
            <DialogDescription>
              {paperToView?.description || 'View question paper information'}
            </DialogDescription>
          </DialogHeader>
          
          {paperToView && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(paperToView.status)}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Total Marks</Label>
                  <div className="mt-1">
                    {paperToView.markDistribution?.totalMarks || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Exam</Label>
                  <div className="mt-1 text-sm">
                    {typeof paperToView.examId === 'object' ? paperToView.examId?.title : 'N/A'}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Subject</Label>
                  <div className="mt-1 text-sm">
                    {typeof paperToView.subjectId === 'object' ? paperToView.subjectId?.name : 'N/A'}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Class</Label>
                  <div className="mt-1 text-sm">
                    {typeof paperToView.classId === 'object' ? paperToView.classId?.name : 'N/A'}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Created</Label>
                  <div className="mt-1 text-sm">
                    {new Date(paperToView.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <Label className="font-medium">Mark Distribution</Label>
                <div className="mt-1 text-sm grid grid-cols-4 gap-2">
                  <div>1 Mark: {paperToView.markDistribution?.oneMark || 0}</div>
                  <div>2 Mark: {paperToView.markDistribution?.twoMark || 0}</div>
                  <div>3 Mark: {paperToView.markDistribution?.threeMark || 0}</div>
                  <div>5 Mark: {paperToView.markDistribution?.fiveMark || 0}</div>
                </div>
              </div>

              <div>
                <Label className="font-medium">AI Settings</Label>
                <div className="mt-1 text-sm space-y-1">
                  <div>Difficulty: {paperToView.aiSettings?.difficultyLevel || 'N/A'}</div>
                  <div>Use Subject Book: {paperToView.aiSettings?.useSubjectBook ? 'Yes' : 'No'}</div>
                  {paperToView.aiSettings?.twistedQuestionsPercentage > 0 && (
                    <div>Twisted Questions: {paperToView.aiSettings.twistedQuestionsPercentage}%</div>
                  )}
                </div>
              </div>

              {paperToView.generatedPdf && (
                <div className="flex justify-center pt-4">
                  <Button onClick={() => handleDownloadPDF(paperToView)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Question Paper Dialog - Multi-step like Admin */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) {
          // Reset form when dialog closes
          setCurrentStep(1);
          setCustomMarks([]);
          setUploadedPattern(null);
          setUploadedPatternId(null);
          setHasTemplates(false);
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
              oneMark: [],
              twoMark: [],
              threeMark: [],
              fiveMark: []
            } as any,
            aiSettings: {
              useSubjectBook: false,
              customInstructions: '',
              difficultyLevel: 'MODERATE',
              twistedQuestionsPercentage: 0
            }
          });
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Question Paper</DialogTitle>
            <DialogDescription>
              Configure the question paper settings and AI generation parameters
            </DialogDescription>
          </DialogHeader>

          {/* Step Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                1
              </div>
              <span className={`text-sm ${currentStep >= 1 ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                Basic Info
              </span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                2
              </div>
              <span className={`text-sm ${currentStep >= 2 ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                Distribution
              </span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                3
              </div>
              <span className={`text-sm ${currentStep >= 3 ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                AI Settings
              </span>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter question paper title"
                  />
                </div>
                <div>
                  <Label htmlFor="exam">Exam *</Label>
                  <Select
                    value={formData.examId}
                    onValueChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        examId: value,
                      }));
                      
                      // Check if templates exist for this exam
                      if (value) {
                        checkTemplatesForExam(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
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
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Distribution Settings</h3>
              <p className="text-sm text-gray-600">
                Configure the mark distribution and Bloom's taxonomy for your question paper.
              </p>

              {/* Mark Distribution */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-md font-medium">Mark Distribution</h5>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const selectedExam = exams.find(e => e._id === formData.examId);
                      if (selectedExam) {
                        setIsAutoFetchDialogOpen(true);
                      }
                    }}
                    className="flex items-center space-x-2"
                    disabled={!formData.examId || isCheckingTemplates || !hasTemplates}
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>{isCheckingTemplates ? "Checking..." : hasTemplates ? "Select Template & Auto-Fetch Marks" : "No Templates Available"}</span>
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="oneMark">1 Mark Questions</Label>
                    <Input
                      id="oneMark"
                      type="number"
                      value={formData.markDistribution.oneMark}
                      onChange={(e) => updateMarkDistribution('oneMark', parseInt(e.target.value) || 0)}
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
                      value={formData.markDistribution.twoMark}
                      onChange={(e) => updateMarkDistribution('twoMark', parseInt(e.target.value) || 0)}
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
                      value={formData.markDistribution.threeMark}
                      onChange={(e) => updateMarkDistribution('threeMark', parseInt(e.target.value) || 0)}
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
                      value={formData.markDistribution.fiveMark}
                      onChange={(e) => updateMarkDistribution('fiveMark', parseInt(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {/* Total Marks Display */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Marks:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formData.markDistribution.totalMarks}
                    </span>
                  </div>
                </div>

                {/* Custom Marks */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Custom Marks</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCustomMark}
                      className="flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Custom Mark</span>
                    </Button>
                  </div>
                  {customMarks.length > 0 && (
                    <div className="space-y-2">
                      {customMarks.map((custom, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 border rounded-lg">
                          <Input
                            type="number"
                            placeholder="Marks"
                            value={custom.mark || ''}
                            onChange={(e) => updateCustomMark(index, 'mark', parseInt(e.target.value) || 0)}
                            className="w-24"
                            min="0"
                          />
                          <span className="text-gray-500">×</span>
                          <Input
                            type="number"
                            placeholder="Count"
                            value={custom.count || ''}
                            onChange={(e) => updateCustomMark(index, 'count', parseInt(e.target.value) || 0)}
                            className="w-24"
                            min="0"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomMark(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Question Type Distribution */}
              <div className="space-y-4">
                <h5 className="text-md font-medium">Question Type Distribution</h5>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="oneMark">
                    <AccordionTrigger>
                      1 Mark Questions ({formData.markDistribution.oneMark})
                    </AccordionTrigger>
                    <AccordionContent>
                      {/* Validation indicator */}
                      <div className="mb-4 p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium">Total Questions Used: </span>
                            <span className={`font-bold ${getQuestionTypeTotal('oneMark') > formData.markDistribution.oneMark ? 'text-red-600' : 'text-green-600'}`}>
                              {getQuestionTypeTotal('oneMark')}
                            </span>
                            <span className="text-gray-600"> / {formData.markDistribution.oneMark}</span>
                          </div>
                          {getQuestionTypeTotal('oneMark') > formData.markDistribution.oneMark && (
                            <div className="text-red-600 text-sm font-medium">
                              ⚠️ Exceeds limit!
                            </div>
                          )}
                          {getQuestionTypeTotal('oneMark') === formData.markDistribution.oneMark && formData.markDistribution.oneMark > 0 && (
                            <div className="text-green-600 text-sm font-medium">
                              ✅ Perfect!
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {getAvailableQuestionTypes(1).map((type) => (
                          <div key={type.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <Label className="font-medium">{type.name}</Label>
                                <p className="text-sm text-gray-600">{type.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={getQuestionTypeCount('oneMark', type.id)}
                                  onChange={(e) => updateQuestionTypeDistribution('oneMark', type.id, parseInt(e.target.value) || 0)}
                                  onFocus={(e) => e.target.select()}
                                  min="0"
                                  max={formData.markDistribution.oneMark}
                                  className="w-20"
                                  placeholder="0"
                                />
                                <span className="text-sm text-gray-500">questions</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="twoMark">
                    <AccordionTrigger>
                      2 Mark Questions ({formData.markDistribution.twoMark})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mb-4 p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium">Total Questions Used: </span>
                            <span className={`font-bold ${getQuestionTypeTotal('twoMark') > formData.markDistribution.twoMark ? 'text-red-600' : 'text-green-600'}`}>
                              {getQuestionTypeTotal('twoMark')}
                            </span>
                            <span className="text-gray-600"> / {formData.markDistribution.twoMark}</span>
                          </div>
                          {getQuestionTypeTotal('twoMark') > formData.markDistribution.twoMark && (
                            <div className="text-red-600 text-sm font-medium">⚠️ Exceeds limit!</div>
                          )}
                          {getQuestionTypeTotal('twoMark') === formData.markDistribution.twoMark && formData.markDistribution.twoMark > 0 && (
                            <div className="text-green-600 text-sm font-medium">✅ Perfect!</div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {getAvailableQuestionTypes(2).map((type) => (
                          <div key={type.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <Label className="font-medium">{type.name}</Label>
                                <p className="text-sm text-gray-600">{type.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={getQuestionTypeCount('twoMark', type.id)}
                                  onChange={(e) => updateQuestionTypeDistribution('twoMark', type.id, parseInt(e.target.value) || 0)}
                                  onFocus={(e) => e.target.select()}
                                  min="0"
                                  max={formData.markDistribution.twoMark}
                                  className="w-20"
                                  placeholder="0"
                                />
                                <span className="text-sm text-gray-500">questions</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="threeMark">
                    <AccordionTrigger>
                      3 Mark Questions ({formData.markDistribution.threeMark})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mb-4 p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium">Total Questions Used: </span>
                            <span className={`font-bold ${getQuestionTypeTotal('threeMark') > formData.markDistribution.threeMark ? 'text-red-600' : 'text-green-600'}`}>
                              {getQuestionTypeTotal('threeMark')}
                            </span>
                            <span className="text-gray-600"> / {formData.markDistribution.threeMark}</span>
                          </div>
                          {getQuestionTypeTotal('threeMark') > formData.markDistribution.threeMark && (
                            <div className="text-red-600 text-sm font-medium">⚠️ Exceeds limit!</div>
                          )}
                          {getQuestionTypeTotal('threeMark') === formData.markDistribution.threeMark && formData.markDistribution.threeMark > 0 && (
                            <div className="text-green-600 text-sm font-medium">✅ Perfect!</div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {getAvailableQuestionTypes(3).map((type) => (
                          <div key={type.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <Label className="font-medium">{type.name}</Label>
                                <p className="text-sm text-gray-600">{type.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={getQuestionTypeCount('threeMark', type.id)}
                                  onChange={(e) => updateQuestionTypeDistribution('threeMark', type.id, parseInt(e.target.value) || 0)}
                                  onFocus={(e) => e.target.select()}
                                  min="0"
                                  max={formData.markDistribution.threeMark}
                                  className="w-20"
                                  placeholder="0"
                                />
                                <span className="text-sm text-gray-500">questions</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="fiveMark">
                    <AccordionTrigger>
                      5 Mark Questions ({formData.markDistribution.fiveMark})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mb-4 p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium">Total Questions Used: </span>
                            <span className={`font-bold ${getQuestionTypeTotal('fiveMark') > formData.markDistribution.fiveMark ? 'text-red-600' : 'text-green-600'}`}>
                              {getQuestionTypeTotal('fiveMark')}
                            </span>
                            <span className="text-gray-600"> / {formData.markDistribution.fiveMark}</span>
                          </div>
                          {getQuestionTypeTotal('fiveMark') > formData.markDistribution.fiveMark && (
                            <div className="text-red-600 text-sm font-medium">⚠️ Exceeds limit!</div>
                          )}
                          {getQuestionTypeTotal('fiveMark') === formData.markDistribution.fiveMark && formData.markDistribution.fiveMark > 0 && (
                            <div className="text-green-600 text-sm font-medium">✅ Perfect!</div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {getAvailableQuestionTypes(5).map((type) => (
                          <div key={type.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <Label className="font-medium">{type.name}</Label>
                                <p className="text-sm text-gray-600">{type.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={getQuestionTypeCount('fiveMark', type.id)}
                                  onChange={(e) => updateQuestionTypeDistribution('fiveMark', type.id, parseInt(e.target.value) || 0)}
                                  onFocus={(e) => e.target.select()}
                                  min="0"
                                  max={formData.markDistribution.fiveMark}
                                  className="w-20"
                                  placeholder="0"
                                />
                                <span className="text-sm text-gray-500">questions</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Blooms Taxonomy Distribution */}
              <div className="space-y-4">
                <h5 className="text-md font-medium">Bloom's Taxonomy Distribution</h5>
                <div className="space-y-4">
                  {BLOOMS_LEVELS.map((level) => (
                    <div key={level.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <Label className="font-medium">{level.name}</Label>
                          <p className="text-sm text-gray-600">{level.description}</p>
                        </div>
                        <span className="text-sm font-medium">
                          {getBloomsDistribution(formData.bloomsDistribution).find(d => d.level === level.id)?.percentage || 0}%
                        </span>
                      </div>
                      <Slider
                        value={[getBloomsDistribution(formData.bloomsDistribution).find(d => d.level === level.id)?.percentage || 0]}
                        onValueChange={([value]) => updateBloomsDistribution(level.id, value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Blooms Distribution Summary */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h6 className="font-medium text-sm mb-2">Distribution Summary</h6>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {BLOOMS_LEVELS.map((level) => {
                      const percentage = getBloomsDistribution(formData.bloomsDistribution).find(d => d.level === level.id)?.percentage || 0;
                      return (
                        <div key={level.id} className="flex justify-between">
                          <span className="text-gray-600">{level.name}:</span>
                          <span className={`font-medium ${percentage > 0 ? "text-green-600" : "text-gray-400"}`}>
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
                        getBloomsDistribution(formData.bloomsDistribution).reduce((sum, dist) => sum + dist.percentage, 0) === 100
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        {getBloomsDistribution(formData.bloomsDistribution).reduce((sum, dist) => sum + dist.percentage, 0)}%
                      </span>
                    </div>
                    {getBloomsDistribution(formData.bloomsDistribution).reduce((sum, dist) => sum + dist.percentage, 0) !== 100 && (
                      <div className="mt-2 text-red-600 text-sm">
                        ⚠️ Blooms taxonomy percentages must add up to exactly 100%. Please adjust the distribution.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">AI Generation Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select 
                    value={formData.aiSettings.difficultyLevel}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      aiSettings: { ...prev.aiSettings, difficultyLevel: value }
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useSubjectBook"
                    checked={formData.aiSettings.useSubjectBook}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      aiSettings: { ...prev.aiSettings, useSubjectBook: checked === true }
                    }))}
                  />
                  <Label htmlFor="useSubjectBook">Use Subject Book for Reference</Label>
                </div>
                <div>
                  <Label htmlFor="customInstructions">Custom Instructions</Label>
                  <Textarea
                    id="customInstructions"
                    value={formData.aiSettings.customInstructions}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      aiSettings: { ...prev.aiSettings, customInstructions: e.target.value }
                    }))}
                    placeholder="Add any custom instructions for AI generation"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="twistedPercentage">Twisted Questions Percentage</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[formData.aiSettings.twistedQuestionsPercentage]}
                      onValueChange={([value]) => setFormData(prev => ({
                        ...prev,
                        aiSettings: { ...prev.aiSettings, twistedQuestionsPercentage: value }
                      }))}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>0%</span>
                      <span className="font-medium">{formData.aiSettings.twistedQuestionsPercentage}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setShowCreateDialog(false);
                setCurrentStep(1);
              }}>
                Cancel
              </Button>
              {currentStep < 3 ? (
                <Button onClick={handleNextStep}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleCreateQuestionPaper}>
                  <Save className="w-4 h-4 mr-2" />
                  Create Question Paper
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto-Fetch Marks Dialog */}
      {isAutoFetchDialogOpen && formData.examId && (
        <AutoFetchMarks
          subjectId={(() => {
            const selectedExam = exams.find(e => e._id === formData.examId);
            if (!selectedExam) return '';
            const subjectId = typeof selectedExam.subjectId === 'object' 
              ? selectedExam.subjectId._id 
              : selectedExam.subjectId || (selectedExam.subjectIds?.[0]?._id || selectedExam.subjectIds?.[0]);
            return subjectId || '';
          })()}
          examType={(() => {
            const selectedExam = exams.find(e => e._id === formData.examId);
            return selectedExam?.examType || '';
          })()}
          onMarksFetched={handleAutoFetchMarks}
          onClose={() => setIsAutoFetchDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default QuestionPaperCreation;
