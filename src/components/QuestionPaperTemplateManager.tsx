import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ViewButton } from '@/components/ui/view-button';
import { 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  BookOpen,
  AlertCircle,
  CheckCircle,
  Plus,
  Eye
} from 'lucide-react';
import { questionPaperTemplateAPI } from '@/services/api';
import { authAPI, subjectManagementAPI } from '@/services/api';
import { QuestionPaperTemplate, CreateTemplateRequest } from '@/types/question-paper-template';

interface QuestionPaperTemplateManagerProps {
  subjectId: string;
  subjectName: string;
  onUpdate: () => void;
}

export default function QuestionPaperTemplateManager({ 
  subjectId, 
  subjectName,
  onUpdate 
}: QuestionPaperTemplateManagerProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [templates, setTemplates] = useState<QuestionPaperTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const { toast } = useToast();

  // Exam types
  const examTypes = [
    { value: 'UNIT_TEST', label: 'Unit Test' },
    { value: 'MID_TERM', label: 'Mid Term' },
    { value: 'FINAL', label: 'Final Exam' },
    { value: 'QUIZ', label: 'Quiz' },
    { value: 'ASSIGNMENT', label: 'Assignment' },
    { value: 'PRACTICAL', label: 'Practical' },
    { value: 'DAILY', label: 'Daily Test' },
    { value: 'WEEKLY', label: 'Weekly Test' },
    { value: 'MONTHLY', label: 'Monthly Test' },
    { value: 'UNIT_WISE', label: 'Unit Wise' },
    { value: 'PAGE_WISE', label: 'Page Wise' },
    { value: 'TERM_TEST', label: 'Term Test' },
    { value: 'ANNUAL_EXAM', label: 'Annual Exam' },
    { value: 'CUSTOM_EXAM', label: 'Custom Exam' }
  ];

  // Upload form state
  const [uploadForm, setUploadForm] = useState<CreateTemplateRequest>({
    title: '',
    description: '',
    subjectId: subjectId,
    examType: 'UNIT_TEST'
  });

  // Load templates for this subject
  const loadTemplates = useCallback(async () => {
    try {
      setIsLoadingTemplates(true);
      const templates = await questionPaperTemplateAPI.getAll({ subjectId });
      setTemplates(templates as unknown as QuestionPaperTemplate[] || []);
    } catch (error) {
      setTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [subjectId]);

  // Load subjects
  const loadSubjects = useCallback(async () => {
    try {
      const subjectsResponse = await subjectManagementAPI.getAll();
      setSubjects(subjectsResponse.subjects || []);
    } catch (error) {
    }
  }, []);

  // Load templates when component mounts
  useEffect(() => {
    loadTemplates();
    loadSubjects();
  }, [subjectId, loadTemplates, loadSubjects]);


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadForm.title || !uploadForm.examType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a file",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      const templateData: CreateTemplateRequest = {
        ...uploadForm,
        templateFile: uploadFile
      };

      const response = await questionPaperTemplateAPI.create(templateData);
      
      // Show validation results if available
      if (response.validation) {
        setValidationResult(response.validation);
        
        if (response.validation.isValid) {
          toast({
            title: "Success",
            description: `Template uploaded successfully! Confidence: ${response.validation.confidence}%`,
          });
        } else {
          toast({
            title: "Template uploaded with warnings",
            description: `Template uploaded but validation failed. Confidence: ${response.validation.confidence}%`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Question paper template uploaded successfully",
        });
      }
      
      setIsUploadDialogOpen(false);
      setUploadFile(null);
      setUploadForm({
        title: '',
        description: '',
        subjectId: subjectId,
        examType: 'UNIT_TEST'
      });
      setValidationResult(null);
      
      // Refresh templates locally
      await loadTemplates();
      // Also notify parent for any other updates
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload template",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (templateId: string, fileName: string) => {
    try {
      // Check if user is authenticated before attempting download
      const currentUser = authAPI.getCurrentUser();
      const token = localStorage.getItem('auth-token');
      
      if (!currentUser || !token) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to download the template",
          variant: "destructive",
        });
        return;
      }

      setIsDownloading(true);
      await questionPaperTemplateAPI.download(templateId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to download template";
      
      // Check if it's an authentication error
      if (errorMessage.includes('authentication token') || errorMessage.includes('Authorization header')) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to download the template",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      setIsDeleting(true);
      await questionPaperTemplateAPI.delete(templateToDelete);
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
      // Refresh templates locally
      await loadTemplates();
      // Also notify parent for any other updates
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <BookOpen className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs font-medium">Question Paper Templates</span>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {templates.length} template{templates.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 px-2 w-full sm:w-auto">
              <Plus className="h-3 w-3 mr-1" />
              <span className="text-xs">Upload</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>Upload Question Paper Template</DialogTitle>
              <DialogDescription>
                Upload a sample question paper PDF to use as a template for {subjectName}
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
                <Label htmlFor="examType">Exam Type *</Label>
                <Select
                  value={uploadForm.examType}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, examType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label>Upload Template File *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="template-upload"
                  />
                  <label htmlFor="template-upload" className="cursor-pointer">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF files only, up to 10MB
                    </p>
                  </label>
                  {uploadFile && (
                    <p className="text-xs sm:text-sm text-primary mt-2 truncate">
                      Selected: {uploadFile.name}
                    </p>
                  )}
                </div>
              </div>

              {validationResult && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2 mb-2">
                    {validationResult.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="text-sm font-medium">
                      AI Validation Results (Confidence: {validationResult.confidence}%)
                    </span>
                  </div>
                  
                  {validationResult.warnings && validationResult.warnings.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-yellow-700 mb-1">Warnings:</p>
                      <ul className="text-xs text-yellow-600 list-disc list-inside">
                        {validationResult.warnings.map((warning: string, index: number) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Suggestions:</p>
                      <ul className="text-xs text-blue-600 list-disc list-inside">
                        {validationResult.suggestions.map((suggestion: string, index: number) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !uploadFile || !uploadForm.title || !uploadForm.examType}
                  className="w-full sm:w-auto"
                >
                  {isUploading ? "Uploading..." : "Upload Template"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingTemplates ? (
        <div className="space-y-1.5 max-h-28">
          <div className="flex items-center justify-center p-4">
            <div className="text-xs text-muted-foreground">Loading templates...</div>
          </div>
        </div>
      ) : templates.length > 0 ? (
        <div className="space-y-1.5 max-h-28 overflow-y-auto">
          {templates.map((template) => (
            <div key={template._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-0 p-2 border rounded bg-gray-50/50">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1">
                    <p className="text-xs font-medium truncate">{template.title}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{template.examType?.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{formatFileSize(template.templateFile.fileSize)}</span>
                  </div>
                  {template.aiValidation && (
                    <div className="flex items-center space-x-1 mt-1">
                      {template.aiValidation.isValid ? (
                        <CheckCircle className="h-2.5 w-2.5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-2.5 w-2.5 text-yellow-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        AI Confidence: {template.aiValidation.confidence}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end sm:justify-start space-x-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(template._id, template.templateFile.fileName)}
                  disabled={isDownloading}
                  className="h-5 px-1.5 flex-1 sm:flex-none"
                >
                  <Download className="h-2.5 w-2.5 mr-1 sm:mr-0" />
                  <span className="sm:hidden text-xs">Download</span>
                </Button>
                <ViewButton
                  onClick={() => handleDownload(template._id, template.templateFile.fileName)}
                  disabled={isDownloading}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTemplateToDelete(template._id);
                    setIsDeleteDialogOpen(true);
                  }}
                  disabled={isDeleting}
                  className="h-5 px-1.5 flex-1 sm:flex-none"
                >
                  <Trash2 className="h-2.5 w-2.5 mr-1 sm:mr-0" />
                  <span className="sm:hidden text-xs">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-2 text-muted-foreground">
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-muted-foreground/50" />
          <p className="text-xs">No templates uploaded yet</p>
          <p className="text-xs">Upload a sample question paper to use as a template</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
