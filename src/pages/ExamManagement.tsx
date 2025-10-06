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
import { Exam, CreateExamRequest, examsAPI, subjectManagementAPI, classManagementAPI } from '@/services/api';

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateExamRequest>({
    title: '',
    description: '',
    examType: 'UNIT_TEST',
    subjectId: '',
    classId: '',
    adminId: '', // Will be set from current user if not provided
    totalMarks: 100,
    duration: 60,
    scheduledDate: '',
    endDate: '',
    instructions: '',
    allowLateSubmission: false,
    lateSubmissionPenalty: 0
  });

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
      const [examsResponse, subjectsResponse, classesResponse] = await Promise.all([
        examsAPI.getAll(filters).catch(() => null),
        subjectManagementAPI.getAll().catch(() => null),
        classManagementAPI.getAll().catch(() => null)
      ]);
      console.log("examsResponse",examsResponse)
      console.log("subjectsResponse",subjectsResponse)
      console.log("classesResponse",classesResponse)

      if (examsResponse && subjectsResponse && classesResponse) {
        // Backend data available
        setExams(examsResponse?.data || []);
        setSubjects(subjectsResponse.subjects || []);
        setClasses(classesResponse.classes || []);
        console.log('✅ Loaded data from backend');
      } else {
        // Fallback to mock data
        console.log('⚠️ Backend unavailable, using mock data');
        // loadMockData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to mock data on error
      // loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockExams = [
      {
        _id: '1',
        id: '1',
        title: 'Mathematics Unit Test - Chapter 1',
        description: 'Unit test covering basic algebra and geometry concepts',
        examType: 'UNIT_TEST' as const,
        subjectId: 'subj1',
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
        _id: '2',
        id: '2',
        title: 'Physics Final Exam',
        description: 'Comprehensive final examination covering all physics topics',
        examType: 'FINAL' as const,
        subjectId: 'subj2',
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
      { _id: 'subj1', id: 'subj1', name: 'Mathematics', code: 'MATH' },
      { _id: 'subj2', id: 'subj2', name: 'Physics', code: 'PHY' }
    ];

    const mockClasses = [
      { _id: 'class1', id: 'class1', name: '10A', displayName: 'Class 10A' },
      { _id: 'class2', id: 'class2', name: '11B', displayName: 'Class 11B' }
    ];

    setExams(mockExams);
    setSubjects(mockSubjects);
    setClasses(mockClasses);

    // ✅ Critical fix: stop loading spinner
    setLoading(false);
  };

  const handleCreate = async () => {
    try {
      // Prepare data for API call - remove empty adminId to avoid validation error
      const { adminId, ...examData } = formData;
      const apiData = adminId ? { ...examData, adminId } : examData;
      
      // Try backend API first
      const newExam = await examsAPI.create(apiData);
      setExams(prev => [newExam, ...prev]);
      toast({
        title: "Success",
        description: "Exam created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Backend create failed, using mock data:', error);
      // Fallback to mock creation
      const newExam: Exam = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        examType: formData.examType,
        subjectId: formData.subjectId,
        classId: formData.classId,
        totalMarks: formData.totalMarks,
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
      setExams(prev => prev.filter(exam => exam.id !== id));
      toast({
        title: "Success",
        description: "Exam deleted successfully",
      });
    } catch (error) {
      console.error('Backend delete failed, using mock data:', error);
      // Fallback to mock deletion
      setExams(prev => prev.filter(exam => exam.id !== id));
      toast({
        title: "Success",
        description: "Exam deleted successfully (offline mode)",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      examType: 'UNIT_TEST',
      subjectId: '',
      classId: '',
      adminId: '',
      totalMarks: 100,
      duration: 60,
      scheduledDate: '',
      endDate: '',
      instructions: '',
      allowLateSubmission: false,
      lateSubmissionPenalty: 0
    });
    setSelectedDate(undefined);
  };

  const initializeDate = (dateTimeString: string) => {
    if (dateTimeString) {
      const date = new Date(dateTimeString);
      setSelectedDate(date);
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
                          <span>{new Date(exam.scheduledDate).toLocaleDateString()}</span>
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
                          <span>{subjects.find(s => s._id === exam.subjectId?._id)?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          <span>{classes.find(c => c._id === exam.classId?._id)?.displayName}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(exam.id)}
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

      {/* Create Exam Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Exam</DialogTitle>
            <DialogDescription>Create a new exam for a specific class and subject</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
                <Label htmlFor="type">Exam Type</Label>
                <Select 
                  value={formData.examType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, examType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNIT_TEST">Unit Test</SelectItem>
                    <SelectItem value="FINAL">Final Exam</SelectItem>
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
                placeholder="Enter exam description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  value={formData.subjectId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length === 0 ? (
                      <SelectItem value="" disabled>No subjects available. Create subjects first.</SelectItem>
                    ) : (
                      subjects.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="class">Class</Label>
                <Select 
                  value={formData.classId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length === 0 ? (
                      <SelectItem value="" disabled>No classes available. Create classes first.</SelectItem>
                    ) : (
                      classes.map((cls) => (
                        <SelectItem key={cls._id} value={cls._id}>
                          {cls.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 0 }))}
                  placeholder="100"
                />
              </div>
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
                <Popover>
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
                        }
                      }}
                      disabled={(date) => date < new Date()}
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
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!formData.title || !formData.subjectId || !formData.classId}
            >
              Create Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
