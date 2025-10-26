import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  FileText, 
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
import { QuestionPaper, Question } from '@/types/question-paper';
import { QUESTION_TYPES, getQuestionTypeName, normalizeQuestionType } from '@/utils/questionTypes';

interface SimplePDFEditorOnlyProps {
  questionPaper: QuestionPaper;
  onClose: () => void;
  onUpdate: () => void;
}

const SimplePDFEditorOnly: React.FC<SimplePDFEditorOnlyProps> = ({
  questionPaper,
  onClose,
  onUpdate
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, [questionPaper]);

  const loadQuestions = async () => {
    try {
      const questionPaperId = questionPaper._id || questionPaper.id;
      const questionsData = await questionPaperAPI.getQuestions(questionPaperId);
      console.log('SimplePDFEditor - Questions loaded:', questionsData);
      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    }
  };

  const handleQuestionSelect = (question: Question) => {
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
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditedQuestion({ ...selectedQuestion });
    setIsEditing(false);
    setHasChanges(false);
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
          <CardContent className="max-h-96 overflow-y-auto">
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No questions found</p>
              </div>
            ) : (
              <div className="space-y-2">
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
            )}
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
                {isEditing ? (
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
                      <Label htmlFor="question-type">Question Type</Label>
                      <select
                        id="question-type"
                        value={normalizeQuestionType(editedQuestion.questionType || editedQuestion.type || 'CHOOSE_BEST_ANSWER')}
                        onChange={(e) => {
                          setEditedQuestion({ ...editedQuestion, questionType: e.target.value });
                          setHasChanges(true);
                        }}
                        className="mt-1 w-full p-2 border rounded-md"
                      >
                        {QUESTION_TYPES.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="marks">Marks</Label>
                      <Input
                        id="marks"
                        type="number"
                        value={editedQuestion.marks || 1}
                        onChange={(e) => {
                          setEditedQuestion({ ...editedQuestion, marks: parseInt(e.target.value) || 1 });
                          setHasChanges(true);
                        }}
                        className="mt-1"
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
                        placeholder="Enter the correct answer"
                      />
                    </div>

                    <div>
                      <Label htmlFor="explanation">Explanation</Label>
                      <Textarea
                        id="explanation"
                        value={editedQuestion.explanation || ''}
                        onChange={(e) => {
                          setEditedQuestion({ ...editedQuestion, explanation: e.target.value });
                          setHasChanges(true);
                        }}
                        className="mt-1"
                        rows={3}
                        placeholder="Enter explanation for the answer"
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
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Question Text:</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedQuestion.questionText || selectedQuestion.question || 'No question text'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Type:</h4>
                      <Badge variant="outline" className="mt-1">
                        {getQuestionTypeName(selectedQuestion.questionType || selectedQuestion.type || 'CHOOSE_BEST_ANSWER')}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Marks:</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedQuestion.marks || 1}
                      </p>
                    </div>

                    {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                      <div>
                        <h4 className="font-medium">Options:</h4>
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          {selectedQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center">
                              <span className="w-6 text-xs font-medium">{String.fromCharCode(65 + index)})</span>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedQuestion.correctAnswer && (
                      <div>
                        <h4 className="font-medium">Correct Answer:</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedQuestion.correctAnswer}
                        </p>
                      </div>
                    )}

                    {selectedQuestion.explanation && (
                      <div>
                        <h4 className="font-medium">Explanation:</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedQuestion.explanation}
                        </p>
                      </div>
                    )}
                    
                    <Button onClick={handleEditQuestion} className="w-full">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Question
                    </Button>
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
    </div>
  );
};

export default SimplePDFEditorOnly;
