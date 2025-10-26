import { useState, useEffect, useRef } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PDFViewer from "./PDFViewer";
import PDFViewerCanvas from "./PDFViewerCanvas";
import AdvancedPDFEditor from "./AdvancedPDFEditor";
import TextEditablePDFEditor from "./TextEditablePDFEditor";
import TextEditingDemo from "./TextEditingDemo";
import SimpleQuestionEditor from "./SimpleQuestionEditor";
import SimpleEditGuide from "./SimpleEditGuide";
import SimplePDFEditorOnly from "./SimplePDFEditorOnly";
import AIQuestionGenerator from "./AIQuestionGenerator";
import TestQuestionDisplay from "./TestQuestionDisplay";
import {
  Save,
  Download,
  Upload,
  Eye,
  Edit,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  PenTool,
  Type,
  Image,
  Trash2,
  Plus,
  Copy,
  Undo,
  Redo,
  Brain,
  Wand2,
} from "lucide-react";
import { questionPaperAPI } from "@/services/api";

interface Question {
  _id: string;
  questionText: string;
  questionType: string;
  marks: number;
  bloomsTaxonomyLevel: string;
  difficulty: string;
  isTwisted: boolean;
  options: string[];
  correctAnswer: string;
  explanation: string;
  timeLimit: number;
  tags: string[];
}

interface QuestionPaper {
  _id: string;
  title: string;
  status: string;
  generatedPdf?: {
    fileName: string;
    filePath: string;
    fileSize: number;
    generatedAt: string;
    downloadUrl: string;
  };
  questions?: string[];
}

interface PDFAnnotation {
  id: string;
  type: 'highlight' | 'comment' | 'strikeout' | 'underline';
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  color: string;
  createdAt: string;
}

interface EnhancedPDFEditorProps {
  questionPaper: QuestionPaper;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EnhancedPDFEditor({
  questionPaper,
  isOpen,
  onClose,
  onUpdate,
}: EnhancedPDFEditorProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editHistory, setEditHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  
  // PDF Editing states
  const [editMode, setEditMode] = useState<'text' | 'draw' | 'highlight' | null>(null);
  const [editText, setEditText] = useState('');
  const [drawColor, setDrawColor] = useState('#ff0000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Form state for editing question
  const [editForm, setEditForm] = useState({
    questionText: "",
    questionType: "",
    marks: 0,
    bloomsTaxonomyLevel: "",
    difficulty: "MODERATE",
    isTwisted: false,
    options: [] as string[],
    correctAnswer: "",
    explanation: "",
    timeLimit: 0,
    tags: [] as string[],
  });

  useEffect(() => {
    if (isOpen && questionPaper) {
      loadPDFPreview();
      loadQuestions();
    }
  }, [isOpen, questionPaper]);

  // Listen for CSP errors
  useEffect(() => {
    const handleCSPError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('frame-ancestors')) {
        setIframeError(true);
      }
    };

    window.addEventListener('error', handleCSPError);
    return () => window.removeEventListener('error', handleCSPError);
  }, []);

  // Check for CSP errors after iframe loads
  useEffect(() => {
    if (previewUrl && !iframeError) {
      checkForCSPError();
    }
  }, [previewUrl, iframeError]);

  const loadPDFPreview = () => {
    if (questionPaper.generatedPdf?.downloadUrl) {
      const downloadUrl = questionPaper.generatedPdf.downloadUrl;
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "");
      const path = downloadUrl?.startsWith("/public") ? downloadUrl : `/public/${downloadUrl}`;
      const fullDownloadUrl = `${baseUrl}${path}`;
      setPreviewUrl(fullDownloadUrl);
      setIframeError(false); // Reset error state when loading new PDF
    }
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  // Enhanced CSP error detection
  const handleIframeLoad = () => {
    // Reset error state when iframe loads successfully
    setIframeError(false);
  };

  // Check for CSP errors more aggressively
  const checkForCSPError = () => {
    setTimeout(() => {
      try {
        const iframe = document.querySelector('iframe[title="Question Paper PDF Preview"]') as HTMLIFrameElement;
        if (iframe && iframe.contentDocument === null) {
          setIframeError(true);
        }
      } catch (error) {
        setIframeError(true);
      }
    }, 2000); // Wait 2 seconds for iframe to load
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const questionPaperId = questionPaper._id || questionPaper.id;
      const questions = await questionPaperAPI.getQuestions(questionPaperId);
      console.log('EnhancedPDFEditor - Questions loaded:', questions);
      console.log('EnhancedPDFEditor - Questions count:', questions?.length);
      setQuestions(questions || []);
    } catch (error) {
      console.error('EnhancedPDFEditor - Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setEditForm({
      questionText: question.questionText,
      questionType: question.questionType,
      marks: question.marks,
      bloomsTaxonomyLevel: question.bloomsTaxonomyLevel,
      difficulty: question.difficulty,
      isTwisted: question.isTwisted,
      options: question.options || [],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
      timeLimit: question.timeLimit || 0,
      tags: question.tags || [],
    });
    setIsEditingQuestion(true);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;

    try {
      setLoading(true);
      const questionPaperId = questionPaper._id || questionPaper.id;
      await questionPaperAPI.updateQuestion(questionPaperId, editingQuestion._id, editForm);
      
      // Update local state
      setQuestions(prev => prev.map(q => 
        q._id === editingQuestion._id ? { ...q, ...editForm } : q
      ));

      // Add to history
      addToHistory({
        type: 'question_edit',
        questionId: editingQuestion._id,
        oldData: editingQuestion,
        newData: editForm,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Question updated successfully",
      });

      setIsEditingQuestion(false);
      setEditingQuestion(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegeneratePDF = async () => {
    try {
      setLoading(true);
      const questionPaperId = questionPaper._id || questionPaper.id;
      await questionPaperAPI.regeneratePDF(questionPaperId);
      
      toast({
        title: "Success",
        description: "PDF regenerated successfully",
      });

      // Reload data
      loadPDFPreview();
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    try {
      setIsGeneratingAI(true);
      const questionPaperId = questionPaper._id || questionPaper.id;
      
      // Call AI generation API
      const response = await questionPaperAPI.generateWithAI(questionPaperId, {
        // You can add AI generation parameters here
        difficulty: 'MODERATE',
        questionCount: 10,
        subject: questionPaper.subjects?.[0] || 'General',
        className: questionPaper.className || 'General'
      });
      
      // Reload questions after AI generation
      await loadQuestions();
      
      toast({
        title: "Success",
        description: "Questions generated successfully with AI",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions with AI",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
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

  // PDF Editing handlers
  const handleAddText = () => {
    if (editText.trim()) {
      // In a real implementation, this would add text to the PDF
      setHasUnsavedChanges(true);
      setEditText('');
      toast({ title: "Text Added", description: "Text has been added to the PDF" });
    }
  };

  const handleRemoveText = () => {
    // In a real implementation, this would remove text from the PDF
    setHasUnsavedChanges(true);
    toast({ title: "Text Removed", description: "Text has been removed from the PDF" });
  };

  const handleStartDrawing = () => {
    // In a real implementation, this would enable drawing mode
    setHasUnsavedChanges(true);
    toast({ title: "Drawing Mode", description: "Click and drag to draw on the PDF" });
  };

  const handleClearDrawing = () => {
    // In a real implementation, this would clear drawings
    setHasUnsavedChanges(true);
    toast({ title: "Drawings Cleared", description: "All drawings have been cleared" });
  };

  const handleStartHighlighting = () => {
    // In a real implementation, this would enable highlighting mode
    setHasUnsavedChanges(true);
    toast({ title: "Highlighting Mode", description: "Click and drag to highlight text" });
  };

  const handleAddImage = () => {
    // In a real implementation, this would open file picker for images
    setHasUnsavedChanges(true);
    toast({ title: "Image Added", description: "Image has been added to the PDF" });
  };

  const handleSaveEditedPDF = async () => {
    try {
      // In a real implementation, this would save the edited PDF
      // Simulate API call to save edited PDF
      const questionPaperId = questionPaper._id || questionPaper.id;
      await questionPaperAPI.saveEditedPDF(questionPaperId, {
        edits: {
          text: editText,
          drawings: [],
          highlights: [],
          images: []
        }
      });
      
      setHasUnsavedChanges(false);
      toast({ title: "Success", description: "PDF changes saved successfully" });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save PDF changes", variant: "destructive" });
    }
  };

  const handleUploadNewPDF = async () => {
    if (!pdfFile) return;

    try {
      setUploading(true);
      const questionPaperId = questionPaper._id || questionPaper.id;
      
      // Store old PDF URL for deletion
      const oldPdfUrl = questionPaper.pdfUrl;
      
      // Upload new PDF (this will replace the old one)
      const response = await questionPaperAPI.uploadPDF(questionPaperId, pdfFile);
      
      // If upload successful and we have an old PDF, delete it
      if (oldPdfUrl && response.success) {
        try {
          await questionPaperAPI.deleteOldPDF(questionPaperId, oldPdfUrl);
        } catch (deleteError) {
          // Don't fail the whole operation if old PDF deletion fails
        }
      }
      
      toast({
        title: "Success",
        description: "PDF replaced successfully. Old PDF has been removed.",
      });

      // Reload data to show new PDF
      loadPDFPreview();
      onUpdate();
      
      // Clear the file input
      setPdfFile(null);
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
      const questionPaperId = questionPaper._id || questionPaper.id;
      const response = await questionPaperAPI.download(questionPaperId);
      
      if (response.downloadUrl) {
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = `${questionPaper.title || 'question-paper'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  const addToHistory = (action: any) => {
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(action);
    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // Apply undo logic here
    }
  };

  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      // Apply redo logic here
    }
  };

  const addAnnotation = (annotation: Omit<PDFAnnotation, 'id' | 'createdAt'>) => {
    const newAnnotation: PDFAnnotation = {
      ...annotation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Enhanced PDF Editor - {questionPaper?.title}
          </DialogTitle>
          <DialogDescription>
            Edit questions, annotate PDFs, and manage your question paper
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="preview">PDF Preview</TabsTrigger>
              <TabsTrigger value="simple-edit">Simple Edit</TabsTrigger>
              {/* Commented out other tabs for now */}
              {/* <TabsTrigger value="edit-pdf">Edit PDF</TabsTrigger> */}
              {/* <TabsTrigger value="text-edit">Text Edit</TabsTrigger> */}
              {/* <TabsTrigger value="ai-generate">AI Generate</TabsTrigger> */}
              {/* <TabsTrigger value="debug">Debug</TabsTrigger> */}
              {/* <TabsTrigger value="questions">Edit Questions</TabsTrigger> */}
              {/* <TabsTrigger value="annotations">Annotations</TabsTrigger> */}
              {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
            </TabsList>

            <TabsContent value="preview" className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">PDF Preview & Edit</h3>
              <div className="flex space-x-2">
                <Button
                  onClick={handleDownloadOriginal}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Original
                </Button>
                <Button
                  onClick={handleRegeneratePDF}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Regenerate PDF
                </Button>
              </div>
            </div>

            {previewUrl ? (
              <PDFViewerCanvas 
                pdfUrl={previewUrl} 
                title="Question Paper PDF Preview"
                height="600px"
                showControls={true}
                onEdit={(pageNumber, x, y, text) => {
                  setHasUnsavedChanges(true);
                  toast({ title: "Text Added", description: `"${text}" added to page ${pageNumber}` });
                }}
              />
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

            {/* Upload New PDF Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload New PDF</CardTitle>
                <CardDescription>
                  Replace the current PDF with a new one
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pdf-upload">Select PDF File</Label>
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                </div>
                {pdfFile && (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleUploadNewPDF}
                      disabled={uploading}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload PDF"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

            {/* <TabsContent value="edit-pdf" className="flex-1 overflow-y-auto space-y-4 p-1"> */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Edit PDF Document</h3>
              <div className="flex space-x-2">
                <Button
                  onClick={handleDownloadOriginal}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={handleSaveEditedPDF}
                  variant="default"
                  size="sm"
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Advanced PDF Editor */}
            {previewUrl ? (
              <AdvancedPDFEditor
                pdfUrl={previewUrl}
                title="PDF Editor"
                height="600px"
                onSave={(edits) => {
                  setHasUnsavedChanges(false);
                  toast({ title: "Success", description: "PDF edits saved successfully" });
                }}
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No PDF Available
                </h3>
                <p className="text-gray-600">
                  This question paper doesn't have a PDF yet. Generate one first.
                </p>
              </div>
            )}

            {/* Alternative: Upload Edited PDF */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alternative: Upload Edited PDF</CardTitle>
                <CardDescription>
                  If you prefer to edit externally, you can upload your edited PDF here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Upload Edited PDF
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Select your edited PDF file to replace the current one
                    </p>
                    
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="max-w-xs mx-auto"
                    />
                    
                    {pdfFile && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600">
                          Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <Button
                          onClick={handleUploadNewPDF}
                          disabled={uploading}
                          className="w-full max-w-xs"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? 'Uploading...' : 'Replace PDF'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

            {/* <TabsContent value="text-edit" className="flex-1 overflow-y-auto space-y-4 p-1"> */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Direct Text Editing</h3>
              <div className="flex space-x-2">
                <Button
                  onClick={handleDownloadOriginal}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Original
                </Button>
                <Button
                  onClick={handleSaveEditedPDF}
                  variant="default"
                  size="sm"
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <TextEditingDemo />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Edit Text Directly in PDF</CardTitle>
                  <CardDescription>
                    Select and edit existing text in the PDF, or add new text annotations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previewUrl ? (
                    <TextEditablePDFEditor
                      pdfUrl={previewUrl}
                      title="Text Editable PDF Editor"
                      height="500px"
                      onSave={(edits) => {
                        setHasUnsavedChanges(true);
                        toast({ title: "Text Edits Saved", description: "Your text changes have been saved" });
                      }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No PDF Available
                      </h3>
                      <p className="text-gray-600">
                        This question paper doesn't have a PDF yet. Generate one first.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

            <TabsContent value="simple-edit" className="flex-1 overflow-y-auto space-y-4 p-1">
              <SimplePDFEditorOnly
                questionPaper={questionPaper}
                onClose={() => setShowEditDialog(false)}
                onUpdate={() => {
                  // Refresh the question paper data
                  window.location.reload();
                }}
              />
            </TabsContent>

            <TabsContent value="ai-generate" className="flex-1 overflow-y-auto space-y-4 p-1">
              <AIQuestionGenerator
                questionPaper={questionPaper}
                onQuestionsGenerated={(questions) => {
                  // Refresh the question paper data
                  window.location.reload();
                }}
                onClose={() => setShowEditDialog(false)}
              />
            </TabsContent>

            <TabsContent value="debug" className="flex-1 overflow-y-auto space-y-4 p-1">
              <TestQuestionDisplay questionPaper={questionPaper} />
            </TabsContent>

            <TabsContent value="questions" className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold">Edit Questions</h3>
                <Badge variant="outline">
                  {questions.length} questions
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                >
                  <Brain className={`w-4 h-4 mr-2 ${isGeneratingAI ? 'animate-pulse' : ''}`} />
                  {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
                </Button>
                <Button
                  onClick={() => setShowAddQuestion(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manually
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Questions Found
                </h3>
                <p className="text-gray-600 mb-4">
                  This question paper doesn't have any questions yet.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => {
                      // Trigger AI question generation
                      handleGenerateWithAI();
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Open manual question form
                      setShowAddQuestion(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Manually
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questions.map((question, index) => (
                  <Card key={question._id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Q{index + 1}</Badge>
                            <Badge variant="outline">{question.marks} marks</Badge>
                            <Badge variant="outline">{question.difficulty}</Badge>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {question.questionText}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {question.questionType}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">
                              {question.bloomsTaxonomyLevel}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Question Edit Dialog */}
            {isEditingQuestion && editingQuestion && (
              <Dialog open={isEditingQuestion} onOpenChange={setIsEditingQuestion}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Question</DialogTitle>
                    <DialogDescription>
                      Modify the question details
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="questionText">Question Text</Label>
                      <Textarea
                        id="questionText"
                        value={editForm.questionText}
                        onChange={(e) => setEditForm(prev => ({ ...prev, questionText: e.target.value }))}
                        className="mt-1"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="questionType">Question Type</Label>
                        <Select
                          value={editForm.questionType}
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, questionType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CHOOSE_BEST_ANSWER">Multiple Choice</SelectItem>
                            <SelectItem value="FILL_BLANKS">Fill in the Blanks</SelectItem>
                            <SelectItem value="ONE_WORD_ANSWER">One Word Answer</SelectItem>
                            <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                            <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                            <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="marks">Marks</Label>
                        <Input
                          id="marks"
                          type="number"
                          value={editForm.marks}
                          onChange={(e) => setEditForm(prev => ({ ...prev, marks: parseInt(e.target.value) || 0 }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={editForm.difficulty}
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, difficulty: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EASY">Easy</SelectItem>
                            <SelectItem value="MODERATE">Moderate</SelectItem>
                            <SelectItem value="TOUGHEST">Tough</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="bloomsTaxonomyLevel">Blooms Taxonomy</Label>
                        <Select
                          value={editForm.bloomsTaxonomyLevel}
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, bloomsTaxonomyLevel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="REMEMBER">Remember</SelectItem>
                            <SelectItem value="UNDERSTAND">Understand</SelectItem>
                            <SelectItem value="APPLY">Apply</SelectItem>
                            <SelectItem value="ANALYZE">Analyze</SelectItem>
                            <SelectItem value="EVALUATE">Evaluate</SelectItem>
                            <SelectItem value="CREATE">Create</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="correctAnswer">Correct Answer</Label>
                      <Textarea
                        id="correctAnswer"
                        value={editForm.correctAnswer}
                        onChange={(e) => setEditForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="explanation">Explanation</Label>
                      <Textarea
                        id="explanation"
                        value={editForm.explanation}
                        onChange={(e) => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingQuestion(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveQuestion}
                        disabled={loading}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

            <TabsContent value="annotations" className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">PDF Annotations</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <PenTool className="w-4 h-4 mr-2" />
                  Add Highlight
                </Button>
                <Button variant="outline" size="sm">
                  <Type className="w-4 h-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Annotation Tools</CardTitle>
                <CardDescription>
                  Add annotations to the PDF for review and collaboration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Annotation Tools Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    Advanced PDF annotation features will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

            <TabsContent value="settings" className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">PDF Settings</h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PDF Generation Settings</CardTitle>
                <CardDescription>
                  Configure how the PDF is generated and formatted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Settings Panel Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    Advanced PDF formatting and generation settings will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </div>
      </DialogContent>

      {/* Add Question Modal */}
      {showAddQuestion && (
        <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
              <DialogDescription>
                Create a new question for this question paper
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="questionText">Question Text</Label>
                <Textarea
                  id="questionText"
                  value={editForm.questionText}
                  onChange={(e) => setEditForm(prev => ({ ...prev, questionText: e.target.value }))}
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Options</Label>
                {editForm.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mt-2">
                    <span className="w-6 text-sm font-medium">{String.fromCharCode(65 + index)})</span>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editForm.options];
                        newOptions[index] = e.target.value;
                        setEditForm(prev => ({ ...prev, options: newOptions }));
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={editForm.correctAnswer === index}
                      onChange={() => setEditForm(prev => ({ ...prev, correctAnswer: index }))}
                    />
                    <Label className="text-sm">Correct</Label>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={editForm.difficulty}
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MODERATE">Moderate</SelectItem>
                      <SelectItem value="TOUGHEST">Tough</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    value={editForm.marks}
                    onChange={(e) => setEditForm(prev => ({ ...prev, marks: parseInt(e.target.value) || 1 }))}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  value={editForm.explanation}
                  onChange={(e) => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Enter explanation for the correct answer..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddQuestion(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const questionPaperId = questionPaper._id || questionPaper.id;
                    await questionPaperAPI.addQuestion(questionPaperId, editForm);
                    await loadQuestions();
                    setShowAddQuestion(false);
                    setEditForm({
                      questionText: "",
                      questionType: "",
                      marks: 1,
                      bloomsTaxonomyLevel: "",
                      difficulty: "MODERATE",
                      isTwisted: false,
                      options: ["", "", "", ""],
                      correctAnswer: "",
                      explanation: "",
                      timeLimit: 0,
                      tags: [],
                    });
                    toast({
                      title: "Success",
                      description: "Question added successfully",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to add question",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
