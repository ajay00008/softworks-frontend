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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Question, questionPaperAPI } from "@/services/api";

// Question Types
const QUESTION_TYPES = [
  {
    id: "CHOOSE_BEST_ANSWER",
    name: "Choose the best answer",
    description: "Multiple choice with one correct answer",
  },
  {
    id: "FILL_BLANKS",
    name: "Fill in the blanks",
    description: "Complete missing words or phrases",
  },
  {
    id: "ONE_WORD_ANSWER",
    name: "One word answer",
    description: "Answer in one word",
  },
  {
    id: "TRUE_FALSE",
    name: "True or False",
    description: "Select true or false",
  },
  {
    id: "CHOOSE_MULTIPLE_ANSWERS",
    name: "Choose multiple answers",
    description: "Select multiple correct answers",
  },
  {
    id: "MATCHING_PAIRS",
    name: "Matching pairs",
    description: "Match items using arrows",
  },
  {
    id: "DRAWING_DIAGRAM",
    name: "Drawing/Diagram",
    description: "Draw diagrams and mark parts",
  },
  {
    id: "MARKING_PARTS",
    name: "Marking parts",
    description: "Mark correct objects or parts",
  },
  {
    id: "SHORT_ANSWER",
    name: "Short answer",
    description: "Brief text response",
  },
  {
    id: "LONG_ANSWER",
    name: "Long answer",
    description: "Detailed text response",
  },
];

// Blooms Taxonomy Levels
const BLOOMS_LEVELS = [
  {
    id: "REMEMBER",
    name: "Remember",
    description: "Recall facts and basic concepts",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "UNDERSTAND",
    name: "Understand",
    description: "Explain ideas or concepts",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "APPLY",
    name: "Apply",
    description: "Use information in new situations",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "ANALYZE",
    name: "Analyze",
    description: "Draw connections among ideas",
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "EVALUATE",
    name: "Evaluate",
    description: "Justify a stand or decision",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "CREATE",
    name: "Create",
    description: "Produce new or original work",
    color: "bg-red-100 text-red-800",
  },
];

interface QuestionEditorProps {
  questionPaper: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function QuestionEditor({
  questionPaper,
  isOpen,
  onClose,
  onUpdate,
}: QuestionEditorProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAnswers, setShowAnswers] = useState<{[key: string]: boolean}>({});
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
    console.log("QuestionEditor useEffect - isOpen:", isOpen, "questionPaper:", questionPaper);
    if (isOpen && questionPaper) {
      loadQuestions();
    }
  }, [isOpen, questionPaper]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const questionPaperId = questionPaper._id || questionPaper.id;
      console.log("Loading questions for question paper:", questionPaperId);
      const questions = await questionPaperAPI.getQuestions(questionPaperId);
      console.log("Loaded questions:", questions);
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
    setIsEditing(true);
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
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const questionPaperId = questionPaper._id || questionPaper.id;
      // Call the API to update the question
      const updatedQuestion = await questionPaperAPI.updateQuestion(
        questionPaperId,
        editingQuestion.id,
        editForm
      );

      // Update the question in the list
      setQuestions(prev =>
        prev.map(q =>
          q.id === editingQuestion.id ? updatedQuestion : q
        )
      );

      toast({
        title: "Success",
        description: "Question updated successfully",
      });

      setIsEditing(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const questionPaperId = questionPaper._id || questionPaper.id;
      // Call the API to delete the question
      await questionPaperAPI.deleteQuestion(questionPaperId, questionId);

      // Remove from local state
      setQuestions(prev => prev.filter(q => q.id !== questionId));

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const toggleAnswerVisibility = (questionId: string) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const getQuestionTypeName = (type: string) => {
    return QUESTION_TYPES.find(t => t.id === type)?.name || type;
  };

  const getBloomsLevelName = (level: string) => {
    return BLOOMS_LEVELS.find(l => l.id === level)?.name || level;
  };

  const getBloomsLevelColor = (level: string) => {
    return BLOOMS_LEVELS.find(l => l.id === level)?.color || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading questions...</p>
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
          <DialogTitle>Edit Questions - {questionPaper?.title}</DialogTitle>
          <DialogDescription>
            Manage and edit individual questions in this question paper
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Questions List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Questions ({questions.length})
              </h3>
              <Button
                onClick={() => {
                  // Add new question functionality would go here
                  toast({
                    title: "Info",
                    description: "Add new question functionality coming soon",
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions && questions.map((question, index) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        <Badge className={getBloomsLevelColor(question.bloomsTaxonomyLevel)}>
                          {getBloomsLevelName(question.bloomsTaxonomyLevel)}
                        </Badge>
                        <Badge variant="outline">
                          {question.marks} mark{question.marks !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="outline">
                          {getQuestionTypeName(question.questionType)}
                        </Badge>
                        {question.isTwisted && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Twisted
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base">
                        {question.questionText}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAnswerVisibility(question.id)}
                      >
                        {showAnswers[question.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Question Options (for multiple choice) */}
                  {question.options && question.options.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium">Options:</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span className="text-sm">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Answer Section */}
                  {showAnswers[question.id] && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="space-y-2">
                        <div>
                          <Label className="text-sm font-medium text-green-800">
                            Correct Answer:
                          </Label>
                          <p className="text-sm text-green-700 mt-1">
                            {question.correctAnswer}
                          </p>
                        </div>
                        {question.explanation && (
                          <div>
                            <Label className="text-sm font-medium text-green-800">
                              Explanation:
                            </Label>
                            <p className="text-sm text-green-700 mt-1">
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Question Metadata */}
                  <div className="flex flex-wrap gap-2 mt-4 text-xs text-gray-600">
                    <span>Difficulty: {question.difficulty}</span>
                    <span>•</span>
                    <span>Time: {question.timeLimit}s</span>
                    {question.tags && question.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Tags: {question.tags.join(", ")}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {questions && questions.length === 0 && !loading && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Questions Found
                </h3>
                <p className="text-gray-600 mb-4">
                  This question paper doesn't have any questions yet.
                </p>
                <p className="text-sm text-gray-500">
                  Questions will appear here after the question paper is generated with AI.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Question Dialog */}
        {isEditing && editingQuestion && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Question</DialogTitle>
                <DialogDescription>
                  Modify the question details and settings
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="questionText">Question Text *</Label>
                  <Textarea
                    id="questionText"
                    value={editForm.questionText}
                    onChange={(e) =>
                      setEditForm(prev => ({ ...prev, questionText: e.target.value }))
                    }
                    placeholder="Enter the question text"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="questionType">Question Type *</Label>
                    <Select
                      value={editForm.questionType}
                      onValueChange={(value) =>
                        setEditForm(prev => ({ ...prev, questionType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="marks">Marks *</Label>
                    <Input
                      id="marks"
                      type="number"
                      value={editForm.marks}
                      onChange={(e) =>
                        setEditForm(prev => ({ ...prev, marks: parseInt(e.target.value) || 0 }))
                      }
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloomsLevel">Blooms Taxonomy Level *</Label>
                    <Select
                      value={editForm.bloomsTaxonomyLevel}
                      onValueChange={(value) =>
                        setEditForm(prev => ({ ...prev, bloomsTaxonomyLevel: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOMS_LEVELS.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty Level *</Label>
                    <Select
                      value={editForm.difficulty}
                      onValueChange={(value) =>
                        setEditForm(prev => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MODERATE">Moderate</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="correctAnswer">Correct Answer *</Label>
                  <Textarea
                    id="correctAnswer"
                    value={editForm.correctAnswer}
                    onChange={(e) =>
                      setEditForm(prev => ({ ...prev, correctAnswer: e.target.value }))
                    }
                    placeholder="Enter the correct answer"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    value={editForm.explanation}
                    onChange={(e) =>
                      setEditForm(prev => ({ ...prev, explanation: e.target.value }))
                    }
                    placeholder="Enter explanation for the answer"
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isTwisted"
                    checked={editForm.isTwisted}
                    onCheckedChange={(checked) =>
                      setEditForm(prev => ({ ...prev, isTwisted: !!checked }))
                    }
                  />
                  <Label htmlFor="isTwisted">This is a twisted question</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveQuestion}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
