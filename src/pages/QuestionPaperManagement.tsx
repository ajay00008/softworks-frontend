import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Brain,
  BookOpen,
  GraduationCap,
  Settings,
  Download,
  FileText,
  Wand2,
  Upload as UploadIcon,
  Eye,
  MoreHorizontal,
  Target,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  QuestionPaper,
  CreateQuestionPaperRequest,
  questionPaperAPI,
  subjectManagementAPI,
  classManagementAPI,
  examsAPI,
} from "@/services/api";
import PDFEditor from "@/components/PDFEditor";
import SimplifiedPDFEditor from "@/components/SimplifiedPDFEditor";

// Question Types
const QUESTION_TYPES = [
  {
    id: "CHOOSE_BEST_ANSWER",
    name: "Choose the best answer",
    description: "Multiple choice with one correct answer",
    availableForMarks: [1], // Only available for 1-mark questions
  },
  {
    id: "FILL_BLANKS",
    name: "Fill in the blanks",
    description: "Complete missing words or phrases",
    availableForMarks: [1], // Only available for 1-mark questions
  },
  {
    id: "ONE_WORD_ANSWER",
    name: "One word answer",
    description: "Answer in one word",
    availableForMarks: [1], // Only available for 1-mark questions
  },
  {
    id: "TRUE_FALSE",
    name: "True or False",
    description: "Select true or false",
    availableForMarks: [1], // Only available for 1-mark questions
  },
  {
    id: "CHOOSE_MULTIPLE_ANSWERS",
    name: "Choose multiple answers",
    description: "Select multiple correct answers",
    availableForMarks: [1], // Only available for 1-mark questions
  },
  {
    id: "MATCHING_PAIRS",
    name: "Matching pairs",
    description: "Match items using arrows",
    availableForMarks: [1], // Only available for 1-mark questions
  },
  {
    id: "DRAWING_DIAGRAM",
    name: "Drawing/Diagram",
    description: "Draw diagrams and mark parts",
    availableForMarks: [1], // Only available for 1-mark questions
  },
  {
    id: "MARKING_PARTS",
    name: "Marking parts",
    description: "Mark correct objects or parts",
    availableForMarks: [1], // Only available for 1-mark questions
  },
  {
    id: "SHORT_ANSWER",
    name: "Short answer",
    description: "Brief text response",
    availableForMarks: [1, 2, 3, 5], // Available for all mark values
  },
  {
    id: "LONG_ANSWER",
    name: "Long answer",
    description: "Detailed text response",
    availableForMarks: [1, 2, 3, 5], // Available for all mark values
  },
];

// Helper function to get available question types for a specific mark value
const getAvailableQuestionTypes = (markValue: number) => {
  return QUESTION_TYPES.filter(type => type.availableForMarks.includes(markValue));
};

// Helper function to get mark value from mark category
const getMarkValue = (markCategory: string) => {
  switch (markCategory) {
    case 'oneMark': return 1;
    case 'twoMark': return 2;
    case 'threeMark': return 3;
    case 'fiveMark': return 5;
    default: return 1;
  }
};

// Helper function to validate subject distribution
const validateSubjectDistribution = (subjectId: string, subjectDistributions: any) => {
  const distribution = subjectDistributions[subjectId];
  if (!distribution || !distribution.markDistribution) {
    return { isValid: false, totalMarks: 0, message: "No distribution configured" };
  }

  const totalMarks = 
    (distribution.markDistribution.oneMark || 0) * 1 +
    (distribution.markDistribution.twoMark || 0) * 2 +
    (distribution.markDistribution.threeMark || 0) * 3 +
    (distribution.markDistribution.fiveMark || 0) * 5 +
    (distribution.customMarks || []).reduce((sum: number, custom: any) => sum + custom.mark * custom.count, 0);

  const isValid = totalMarks >= 1;
  return { 
    isValid, 
    totalMarks, 
    message: isValid ? "Valid" : "Total marks must be at least 1" 
  };
};

// Blooms Taxonomy Levels
const BLOOMS_LEVELS = [
  {
    id: "REMEMBER",
    name: "Remember",
    description: "Recall facts and basic concepts",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "UNDERSTAND",
    name: "Understand",
    description: "Explain ideas or concepts",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "APPLY",
    name: "Apply",
    description: "Use information in new situations",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "ANALYZE",
    name: "Analyze",
    description: "Draw connections among ideas",
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "EVALUATE",
    name: "Evaluate",
    description: "Justify a stand or decision",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "CREATE",
    name: "Create",
    description: "Produce new or original work",
    color: "bg-red-100 text-red-800",
  },
];

export default function QuestionPaperManagement() {
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedQuestionPaper, setSelectedQuestionPaper] =
    useState<QuestionPaper | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [customMarks, setCustomMarks] = useState<
    { mark: number; count: number }[]
  >([]);
  const [uploadedPattern, setUploadedPattern] = useState<File | null>(null);
  const [uploadedPatternId, setUploadedPatternId] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<CreateQuestionPaperRequest>({
    title: "",
    description: "",
    examId: "",
    markDistribution: {
      oneMark: 0,
      twoMark: 0,
      threeMark: 0,
      fiveMark: 0,
      totalMarks: 0,
    },
    bloomsDistribution: [
      { level: "REMEMBER", percentage: 20 },
      { level: "UNDERSTAND", percentage: 30 },
      { level: "APPLY", percentage: 25 },
      { level: "ANALYZE", percentage: 15 },
      { level: "EVALUATE", percentage: 7 },
      { level: "CREATE", percentage: 3 },
    ],
    questionTypeDistribution: {
      oneMark: [],
      twoMark: [],
      threeMark: [],
      fiveMark: [],
    } as any, // Updated to object for per-mark distributions
    aiSettings: {
      useSubjectBook: false,
      customInstructions: "",
      difficultyLevel: "MODERATE",
      twistedQuestionsPercentage: 0,
    },
  });

  // Multi-subject handling
  const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);
  const [subjectDistributions, setSubjectDistributions] = useState<{
    [subjectId: string]: any;
  }>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestionPaper, setEditingQuestionPaper] =
    useState<QuestionPaper | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    loadData();
  }, [
    searchTerm,
    selectedType,
    selectedStatus,
    selectedSubject,
    selectedClass,
    selectedExam,
  ]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Build filter parameters for question papers
      const questionPaperFilters: any = {};
      if (searchTerm) questionPaperFilters.search = searchTerm;
      if (selectedType && selectedType !== "all")
        questionPaperFilters.type = selectedType;
      if (selectedStatus && selectedStatus !== "all")
        questionPaperFilters.status = selectedStatus;
      if (selectedSubject && selectedSubject !== "all")
        questionPaperFilters.subjectId = selectedSubject;
      if (selectedClass && selectedClass !== "all")
        questionPaperFilters.classId = selectedClass;
      if (selectedExam && selectedExam !== "all")
        questionPaperFilters.examId = selectedExam;

      const [
        examsResponse,
        questionPapersResponse,
        subjectsResponse,
        classesResponse,
      ] = await Promise.all([
        examsAPI.getAll().catch((error) => {
          console.error('Error loading exams:', error);
          return null;
        }),
        questionPaperAPI.getAll(questionPaperFilters).catch((error) => {
          console.error('Error loading question papers:', error);
          return null;
        }),
        subjectManagementAPI.getAll().catch((error) => {
          console.error('Error loading subjects:', error);
          return null;
        }),
        classManagementAPI.getAll().catch((error) => {
          console.error('Error loading classes:', error);
          return null;
        }),
      ]);
      setExams(examsResponse?.exams || examsResponse?.data || []);
      setQuestionPapers(questionPapersResponse?.questionPapers || []);
      setSubjects(subjectsResponse?.subjects || []);
      setClasses(classesResponse?.classes || []);

      // Debug log to check data structure
      console.log('Exams response:', examsResponse);
      console.log('Question papers response:', questionPapersResponse);
      console.log('Subjects response:', subjectsResponse);
      console.log('Classes response:', classesResponse);
      } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleGenerateQuestionPaper = async (questionPaper: QuestionPaper) => {
    try {
      // Generate question paper using AI
      const result = await questionPaperAPI.generateAI(questionPaper._id);
      // Update the question paper in state
      setQuestionPapers((prev) =>
        prev.map((paper) => (paper._id === questionPaper._id ? result : paper))
      );

      toast({
        title: "Success",
        description: "Question paper generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate question paper",
        variant: "destructive",
      });
    }
  };
  const handleDownloadQuestionPaper = async (questionPaper: QuestionPaper) => {
    try {
      if (!questionPaper.generatedPdf) {
        toast({
          title: "Error",
          description: "No PDF available for download",
          variant: "destructive",
        });
        return;
      }

      const downloadUrl = questionPaper.generatedPdf.downloadUrl;
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(
        /\/api\/?$/,
        ""
      );
      const path = downloadUrl?.startsWith("/public")
        ? downloadUrl
        : `/public/${downloadUrl}`;
      const fullDownloadUrl = `${baseUrl}${path}`;

      // Fetch the PDF as a blob
      const response = await fetch(fullDownloadUrl);
      if (!response.ok) throw new Error("Failed to fetch PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a hidden link element
      const link = document.createElement("a");
      link.href = url;
      link.download =
        questionPaper.generatedPdf.fileName || "question-paper.pdf";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${questionPaper.generatedPdf.fileName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download question paper",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestionPaper = async (questionPaper: QuestionPaper) => {
    try {
      // Delete question paper using API
      await questionPaperAPI.delete(questionPaper._id);

      // Remove from state
      setQuestionPapers((prev) =>
        prev.filter((paper) => paper._id !== questionPaper._id)
      );

      toast({
        title: "Success",
        description: "Question paper deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question paper",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      examId: "",
      markDistribution: {
        oneMark: 0,
        twoMark: 0,
        threeMark: 0,
        fiveMark: 0,
        totalMarks: 0,
      },
      bloomsDistribution: [
        { level: "REMEMBER", percentage: 20 },
        { level: "UNDERSTAND", percentage: 30 },
        { level: "APPLY", percentage: 25 },
        { level: "ANALYZE", percentage: 15 },
        { level: "EVALUATE", percentage: 7 },
        { level: "CREATE", percentage: 3 },
      ],
      questionTypeDistribution: {
        oneMark: [],
        twoMark: [],
        threeMark: [],
        fiveMark: [],
      } as any,
      aiSettings: {
        useSubjectBook: false,
        customInstructions: "",
        difficultyLevel: "MODERATE",
        twistedQuestionsPercentage: 0,
      },
    });
    setCurrentStep(1);
    setCustomMarks([]);
    setUploadedPattern(null);
    setUploadedPatternId(null);
    setSelectedSubjects([]);
  };

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

  const updateBloomsDistribution = (level: string, percentage: number) => {
    setFormData((prev) => ({
      ...prev,
      bloomsDistribution: prev.bloomsDistribution.map((dist) =>
        dist.level === level ? { ...dist, percentage } : dist
      ),
    }));
  };

  const updateQuestionTypeDistribution = (
    mark: string,
    type: string,
    questionCount: number
  ) => {
    setFormData((prev) => {
      const distributions = { ...prev.questionTypeDistribution };
      let dists = distributions[mark] || [];
      const existingIndex = dists.findIndex((d) => d.type === type);

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
      formData.questionTypeDistribution[mark]?.find((d) => d.type === type)
        ?.questionCount || 0
    );
  };

  const getQuestionTypeTotal = (mark: string) => {
    return (formData.questionTypeDistribution[mark] || []).reduce(
      (sum, d) => sum + (d.questionCount || 0),
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

  // Step validation functions
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

    // For multi-subject exams, validation is handled in subject-specific sections
    if (selectedSubjects.length > 1) {
      // Validate that each subject has at least some questions configured
      for (const subjectData of selectedSubjects) {
        const distribution = subjectDistributions[subjectData._id];
        if (!distribution || !distribution.markDistribution) {
          errors.push(
            `Please configure mark distribution for ${
              subjects.find((s) => s._id === subjectData._id)?.name ||
              "this subject"
            }`
          );
          continue;
        }

        const subjectTotalQuestions =
          (distribution.markDistribution.oneMark || 0) +
          (distribution.markDistribution.twoMark || 0) +
          (distribution.markDistribution.threeMark || 0) +
          (distribution.markDistribution.fiveMark || 0) +
          (distribution.customMarks || []).reduce(
            (sum: number, custom: any) => sum + custom.count,
            0
          );

        if (subjectTotalQuestions === 0) {
          errors.push(
            `At least one question must be configured for ${
              subjects.find((s) => s._id === subjectData._id)?.name ||
              "this subject"
            }`
          );
        }

        // Validate Blooms taxonomy totals 100%
        const bloomsTotal = (distribution.bloomsDistribution || []).reduce(
          (sum: number, dist: any) => sum + dist.percentage,
          0
        );
        if (bloomsTotal !== 100) {
          errors.push(
            `Blooms taxonomy percentages must add up to exactly 100% for ${
              subjects.find((s) => s._id === subjectData._id)?.name ||
              "this subject"
            }. Current total: ${bloomsTotal}%`
          );
        }
      }
    } else {
      // For single subject exams, use the global form data
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
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleCreateQuestionPaper = async () => {
    try {
      setIsCreating(true);

      // Use comprehensive validation
      const validation = validateQuestionPaperForm();
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(". "),
          variant: "destructive",
        });
        return;
      }

      // Additional validation for total marks
      // For multi-subject exams, validate each subject individually
      if (selectedSubjects.length > 1) {
        let hasValidSubject = false;
        for (const subjectData of selectedSubjects) {
          const distribution = subjectDistributions[subjectData._id];
          if (distribution && distribution.markDistribution) {
            const subjectTotalMarks = 
              (distribution.markDistribution.oneMark || 0) * 1 +
              (distribution.markDistribution.twoMark || 0) * 2 +
              (distribution.markDistribution.threeMark || 0) * 3 +
              (distribution.markDistribution.fiveMark || 0) * 5 +
              (distribution.customMarks || []).reduce((sum: number, custom: any) => sum + custom.mark * custom.count, 0);
            
            if (subjectTotalMarks >= 1) {
              hasValidSubject = true;
              break;
            }
          }
        }
        
        if (!hasValidSubject) {
          toast({
            title: "Validation Error",
            description: "At least one subject must have total marks of at least 1. Please configure mark distribution for subjects.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // For single subject or no subject exams, use global validation
        if (formData.markDistribution.totalMarks < 1) {
          toast({
            title: "Validation Error",
            description: "Total marks must be at least 1. Please configure mark distribution.",
            variant: "destructive",
          });
          return;
        }
      }

      // Get exam details to extract subject and class IDs
      const selectedExam = exams.find((exam) => exam._id === formData.examId);

      if (!selectedExam) {
        toast({
          title: "Error",
          description: "Please select a valid exam",
          variant: "destructive",
        });
        return;
      }

      // Calculate the actual total marks from questions
      const totalFromQuestions =
        formData.markDistribution.oneMark * 1 +
        formData.markDistribution.twoMark * 2 +
        formData.markDistribution.threeMark * 3 +
        formData.markDistribution.fiveMark * 5;

      const customMarksTotal = customMarks.reduce(
        (sum, custom) => sum + custom.mark * custom.count,
        0
      );
      const actualTotalMarks = totalFromQuestions + customMarksTotal;

      console.log("Mark distribution debug:", {
        oneMark: formData.markDistribution.oneMark,
        twoMark: formData.markDistribution.twoMark,
        threeMark: formData.markDistribution.threeMark,
        fiveMark: formData.markDistribution.fiveMark,
        totalMarks: formData.markDistribution.totalMarks,
        calculatedTotal: actualTotalMarks,
        customMarksTotal
      });

      // Distribute custom marks into existing categories for backend compatibility
      let adjustedMarkDistribution = { ...formData.markDistribution };

      // If we have custom marks, distribute them intelligently
      if (customMarksTotal > 0) {
        // Distribute custom marks based on their mark values
        customMarks.forEach((custom) => {
          if (custom.mark > 0 && custom.count > 0) {
            const totalCustomMarks = custom.mark * custom.count;

            // Distribute based on mark value:
            // 1-2 marks -> oneMark or twoMark
            // 3-4 marks -> threeMark
            // 5+ marks -> fiveMark
            if (custom.mark <= 2) {
              // Distribute between oneMark and twoMark
              if (custom.mark === 1) {
                adjustedMarkDistribution.oneMark += custom.count;
              } else {
                adjustedMarkDistribution.twoMark += custom.count;
              }
            } else if (custom.mark <= 4) {
              // Distribute to threeMark - convert to equivalent 3-mark questions
              const equivalentThreeMarkQuestions = Math.ceil(
                totalCustomMarks / 3
              );
              adjustedMarkDistribution.threeMark +=
                equivalentThreeMarkQuestions;
            } else {
              // Distribute to fiveMark - convert to equivalent 5-mark questions
              const equivalentFiveMarkQuestions = Math.ceil(
                totalCustomMarks / 5
              );
              adjustedMarkDistribution.fiveMark += equivalentFiveMarkQuestions;
            }
          }
        });
      }

      // Validate that adjusted distribution matches expected total
      const adjustedTotalFromQuestions =
        adjustedMarkDistribution.oneMark * 1 +
        adjustedMarkDistribution.twoMark * 2 +
        adjustedMarkDistribution.threeMark * 3 +
        adjustedMarkDistribution.fiveMark * 5;

      // If there's a mismatch, adjust the fiveMark category to match
      if (adjustedTotalFromQuestions !== actualTotalMarks) {
        const difference = actualTotalMarks - adjustedTotalFromQuestions;
        adjustedMarkDistribution.fiveMark += Math.ceil(difference / 5);
      }

      // Create question papers for each subject
      const createdQuestionPapers = [];

      // Handle case where exam has no subjects (use global form data)
      console.log("Debug: selectedSubjects.length =", selectedSubjects.length);
      console.log("Debug: selectedSubjects =", selectedSubjects);
      console.log("Debug: subjectDistributions =", subjectDistributions);
      
      if (selectedSubjects.length === 0) {
        console.log("No subjects found, using global form data");
        
        // Calculate total marks from global form data
        const globalStandardMarks =
          (adjustedMarkDistribution.oneMark || 0) * 1 +
          (adjustedMarkDistribution.twoMark || 0) * 2 +
          (adjustedMarkDistribution.threeMark || 0) * 3 +
          (adjustedMarkDistribution.fiveMark || 0) * 5;

        const globalCustomMarksTotal = customMarks.reduce(
          (sum: number, custom: any) => sum + custom.mark * custom.count,
          0
        );
        const globalTotalMarks = globalStandardMarks + globalCustomMarksTotal;

        console.log("Global calculation:", {
          globalStandardMarks,
          globalCustomMarksTotal,
          globalTotalMarks,
          adjustedMarkDistribution
        });

        // Create a single question paper without subject
        const aiRequest = {
          title: formData.title,
          description: formData.description,
          examId: formData.examId,
          // For exams without subjects, we don't include subjectId
          classId: selectedExam.classId || selectedExam.classId?._id,
          markDistribution: {
            ...adjustedMarkDistribution,
            totalMarks: globalTotalMarks,
          },
          bloomsDistribution: formData.bloomsDistribution,
          questionTypeDistribution: (() => {
            // Convert question counts to percentages for backend compatibility
            const converted: any = {};
            const markCategories = [
              "oneMark",
              "twoMark", 
              "threeMark",
              "fiveMark",
            ] as const;

            markCategories.forEach((category) => {
              const questionCount = adjustedMarkDistribution[category] || 0;
              const questionTypes = formData.questionTypeDistribution[category] || [];
              
              converted[category] = questionTypes.map((qt: any) => ({
                type: qt.type,
                percentage: questionCount > 0 ? (qt.questionCount / questionCount) * 100 : 0
              }));
            });

            return converted;
          })(),
          aiSettings: formData.aiSettings,
        };

        console.log("Sending AI request for no-subject exam:", aiRequest);

        try {
          const generatedQuestionPaper = await questionPaperAPI.generateCompleteAI(aiRequest as any);
          
          // Extract the question paper from the response
          const responseData = generatedQuestionPaper as any;
          
          if (responseData && responseData.questionPaper) {
            createdQuestionPapers.push(responseData.questionPaper);
          } else if (responseData) {
            // If the response is the question paper directly
            createdQuestionPapers.push(responseData);
          }
        } catch (error) {
          console.error("Error generating question paper:", error);
          throw error;
        }
      } else {
        // Handle case where exam has subjects
        for (const subjectData of selectedSubjects) {
        const subject = subjects.find((s) => s._id === subjectData._id);
        const subjectDistribution = subjectDistributions[subjectData._id];

        // Use subject-specific distribution if it has values, otherwise use global distribution
        const subjectMarkDistribution = subjectDistribution?.markDistribution;
        const hasSubjectMarks = subjectMarkDistribution && (
          subjectMarkDistribution.oneMark > 0 ||
          subjectMarkDistribution.twoMark > 0 ||
          subjectMarkDistribution.threeMark > 0 ||
          subjectMarkDistribution.fiveMark > 0
        );
        
        const markDistribution = hasSubjectMarks ? subjectMarkDistribution : adjustedMarkDistribution;
        
        console.log("Debug: subjectDistribution =", subjectDistribution);
        console.log("Debug: hasSubjectMarks =", hasSubjectMarks);
        console.log("Debug: markDistribution =", markDistribution);
        // Use subject-specific Bloom's distribution if it has values, otherwise use global distribution
        const subjectBloomsDistribution = subjectDistribution?.bloomsDistribution;
        const hasSubjectBlooms = subjectBloomsDistribution && 
          subjectBloomsDistribution.reduce((sum, dist) => sum + dist.percentage, 0) > 0;
        
        const bloomsDistribution = hasSubjectBlooms ? subjectBloomsDistribution : formData.bloomsDistribution;
        
        console.log("Debug: bloomsDistribution =", bloomsDistribution);
        console.log("Debug: bloomsDistribution total =", bloomsDistribution.reduce((sum, dist) => sum + dist.percentage, 0));
        const questionTypeDistribution =
          subjectDistribution?.questionTypeDistribution ||
          formData.questionTypeDistribution;
        const customMarks = subjectDistribution?.customMarks || [];

        // Calculate total marks for this subject including custom marks
        const standardMarks =
          (markDistribution.oneMark || 0) * 1 +
          (markDistribution.twoMark || 0) * 2 +
          (markDistribution.threeMark || 0) * 3 +
          (markDistribution.fiveMark || 0) * 5;

        const customMarksTotal = customMarks.reduce(
          (sum: number, custom: any) => sum + custom.mark * custom.count,
          0
        );
        const subjectTotalMarks = standardMarks + customMarksTotal;

        console.log("Subject-specific calculation:", {
          subjectId: subjectData._id,
          standardMarks,
          customMarksTotal,
          subjectTotalMarks,
          markDistribution
        });

        // Generate question paper for this subject
        const aiRequest = {
          title: `${subject?.name || "Subject"} - ${formData.title}`,
          description: formData.description,
          examId: formData.examId,
          subjectId: subjectData._id,
          classId: selectedExam.classId || selectedExam.classId?._id,
          markDistribution: {
            ...markDistribution,
            totalMarks: subjectTotalMarks,
          },
          bloomsDistribution: bloomsDistribution,
          questionTypeDistribution: (() => {
            // Convert question counts to percentages for backend compatibility
            const converted: any = {};
            const markCategories = [
              "oneMark",
              "twoMark",
              "threeMark",
              "fiveMark",
            ] as const;

            for (const mark of markCategories) {
              if (markDistribution[mark] > 0) {
                const distributions = questionTypeDistribution[mark] || [];
                const totalQuestions = markDistribution[mark];

                converted[mark] = distributions.map((dist) => ({
                  type: dist.type,
                  percentage:
                    totalQuestions > 0
                      ? Math.round((dist.questionCount / totalQuestions) * 100)
                      : 0,
                }));
              }
            }

            return converted;
          })(),
          aiSettings: formData.aiSettings,
        };

        // Add pattern ID to request if pattern was uploaded
        if (uploadedPatternId) {
          (aiRequest as any).patternId = uploadedPatternId;
        }

        // Add syllabus ID from subject data if available
        if (subject?.syllabus?.id) {
          (aiRequest as any).syllabusId = subject.syllabus.id;
        }

        try {
          const generatedQuestionPaper =
            await questionPaperAPI.generateCompleteAI(aiRequest as any);

          // Extract the question paper from the response
          const responseData = generatedQuestionPaper as any;

          if (responseData && responseData.questionPaper) {
            createdQuestionPapers.push(responseData.questionPaper);
          } else if (responseData) {
            // If the response is the question paper directly
            createdQuestionPapers.push(responseData);
          }
        } catch (error) {
          toast({
            title: "Warning",
            description: `Failed to create question paper for ${subject?.name}`,
            variant: "destructive",
          });
        }
      }
      } // Close the else block for subjects

      // Add all created question papers to the list
      if (createdQuestionPapers.length > 0) {
        setQuestionPapers((prev) => [...createdQuestionPapers, ...prev]);

        toast({
          title: "Success",
          description: `${createdQuestionPapers.length} question paper(s) generated successfully with AI`,
        });
      } else {
        toast({
          title: "Error",
          description: "No question papers were created",
          variant: "destructive",
        });
      }

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate question papers",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
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
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Comprehensive validation function for question paper creation
  const validateQuestionPaperForm = () => {
    const errors: string[] = [];

    // Basic required fields validation
    if (!formData.title.trim()) {
      errors.push("Title is required");
    }

    if (!formData.examId) {
      errors.push("Exam selection is required");
    } else {
      // Validate that the selected exam exists and has required data
      const selectedExam = exams.find((exam) => exam._id === formData.examId);
      if (!selectedExam) {
        errors.push("Selected exam is not valid or not found");
      } else {
        // Check if exam has required subject and class information
        if (!selectedExam.subjectIds || selectedExam.subjectIds.length === 0) {
          errors.push("Selected exam does not have any subjects");
        }
        if (!selectedExam.classId) {
          errors.push("Selected exam does not have a valid class");
        }
      }
    }

    // For multi-subject exams, validate each subject individually
    if (selectedSubjects.length > 1) {
      for (const subjectData of selectedSubjects) {
        const distribution = subjectDistributions[subjectData._id];
        if (!distribution || !distribution.markDistribution) {
          errors.push(
            `Please configure mark distribution for ${
              subjects.find((s) => s._id === subjectData._id)?.name ||
              "this subject"
            }`
          );
          continue;
        }

        const subjectTotalQuestions =
          (distribution.markDistribution.oneMark || 0) +
          (distribution.markDistribution.twoMark || 0) +
          (distribution.markDistribution.threeMark || 0) +
          (distribution.markDistribution.fiveMark || 0) +
          (distribution.customMarks || []).reduce(
            (sum: number, custom: any) => sum + custom.count,
            0
          );

        if (subjectTotalQuestions === 0) {
          errors.push(
            `At least one question must be configured for ${
              subjects.find((s) => s._id === subjectData._id)?.name ||
              "this subject"
            }`
          );
        }

        // Validate Blooms taxonomy totals 100%
        const bloomsTotal = (distribution.bloomsDistribution || []).reduce(
          (sum: number, dist: any) => sum + dist.percentage,
          0
        );
        if (bloomsTotal !== 100) {
          errors.push(
            `Blooms taxonomy percentages must add up to exactly 100% for ${
              subjects.find((s) => s._id === subjectData._id)?.name ||
              "this subject"
            }. Current total: ${bloomsTotal}%`
          );
        }
      }
    } else {
      // For single subject exams, use the global form data
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

      // Validate that at least some questions are configured
      const totalQuestions =
        formData.markDistribution.oneMark +
        formData.markDistribution.twoMark +
        formData.markDistribution.threeMark +
        formData.markDistribution.fiveMark +
        customMarks.reduce((sum, custom) => sum + custom.count, 0);

      if (totalQuestions === 0) {
        errors.push("At least one question must be configured");
      }

      // Validate total marks configuration
      if (formData.markDistribution.totalMarks <= 0) {
        errors.push("Total marks must be greater than 0");
      }

      // If total marks is set to 100, ensure question marks add up to 100
      if (
        formData.markDistribution.totalMarks === 100 &&
        totalFromAllQuestions !== 100
      ) {
        errors.push(
          `When total marks is 100, question marks must add up to exactly 100. Current total: ${totalFromAllQuestions}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: "bg-gray-100 text-gray-800", icon: FileText },
      GENERATED: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      PUBLISHED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      ARCHIVED: { color: "bg-yellow-100 text-yellow-800", icon: Archive },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
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
          <p className="text-gray-600">
            Create and manage question papers with AI generation
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
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
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
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
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
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
                  {exams.map((exam) => (
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Question Papers Found
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {questionPapers.length === 0
                ? "You haven't created any question papers yet. Create your first question paper to get started."
                : "No question papers match your current filters. Try adjusting your search criteria."}
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Question Paper
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questionPapers.map((paper) => {
            return (
              <Card
                key={paper._id}
                className="hover:shadow-lg transition-shadow"
              >
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
                        <DropdownMenuItem
                          onClick={() => setSelectedQuestionPaper(paper)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingQuestionPaper(paper);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit PDF
                        </DropdownMenuItem>
                        {paper.status === "DRAFT" && (
                          <DropdownMenuItem
                            onClick={() => handleGenerateQuestionPaper(paper)}
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate with AI
                          </DropdownMenuItem>
                        )}
                        {paper.status === "GENERATED" && paper.generatedPdf && (
                          <DropdownMenuItem
                            onClick={() => handleDownloadQuestionPaper(paper)}
                          >
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
                      <span className="font-medium">
                        {paper.markDistribution?.totalMarks || "N/A"}
                      </span>
                    </div>
                    {paper.generatedPdf && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          PDF Generated
                        </span>
                        <span className="text-sm text-green-600">
                          ✓ Available
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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

          {/* Step Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span
                className={`text-sm ${
                  currentStep >= 1
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                Basic Info
              </span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span
                className={`text-sm ${
                  currentStep >= 2
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                Distribution
              </span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span
                className={`text-sm ${
                  currentStep >= 3
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter question paper title"
                  />
                </div>
                <div>
                  <Label htmlFor="exam">Exam *</Label>
                  <Select
                    value={formData.examId}
                    onValueChange={(value) => {
                      const selectedExam = exams.find(
                        (exam) => exam._id === value
                      );
                      setFormData((prev) => ({
                        ...prev,
                        examId: value,
                      }));
                      // Set selected subjects based on exam
                      if (selectedExam?.subjectIds) {
                        setSelectedSubjects(selectedExam.subjectIds);
                        // Initialize subject-specific distributions
                        const distributions: { [subjectId: string]: any } = {};
                        selectedExam.subjectIds.forEach((subject: any) => {
                          distributions[subject._id] = {
                            markDistribution: {
                              oneMark: 0,
                              twoMark: 0,
                              threeMark: 0,
                              fiveMark: 0,
                              totalMarks: 0,
                            },
                            bloomsDistribution: [
                              { level: "REMEMBER", percentage: 0 },
                              { level: "UNDERSTAND", percentage: 0 },
                              { level: "APPLY", percentage: 0 },
                              { level: "ANALYZE", percentage: 0 },
                              { level: "EVALUATE", percentage: 0 },
                              { level: "CREATE", percentage: 0 },
                            ],
                            questionTypeDistribution: {
                              oneMark: [],
                              twoMark: [],
                              threeMark: [],
                              fiveMark: [],
                            },
                            customMarks: [],
                          };
                        });
                        setSubjectDistributions(distributions);
                      } else {
                        setSelectedSubjects([]);
                        setSubjectDistributions({});
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
                          {exam.subjectIds &&
                            exam.subjectIds.length > 1 &&
                            ` (${exam.subjectIds.length} subjects)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Subjects Display */}
                {selectedSubjects.length > 0 && (
                  <div>
                    <Label>Selected Subjects ({selectedSubjects.length})</Label>
                    <div className="mt-2 space-y-3">
                      {selectedSubjects.map((subjectData) => {
                        const subject = subjects.find(
                          (s) => s._id === subjectData._id
                        );
                        return (
                          <div
                            key={subjectData._id}
                            className="border rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">
                                  {subject?.name || "Unknown Subject"}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {subject?.code || ""}
                                </p>
                                {subject?.syllabus && (
                                  <p className="text-xs text-green-600 mt-1">
                                    ✓ Syllabus available
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline">
                                {selectedSubjects.length > 1
                                  ? "Multi-Subject"
                                  : "Single Subject"}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedSubjects.length > 1 && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <strong>Multi-Subject Exam:</strong>{" "}
                            {selectedSubjects.length} question papers will be
                            created - one for each subject. Each question paper
                            will use the existing syllabus from the subject
                            data.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
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
                Configure the mark distribution, Bloom's taxonomy, and question types for your question paper.
              </p>


              {/* No subjects message and fallback form */}
              {selectedSubjects.length === 0 && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-800">
                      ⚠️ This exam doesn't have any subjects associated with it. 
                      You can still create a question paper with the distribution settings below.
                    </p>
                  </div>
                  
                  {/* Fallback form for exams without subjects */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold">
                      Distribution Settings
                    </h4>
                    
                    {/* Mark Distribution */}
                    <div className="space-y-4">
                      <h5 className="text-md font-medium">Mark Distribution</h5>
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

                    {/* Question Type Distribution */}
                    <div className="space-y-4">
                      <h5 className="text-md font-medium">Question Type Distribution</h5>
                      <Accordion type="multiple" className="w-full">
                        <AccordionItem value="oneMark">
                          <AccordionTrigger>
                            1 Mark Questions ({formData.markDistribution.oneMark})
                          </AccordionTrigger>
                          <AccordionContent>
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
                  </div>
                </div>
              )}

              {/* Single Subject Distribution */}
              {selectedSubjects.length === 1 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold">
                    Distribution Settings
                  </h4>
                  
                  {/* Mark Distribution */}
                  <div className="space-y-4">
                    <h5 className="text-md font-medium">Mark Distribution</h5>
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
                    
                    {/* Blooms Distribution Summary */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h6 className="font-medium text-sm mb-2">Distribution Summary</h6>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {BLOOMS_LEVELS.map((level) => {
                          const percentage = formData.bloomsDistribution.find(d => d.level === level.id)?.percentage || 0;
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
                            formData.bloomsDistribution.reduce((sum, dist) => sum + dist.percentage, 0) === 100
                              ? "text-green-600"
                              : "text-red-600"
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
                </div>
              )}

              {/* Subject-Specific Distribution for Multi-Subject Exams */}
              {selectedSubjects.length > 1 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">
                    Subject-Specific Distribution
                  </h4>
                  <p className="text-sm text-gray-600">
                    Configure different distributions for each subject in the
                    exam
                  </p>

                  {selectedSubjects.map((subjectData) => {
                    const subject = subjects.find(
                      (s) => s._id === subjectData._id
                    );
                    const distribution =
                      subjectDistributions[subjectData._id] || {};
                    return (
                      <Card key={subjectData._id} className="p-4">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>{subject?.name || "Unknown Subject"}</span>
                            {(() => {
                              const validation = validateSubjectDistribution(subjectData._id, subjectDistributions);
                              return (
                                <div className={`text-sm px-2 py-1 rounded ${
                                  validation.isValid 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {validation.isValid ? `✓ ${validation.totalMarks} marks` : validation.message}
                                </div>
                              );
                            })()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Mark Distribution for this subject */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Mark Distribution
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <Label htmlFor={`${subjectData._id}-oneMark`}>
                                  1 Mark Questions
                                </Label>
                                <Input
                                  id={`${subjectData._id}-oneMark`}
                                  type="number"
                                  value={
                                    distribution.markDistribution?.oneMark || 0
                                  }
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? 0
                                        : Math.max(
                                            0,
                                            parseInt(e.target.value) || 0
                                          );
                                    setSubjectDistributions((prev) => ({
                                      ...prev,
                                      [subjectData._id]: {
                                        ...prev[subjectData._id],
                                        markDistribution: {
                                          ...prev[subjectData._id]
                                            ?.markDistribution,
                                          oneMark: value,
                                        },
                                      },
                                    }));
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  min="0"
                                  max="100"
                                  placeholder="0"
                                  className={(() => {
                                    const validation = validateSubjectDistribution(subjectData._id, subjectDistributions);
                                    return validation.isValid ? 'border-green-300 focus:border-green-500' : 'border-red-300 focus:border-red-500';
                                  })()}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`${subjectData._id}-twoMark`}>
                                  2 Mark Questions
                                </Label>
                                <Input
                                  id={`${subjectData._id}-twoMark`}
                                  type="number"
                                  value={
                                    distribution.markDistribution?.twoMark || 0
                                  }
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? 0
                                        : Math.max(
                                            0,
                                            parseInt(e.target.value) || 0
                                          );
                                    setSubjectDistributions((prev) => ({
                                      ...prev,
                                      [subjectData._id]: {
                                        ...prev[subjectData._id],
                                        markDistribution: {
                                          ...prev[subjectData._id]
                                            ?.markDistribution,
                                          twoMark: value,
                                        },
                                      },
                                    }));
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  min="0"
                                  max="100"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`${subjectData._id}-threeMark`}>
                                  3 Mark Questions
                                </Label>
                                <Input
                                  id={`${subjectData._id}-threeMark`}
                                  type="number"
                                  value={
                                    distribution.markDistribution?.threeMark ||
                                    0
                                  }
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? 0
                                        : Math.max(
                                            0,
                                            parseInt(e.target.value) || 0
                                          );
                                    setSubjectDistributions((prev) => ({
                                      ...prev,
                                      [subjectData._id]: {
                                        ...prev[subjectData._id],
                                        markDistribution: {
                                          ...prev[subjectData._id]
                                            ?.markDistribution,
                                          threeMark: value,
                                        },
                                      },
                                    }));
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  min="0"
                                  max="100"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`${subjectData._id}-fiveMark`}>
                                  5 Mark Questions
                                </Label>
                                <Input
                                  id={`${subjectData._id}-fiveMark`}
                                  type="number"
                                  value={
                                    distribution.markDistribution?.fiveMark || 0
                                  }
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? 0
                                        : Math.max(
                                            0,
                                            parseInt(e.target.value) || 0
                                          );
                                    setSubjectDistributions((prev) => ({
                                      ...prev,
                                      [subjectData._id]: {
                                        ...prev[subjectData._id],
                                        markDistribution: {
                                          ...prev[subjectData._id]
                                            ?.markDistribution,
                                          fiveMark: value,
                                        },
                                      },
                                    }));
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  min="0"
                                  max="100"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Blooms Taxonomy Distribution for this subject */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Blooms Taxonomy Distribution
                            </Label>
                            <div className="space-y-4">
                              {BLOOMS_LEVELS.map((level) => (
                                <div key={level.id} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <Label className="font-medium">
                                        {level.name}
                                      </Label>
                                      <p className="text-sm text-gray-600">
                                        {level.description}
                                      </p>
                                    </div>
                                    <span className="text-sm font-medium">
                                      {distribution.bloomsDistribution?.find(
                                        (d: any) => d.level === level.id
                                      )?.percentage || 0}
                                      %
                                    </span>
                                  </div>
                                  <Slider
                                    value={[
                                      distribution.bloomsDistribution?.find(
                                        (d: any) => d.level === level.id
                                      )?.percentage || 0,
                                    ]}
                                    onValueChange={([value]) => {
                                      setSubjectDistributions((prev) => ({
                                        ...prev,
                                        [subjectData._id]: {
                                          ...prev[subjectData._id],
                                          bloomsDistribution: (
                                            prev[subjectData._id]
                                              ?.bloomsDistribution || []
                                          )
                                            .filter(
                                              (d: any) => d.level !== level.id
                                            )
                                            .concat([
                                              {
                                                level: level.id,
                                                percentage: value,
                                              },
                                            ]),
                                        },
                                      }));
                                    }}
                                    max={100}
                                    step={1}
                                    className="w-full"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Blooms Distribution Summary */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium text-sm mb-2">
                                Distribution Summary
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {BLOOMS_LEVELS.map((level) => {
                                  const percentage =
                                    distribution.bloomsDistribution?.find(
                                      (d: any) => d.level === level.id
                                    )?.percentage || 0;
                                  return (
                                    <div
                                      key={level.id}
                                      className="flex justify-between"
                                    >
                                      <span className="text-gray-600">
                                        {level.name}:
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          percentage > 0
                                            ? "text-blue-600"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {percentage}%
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 font-medium">
                                    Total:
                                  </span>
                                  <span
                                    className={`font-bold ${
                                      (
                                        distribution.bloomsDistribution || []
                                      ).reduce(
                                        (sum: number, dist: any) =>
                                          sum + dist.percentage,
                                        0
                                      ) === 100
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {(
                                      distribution.bloomsDistribution || []
                                    ).reduce(
                                      (sum: number, dist: any) =>
                                        sum + dist.percentage,
                                      0
                                    )}
                                    %
                                  </span>
                                </div>
                                {(distribution.bloomsDistribution || []).reduce(
                                  (sum: number, dist: any) =>
                                    sum + dist.percentage,
                                  0
                                ) !== 100 && (
                                  <div className="mt-2 text-red-600 text-sm">
                                    ⚠️ Blooms taxonomy percentages must add up
                                    to exactly 100%. Please adjust the
                                    distribution.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Custom Marks for this subject */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="text-sm font-medium">
                                Custom Marks Questions
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newCustomMark = { mark: 0, count: 0 };
                                  setSubjectDistributions((prev) => ({
                                    ...prev,
                                    [subjectData._id]: {
                                      ...prev[subjectData._id],
                                      customMarks: [
                                        ...(prev[subjectData._id]
                                          ?.customMarks || []),
                                        newCustomMark,
                                      ],
                                    },
                                  }));
                                }}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Custom Mark
                              </Button>
                            </div>

                            {(distribution.customMarks || []).length > 0 && (
                              <div className="space-y-3">
                                {(distribution.customMarks || []).map(
                                  (custom: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                                    >
                                      <div className="flex-1">
                                        <Label
                                          htmlFor={`${subjectData._id}-customMark-${index}`}
                                        >
                                          Mark Value
                                        </Label>
                                        <Input
                                          id={`${subjectData._id}-customMark-${index}`}
                                          type="number"
                                          value={custom.mark || ""}
                                          onChange={(e) => {
                                            const value =
                                              e.target.value === ""
                                                ? 0
                                                : Math.max(
                                                    0,
                                                    parseInt(e.target.value) ||
                                                      0
                                                  );
                                            setSubjectDistributions((prev) => ({
                                              ...prev,
                                              [subjectData._id]: {
                                                ...prev[subjectData._id],
                                                customMarks:
                                                  prev[
                                                    subjectData._id
                                                  ]?.customMarks?.map(
                                                    (cm: any, i: number) =>
                                                      i === index
                                                        ? { ...cm, mark: value }
                                                        : cm
                                                  ) || [],
                                              },
                                            }));
                                          }}
                                          onFocus={(e) => e.target.select()}
                                          min="1"
                                          max="100"
                                          placeholder="e.g., 4"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <Label
                                          htmlFor={`${subjectData._id}-customCount-${index}`}
                                        >
                                          Number of Questions
                                        </Label>
                                        <Input
                                          id={`${subjectData._id}-customCount-${index}`}
                                          type="number"
                                          value={custom.count || ""}
                                          onChange={(e) => {
                                            const value =
                                              e.target.value === ""
                                                ? 0
                                                : Math.max(
                                                    0,
                                                    parseInt(e.target.value) ||
                                                      0
                                                  );
                                            setSubjectDistributions((prev) => ({
                                              ...prev,
                                              [subjectData._id]: {
                                                ...prev[subjectData._id],
                                                customMarks:
                                                  prev[
                                                    subjectData._id
                                                  ]?.customMarks?.map(
                                                    (cm: any, i: number) =>
                                                      i === index
                                                        ? {
                                                            ...cm,
                                                            count: value,
                                                          }
                                                        : cm
                                                  ) || [],
                                              },
                                            }));
                                          }}
                                          onFocus={(e) => e.target.select()}
                                          min="0"
                                          max="100"
                                          placeholder="e.g., 5"
                                        />
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium">
                                          = {custom.mark * custom.count} marks
                                        </span>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSubjectDistributions((prev) => ({
                                              ...prev,
                                              [subjectData._id]: {
                                                ...prev[subjectData._id],
                                                customMarks:
                                                  prev[
                                                    subjectData._id
                                                  ]?.customMarks?.filter(
                                                    (_: any, i: number) =>
                                                      i !== index
                                                  ) || [],
                                              },
                                            }));
                                          }}
                                          className="text-red-600 border-red-600 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>

                          {/* Question Type Distribution for this subject */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Question Type Distribution
                            </Label>
                            <Accordion type="multiple" className="w-full">
                              <AccordionItem value="oneMark">
                                <AccordionTrigger>
                                  1 Mark Questions (
                                  {distribution.markDistribution?.oneMark || 0})
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    {getAvailableQuestionTypes(1).map((type) => (
                                      <div key={type.id} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <Label className="font-medium">
                                              {type.name}
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                              {type.description}
                                            </p>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Input
                                              type="number"
                                              value={
                                                distribution.questionTypeDistribution?.oneMark?.find(
                                                  (d: any) => d.type === type.id
                                                )?.questionCount || ""
                                              }
                                              onChange={(e) => {
                                                const value =
                                                  e.target.value === ""
                                                    ? 0
                                                    : Math.max(
                                                        0,
                                                        parseInt(
                                                          e.target.value
                                                        ) || 0
                                                      );
                                                setSubjectDistributions(
                                                  (prev) => ({
                                                    ...prev,
                                                    [subjectData._id]: {
                                                      ...prev[subjectData._id],
                                                      questionTypeDistribution:
                                                        {
                                                          ...prev[
                                                            subjectData._id
                                                          ]
                                                            ?.questionTypeDistribution,
                                                          oneMark: (
                                                            prev[
                                                              subjectData._id
                                                            ]
                                                              ?.questionTypeDistribution
                                                              ?.oneMark || []
                                                          )
                                                            .filter(
                                                              (d: any) =>
                                                                d.type !==
                                                                type.id
                                                            )
                                                            .concat(
                                                              value > 0
                                                                ? [
                                                                    {
                                                                      type: type.id,
                                                                      questionCount:
                                                                        value,
                                                                    },
                                                                  ]
                                                                : []
                                                            ),
                                                        },
                                                    },
                                                  })
                                                );
                                              }}
                                              onFocus={(e) => e.target.select()}
                                              min="0"
                                              max={
                                                distribution.markDistribution
                                                  ?.oneMark || 0
                                              }
                                              className="w-20"
                                              placeholder="0"
                                            />
                                            <span className="text-sm text-gray-500">
                                              questions
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>

                              <AccordionItem value="twoMark">
                                <AccordionTrigger>
                                  2 Mark Questions (
                                  {distribution.markDistribution?.twoMark || 0})
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    {getAvailableQuestionTypes(2).map((type) => (
                                      <div key={type.id} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <Label className="font-medium">
                                              {type.name}
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                              {type.description}
                                            </p>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Input
                                              type="number"
                                              value={
                                                distribution.questionTypeDistribution?.twoMark?.find(
                                                  (d: any) => d.type === type.id
                                                )?.questionCount || ""
                                              }
                                              onChange={(e) => {
                                                const value =
                                                  e.target.value === ""
                                                    ? 0
                                                    : Math.max(
                                                        0,
                                                        parseInt(
                                                          e.target.value
                                                        ) || 0
                                                      );
                                                setSubjectDistributions(
                                                  (prev) => ({
                                                    ...prev,
                                                    [subjectData._id]: {
                                                      ...prev[subjectData._id],
                                                      questionTypeDistribution:
                                                        {
                                                          ...prev[
                                                            subjectData._id
                                                          ]
                                                            ?.questionTypeDistribution,
                                                          twoMark: (
                                                            prev[
                                                              subjectData._id
                                                            ]
                                                              ?.questionTypeDistribution
                                                              ?.twoMark || []
                                                          )
                                                            .filter(
                                                              (d: any) =>
                                                                d.type !==
                                                                type.id
                                                            )
                                                            .concat(
                                                              value > 0
                                                                ? [
                                                                    {
                                                                      type: type.id,
                                                                      questionCount:
                                                                        value,
                                                                    },
                                                                  ]
                                                                : []
                                                            ),
                                                        },
                                                    },
                                                  })
                                                );
                                              }}
                                              onFocus={(e) => e.target.select()}
                                              min="0"
                                              max={
                                                distribution.markDistribution
                                                  ?.twoMark || 0
                                              }
                                              className="w-20"
                                              placeholder="0"
                                            />
                                            <span className="text-sm text-gray-500">
                                              questions
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>

                              <AccordionItem value="threeMark">
                                <AccordionTrigger>
                                  3 Mark Questions (
                                  {distribution.markDistribution?.threeMark ||
                                    0}
                                  )
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    {getAvailableQuestionTypes(3).map((type) => (
                                      <div key={type.id} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <Label className="font-medium">
                                              {type.name}
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                              {type.description}
                                            </p>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Input
                                              type="number"
                                              value={
                                                distribution.questionTypeDistribution?.threeMark?.find(
                                                  (d: any) => d.type === type.id
                                                )?.questionCount || ""
                                              }
                                              onChange={(e) => {
                                                const value =
                                                  e.target.value === ""
                                                    ? 0
                                                    : Math.max(
                                                        0,
                                                        parseInt(
                                                          e.target.value
                                                        ) || 0
                                                      );
                                                setSubjectDistributions(
                                                  (prev) => ({
                                                    ...prev,
                                                    [subjectData._id]: {
                                                      ...prev[subjectData._id],
                                                      questionTypeDistribution:
                                                        {
                                                          ...prev[
                                                            subjectData._id
                                                          ]
                                                            ?.questionTypeDistribution,
                                                          threeMark: (
                                                            prev[
                                                              subjectData._id
                                                            ]
                                                              ?.questionTypeDistribution
                                                              ?.threeMark || []
                                                          )
                                                            .filter(
                                                              (d: any) =>
                                                                d.type !==
                                                                type.id
                                                            )
                                                            .concat(
                                                              value > 0
                                                                ? [
                                                                    {
                                                                      type: type.id,
                                                                      questionCount:
                                                                        value,
                                                                    },
                                                                  ]
                                                                : []
                                                            ),
                                                        },
                                                    },
                                                  })
                                                );
                                              }}
                                              onFocus={(e) => e.target.select()}
                                              min="0"
                                              max={
                                                distribution.markDistribution
                                                  ?.threeMark || 0
                                              }
                                              className="w-20"
                                              placeholder="0"
                                            />
                                            <span className="text-sm text-gray-500">
                                              questions
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>

                              <AccordionItem value="fiveMark">
                                <AccordionTrigger>
                                  5 Mark Questions (
                                  {distribution.markDistribution?.fiveMark || 0}
                                  )
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    {getAvailableQuestionTypes(5).map((type) => (
                                      <div key={type.id} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <Label className="font-medium">
                                              {type.name}
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                              {type.description}
                                            </p>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Input
                                              type="number"
                                              value={
                                                distribution.questionTypeDistribution?.fiveMark?.find(
                                                  (d: any) => d.type === type.id
                                                )?.questionCount || ""
                                              }
                                              onChange={(e) => {
                                                const value =
                                                  e.target.value === ""
                                                    ? 0
                                                    : Math.max(
                                                        0,
                                                        parseInt(
                                                          e.target.value
                                                        ) || 0
                                                      );
                                                setSubjectDistributions(
                                                  (prev) => ({
                                                    ...prev,
                                                    [subjectData._id]: {
                                                      ...prev[subjectData._id],
                                                      questionTypeDistribution:
                                                        {
                                                          ...prev[
                                                            subjectData._id
                                                          ]
                                                            ?.questionTypeDistribution,
                                                          fiveMark: (
                                                            prev[
                                                              subjectData._id
                                                            ]
                                                              ?.questionTypeDistribution
                                                              ?.fiveMark || []
                                                          )
                                                            .filter(
                                                              (d: any) =>
                                                                d.type !==
                                                                type.id
                                                            )
                                                            .concat(
                                                              value > 0
                                                                ? [
                                                                    {
                                                                      type: type.id,
                                                                      questionCount:
                                                                        value,
                                                                    },
                                                                  ]
                                                                : []
                                                            ),
                                                        },
                                                    },
                                                  })
                                                );
                                              }}
                                              onFocus={(e) => e.target.select()}
                                              min="0"
                                              max={
                                                distribution.markDistribution
                                                  ?.fiveMark || 0
                                              }
                                              className="w-20"
                                              placeholder="0"
                                            />
                                            <span className="text-sm text-gray-500">
                                              questions
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">AI Settings</h3>
              <div className="space-y-4">
                {/* Upload Question Paper Pattern */}
                <div>
                  <Label htmlFor="patternUpload">
                    Upload Question Paper Pattern (Optional)
                  </Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a PDF or image of a question paper pattern to help AI
                    generate similar format
                  </p>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="patternUpload"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedPattern(file);
                          try {
                            const result = await questionPaperAPI.uploadPattern(
                              file
                            );
                            setUploadedPatternId(result.patternId);
                            toast({
                              title: "Pattern uploaded",
                              description: "Pattern file uploaded successfully",
                            });
                          } catch (error) {
                            toast({
                              title: "Upload failed",
                              description: "Failed to upload pattern file",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                      className="flex-1"
                    />
                    {uploadedPattern && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600">
                          ✓ {uploadedPattern.name}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUploadedPattern(null);
                            setUploadedPatternId(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                  <Select
                    value={formData.aiSettings.difficultyLevel}
                    onValueChange={(value: "EASY" | "MODERATE" | "TOUGHEST") =>
                      setFormData((prev) => ({
                        ...prev,
                        aiSettings: {
                          ...prev.aiSettings,
                          difficultyLevel: value,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MODERATE">Moderate</SelectItem>
                      <SelectItem value="TOUGHEST">Toughest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Twisted Questions Percentage</Label>
                  <Slider
                    value={[formData.aiSettings.twistedQuestionsPercentage]}
                    onValueChange={([value]) =>
                      setFormData((prev) => ({
                        ...prev,
                        aiSettings: {
                          ...prev.aiSettings,
                          twistedQuestionsPercentage: value,
                        },
                      }))
                    }
                    max={100}
                    step={1}
                  />
                  <span className="text-sm font-medium">
                    {formData.aiSettings.twistedQuestionsPercentage}%
                  </span>
                </div>
                <div>
                  <Label htmlFor="customInstructions">
                    Custom Instructions
                  </Label>
                  <Textarea
                    id="customInstructions"
                    value={formData.aiSettings.customInstructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        aiSettings: {
                          ...prev.aiSettings,
                          customInstructions: e.target.value,
                        },
                      }))
                    }
                    placeholder="Additional instructions for AI generation"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step Validation Status Display */}
          {(() => {
            let validation;
            if (currentStep === 1) {
              validation = validateStep1();
            } else if (currentStep === 2) {
              validation = validateStep2();
            } else {
              validation = validateStep3();
            }

            // Only show validation errors if the user has attempted to configure something
            // For step 2, only show errors if there's some configuration attempt
            const shouldShowValidation = currentStep === 1 || 
              (currentStep === 2 && (
                formData.markDistribution.oneMark > 0 ||
                formData.markDistribution.twoMark > 0 ||
                formData.markDistribution.threeMark > 0 ||
                formData.markDistribution.fiveMark > 0 ||
                customMarks.length > 0 ||
                selectedSubjects.length > 1
              ));

            if (!validation.isValid && shouldShowValidation) {
              return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-2">
                        Please fix the following issues:
                      </h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {validation.errors.map((error, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            }
            
            if (validation.isValid && shouldShowValidation) {
              return (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-green-800">
                      Step {currentStep} validation passed. Ready to proceed.
                    </span>
                  </div>
                </div>
              );
            }
            
            return null;
          })()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <div className="flex space-x-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePreviousStep}>
                  Previous
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="flex space-x-2">
              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={(() => {
                    if (currentStep === 1) return !validateStep1().isValid;
                    if (currentStep === 2) return !validateStep2().isValid;
                    return false;
                  })()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleCreateQuestionPaper}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isCreating || !validateQuestionPaperForm().isValid}
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Question Paper"
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Paper Details Dialog */}
      {selectedQuestionPaper && (
        <Dialog
          open={!!selectedQuestionPaper}
          onOpenChange={() => setSelectedQuestionPaper(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedQuestionPaper.title}</DialogTitle>
              <DialogDescription>
                {selectedQuestionPaper.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedQuestionPaper.status)}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Type</Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {selectedQuestionPaper.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Total Marks</Label>
                  <div className="mt-1">
                    {selectedQuestionPaper.markDistribution?.totalMarks ||
                      "N/A"}
                  </div>
                </div>
              </div>

              {selectedQuestionPaper.generatedPdf && (
                <div className="flex justify-center">
                  <Button
                    onClick={() =>
                      handleDownloadQuestionPaper(selectedQuestionPaper)
                    }
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Enhanced PDF Editor Dialog */}
      {editingQuestionPaper && (
        <SimplifiedPDFEditor
          questionPaper={editingQuestionPaper}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingQuestionPaper(null);
          }}
          onUpdate={() => {
            // Reload question papers after editing
            loadData();
          }}
        />
      )}
    </div>
  );
}
