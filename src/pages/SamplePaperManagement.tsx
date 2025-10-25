import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  Search,
  Filter,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { samplePaperAPI, subjectManagementAPI } from '@/services/api';
import { SamplePaper, CreateSamplePaperRequest } from '@/types/sample-paper';
import { Subject } from '@/types/subject';

const SamplePaperManagement: React.FC = () => {
  const [samplePapers, setSamplePapers] = useState<SamplePaper[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const { toast } = useToast();

  // Upload form state
  const [uploadForm, setUploadForm] = useState<CreateSamplePaperRequest>({
    title: '',
    description: '',
    subjectId: ''
  });
  const [sampleFile, setSampleFile] = useState<File | null>(null);

  useEffect(() => {
    loadSamplePapers();
    loadSubjects();
  }, []);

  const loadSamplePapers = async () => {
    try {
      setLoading(true);
      const samplePapersData = await samplePaperAPI.getAll({
        subjectId: filterSubject || undefined
      });
      setSamplePapers(samplePapersData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sample papers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const subjectsData = await subjectManagementAPI.getAll();
      setSubjects(subjectsData.subjects || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };


  const handleFileUpload = async () => {
    if (!sampleFile || !uploadForm.title || !uploadForm.subjectId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a file",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const samplePaperData: CreateSamplePaperRequest = {
        ...uploadForm,
        sampleFile: sampleFile
      };

      const createdSamplePaper = await samplePaperAPI.create(samplePaperData);
      
      setSamplePapers(prev => [createdSamplePaper, ...prev]);
      setShowUploadDialog(false);
      setUploadForm({
        title: '',
        description: '',
        subjectId: ''
      });
      setSampleFile(null);

      toast({
        title: "Sample Paper Uploaded",
        description: "Sample paper has been successfully uploaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload sample paper",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (samplePaperId: string, fileName: string) => {
    try {
      await samplePaperAPI.download(samplePaperId);
      toast({
        title: "Success",
        description: "Sample paper downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download sample paper",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (samplePaperId: string) => {
    try {
      await samplePaperAPI.delete(samplePaperId);
      setSamplePapers(prev => prev.filter(sp => sp._id !== samplePaperId));
      toast({
        title: "Success",
        description: "Sample paper deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sample paper",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSamplePapers = samplePapers.filter(samplePaper => {
    const matchesSearch = samplePaper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         samplePaper.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sample Paper Management</h1>
          <p className="text-muted-foreground">
            Upload and manage sample question papers to use as design templates
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Sample Paper
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Sample Question Paper</DialogTitle>
              <DialogDescription>
                Upload a sample question paper to use as a design template for generating new question papers.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Sample Paper Title *</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Mathematics Class 10 Sample Paper"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the sample paper pattern and usage..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={uploadForm.subjectId}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, subjectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
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

              <div>
                <Label htmlFor="file">Sample Paper File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSampleFile(e.target.files?.[0] || null)}
                />
                {sampleFile && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Selected: {sampleFile.name} ({formatFileSize(sampleFile.size)})
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleFileUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Sample Paper'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sample papers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject._id} value={subject._id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadSamplePapers}>
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
      </div>

      {/* Sample Papers List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading sample papers...</p>
        </div>
      ) : filteredSamplePapers.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Sample Papers Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterSubject 
              ? "No sample papers match your current filters."
              : "Upload sample papers to use as design templates for generating new question papers."
            }
          </p>
          {!searchTerm && !filterSubject && (
            <Button onClick={() => setShowUploadDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Your First Sample Paper
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSamplePapers.map((samplePaper) => (
            <div key={samplePaper._id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{samplePaper.title}</h4>
                    <Badge variant="secondary">v{samplePaper.version}</Badge>
                    {samplePaper.templateSettings.useAsTemplate && (
                      <Badge variant="outline">Template</Badge>
                    )}
                  </div>
                  
                  {samplePaper.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {samplePaper.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Subject: {samplePaper.subjectId.name}</span>
                    <span>•</span>
                    <span>Size: {formatFileSize(samplePaper.sampleFile.fileSize)}</span>
                    <span>•</span>
                    <span>Uploaded: {formatDate(samplePaper.sampleFile.uploadedAt)}</span>
                  </div>
                  
                  {samplePaper.analysis && samplePaper.analysis.totalQuestions > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span>Questions: {samplePaper.analysis.totalQuestions}</span>
                      <span className="mx-2">•</span>
                      <span>Marks: {samplePaper.analysis.markDistribution.totalMarks}</span>
                      {samplePaper.analysis.questionTypes.length > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Types: {samplePaper.analysis.questionTypes.join(', ')}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(samplePaper._id, samplePaper.sampleFile.fileName)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(samplePaper._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SamplePaperManagement;
