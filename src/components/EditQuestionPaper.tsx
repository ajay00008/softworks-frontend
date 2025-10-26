import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Trash2,
  Save,
  Download,
  RefreshCw,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { questionPaperAPI, QuestionPaper, Question } from '@/services/api';
import QuestionCard from './QuestionCard';

interface EditQuestionPaperProps {
  questionPaperId: string;
  onClose: () => void;
  onSave?: (updatedPaper: QuestionPaper) => void;
}

const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

const BLOOMS_LEVELS = [
  { value: 'REMEMBER', label: 'Remember' },
  { value: 'UNDERSTAND', label: 'Understand' },
  { value: 'APPLY', label: 'Apply' },
  { value: 'ANALYZE', label: 'Analyze' },
  { value: 'EVALUATE', label: 'Evaluate' },
  { value: 'CREATE', label: 'Create' },
];

export default function EditQuestionPaper({
  questionPaperId,
  onClose,
  onSave,
}: EditQuestionPaperProps) {
  const [questionPaper, setQuestionPaper] = useState<QuestionPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const { toast } = useToast();

  // Form state for editing question paper metadata
  const [formData, setFormData] = useState({
    title: '',
    className: '',
    subjects: [] as string[],
    duration: 60,
    instructions: '',
  });

  // Form state for editing individual question
  const [questionForm, setQuestionForm] = useState<Question>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'MEDIUM',
    bloomsLevel: 'UNDERSTAND',
    unit: '',
    marks: 1,
  });

  useEffect(() => {
    loadQuestionPaper();
  }, [questionPaperId]);

  const loadQuestionPaper = async () => {
    try {
      setLoading(true);
      const questionPaper = await questionPaperAPI.getById(questionPaperId);
      setQuestionPaper(questionPaper);
      setFormData({
        title: questionPaper.title,
        className: questionPaper.className,
        subjects: questionPaper.subjects,
        duration: questionPaper.duration,
        instructions: questionPaper.instructions,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load question paper',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'MEDIUM',
      bloomsLevel: 'UNDERSTAND',
      unit: '',
      marks: 1,
    });
    setShowAddQuestion(true);
  };

  const handleEditQuestion = (question: Question) => {
    setQuestionForm(question);
    setEditingQuestion(question);
    setShowAddQuestion(true);
  };

  const handleSaveQuestion = () => {
    if (!questionPaper) return;

    const updatedQuestions = [...questionPaper.questions];
    
    if (editingQuestion) {
      // Update existing question
      const index = updatedQuestions.findIndex(q => q._id === editingQuestion._id);
      if (index !== -1) {
        updatedQuestions[index] = { ...questionForm, _id: editingQuestion._id };
      }
    } else {
      // Add new question
      updatedQuestions.push({ ...questionForm, _id: Date.now().toString() });
    }

    setQuestionPaper({
      ...questionPaper,
      questions: updatedQuestions,
    });

    setShowAddQuestion(false);
    setEditingQuestion(null);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'MEDIUM',
      bloomsLevel: 'UNDERSTAND',
      unit: '',
      marks: 1,
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!questionPaper) return;

    const updatedQuestions = questionPaper.questions.filter(q => q._id !== questionId);
    setQuestionPaper({
      ...questionPaper,
      questions: updatedQuestions,
    });
  };

  const handleSaveChanges = async () => {
    if (!questionPaper) return;

    try {
      setSaving(true);
      const response = await questionPaperAPI.updateQuestionPaper(questionPaperId, {
        title: formData.title,
        className: formData.className,
        subjects: formData.subjects,
        questions: questionPaper.questions,
        duration: formData.duration,
        instructions: formData.instructions,
      });

      setQuestionPaper(response.data);
      onSave?.(response.data);
      
      toast({
        title: 'Success',
        description: 'Question paper updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save question paper',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRegeneratePDF = async () => {
    if (!questionPaper) return;

    try {
      setRegenerating(true);
      const response = await questionPaperAPI.updateQuestionPaper(questionPaperId, {
        questions: questionPaper.questions,
      });

      setQuestionPaper(response.data);
      
      toast({
        title: 'Success',
        description: 'PDF regenerated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate PDF',
        variant: 'destructive',
      });
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!questionPaper?.generatedPdf?.downloadUrl) {
      toast({
        title: 'Error',
        description: 'No PDF available for download',
        variant: 'destructive',
      });
      return;
    }

    try {
      const downloadUrl = questionPaper.generatedPdf.downloadUrl;
      
      // Construct full URL by adding Vite base URL and removing /api
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || 'http://localhost:4000';
      const fullDownloadUrl = `${baseUrl}${downloadUrl}`;

      // Open the PDF directly in a new tab/window
      window.open(fullDownloadUrl, '_blank');
      
      toast({
        title: 'Download Started',
        description: 'PDF opened in new tab',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open PDF',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading question paper...</span>
      </div>
    );
  }

  if (!questionPaper) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Question Paper Not Found
        </h3>
        <p className="text-gray-600">The requested question paper could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Question Paper</h1>
          <p className="text-gray-600">Make changes to your question paper and regenerate the PDF</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSaveChanges} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Question Paper Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Question Paper Details</CardTitle>
          <CardDescription>Edit the basic information about your question paper</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter question paper title"
              />
            </div>
            <div>
              <Label htmlFor="className">Class</Label>
              <Input
                id="className"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="Enter class name"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                placeholder="60"
              />
            </div>
            <div>
              <Label>Subjects</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.subjects.map((subject, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <button
                      onClick={() => {
                        const newSubjects = formData.subjects.filter((_, i) => i !== index);
                        setFormData({ ...formData, subjects: newSubjects });
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Input
                  placeholder="Add subject"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim();
                      if (value && !formData.subjects.includes(value)) {
                        setFormData({
                          ...formData,
                          subjects: [...formData.subjects, value],
                        });
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Enter instructions for students"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Questions ({questionPaper.questions.length})</CardTitle>
              <CardDescription>Manage the questions in your question paper</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleRegeneratePDF} disabled={regenerating} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                {regenerating ? 'Regenerating...' : 'Regenerate PDF'}
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" disabled={!questionPaper}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handleAddQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {questionPaper.questions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Questions Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add your first question to get started.
              </p>
              <Button onClick={handleAddQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questionPaper.questions.map((question, index) => (
                <QuestionCard
                  key={question._id}
                  question={question}
                  index={index}
                  onEdit={() => handleEditQuestion(question)}
                  onDelete={() => handleDeleteQuestion(question._id!)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Question Modal */}
      {showAddQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="questionText">Question</Label>
                <Textarea
                  id="questionText"
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Options</Label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mt-2">
                    <span className="w-6 text-sm font-medium">{String.fromCharCode(65 + index)})</span>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[index] = e.target.value;
                        setQuestionForm({ ...questionForm, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={questionForm.correctAnswer === index}
                      onChange={() => setQuestionForm({ ...questionForm, correctAnswer: index })}
                    />
                    <Label className="text-sm">Correct</Label>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={questionForm.difficulty}
                    onValueChange={(value) => setQuestionForm({ ...questionForm, difficulty: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bloomsLevel">Blooms Level</Label>
                  <Select
                    value={questionForm.bloomsLevel}
                    onValueChange={(value) => setQuestionForm({ ...questionForm, bloomsLevel: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOMS_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={questionForm.unit}
                    onChange={(e) => setQuestionForm({ ...questionForm, unit: e.target.value })}
                    placeholder="Enter unit name"
                  />
                </div>
                <div>
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder="Enter explanation for the correct answer..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddQuestion(false);
                  setEditingQuestion(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveQuestion}>
                <Save className="w-4 h-4 mr-2" />
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
