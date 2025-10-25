import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
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
import { QuestionPaperTemplate, CreateTemplateRequest } from '@/types/question-paper-template';

interface QuestionPaperTemplateManagerProps {
  subjectId: string;
  subjectName: string;
  templates?: QuestionPaperTemplate[];
  onUpdate: () => void;
}

export default function QuestionPaperTemplateManager({ 
  subjectId, 
  subjectName,
  templates = [], 
  onUpdate 
}: QuestionPaperTemplateManagerProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Upload form state
  const [uploadForm, setUploadForm] = useState<CreateTemplateRequest>({
    title: '',
    description: '',
    subjectId: subjectId
  });


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
    if (!uploadFile || !uploadForm.title) {
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

      await questionPaperTemplateAPI.create(templateData);
      toast({
        title: "Success",
        description: "Question paper template uploaded successfully",
      });
      setIsUploadDialogOpen(false);
      setUploadFile(null);
      setUploadForm({
        title: '',
        description: '',
        subjectId: subjectId
      });
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
      console.error('Download error:', error);
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">Question Paper Templates</span>
          <Badge variant="outline" className="text-xs">
            {templates.length} template{templates.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 px-2">
              <Plus className="h-3 w-3 mr-1" />
              <span className="text-xs">Upload</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
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
                  {uploadFile && (
                    <p className="text-sm text-primary mt-2">
                      Selected: {uploadFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !uploadFile || !uploadForm.title}
                >
                  {isUploading ? "Uploading..." : "Upload Template"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length > 0 ? (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {templates.map((template) => (
            <div key={template._id} className="flex items-center justify-between p-2 border rounded bg-gray-50">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{template.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(template.templateFile.fileSize)} • {template.language}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(template._id, template.templateFile.fileName)}
                  disabled={isDownloading}
                  className="h-6 px-2"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTemplateToDelete(template._id);
                    setIsDeleteDialogOpen(true);
                  }}
                  disabled={isDeleting}
                  className="h-6 px-2"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-2 text-muted-foreground">
          <BookOpen className="h-6 w-6 mx-auto mb-1 text-muted-foreground/50" />
          <p className="text-xs">No templates uploaded yet</p>
          <p className="text-xs">Upload a sample question paper to use as a template</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
