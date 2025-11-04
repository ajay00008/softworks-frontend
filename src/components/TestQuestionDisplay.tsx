import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { questionPaperAPI } from '@/services/api';

interface TestQuestionDisplayProps {
  questionPaper: any;
}

const TestQuestionDisplay: React.FC<TestQuestionDisplayProps> = ({ questionPaper }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (questionPaper) {
      loadQuestions();
    }
  }, [questionPaper]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const questionsData = await questionPaperAPI.getQuestions(questionPaper._id);
      
      setQuestions(questionsData || []);
      
      if (!questionsData || questionsData.length === 0) {
        setError('No questions found for this question paper');
      }
    } catch (error) {
      setError('Failed to load questions');
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Question Paper Debug</span>
            </div>
            <Button onClick={loadQuestions} disabled={loading} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm">Question Paper Info:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>ID:</strong> {questionPaper._id}</p>
                  <p><strong>Title:</strong> {questionPaper.title}</p>
                  <p><strong>Status:</strong> {questionPaper.status}</p>
                  <p><strong>Questions Count:</strong> {questionPaper.questions?.length || 0}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm">API Response:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                  <p><strong>Error:</strong> {error || 'None'}</p>
                  <p><strong>Questions Found:</strong> {questions.length}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">Error: {error}</span>
                </div>
              </div>
            )}

            {questions.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Questions ({questions.length}):</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {questions.map((question, index) => (
                    <div key={question._id || index} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">Question {index + 1}</Badge>
                        <Badge variant="secondary">{question.difficulty || 'Unknown'}</Badge>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {question.questionText || 'No question text'}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        <strong>Type:</strong> {question.questionType} | 
                        <strong> Marks:</strong> {question.marks} | 
                        <strong> ID:</strong> {question._id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questions.length === 0 && !loading && !error && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Questions Found
                </h3>
                <p className="text-gray-600">
                  This question paper doesn't have any questions yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestQuestionDisplay;
