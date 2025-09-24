import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Plus, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  Users,
  GraduationCap,
  FileText,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { syllabusAPI, classesAPI, subjectsAPI } from '@/services/api';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

interface Syllabus {
  _id: string;
  title: string;
  description: string;
  subjectId: {
    _id: string;
    name: string;
    code: string;
  };
  classId: {
    _id: string;
    name: string;
    displayName: string;
  };
  academicYear: string;
  units: any[];
  totalHours: number;
  version: string;
  language: string;
  fileUrl?: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const SyllabusList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    syllabus: Syllabus | null;
  }>({
    isOpen: false,
    syllabus: null
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  
  // Academic years
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [syllabiResponse, classesResponse, subjectsResponse] = await Promise.all([
          syllabusAPI.getAll(),
          classesAPI.getAll(),
          subjectsAPI.getAll(10)
        ]);
        
        setSyllabi(syllabiResponse.data || []);
        setClasses(classesResponse.data || []);
        setSubjects(subjectsResponse.data || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        toast({
          title: "Error",
          description: "Failed to load syllabi",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Filter syllabi
  const filteredSyllabi = syllabi.filter(syllabus => {
    const matchesSearch = syllabus.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         syllabus.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         syllabus.subjectId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         syllabus.classId.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'all' || syllabus.classId._id === selectedClass;
    const matchesSubject = selectedSubject === 'all' || syllabus.subjectId._id === selectedSubject;
    const matchesYear = selectedYear === 'all' || syllabus.academicYear === selectedYear;
    
    return matchesSearch && matchesClass && matchesSubject && matchesYear;
  });

  // Handle delete
  const handleDelete = async (syllabus: Syllabus) => {
    setDeleteModal({
      isOpen: true,
      syllabus
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.syllabus) return;

    try {
      await syllabusAPI.delete(deleteModal.syllabus._id);
      setSyllabi(prev => prev.filter(s => s._id !== deleteModal.syllabus!._id));
      toast({
        title: "Success",
        description: "Syllabus deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting syllabus:', err);
      toast({
        title: "Error",
        description: "Failed to delete syllabus",
        variant: "destructive"
      });
    } finally {
      setDeleteModal({ isOpen: false, syllabus: null });
    }
  };

  // Handle view
  const handleView = (syllabus: Syllabus) => {
    navigate(`/dashboard/syllabus/view/${syllabus._id}`);
  };

  // Handle edit
  const handleEdit = (syllabus: Syllabus) => {
    // Navigate to edit page
    navigate(`/dashboard/syllabus/edit/${syllabus._id}`);
  };
console.log(subjects,"subjects" )
  // Handle download
  const handleDownload = (syllabus: Syllabus) => {
    if (syllabus.fileUrl) {
      window.open(syllabus.fileUrl, '_blank');
    } else {
      toast({
        title: "No File",
        description: "No file available for download",
        variant: "destructive"
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading syllabi...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-destructive mb-4">
            <BookOpen className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Syllabi</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Syllabus Management</h1>
          </div>
          <p className="text-muted-foreground">
            View and manage all syllabi in the system
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button onClick={() => navigate('/dashboard/syllabus/upload')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Syllabus
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search syllabi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
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
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year} - {parseInt(year) + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedClass('all');
                  setSelectedSubject('all');
                  setSelectedYear('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredSyllabi.length} of {syllabi.length} syllabi
        </p>
      </div>

      {/* Syllabi Grid */}
      {filteredSyllabi.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Syllabi Found</h3>
            <p className="text-muted-foreground mb-4">
              {syllabi.length === 0 
                ? "No syllabi have been created yet." 
                : "No syllabi match your current filters."}
            </p>
            {syllabi.length === 0 && (
              <Button onClick={() => navigate('/dashboard/syllabus/upload')}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Syllabus
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredSyllabi.map((syllabus) => (
            <Card key={syllabus._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-2">{syllabus.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {syllabus.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{syllabus.version}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subject and Class */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{syllabus.subjectId.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{syllabus.classId.displayName}</span>
                  </div>
                </div>

                {/* Academic Year and Language */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{syllabus.academicYear}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {syllabus.language}
                  </Badge>
                </div>

                {/* Units and Hours */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>{syllabus.units.length} units</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{syllabus.totalHours}h</span>
                  </div>
                </div>

                {/* File Status */}
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {syllabus.fileUrl ? 'File attached' : 'No file'}
                  </span>
                </div>

                {/* Uploaded By */}
                <div className="text-xs text-muted-foreground">
                  Uploaded by {syllabus.uploadedBy.name} on{' '}
                  {new Date(syllabus.createdAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(syllabus)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(syllabus)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  {syllabus.fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(syllabus)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(syllabus)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, syllabus: null })}
        onConfirm={confirmDelete}
        title="Delete Syllabus"
        description="Are you sure you want to delete this syllabus? This action cannot be undone."
        itemName={deleteModal.syllabus?.title || ''}
      />
    </div>
  );
};

export default SyllabusList;
