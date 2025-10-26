import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  FileText, 
  Upload, 
  Download, 
  Edit3, 
  Save,
  Eye,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { questionPaperAPI } from '@/services/api';
import { QUESTION_TYPES, getQuestionTypeName, normalizeQuestionType } from '@/utils/questionTypes';

interface SimplePDFEditorProps {
  questionPaper: any;
  onClose: () => void;
  onUpdate: () => void;
}

const SimplePDFEditor: React.FC<SimplePDFEditorProps> = ({
  questionPaper,
  onClose,
  onUpdate
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [editedQuestion, setEditedQuestion] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const { toast } = useToast();

  // Load questions when component mounts
  useEffect(() => {
    console.log('SimplePDFEditor - Component mounted, loading questions for:', questionPaper._id);
    loadQuestions();
  }, [questionPaper]);

  const loadQuestions = async () => {
    try {
      const questionPaperId = questionPaper._id || questionPaper.id;
      const questionsData = await questionPaperAPI.getQuestions(questionPaperId);
      console.log('SimplePDFEditor - Questions loaded:', questionsData);
      console.log('SimplePDFEditor - First question structure:', questionsData?.[0]);
      
      setQuestions(questionsData || []);
      
      // Set first question as default if available
      if (questionsData && questionsData.length > 0) {
        setSelectedQuestion(questionsData[0]);
        setEditedQuestion({ ...questionsData[0] });
      }
    } catch (error) {
      console.error('SimplePDFEditor - Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive"
      });
    }
  };

  const handleQuestionSelect = (question: any) => {
    setSelectedQuestion(question);
    setEditedQuestion({ ...question });
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleEditQuestion = () => {
    setIsEditing(true);
  };

  const handleSaveQuestion = async () => {
    if (!editedQuestion) return;

    try {
      const questionPaperId = questionPaper._id || questionPaper.id;
      await questionPaperAPI.updateQuestion(questionPaperId, editedQuestion._id, editedQuestion);
      
      // Update local state
      setQuestions(prev => prev.map(q => 
        q._id === editedQuestion._id ? editedQuestion : q
      ));
      
      setSelectedQuestion(editedQuestion);
      setIsEditing(false);
      setHasChanges(false);
      
      toast({
        title: "Success",
        description: "Question updated successfully"
      });

      // Automatically regenerate PDF after updating question
      try {
        await questionPaperAPI.regeneratePDF(questionPaperId);
        toast({
          title: "PDF Updated",
          description: "PDF has been regenerated with updated questions"
        });
      } catch (regenerateError) {
        toast({
          title: "Warning",
          description: "Question updated but PDF regeneration failed. Please regenerate manually.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditedQuestion({ ...selectedQuestion });
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setHasChanges(true);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a PDF file",
        variant: "destructive"
      });
    }
  };

  const handleReplacePDF = async () => {
    if (!uploadedFile) {
      toast({
        title: "No File",
        description: "Please select a PDF file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const questionPaperId = questionPaper._id || questionPaper.id;
      
      // Upload new PDF
      const formData = new FormData();
      formData.append('pdf', uploadedFile);
      
      await questionPaperAPI.uploadPDFQuestionPaper(questionPaperId, formData);
      
      toast({
        title: "Success",
        description: "PDF replaced successfully"
      });
      
      setUploadedFile(null);
      setHasChanges(false);
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to replace PDF",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
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

  const handleRegeneratePDF = async () => {
    try {
      setIsRegenerating(true);
      const questionPaperId = questionPaper._id || questionPaper.id;
      
      const result = await questionPaperAPI.regeneratePDF(questionPaperId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "PDF regenerated successfully with updated questions",
        });
        
        // Trigger download of the new PDF
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `updated-${questionPaper.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Notify parent to refresh data
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate PDF",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  console.log('SimplePDFEditor - Component rendering with questions:', questions.length);
  console.log('SimplePDFEditor - Questions data:', questions);

  return (
    <div className="space-y-6 max-h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Edit Question Paper</h2>
          <p className="text-gray-600">{questionPaper.title}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleDownloadOriginal} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handleRegeneratePDF} variant="default" size="sm" disabled={isRegenerating}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate PDF'}
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Question List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Questions ({questions.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {console.log('SimplePDFEditor - Rendering questions list, count:', questions.length)}
              {questions.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No questions found. Check console for debugging info.
                </div>
              )}
              {questions.map((question, index) => (
                <div
                  key={question._id || index}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedQuestion?._id === question._id
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleQuestionSelect(question)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        Question {index + 1}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {question.questionText || question.question || 'No question text'}...
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {getQuestionTypeName(question.questionType || question.type || 'CHOOSE_BEST_ANSWER')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Question Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit3 className="w-5 h-5" />
              <span>Edit Question</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedQuestion ? (
              <div className="space-y-4">
                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Question Text</Label>
                      <div className="p-3 bg-gray-50 rounded border text-sm">
                        {editedQuestion.questionText || editedQuestion.question}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Options</Label>
                      <div className="space-y-2">
                        {editedQuestion.options?.map((option: string, index: number) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                            {String.fromCharCode(65 + index)}. {option}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Correct Answer</Label>
                      <div className="p-2 bg-green-50 rounded text-sm">
                        {editedQuestion.correctAnswer}
                      </div>
                    </div>
                    
                    <Button onClick={handleEditQuestion} className="w-full">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit This Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="question-text">Question Text</Label>
                      <Textarea
                        id="question-text"
                        value={editedQuestion.questionText || editedQuestion.question || ''}
                        onChange={(e) => {
                          setEditedQuestion({ ...editedQuestion, questionText: e.target.value });
                          setHasChanges(true);
                        }}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="options">Options (one per line)</Label>
                      <Textarea
                        id="options"
                        value={editedQuestion.options?.join('\n') || ''}
                        onChange={(e) => {
                          const options = e.target.value.split('\n').filter(opt => opt.trim());
                          setEditedQuestion({ ...editedQuestion, options });
                          setHasChanges(true);
                        }}
                        className="mt-1"
                        rows={4}
                        placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="correct-answer">Correct Answer</Label>
                      <Input
                        id="correct-answer"
                        value={editedQuestion.correctAnswer || ''}
                        onChange={(e) => {
                          setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value });
                          setHasChanges(true);
                        }}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSaveQuestion} 
                        disabled={!hasChanges}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        onClick={handleCancelEdit} 
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a question to edit</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PDF Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Replace PDF</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Edited PDF
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload your edited PDF to replace the current one
                </p>
                <div className="flex items-center justify-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Choose PDF File
                  </label>
                </div>
                {uploadedFile && (
                  <div className="mt-4 p-3 bg-green-50 rounded border">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-700">
                        Selected: {uploadedFile.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {uploadedFile && (
              <div className="flex space-x-2">
                <Button 
                  onClick={handleReplacePDF} 
                  disabled={isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Replace PDF
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    setUploadedFile(null);
                    setHasChanges(false);
                  }} 
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplePDFEditor;
