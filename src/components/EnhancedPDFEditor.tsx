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
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editHistory, setEditHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
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

  const loadPDFPreview = () => {
    if (questionPaper.generatedPdf?.downloadUrl) {
      setPreviewUrl(questionPaper.generatedPdf.downloadUrl);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const questionPaperId = questionPaper._id || questionPaper.id;
      const questions = await questionPaperAPI.getQuestions(questionPaperId);
      setQuestions(questions || []);
    } catch (error) {
      console.error("Error loading questions:", error);
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
      console.error("Error updating question:", error);
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
      console.error("Error regenerating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const handleUploadNewPDF = async () => {
    if (!pdfFile) return;

    try {
      setUploading(true);
      const questionPaperId = questionPaper._id || questionPaper.id;
      await questionPaperAPI.uploadPDF(questionPaperId, pdfFile);
      
      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });

      // Reload data
      loadPDFPreview();
      onUpdate();
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to upload PDF",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadOriginal = () => {
    if (questionPaper.generatedPdf?.downloadUrl) {
      const link = document.createElement('a');
      link.href = questionPaper.generatedPdf.downloadUrl;
      link.download = questionPaper.generatedPdf.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Enhanced PDF Editor - {questionPaper?.title}
          </DialogTitle>
          <DialogDescription>
            Edit questions, annotate PDFs, and manage your question paper
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preview">PDF Preview</TabsTrigger>
            <TabsTrigger value="questions">Edit Questions</TabsTrigger>
            <TabsTrigger value="annotations">Annotations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">PDF Preview</h3>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUndo}
                  variant="outline"
                  size="sm"
                  disabled={historyIndex <= 0}
                >
                  <Undo className="w-4 h-4 mr-2" />
                  Undo
                </Button>
                <Button
                  onClick={handleRedo}
                  variant="outline"
                  size="sm"
                  disabled={historyIndex >= editHistory.length - 1}
                >
                  <Redo className="w-4 h-4 mr-2" />
                  Redo
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
                <Button
                  onClick={handleDownloadOriginal}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {previewUrl ? (
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={previewUrl}
                  width="100%"
                  height="600"
                  className="border-0"
                  title="Question Paper PDF Preview"
                />
              </div>
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

          <TabsContent value="questions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Edit Questions</h3>
              <Badge variant="outline">
                {questions.length} questions
              </Badge>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Loading questions...</p>
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

          <TabsContent value="annotations" className="space-y-4">
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

          <TabsContent value="settings" className="space-y-4">
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
      </DialogContent>
    </Dialog>
  );
}
