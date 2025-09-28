import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Pagination } from '@/components/ui/pagination';
import { 
  BookOpen, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  FileText,
  Calendar,
  User,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { 
  syllabusAPI, 
  Syllabus, 
  CreateSyllabusRequest, 
  UpdateSyllabusRequest,
  classManagementAPI,
  subjectManagementAPI
} from '@/services/api';

const SyllabusManagement = () => {
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load classes and subjects in parallel
        await Promise.all([
          loadClasses(),
          loadSubjects()
        ]);
        
        // Load syllabi regardless of classes/subjects success
        await loadSyllabi();
      } catch (error) {
        console.error('Error initializing data:', error);
        // Still try to load syllabi even if classes/subjects fail
        await loadSyllabi();
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
        if (syllabi.length === 0) {
          setError('Loading timeout - please refresh the page');
        }
      }
    }, 15000); // 15 seconds fallback

    return () => clearTimeout(fallbackTimeout);
  }, [isLoading, syllabi.length]);

  const loadSyllabi = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const response = await Promise.race([
        syllabusAPI.getAll({
          search: searchTerm,
          subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
          classId: selectedClass !== 'all' ? selectedClass : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }),
        timeoutPromise
      ]) as any;
      console.log(response,'responseSyllabi');
      
      // Handle the API response structure: { success: true, data: [...], pagination: {...} }
      if (response.success && response.data) {
        setSyllabi(response.data);
      } else if (Array.isArray(response)) {
        // Fallback for direct array response
        setSyllabi(response);
      } else {
        setSyllabi([]);
      }
    } catch (error) {
      console.error('Error loading syllabi:', error);
      setError('Failed to load syllabi');
      setSyllabi([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await classManagementAPI.getAll();
      setClasses(Array.isArray(response) ? response : response.classes || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      setClasses([]);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await subjectManagementAPI.getAll();
      setSubjects(Array.isArray(response) ? response : response.subjects || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setSubjects([]);
    }
  };

  // Validate if subjects and classes are available before opening upload dialog
  const handleUploadDialogOpen = () => {
    if (subjects.length === 0 || classes.length === 0) {
      toast({
        title: "Setup Required",
        description: "Please add subjects and classes first before uploading syllabus.",
        variant: "destructive",
      });
      return;
    }
    setShowUploadDialog(true);
  };

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    subject: '',
    class: '',
    academicYear: '2024-25',
    term: '',
    description: '',
    file: null as File | null
  });

  const handleFileUpload = async () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.subject || !uploadForm.class) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First create the syllabus
      const syllabusData: CreateSyllabusRequest = {
        title: uploadForm.title,
        subjectId: uploadForm.subject,
        classId: uploadForm.class,
        academicYear: uploadForm.academicYear,
        term: uploadForm.term,
        description: uploadForm.description,
        language: 'ENGLISH' // Default language
      };

      const createdSyllabus = await syllabusAPI.create(syllabusData);
      
      // Then upload the file
      // const updatedSyllabus = await syllabusAPI.uploadFile(createdSyllabus.syllabus._id, uploadForm.file);

      setSyllabi(prev => [createdSyllabus.syllabus, ...prev]);
      setShowUploadDialog(false);
    setUploadForm({
      title: '',
      subject: '',
      class: '',
      academicYear: '2024-25',
      term: '',
      description: '',
      file: null
    });

      toast({
        title: "Syllabus Uploaded",
        description: "Syllabus has been successfully uploaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload syllabus",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSyllabus = async (id: string) => {
    try {
      await syllabusAPI.delete(id);
    setSyllabi(prev => prev.filter(s => s._id !== id));
    toast({
      title: "Syllabus Deleted",
      description: "Syllabus has been removed",
    });
    } catch (error) {
      console.error('Error deleting syllabus:', error);
      toast({
        title: "Error",
        description: "Failed to delete syllabus",
        variant: "destructive",
      });
    }
  };

  const handleDownloadSyllabus = (syllabus: any) => {
    // Simulate download
    toast({
      title: "Download Started",
      description: `Downloading ${syllabus.fileName}`,
    });
  };

  const filteredSyllabi = syllabi.filter(syllabus => {
    const matchesSearch = searchTerm === '' || 
                         syllabus.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         syllabus.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (syllabus.uploadedBy as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || 
                          (typeof syllabus.subjectId === 'string' ? syllabus.subjectId === selectedSubject : 
                           (syllabus.subjectId as any)?._id === selectedSubject);
    const matchesClass = selectedClass === 'all' || 
                        (typeof syllabus.classId === 'string' ? syllabus.classId === selectedClass : 
                         (syllabus.classId as any)?._id === selectedClass);
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' ? (syllabus as any).isActive === true : 
                          selectedStatus === 'inactive' ? (syllabus as any).isActive === false : true);

    // Debug logging
    console.log('Filtering syllabus:', {
      title: syllabus.title,
      subjectId: syllabus.subjectId,
      classId: syllabus.classId,
      isActive: (syllabus as any).isActive,
      selectedSubject,
      selectedClass,
      selectedStatus,
      matchesSearch,
      matchesSubject,
      matchesClass,
      matchesStatus,
      finalMatch: matchesSearch && matchesSubject && matchesClass && matchesStatus
    });

    return matchesSearch && matchesSubject && matchesClass && matchesStatus;
  });
  console.log('Filter values:', { searchTerm, selectedSubject, selectedClass, selectedStatus });
  console.log('Total syllabi:', syllabi.length);
  console.log('Filtered syllabi:', filteredSyllabi.length);

  // Pagination logic
  const totalPages = Math.ceil(filteredSyllabi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSyllabi = filteredSyllabi.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><AlertCircle className="w-3 h-3 mr-1" />Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Syllabus Management</h1>
          </div>
          <p className="text-muted-foreground">
            Upload and manage educational syllabi for different classes and subjects
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleUploadDialogOpen}
              className={subjects.length === 0 || classes.length === 0 ? "opacity-60" : ""}
              title={subjects.length === 0 || classes.length === 0 ? "Add subjects and classes first" : ""}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Syllabus
              {(subjects.length === 0 || classes.length === 0) && (
                <AlertTriangle className="w-4 h-4 ml-2 text-amber-500" />
              )}
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search syllabi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
              />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
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
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
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
              <span>Loading syllabi...</span>
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
                  loadSyllabi();
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

      {/* Syllabi List */}
      {!isLoading && !error && (
      <div className="space-y-4">
          {filteredSyllabi.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-4 text-muted-foreground">
                  <BookOpen className="w-5 h-5" />
                  <span>No syllabi found. Upload your first syllabus!</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsLoading(true);
                      loadSyllabi();
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
            paginatedSyllabi.map((syllabus) => (
          <Card key={(syllabus as any)._id || syllabus.id} className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  {/* Syllabus Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{syllabus.title}</h3>
                      <div className="flex items-center space-x-4">
                        <Badge className="bg-blue-100 text-blue-800">
                              {(syllabus.subjectId as any)?.name || 'Unknown Subject'}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                              {(syllabus.classId as any)?.displayName || (syllabus.classId as any)?.name || 'Unknown Class'}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          {(syllabus as any).language || 'ENGLISH'}
                        </Badge>
                        <Badge className="bg-orange-100 text-orange-800">
                          {syllabus.academicYear}
                        </Badge>
                        {getStatusBadge((syllabus as any).isActive ? 'active' : 'inactive')}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">{syllabus.description}</p>

                  {/* File Information */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{(syllabus as any).fileName || 'No file uploaded'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Uploaded: {(syllabus as any).createdAt ? new Date((syllabus as any).createdAt).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">By: {(syllabus.uploadedBy as any)?.name || 'Unknown'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                            <Download className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Downloads: {(syllabus as any).downloadCount || 0}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Version: {syllabus.version}</span>
                      </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Size: {(syllabus as any).fileSize || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadSyllabus(syllabus)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSyllabus((syllabus as any)._id || syllabus.id)}
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

      {/* Pagination */}
      {filteredSyllabi.length >= 10 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredSyllabi.length}
          />
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload New Syllabus
            </DialogTitle>
            <DialogDescription>
              Upload a syllabus document for a specific class and subject
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Setup Required Message */}
            {(subjects.length === 0 || classes.length === 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-amber-800">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Setup Required</p>
                    <p className="text-sm">
                      {subjects.length === 0 && classes.length === 0 
                        ? "Please add subjects and classes first before uploading syllabus."
                        : subjects.length === 0 
                        ? "Please add subjects first."
                        : "Please add classes first."
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Syllabus Title *</Label>
              <Input
                placeholder="Enter syllabus title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select 
                  value={uploadForm.subject} 
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, subject: value }))}
                  disabled={subjects.length === 0}
                >
                  <SelectTrigger className={subjects.length === 0 ? "opacity-50" : ""}>
                    <SelectValue placeholder={subjects.length === 0 ? "No subjects available" : "Select subject"} />
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
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select 
                  value={uploadForm.class} 
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, class: value }))}
                  disabled={classes.length === 0}
                >
                  <SelectTrigger className={classes.length === 0 ? "opacity-50" : ""}>
                    <SelectValue placeholder={classes.length === 0 ? "No classes available" : "Select class"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id || cls.id} value={cls._id || cls.id}>
                        {cls.displayName || cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select value={uploadForm.academicYear} onValueChange={(value) => setUploadForm(prev => ({ ...prev, academicYear: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                    <SelectItem value="2023-24">2023-24</SelectItem>
                    <SelectItem value="2025-26">2025-26</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={uploadForm.term} onValueChange={(value) => setUploadForm(prev => ({ ...prev, term: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Full Year">Full Year</SelectItem>
                    <SelectItem value="Mid Term">Mid Term</SelectItem>
                    <SelectItem value="Final Term">Final Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter syllabus description..."
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>


            <div className="space-y-2">
              <Label>Upload File *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                </label>
                {uploadForm.file && (
                  <p className="text-sm text-primary mt-2">
                    Selected: {uploadForm.file.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFileUpload}
                disabled={isLoading || !uploadForm.file || !uploadForm.title || !uploadForm.subject || !uploadForm.class || subjects.length === 0 || classes.length === 0}
              >
                {isLoading ? "Uploading..." : "Upload Syllabus"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SyllabusManagement;