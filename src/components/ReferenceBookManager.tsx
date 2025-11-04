import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { subjectManagementAPI } from '@/services/api';

interface ReferenceBookManagerProps {
  subjectId: string;
  referenceBook?: {
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    uploadedAt: string;
    uploadedBy: string;
  };
  onUpdate: () => void;
}

export default function ReferenceBookManager({ 
  subjectId, 
  referenceBook, 
  onUpdate 
}: ReferenceBookManagerProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isValidatingFile, setIsValidatingFile] = useState(false);
  const [fileExists, setFileExists] = useState<boolean | null>(null);
  const { toast } = useToast();

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
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 50MB",
          variant: "destructive",
        });
        return;
      }
      
      setUploadFile(file);
    } else {
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    
    
    try {
      setIsUploading(true);
      const result = await subjectManagementAPI.uploadReferenceBook(subjectId, uploadFile);
      toast({
        title: "Success",
        description: "Reference book uploaded successfully",
      });
      setIsUploadDialogOpen(false);
      setUploadFile(null);
      onUpdate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload reference book";
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await subjectManagementAPI.downloadReferenceBook(subjectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = referenceBook?.originalName || 'reference-book.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download reference book",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await subjectManagementAPI.deleteReferenceBook(subjectId);
      toast({
        title: "Success",
        description: "Reference book deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete reference book",
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

  // Validate if the reference book file actually exists on the server
  const validateFileExists = async () => {
    if (!referenceBook || !referenceBook.fileName) {
      setFileExists(false);
      return;
    }

    try {
      setIsValidatingFile(true);
      // Check if the file exists using the new endpoint
      const result = await subjectManagementAPI.checkReferenceBookExists(subjectId);
      setFileExists(result.exists);
    } catch (error) {
      setFileExists(false);
    } finally {
      setIsValidatingFile(false);
    }
  };

  // Check file existence when component mounts or referenceBook changes
  useEffect(() => {
    if (referenceBook) {
      validateFileExists();
    } else {
      setFileExists(false);
    }
  }, [referenceBook, subjectId]);

  // Validate if reference book exists and has required fields
  const hasValidReferenceBook = referenceBook && 
    referenceBook.fileName && 
    referenceBook.originalName && 
    referenceBook.filePath && 
    referenceBook.fileSize > 0 &&
    fileExists === true;

  return (
    <div className="space-y-2">
      {isValidatingFile ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Validating reference book...</span>
          </div>
        </div>
      ) : hasValidReferenceBook ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Reference Book</span>
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Uploaded
              </Badge>
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate">
                {referenceBook.originalName}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatFileSize(referenceBook.fileSize)}</span>
              <span>
                {new Date(referenceBook.uploadedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1"
            >
              <Download className="h-3 w-3 mr-1" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Reference Book</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this reference book? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2">
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
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ) : referenceBook && fileExists === false ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-3 w-3 text-destructive" />
            <span className="text-xs text-destructive">Reference Book File Missing</span>
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              File Not Found
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            The reference book was uploaded but the file is no longer available. Please re-upload.
          </p>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-6">
                <Upload className="h-3 w-3 mr-1" />
                <span className="text-xs">Re-upload Reference Book</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Re-upload Reference Book</DialogTitle>
                <DialogDescription>
                  The previous reference book file is missing. Please upload a new PDF reference book for this subject. Maximum file size: 50MB
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label htmlFor="reference-book-upload" className="block text-sm font-medium mb-2">
                    Select PDF File
                  </label>
                  <input
                    id="reference-book-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                
                {uploadFile && (
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{uploadFile.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Size: {formatFileSize(uploadFile.size)}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUploadDialogOpen(false);
                    setUploadFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">No Reference Book</span>
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Uploaded
            </Badge>
          </div>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-6">
                <Upload className="h-3 w-3 mr-1" />
                <span className="text-xs">Upload Reference Book</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Reference Book</DialogTitle>
                <DialogDescription>
                  Upload a PDF reference book for this subject. Maximum file size: 50MB
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label htmlFor="reference-book-upload" className="block text-sm font-medium mb-2">
                    Select PDF File
                  </label>
                  <input
                    id="reference-book-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                
                {uploadFile && (
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{uploadFile.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Size: {formatFileSize(uploadFile.size)}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUploadDialogOpen(false);
                    setUploadFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
