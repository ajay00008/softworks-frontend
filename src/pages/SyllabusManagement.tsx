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
  Clock
} from 'lucide-react';

// Mock data
const mockSyllabi = [
  {
    id: '1',
    title: 'Mathematics Class 11A - Term 1',
    subject: 'Mathematics',
    class: '11A',
    academicYear: '2024-25',
    term: 'Term 1',
    description: 'Complete syllabus for Mathematics Class 11A Term 1 including Algebra, Trigonometry, and Calculus basics.',
    fileName: 'math_11a_term1.pdf',
    fileSize: '2.4 MB',
    uploadedBy: 'Dr. Sarah Johnson',
    uploadedAt: '2024-01-15',
    version: '1.0',
    status: 'active',
    downloadCount: 45,
    lastModified: '2024-01-15'
  },
  {
    id: '2',
    title: 'Physics Class 11A - Complete Syllabus',
    subject: 'Physics',
    class: '11A',
    academicYear: '2024-25',
    term: 'Full Year',
    description: 'Comprehensive Physics syllabus covering Mechanics, Thermodynamics, and Waves.',
    fileName: 'physics_11a_complete.pdf',
    fileSize: '3.1 MB',
    uploadedBy: 'Prof. Michael Chen',
    uploadedAt: '2024-01-14',
    version: '2.1',
    status: 'active',
    downloadCount: 32,
    lastModified: '2024-01-20'
  },
  {
    id: '3',
    title: 'Chemistry Class 11B - Term 2',
    subject: 'Chemistry',
    class: '11B',
    academicYear: '2024-25',
    term: 'Term 2',
    description: 'Chemistry syllabus for Term 2 covering Organic Chemistry and Chemical Bonding.',
    fileName: 'chemistry_11b_term2.pdf',
    fileSize: '1.8 MB',
    uploadedBy: 'Ms. Emily Davis',
    uploadedAt: '2024-01-13',
    version: '1.0',
    status: 'draft',
    downloadCount: 18,
    lastModified: '2024-01-13'
  }
];

const SyllabusManagement = () => {
  const [syllabi, setSyllabi] = useState(mockSyllabi);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newSyllabus = {
        id: `syllabus-${Date.now()}`,
        title: uploadForm.title,
        subject: uploadForm.subject,
        class: uploadForm.class,
        academicYear: uploadForm.academicYear,
        term: uploadForm.term,
        description: uploadForm.description,
        fileName: uploadForm.file.name,
        fileSize: `${(uploadForm.file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedBy: 'Current User', // Replace with actual user
        uploadedAt: new Date().toISOString().split('T')[0],
        version: '1.0',
        status: 'active',
        downloadCount: 0,
        lastModified: new Date().toISOString().split('T')[0]
      };

      setSyllabi(prev => [newSyllabus, ...prev]);
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

  const handleDeleteSyllabus = (id: string) => {
    setSyllabi(prev => prev.filter(s => s.id !== id));
    toast({
      title: "Syllabus Deleted",
      description: "Syllabus has been removed",
    });
  };

  const handleDownloadSyllabus = (syllabus: any) => {
    // Simulate download
    toast({
      title: "Download Started",
      description: `Downloading ${syllabus.fileName}`,
    });
  };

  const filteredSyllabi = syllabi.filter(syllabus => {
    const matchesSearch = syllabus.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         syllabus.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         syllabus.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || syllabus.subject === selectedSubject;
    const matchesClass = selectedClass === 'all' || syllabus.class === selectedClass;
    const matchesStatus = selectedStatus === 'all' || syllabus.status === selectedStatus;

    return matchesSearch && matchesSubject && matchesClass && matchesStatus;
  });

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
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Syllabus
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Syllabi</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{syllabi.length}</div>
            <p className="text-xs text-muted-foreground">Uploaded documents</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/20 border-success/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Syllabi</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {syllabi.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/20 border-warning/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {syllabi.reduce((sum, s) => sum + s.downloadCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time downloads</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/20 border-accent/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects Covered</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {new Set(syllabi.map(s => s.subject)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search & Filter Syllabi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search syllabi..."
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

      {/* Syllabi List */}
      <div className="space-y-4">
        {filteredSyllabi.map((syllabus) => (
          <Card key={syllabus.id} className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  {/* Syllabus Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{syllabus.title}</h3>
                      <div className="flex items-center space-x-4">
                        <Badge className="bg-blue-100 text-blue-800">
                          {syllabus.subject}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {syllabus.class}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          {syllabus.term}
                        </Badge>
                        <Badge className="bg-orange-100 text-orange-800">
                          {syllabus.academicYear}
                        </Badge>
                        {getStatusBadge(syllabus.status)}
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
                        <span className="text-sm font-medium">File Information:</span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>File:</strong> {syllabus.fileName}</p>
                        <p><strong>Size:</strong> {syllabus.fileSize}</p>
                        <p><strong>Version:</strong> {syllabus.version}</p>
                        <p><strong>Downloads:</strong> {syllabus.downloadCount}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Upload Information:</span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Uploaded by:</strong> {syllabus.uploadedBy}</p>
                        <p><strong>Uploaded:</strong> {syllabus.uploadedAt}</p>
                        <p><strong>Last modified:</strong> {syllabus.lastModified}</p>
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
                    onClick={() => handleDeleteSyllabus(syllabus.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                <Select value={uploadForm.subject} onValueChange={(value) => setUploadForm(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select value={uploadForm.class} onValueChange={(value) => setUploadForm(prev => ({ ...prev, class: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11A">Class 11A</SelectItem>
                    <SelectItem value="11B">Class 11B</SelectItem>
                    <SelectItem value="11C">Class 11C</SelectItem>
                    <SelectItem value="12A">Class 12A</SelectItem>
                    <SelectItem value="12B">Class 12B</SelectItem>
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
                    <SelectValue placeholder="Select term" />
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
                  accept=".pdf,.doc,.docx,.txt"
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
                    PDF, DOC, DOCX, TXT (Max 10MB)
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
                disabled={isLoading || !uploadForm.file || !uploadForm.title || !uploadForm.subject || !uploadForm.class}
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

