import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Bot, 
  Plus, 
  Save, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { questionPaperAPI } from '@/services/api';
import { getDefaultPattern, convertPatternToAIGeneration } from '@/utils/defaultQuestionPaperPatterns';

interface AIQuestionGeneratorProps {
  questionPaper: any;
  onQuestionsGenerated: (questions: any[]) => void;
  onClose: () => void;
}

const AIQuestionGenerator: React.FC<AIQuestionGeneratorProps> = ({
  questionPaper,
  onQuestionsGenerated,
  onClose
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('MODERATE');
  const [topic, setTopic] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [useDefaultPattern, setUseDefaultPattern] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerateQuestions = async () => {
    if (!questionPaper) {
      toast({
        title: "Error",
        description: "No question paper selected",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Get pattern (default or custom)
      let pattern = null;
      if (useDefaultPattern) {
        const defaultPattern = getDefaultPattern(
          questionPaper.subjectId?.name || 'Mathematics',
          questionPaper.classId?.name || 'XII'
        );
        if (defaultPattern) {
          pattern = convertPatternToAIGeneration(defaultPattern);
          setSelectedPattern(defaultPattern);
        }
      }

      // Generate questions using AI with pattern
      const response = await questionPaperAPI.generateAIQuestions(questionPaper._id, {
        questionCount,
        difficulty,
        topic: topic || undefined,
        subject: questionPaper.subjectId?.name,
        className: questionPaper.classId?.name,
        pattern: pattern
      });

      if (response.success) {
        setGeneratedQuestions(response.questions || []);
        toast({
          title: "Success",
          description: `${response.questions?.length || 0} questions generated using ${useDefaultPattern ? 'default CBSE pattern' : 'custom pattern'}`
        });
      } else {
        throw new Error(response.message || 'Failed to generate questions');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuestions = async () => {
    if (generatedQuestions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please generate questions first",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save questions to the question paper
      const response = await questionPaperAPI.addQuestionsToPaper(questionPaper._id, {
        questions: generatedQuestions.map(q => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          marks: q.marks,
          difficulty: q.difficulty,
          bloomsTaxonomyLevel: q.bloomsTaxonomyLevel,
          unit: q.unit || 'AI Generated',
          tags: q.tags || []
        }))
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Questions saved to question paper successfully"
        });
        onQuestionsGenerated(response.questions || []);
        onClose();
      } else {
        throw new Error(response.message || 'Failed to save questions');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuestionEdit = (index: number, field: string, value: any) => {
    const updatedQuestions = [...generatedQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setGeneratedQuestions(updatedQuestions);
  };

  return (
    <div className="space-y-6 max-h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Question Generator</h2>
          <p className="text-gray-600">{questionPaper.title}</p>
        </div>
        <Button onClick={onClose} variant="outline" size="sm">
          Close
        </Button>
      </div>

      {/* Generation Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>Generation Parameters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="question-count">Number of Questions</Label>
              <Input
                id="question-count"
                type="number"
                min="1"
                max="50"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="EASY">Easy</option>
                <option value="MODERATE">Moderate</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="topic">Topic (Optional)</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Algebra, Geometry"
                className="mt-1"
              />
            </div>
          </div>

          {/* Pattern Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label className="text-sm font-medium">Question Paper Pattern:</Label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="pattern"
                    checked={useDefaultPattern}
                    onChange={() => setUseDefaultPattern(true)}
                    className="text-primary"
                  />
                  <span className="text-sm">Use Default CBSE Pattern</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="pattern"
                    checked={!useDefaultPattern}
                    onChange={() => setUseDefaultPattern(false)}
                    className="text-primary"
                  />
                  <span className="text-sm">Use Custom Template</span>
                </label>
              </div>
            </div>

            {useDefaultPattern && selectedPattern && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Using: {selectedPattern.name}
                  </span>
                </div>
                <p className="text-xs text-blue-600">
                  {selectedPattern.description} - {selectedPattern.totalMarks} marks, {selectedPattern.duration} minutes
                </p>
              </div>
            )}

            {!useDefaultPattern && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-800">
                    Custom template will be used if available for this subject
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleGenerateQuestions} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 mr-2" />
                Generate Questions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Questions ({generatedQuestions.length})</span>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSaveQuestions} 
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save to Question Paper
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {generatedQuestions.map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Question {index + 1}</Badge>
                    <Badge variant="secondary">{question.difficulty}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Question Text</Label>
                      <Textarea
                        value={question.questionText}
                        onChange={(e) => handleQuestionEdit(index, 'questionText', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    
                    {question.options && question.options.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Options</Label>
                        <div className="space-y-2 mt-1">
                          {question.options.map((option: string, optIndex: number) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <span className="w-6 text-sm font-medium">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optIndex] = e.target.value;
                                  handleQuestionEdit(index, 'options', newOptions);
                                }}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Correct Answer</Label>
                        <Input
                          value={question.correctAnswer}
                          onChange={(e) => handleQuestionEdit(index, 'correctAnswer', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Marks</Label>
                        <Input
                          type="number"
                          value={question.marks}
                          onChange={(e) => handleQuestionEdit(index, 'marks', parseInt(e.target.value) || 1)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    {question.explanation && (
                      <div>
                        <Label className="text-sm font-medium">Explanation</Label>
                        <Textarea
                          value={question.explanation}
                          onChange={(e) => handleQuestionEdit(index, 'explanation', e.target.value)}
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>How It Works</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. <strong>Generate Questions:</strong> AI creates questions based on your parameters</p>
            <p>2. <strong>Review & Edit:</strong> You can modify any generated question before saving</p>
            <p>3. <strong>Save to Database:</strong> Questions are saved with proper references to:</p>
            <ul className="ml-4 space-y-1">
              <li>• Question Paper ID (links questions to this paper)</li>
              <li>• Subject ID (links to the subject)</li>
              <li>• Class ID (links to the class)</li>
              <li>• Admin ID (links to the creator)</li>
            </ul>
            <p>4. <strong>Generate PDF:</strong> PDF is automatically generated from the saved questions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIQuestionGenerator;
