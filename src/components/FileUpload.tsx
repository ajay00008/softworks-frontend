import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  onFileUrlChange?: (url: string) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  className?: string;
}

const FileUpload = ({ 
  onFileSelect, 
  onFileUrlChange, 
  acceptedTypes = ".pdf,.doc,.docx,.txt",
  maxSize = 10,
  className = ""
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: `Please select a file with one of these extensions: ${acceptedTypes}`,
        variant: "destructive"
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setUploadStatus('idle');
    onFileSelect?.(file);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFileUrl(url);
    onFileUrlChange?.(url);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileUrl('');
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateUpload = () => {
    if (!selectedFile) return;
    
    setUploadStatus('uploading');
    
    // Simulate upload process
    setTimeout(() => {
      setUploadStatus('success');
      toast({
        title: "Upload Successful",
        description: `${selectedFile.name} has been uploaded successfully`,
      });
    }, 2000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            {selectedFile ? selectedFile.name : 'Drop files here or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground">
            {acceptedTypes} (max {maxSize}MB)
          </p>
        </div>
      </div>

      {/* Selected File Display */}
      {selectedFile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {uploadStatus === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {uploadStatus === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {uploadStatus === 'idle' && (
              <div className="mt-3">
                <Button
                  onClick={simulateUpload}
                  size="sm"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>
            )}
            
            {uploadStatus === 'uploading' && (
              <div className="mt-3">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* URL Input Alternative */}
      <div className="space-y-2">
        <Label htmlFor="fileUrl">Or enter file URL</Label>
        <Input
          id="fileUrl"
          type="url"
          value={fileUrl}
          onChange={handleUrlChange}
          placeholder="https://example.com/syllabus.pdf"
        />
      </div>
    </div>
  );
};

export default FileUpload;
