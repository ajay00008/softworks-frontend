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
import { samplePaperAPI } from '@/services/api';
import { SamplePaper, CreateSamplePaperRequest } from '@/types/sample-paper';

interface SamplePaperManagerProps {
  subjectId: string;
  subjectName: string;
  samplePapers?: SamplePaper[];
  onUpdate: () => void;
}

export default function SamplePaperManager({ 
  subjectId, 
  subjectName,
  samplePapers = [], 
  onUpdate 
}: SamplePaperManagerProps) {
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [samplePaperToDelete, setSamplePaperToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Upload form state
  const [uploadForm, setUploadForm] = useState<CreateSamplePaperRequest>({
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
      const samplePaperData: CreateSamplePaperRequest = {
        ...uploadForm,
        sampleFile: uploadFile
      };

      await samplePaperAPI.create(samplePaperData);
      toast({
        title: "Success",
        description: "Sample paper uploaded successfully",
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
        description: "Failed to upload sample paper",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (samplePaperId: string, fileName: string) => {
    try {
      setIsDownloading(true);
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
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!samplePaperToDelete) return;
    
    try {
      setIsDeleting(true);
      await samplePaperAPI.delete(samplePaperToDelete);
      toast({
        title: "Success",
        description: "Sample paper deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSamplePaperToDelete(null);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sample paper",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sample Papers for {subjectName}</h3>
          <p className="text-sm text-muted-foreground">
            Upload sample question papers to use as design templates for generating new papers
          </p>
        </div>
        <Dialog>
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
                Upload a sample question paper PDF to use as a design template for {subjectName}
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
                <Label htmlFor="file">Sample Paper File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
                {uploadFile && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Sample Paper'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sample Papers List */}
      {samplePapers.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Sample Papers</h3>
          <p className="text-muted-foreground mb-4">
            Upload sample papers to use as design templates for generating new question papers.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {samplePapers.map((samplePaper) => (
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
                    disabled={isDownloading}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSamplePaperToDelete(samplePaper._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sample Paper</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sample paper? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
