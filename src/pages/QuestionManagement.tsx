import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Brain,
  Target,
  BookOpen,
  GraduationCap,
  Settings,
  Upload,
  Download,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Blooms Taxonomy Levels
const BLOOMS_LEVELS = [
  { id: 'remember', name: 'Remember', description: 'Recall facts and basic concepts', color: 'bg-blue-100 text-blue-800' },
  { id: 'understand', name: 'Understand', description: 'Explain ideas or concepts', color: 'bg-green-100 text-green-800' },
  { id: 'apply', name: 'Apply', description: 'Use information in new situations', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'analyze', name: 'Analyze', description: 'Draw connections among ideas', color: 'bg-orange-100 text-orange-800' },
  { id: 'evaluate', name: 'Evaluate', description: 'Justify a stand or decision', color: 'bg-purple-100 text-purple-800' },
  { id: 'create', name: 'Create', description: 'Produce new or original work', color: 'bg-red-100 text-red-800' }
];

const DIFFICULTY_LEVELS = [
  { id: 'easy', name: 'Easy', description: 'Remember & Understand levels', color: 'bg-green-100 text-green-800' },
  { id: 'moderate', name: 'Moderate', description: 'Apply & Analyze levels', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'toughest', name: 'Toughest', description: 'Evaluate & Create levels', color: 'bg-red-100 text-red-800' }
];

// Mock data
const mockQuestions = [
  {
    id: '1',
    question: 'What is the formula for calculating the area of a circle?',
    subject: 'Mathematics',
    class: '11A',
    unit: 'Geometry',
    bloomsLevel: 'remember',
    difficulty: 'easy',
    isTwisted: false,
    options: ['A = πr²', 'A = 2πr', 'A = πd', 'A = r²'],
    correctAnswer: 0,
    explanation: 'The area of a circle is calculated using the formula A = πr², where r is the radius.',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    question: 'Explain how Newton\'s second law of motion applies to a car accelerating on a highway.',
    subject: 'Physics',
    class: '11A',
    unit: 'Laws of Motion',
    bloomsLevel: 'apply',
    difficulty: 'moderate',
    isTwisted: false,
    options: ['F = ma', 'F = mv', 'F = m/a', 'F = ma²'],
    correctAnswer: 0,
    explanation: 'Newton\'s second law states that force equals mass times acceleration (F = ma).',
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    question: 'Design an experiment to test the effect of temperature on the rate of a chemical reaction.',
    subject: 'Chemistry',
    class: '11A',
    unit: 'Chemical Kinetics',
    bloomsLevel: 'create',
    difficulty: 'toughest',
    isTwisted: true,
    options: ['Use different temperatures', 'Vary concentration', 'Change pressure', 'Modify pH'],
    correctAnswer: 0,
    explanation: 'To test temperature effects, systematically vary temperature while keeping other factors constant.',
    createdAt: '2024-01-13'
  }
];

const QuestionManagement = () => {
  const [questions, setQuestions] = useState(mockQuestions);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // AI Generation Form
  const [aiForm, setAiForm] = useState({
    subject: '',
    class: '',
    unit: '',
    totalQuestions: 10,
    bloomsDistribution: {
      remember: 20,
      understand: 20,
      apply: 20,
      analyze: 20,
      evaluate: 10,
      create: 10
    },
    twistedPercentage: 10,
    language: 'english'
  });

  // Manual Question Form
  const [questionForm, setQuestionForm] = useState({
    question: '',
    subject: '',
    class: '',
    unit: '',
    bloomsLevel: '',
    difficulty: '',
    isTwisted: false,
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const handleAIGeneration = async () => {
    setIsLoading(true);
    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate mock questions based on AI form
      const generatedQuestions = Array.from({ length: aiForm.totalQuestions }, (_, index) => ({
        id: `ai-${Date.now()}-${index}`,
        question: `AI Generated Question ${index + 1} for ${aiForm.subject} - ${aiForm.unit}`,
        subject: aiForm.subject,
        class: aiForm.class,
        unit: aiForm.unit,
        bloomsLevel: Object.keys(aiForm.bloomsDistribution)[index % 6],
        difficulty: index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'moderate' : 'toughest',
        isTwisted: Math.random() < (aiForm.twistedPercentage / 100),
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: index % 4,
        explanation: `Explanation for AI generated question ${index + 1}`,
        createdAt: new Date().toISOString().split('T')[0]
      }));

      setQuestions(prev => [...generatedQuestions, ...prev]);
      setShowAIDialog(false);

      toast({
        title: "Questions Generated",
        description: `Successfully generated ${aiForm.totalQuestions} questions using AI`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions using AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!questionForm.question || !questionForm.subject || !questionForm.class) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newQuestion = {
        id: `manual-${Date.now()}`,
        ...questionForm,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setQuestions(prev => [newQuestion, ...prev]);
      setShowCreateDialog(false);
      setQuestionForm({
        question: '',
        subject: '',
        class: '',
        unit: '',
        bloomsLevel: '',
        difficulty: '',
        isTwisted: false,
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      });

      toast({
        title: "Question Created",
        description: "Successfully created new question",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create question",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast({
      title: "Question Deleted",
      description: "Question has been removed",
    });
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.unit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || question.subject === selectedSubject;
    const matchesClass = selectedClass === 'all' || question.class === selectedClass;
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesClass && matchesDifficulty;
  });

  const getBloomsBadge = (level: string) => {
    const bloomsLevel = BLOOMS_LEVELS.find(l => l.id === level);
    return (
      <Badge className={bloomsLevel?.color || 'bg-gray-100 text-gray-800'}>
        {bloomsLevel?.name || level}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const diffLevel = DIFFICULTY_LEVELS.find(d => d.id === difficulty);
    return (
      <Badge className={diffLevel?.color || 'bg-gray-100 text-gray-800'}>
        {diffLevel?.name || difficulty}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Question Management</h1>
          </div>
          <p className="text-muted-foreground">
            Create questions based on Blooms Taxonomy with AI assistance
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Brain className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Question
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search & Filter Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="11A">Class 11A</SelectItem>
                  <SelectItem value="11B">Class 11B</SelectItem>
                  <SelectItem value="11C">Class 11C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="toughest">Toughest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  {/* Question Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{question.question}</h3>
                      <div className="flex items-center space-x-4">
                        <Badge className="bg-blue-100 text-blue-800">
                          {question.subject}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {question.class}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          {question.unit}
                        </Badge>
                        {getBloomsBadge(question.bloomsLevel)}
                        {getDifficultyBadge(question.difficulty)}
                        {question.isTwisted && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Twisted
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Options:</Label>
                    <div className="grid gap-2">
                      {question.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-sm font-medium w-6">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className={`text-sm ${index === question.correctAnswer ? 'text-green-600 font-semibold' : ''}`}>
                            {option}
                            {index === question.correctAnswer && (
                              <CheckCircle className="w-4 h-4 inline ml-2 text-green-600" />
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Explanation:</Label>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {question.explanation}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Created: {question.createdAt}</span>
                    <span>ID: {question.id}</span>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Generation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Question Generation
            </DialogTitle>
            <DialogDescription>
              Generate questions using AI based on Blooms Taxonomy distribution
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={aiForm.subject} onValueChange={(value) => setAiForm(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select value={aiForm.class} onValueChange={(value) => setAiForm(prev => ({ ...prev, class: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11A">Class 11A</SelectItem>
                    <SelectItem value="11B">Class 11B</SelectItem>
                    <SelectItem value="11C">Class 11C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Unit/Topic *</Label>
              <Input
                placeholder="Enter unit or topic"
                value={aiForm.unit}
                onChange={(e) => setAiForm(prev => ({ ...prev, unit: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Total Questions: {aiForm.totalQuestions}</Label>
              <Slider
                value={[aiForm.totalQuestions]}
                onValueChange={(value) => setAiForm(prev => ({ ...prev, totalQuestions: value[0] }))}
                max={50}
                min={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Blooms Taxonomy Distribution */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Blooms Taxonomy Distribution (%)</Label>
              {BLOOMS_LEVELS.map((level) => (
                <div key={level.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-sm font-medium">{level.name}</Label>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {aiForm.bloomsDistribution[level.id as keyof typeof aiForm.bloomsDistribution]}%
                    </span>
                  </div>
                  <Slider
                    value={[aiForm.bloomsDistribution[level.id as keyof typeof aiForm.bloomsDistribution]]}
                    onValueChange={(value) => setAiForm(prev => ({
                      ...prev,
                      bloomsDistribution: {
                        ...prev.bloomsDistribution,
                        [level.id]: value[0]
                      }
                    }))}
                    max={50}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          ))}

          {/* Twisted Questions */}
          <div className="space-y-2">
            <Label>Twisted Questions Percentage: {aiForm.twistedPercentage}%</Label>
            <Slider
              value={[aiForm.twistedPercentage]}
              onValueChange={(value) => setAiForm(prev => ({ ...prev, twistedPercentage: value[0] }))}
              max={30}
              min={0}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Percentage of questions that will be twisted/complex variations
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowAIDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAIGeneration}
              disabled={isLoading || !aiForm.subject || !aiForm.class || !aiForm.unit}
            >
              {isLoading ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Manual Question Creation Dialog */}
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create New Question
          </DialogTitle>
          <DialogDescription>
            Create a question manually based on Blooms Taxonomy
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Question *</Label>
            <Textarea
              placeholder="Enter your question..."
              value={questionForm.question}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select value={questionForm.subject} onValueChange={(value) => setQuestionForm(prev => ({ ...prev, subject: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select value={questionForm.class} onValueChange={(value) => setQuestionForm(prev => ({ ...prev, class: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11A">Class 11A</SelectItem>
                  <SelectItem value="11B">Class 11B</SelectItem>
                  <SelectItem value="11C">Class 11C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Unit/Topic</Label>
            <Input
              placeholder="Enter unit or topic"
              value={questionForm.unit}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, unit: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Blooms Level *</Label>
              <Select value={questionForm.bloomsLevel} onValueChange={(value) => setQuestionForm(prev => ({ ...prev, bloomsLevel: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Blooms level" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOMS_LEVELS.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} - {level.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty *</Label>
              <Select value={questionForm.difficulty} onValueChange={(value) => setQuestionForm(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} - {level.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="twisted"
              checked={questionForm.isTwisted}
              onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, isTwisted: !!checked }))}
            />
            <Label htmlFor="twisted">This is a twisted/complex question</Label>
          </div>

          <div className="space-y-4">
            <Label>Answer Options *</Label>
            {questionForm.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm font-medium w-6">
                  {String.fromCharCode(65 + index)}.
                </span>
                <Input
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...questionForm.options];
                    newOptions[index] = e.target.value;
                    setQuestionForm(prev => ({ ...prev, options: newOptions }));
                  }}
                />
                <Checkbox
                  checked={questionForm.correctAnswer === index}
                  onCheckedChange={() => setQuestionForm(prev => ({ ...prev, correctAnswer: index }))}
                />
                <Label className="text-sm">Correct</Label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Explanation</Label>
            <Textarea
              placeholder="Explain the correct answer..."
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateQuestion}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Question"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
);
};

export default QuestionManagement;
