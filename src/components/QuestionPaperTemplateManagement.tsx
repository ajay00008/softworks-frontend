import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { 
  FileText, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { questionPaperTemplateAPI, subjectManagementAPI } from '@/services/api';
import { QuestionPaperTemplate, CreateTemplateRequest } from '@/types/question-paper-template';
import { Subject } from '@/types/subject';

const QuestionPaperTemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<QuestionPaperTemplate[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const { toast } = useToast();

  // Upload form state
  const [uploadForm, setUploadForm] = useState<CreateTemplateRequest>({
    title: '',
    description: '',
    subjectId: ''
  });
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  useEffect(() => {
    loadTemplates();
    loadSubjects();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await questionPaperTemplateAPI.getAll({
        subjectId: filterSubject || undefined
      });
      setTemplates(templatesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load templates",
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

  const loadClasses = async () => {
    try {
      const classesData = await classesAPI.getAll();
      setClasses(classesData.classes || []);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!templateFile || !uploadForm.title || !uploadForm.subjectId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const templateData: CreateTemplateRequest = {
        ...uploadForm,
        templateFile: templateFile
      };

      const createdTemplate = await questionPaperTemplateAPI.create(templateData);
      
      setTemplates(prev => [createdTemplate, ...prev]);
      setShowUploadDialog(false);
      setUploadForm({
        title: '',
        description: '',
        subjectId: ''
      });
      setTemplateFile(null);

      toast({
        title: "Template Uploaded",
        description: "Question paper template has been successfully uploaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await questionPaperTemplateAPI.delete(id);
      setTemplates(prev => prev.filter(template => template._id !== id));
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTemplate = async (id: string) => {
    try {
      await questionPaperTemplateAPI.download(id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  const handleAnalyzeTemplate = async (id: string) => {
    try {
      await questionPaperTemplateAPI.analyze(id);
      toast({
        title: "Success",
        description: "Template analyzed successfully",
      });
      loadTemplates(); // Reload to get updated analysis
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze template",
        variant: "destructive",
      });
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Paper Templates</h1>
          <p className="text-gray-600">Manage question paper templates for consistent formatting</p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Question Paper Template</DialogTitle>
              <DialogDescription>
                Upload a sample question paper to use as a template for generating new question papers.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Template Title *</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Mathematics Class 10 Template"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the template pattern and usage..."
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
                <Label>Upload Template File *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="template-upload"
                  />
                  <label htmlFor="template-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF files only, up to 10MB
                    </p>
                  </label>
                  {templateFile && (
                    <p className="text-sm text-primary mt-2">
                      Selected: {templateFile.name}
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
                  disabled={loading || !templateFile || !uploadForm.title || !uploadForm.subjectId}
                >
                  {loading ? "Uploading..." : "Upload Template"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
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
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls._id} value={cls._id}>
                {cls.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={loadTemplates} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {template.subjectId.name} - {template.classId.displayName}
                  </p>
                </div>
                <Badge variant="outline">{template.language}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {template.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {template.description}
                </p>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">File Size:</span>
                  <span>{(template.templateFile.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Uploaded:</span>
                  <span>{new Date(template.templateFile.uploadedAt).toLocaleDateString()}</span>
                </div>
                {template.analysis.totalQuestions > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Questions:</span>
                    <span>{template.analysis.totalQuestions}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadTemplate(template._id)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAnalyzeTemplate(template._id)}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Analyze
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteTemplate(template._id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterSubject || filterClass 
              ? "Try adjusting your search or filters"
              : "Upload your first question paper template to get started"
            }
          </p>
          {!searchTerm && !filterSubject && !filterClass && (
            <Button onClick={() => setShowUploadDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Template
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionPaperTemplateManagement;
