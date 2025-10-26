import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Download,
  Upload,
  Eye,
  Edit,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { questionPaperAPI } from "@/services/api";

interface PDFEditorProps {
  questionPaper: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PDFEditor({
  questionPaper,
  isOpen,
  onClose,
  onUpdate,
}: PDFEditorProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && questionPaper) {
      loadPDFPreview();
    }
  }, [isOpen, questionPaper]);

  const loadPDFPreview = () => {
    if (questionPaper.generatedPdf?.downloadUrl) {
      const downloadUrl = questionPaper.generatedPdf.downloadUrl;
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "");
      const path = downloadUrl?.startsWith("/public") ? downloadUrl : `/public/${downloadUrl}`;
      const fullDownloadUrl = `${baseUrl}${path}`;
      setPreviewUrl(fullDownloadUrl);
      setIframeError(false);
    }
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

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
      
      setPdfFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadNewPDF = async () => {
    if (!pdfFile) return;
    
    try {
      setUploading(true);
      
      // Upload the new PDF to replace the existing one
      const formData = new FormData();
      formData.append('questionPaper', pdfFile);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/question-papers/${questionPaper._id}/upload-pdf`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }
      
      const result = await response.json();
      
      toast({
        title: "Success",
        description: "Question paper PDF updated successfully",
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload PDF",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadOriginal = async () => {
    try {
      if (!questionPaper?.generatedPdf?.downloadUrl) {
        toast({
          title: "Error",
          description: "No PDF available for download",
          variant: "destructive",
        });
        return;
      }

      const downloadUrl = questionPaper.generatedPdf.downloadUrl;
      
      // Construct full URL by adding Vite base URL and removing /api
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || 'http://localhost:4000';
      const fullDownloadUrl = `${baseUrl}${downloadUrl}`;

      // Open the PDF directly in a new tab/window
      window.open(fullDownloadUrl, '_blank');
      
      toast({
        title: "Success",
        description: "PDF opened in new tab",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open PDF",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading PDF editor...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question Paper - {questionPaper?.title}</DialogTitle>
          <DialogDescription>
            View and edit the question paper PDF directly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* PDF Preview Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Question Paper PDF</h3>
              <div className="flex space-x-2">
                <Button
                  onClick={handleDownloadOriginal}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Original
                </Button>
              </div>
            </div>

            {previewUrl ? (
              iframeError ? (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    PDF Preview Not Available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    The PDF cannot be displayed in the browser due to security restrictions.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={handleDownloadOriginal}
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button
                      onClick={() => window.open(previewUrl, '_blank')}
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src={previewUrl}
                    width="100%"
                    height="600"
                    className="border-0"
                    title="Question Paper PDF Preview"
                    onError={handleIframeError}
                  />
                </div>
              )
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No PDF Available
                </h3>
                <p className="text-gray-600">
                  This question paper doesn't have a generated PDF yet.
                </p>
              </div>
            )}
          </div>

          {/* Upload New PDF Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Replace with New PDF</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="pdf-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload a new PDF
                    </span>
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </Label>
                  <p className="text-sm text-gray-500">
                    Upload a new PDF to replace the current question paper
                  </p>
                  <p className="text-xs text-gray-400">
                    Maximum file size: 50MB
                  </p>
                </div>
              </div>
            </div>

            {pdfFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {pdfFile.name}
                    </span>
                    <Badge variant="outline" className="text-blue-600">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleUploadNewPDF}
                      disabled={uploading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Replace PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <h4 className="font-medium mb-2">How to Edit Question Papers:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Download the original PDF using the "Download Original" button</li>
                  <li>Edit the PDF using any PDF editor (Adobe Acrobat, Foxit, etc.)</li>
                  <li>Upload the edited PDF using the upload section above</li>
                  <li>The new PDF will replace the original question paper</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
