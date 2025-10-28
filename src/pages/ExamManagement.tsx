import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Settings,
  Play,
  Square,
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { Exam, CreateExamRequest, examsAPI, subjectManagementAPI, classManagementAPI, syllabusAPI } from '@/services/api';

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [syllabi, setSyllabi] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateExamRequest>({
    title: '',
    description: '',
    examType: 'UNIT_TEST',
    subjectIds: [], // Changed to array for multiple subjects
    classId: '',
    adminId: '', // Will be set from current user if not provided
    duration: 60,
    scheduledDate: new Date().toISOString().split('T')[0], // Set today's date as default
    endDate: '',
    instructions: '',
    allowLateSubmission: false,
    lateSubmissionPenalty: 0
  });
  const [isCustomExamType, setIsCustomExamType] = useState(false);

  // Step-by-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [customExamType, setCustomExamType] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Filter subjects based on selected class
  const filteredSubjects = formData.classId 
    ? subjects.filter(subject => subject.classIds?.includes(formData.classId))
    : [];

  // Check if reference book exists for a subject
  const hasReferenceBookForSubject = (subjectId: string) => {
    const subject = subjects.find(s => s._id === subjectId || s.id === subjectId);
    return subject && subject.referenceBook && subject.referenceBook.fileName;
  };

  // Check if any of the selected subjects have reference books
  const hasReferenceBookForSelectedSubjects = () => {
    if (formData.subjectIds.length === 0) return true;
    return formData.subjectIds.some(subjectId => 
      hasReferenceBookForSubject(subjectId)
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    loadData();
  }, [searchTerm, selectedType, selectedStatus, selectedSubject, selectedClass]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Build filter parameters
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedType && selectedType !== 'all') filters.examType = selectedType;
      if (selectedStatus && selectedStatus !== 'all') filters.status = selectedStatus;
      if (selectedSubject && selectedSubject !== 'all') filters.subjectId = selectedSubject;
      if (selectedClass && selectedClass !== 'all') filters.classId = selectedClass;
      
      // Try to load from backend first
      const [examsResponse, subjectsResponse, classesResponse, syllabiResponse] = await Promise.all([
        examsAPI.getAll(filters).catch(() => null),
        subjectManagementAPI.getAll().catch(() => null),
        classManagementAPI.getAll().catch(() => null),
        syllabusAPI.getAll().catch(() => null)
      ]);
      if (examsResponse && subjectsResponse && classesResponse) {
        // Backend data available
        setExams(examsResponse?.data || examsResponse?.exams || []);
        setSubjects(subjectsResponse.subjects || []);
        setClasses(classesResponse.classes || []);
        setSyllabi(syllabiResponse?.syllabi || syllabiResponse?.data || []);
        } else {
        // Fallback to mock data
        // loadMockData();
      }
    } catch (error) {
      // Fallback to mock data on error
      // loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockExams = [
      {
        id: '1',
        title: 'Mathematics Unit Test - Chapter 1',
        description: 'Unit test covering basic algebra and geometry concepts',
        examType: 'UNIT_TEST' as const,
        subjectIds: ['subj1'],
        classId: 'class1',
        totalMarks: 100,
        duration: 90,
        scheduledDate: '2024-02-15T10:00:00Z',
        endDate: '2024-02-15T11:30:00Z',
        instructions: 'Answer all questions. Show your work clearly.',
        allowLateSubmission: false,
        lateSubmissionPenalty: 0,
        status: 'SCHEDULED' as const,
        questions: ['q1', 'q2', 'q3', 'q4', 'q5'],
        questionDistribution: [],
        createdBy: 'admin1',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Physics Final Exam',
        description: 'Comprehensive final examination covering all physics topics',
        examType: 'FINAL' as const,
        subjectIds: ['subj2'],
        classId: 'class2',
        totalMarks: 150,
        duration: 180,
        scheduledDate: '2024-02-20T09:00:00Z',
        endDate: '2024-02-20T12:00:00Z',
        instructions: 'This is a comprehensive exam. Read all questions carefully before answering.',
        allowLateSubmission: true,
        lateSubmissionPenalty: 10,
        status: 'ONGOING' as const,
        questions: ['q6', 'q7', 'q8'],
        questionDistribution: [],
        createdBy: 'admin1',
        isActive: true,
        createdAt: '2024-01-14T15:00:00Z',
        updatedAt: '2024-01-14T15:00:00Z'
      }
    ];

    const mockSubjects = [
      { id: 'subj1', name: 'Mathematics', code: 'MATH' },
      { id: 'subj2', name: 'Physics', code: 'PHY' }
    ];

    const mockClasses = [
      { id: 'class1', name: '10A', displayName: 'Class 10A' },
      { id: 'class2', name: '11B', displayName: 'Class 11B' }
    ];

    setExams(mockExams);
    setSubjects(mockSubjects);
    setClasses(mockClasses);

    // ✅ Critical fix: stop loading spinner
    setLoading(false);
  };

  const handleCreate = async () => {
    try {
      // Validate reference book availability for selected subjects
      if (!hasReferenceBookForSelectedSubjects()) {
        const missingSubjects = formData.subjectIds.filter(subjectId => 
          !hasReferenceBookForSubject(subjectId)
        );
        const subjectNames = missingSubjects.map(subjectId => 
          subjects.find(s => s._id === subjectId || s.id === subjectId)?.name || 'Unknown'
        ).join(', ');
        
        toast({
          title: "Reference Book Required",
          description: `Reference book not uploaded for subject(s): ${subjectNames}. Please upload reference books for these subjects before creating the exam.`,
          variant: "destructive",
        });
        return;
      }

      // Prepare data for API call - remove empty adminId to avoid validation error
      const { adminId, ...examData } = formData;
      
      // Handle custom exam type - convert to valid enum value
      const finalExamType = isCustomExamType ? 'UNIT_TEST' : formData.examType;
      
      const apiData = {
        ...examData,
        examType: finalExamType,
        ...(adminId && { adminId })
      };
      
      // Try backend API first
      const response = await examsAPI.create(apiData);
      // Handle different response structures
      const newExam = (response as any).exam || response;
      setExams(prev => [newExam, ...prev]);
      
      // Reload data to ensure consistency
      await loadData();
      
      toast({
        title: "Success",
        description: "Exam created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Fallback to mock creation
      const finalExamType = isCustomExamType ? 'UNIT_TEST' : formData.examType;
      
      const newExam: Exam = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        examType: finalExamType as any,
        subjectIds: formData.subjectIds,
        classId: formData.classId,
        duration: formData.duration,
        scheduledDate: formData.scheduledDate,
        endDate: formData.endDate,
        instructions: formData.instructions,
        allowLateSubmission: formData.allowLateSubmission,
        lateSubmissionPenalty: formData.lateSubmissionPenalty,
        status: 'DRAFT' as const,
        questions: [],
        questionDistribution: [],
        createdBy: 'admin1',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setExams(prev => [newExam, ...prev]);
      toast({
        title: "Success",
        description: "Exam created successfully (offline mode)",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    
    try {
      // Try backend API first
      await examsAPI.delete(id);
        setExams(prev => prev.filter(exam => exam._id !== id));
      toast({
        title: "Success",
        description: "Exam deleted successfully",
      });
    } catch (error) {
      // Fallback to mock deletion
      setExams(prev => prev.filter(exam => exam.id !== id));
      toast({
        title: "Success",
        description: "Exam deleted successfully (offline mode)",
      });
    }
  };

  // Exam type options
  const examTypeOptions = [
    { value: 'DAILY', label: 'Daily Test', description: 'Daily assessment tests' },
    { value: 'WEEKLY', label: 'Weekly Test', description: 'Weekly assessment tests' },
    { value: 'MONTHLY', label: 'Monthly Test', description: 'Monthly assessment tests' },
    { value: 'UNIT_WISE', label: 'Unit Wise Test', description: 'Tests based on specific units' },
    { value: 'PAGE_WISE', label: 'Page Wise Test', description: 'Tests based on specific pages' },
    { value: 'TERM_TEST', label: 'Term Test', description: 'Term-based examinations' },
    { value: 'ANNUAL_EXAM', label: 'Annual Exam', description: 'Annual examinations' },
    { value: 'CUSTOM', label: 'Custom', description: 'Custom exam type' }
  ];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      examType: 'UNIT_TEST',
      subjectIds: [],
      classId: '',
      adminId: '',
      duration: 60,
      scheduledDate: new Date().toISOString().split('T')[0], // Set today's date as default
      endDate: '',
      instructions: '',
      allowLateSubmission: false,
      lateSubmissionPenalty: 0
    });
    setSelectedDate(new Date()); // Set today's date as default
    setCurrentStep(1);
    setCustomExamType('');
    setIsCustomExamType(false);
    setIsDatePickerOpen(false);
  };

  const initializeDate = (dateTimeString: string) => {
    if (dateTimeString) {
      const date = new Date(dateTimeString);
      setSelectedDate(date);
    }
  };

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExamTypeChange = (value: string) => {
    if (value === 'CUSTOM') {
      setIsCustomExamType(true);
      setFormData(prev => ({ ...prev, examType: 'UNIT_TEST' as any })); // Use valid enum value
    } else {
      setIsCustomExamType(false);
      setFormData(prev => ({ ...prev, examType: value as any }));
      setCustomExamType('');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary' as const, label: 'Draft', icon: FileText },
      SCHEDULED: { variant: 'default' as const, label: 'Scheduled', icon: Calendar },
      ONGOING: { variant: 'default' as const, label: 'Ongoing', icon: Play },
      COMPLETED: { variant: 'default' as const, label: 'Completed', icon: CheckCircle }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'UNIT_TEST': return <FileText className="h-4 w-4" />;
      case 'FINAL': return <GraduationCap className="h-4 w-4" />;
      case 'DAILY': return <Calendar className="h-4 w-4" />;
      case 'WEEKLY': return <Clock className="h-4 w-4" />;
      case 'MONTHLY': return <Calendar className="h-4 w-4" />;
      case 'UNIT_WISE': return <BookOpen className="h-4 w-4" />;
      case 'PAGE_WISE': return <FileText className="h-4 w-4" />;
      case 'TERM_TEST': return <GraduationCap className="h-4 w-4" />;
      case 'ANNUAL_EXAM': return <GraduationCap className="h-4 w-4" />;
      case 'QUIZ': return <FileText className="h-4 w-4" />;
      case 'ASSIGNMENT': return <FileText className="h-4 w-4" />;
      case 'PRACTICAL': return <Settings className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Exam Management</h1>
          <p className="text-muted-foreground">Create and manage exams for your institution</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={subjects.length === 0 || classes.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Exam
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search exams..."
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
                  <SelectItem value="UNIT_TEST">Unit Test</SelectItem>
                  <SelectItem value="MID_TERM">Mid Term</SelectItem>
                  <SelectItem value="FINAL">Final</SelectItem>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                  <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                  <SelectItem value="PRACTICAL">Practical</SelectItem>
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
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                    <SelectItem key={subject.id} value={subject.id}>
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
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exams</CardTitle>
          <CardDescription>Manage your exams</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : exams.length === 0 ? (
            <div>No exams found.</div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <Card key={exam.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(exam.examType)}
                        <h3 className="text-lg font-semibold">{exam.title}</h3>
                        {getStatusBadge(exam.status)}
                      </div>
                      <p className="text-muted-foreground mb-2">{exam.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {exam.scheduledDate 
                              ? new Date(exam.scheduledDate).toLocaleDateString() 
                              : 'No date set'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(exam.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{exam.examType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>
                            {exam.subjectIds && exam.subjectIds.length > 0 ? (
                              exam.subjectIds.map(subjectId => {
                                const subject = subjects.find(s => s._id === subjectId._id);
                                return subject ? subject.name : 'Unknown Subject';
                              }).join(', ')
                            ) : (
                              'No subjects'
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                            onClick={() => handleDelete(exam._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Exam Dialog - Step by Step */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Exam</DialogTitle>
            <DialogDescription>
              {currentStep === 1 
                ? "Step 1: Select the type of exam you want to create" 
                : "Step 2: Configure exam details and settings"
              }
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Exam Type</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
          </div>

          {/* Step 1: Exam Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Choose Exam Type</h3>
                <p className="text-gray-600">Select the type of exam you want to create</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {examTypeOptions.map((option) => (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      formData.examType === option.value 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleExamTypeChange(option.value)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">
                        {option.value === 'DAILY' && '📅'}
                        {option.value === 'WEEKLY' && '📊'}
                        {option.value === 'MONTHLY' && '📈'}
                        {option.value === 'UNIT_WISE' && '📚'}
                        {option.value === 'PAGE_WISE' && '📄'}
                        {option.value === 'TERM_TEST' && '🎓'}
                        {option.value === 'ANNUAL_EXAM' && '🏆'}
                        {option.value === 'CUSTOM' && '⚙️'}
                      </div>
                      <h4 className="font-medium text-sm mb-1">{option.label}</h4>
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Custom Exam Type Input */}
              {isCustomExamType && (
                <div className="mt-6">
                  <Label htmlFor="customExamType">Custom Exam Type Name</Label>
                  <Input
                    id="customExamType"
                    value={customExamType}
                    onChange={(e) => setCustomExamType(e.target.value)}
                    placeholder="Enter custom exam type name"
                    className="mt-2"
                  />
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={nextStep}
                  disabled={!formData.examType || (isCustomExamType && !customExamType.trim())}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Exam Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Exam Details</h3>
                <p className="text-gray-600">Configure the exam settings and requirements</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter exam title"
                  />
                </div>
                <div>
                  <Label htmlFor="examTypeDisplay">Exam Type</Label>
                  <Input
                    id="examTypeDisplay"
                    value={isCustomExamType ? customExamType : examTypeOptions.find(opt => opt.value === formData.examType)?.label || formData.examType}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter exam description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class">Class *</Label>
                  <Select 
                    value={formData.classId} 
                    onValueChange={(value) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        classId: value,
                        subjectIds: [] // Clear subjects when class changes
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class first" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.length === 0 ? (
                        <SelectItem value="" disabled>No classes available. Create classes first.</SelectItem>
                      ) : (
                        classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls._id}>
                            {cls.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {!formData.classId && (
                    <p className="text-sm text-red-500 mt-1">Please select a class first</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="subjects">Subjects *</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {!formData.classId ? (
                      <p className="text-sm text-gray-500">Please select a class first to see available subjects</p>
                    ) : filteredSubjects.length === 0 ? (
                      <p className="text-sm text-gray-500">No subjects available for the selected class</p>
                    ) : (
                      filteredSubjects.map((subject) => {
                        const hasReferenceBook = hasReferenceBookForSubject(subject._id);
                        return (
                          <div key={subject._id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`subject-${subject._id}`}
                              checked={formData.subjectIds.includes(subject._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    subjectIds: [...prev.subjectIds, subject._id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    subjectIds: prev.subjectIds.filter(id => id !== subject._id)
                                  }));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={`subject-${subject._id}`} className="text-sm flex items-center space-x-2">
                              <span>{subject.name} ({subject.code})</span>
                              {hasReferenceBook ? (
                                <CheckCircle className="h-4 w-4 text-green-500" title="Reference book available" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-500" title="Reference book required" />
                              )}
                            </Label>
                          </div>
                        );
                      })
                    )}
                    {formData.classId && formData.subjectIds.length === 0 && (
                      <p className="text-sm text-red-500">Please select at least one subject</p>
                    )}
                    {formData.classId && formData.subjectIds.length > 0 && !hasReferenceBookForSelectedSubjects() && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-amber-800">
                          <AlertTriangle className="h-4 w-4" />
                          <p className="text-sm">
                            <strong>Warning:</strong> Some selected subjects don't have reference books uploaded. 
                            You won't be able to create the exam until reference books are available for all selected subjects.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    placeholder="60"
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal min-h-[40px] px-3 py-2 h-10"
                      >
                        <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-left overflow-hidden">
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          if (date) {
                            // Set time to 9:00 AM by default
                            const dateTime = new Date(date);
                            dateTime.setHours(9, 0, 0, 0);
                            setFormData(prev => ({ 
                              ...prev, 
                              scheduledDate: dateTime.toISOString().slice(0, 16)
                            }));
                            // Close the popover after selecting a date
                            setIsDatePickerOpen(false);
                          }
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0); // Reset time to start of day
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-gray-500 mt-2">
                    Choose the date when the exam will be conducted (default time: 9:00 AM)
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Enter exam instructions"
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={!formData.title || formData.subjectIds.length === 0 || !formData.classId || !hasReferenceBookForSelectedSubjects()}
                    className="bg-blue-600 hover:bg-blue-700"
                    title={!hasReferenceBookForSelectedSubjects() ? "Reference book required for all selected subjects" : ""}
                  >
                    Create Exam
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

