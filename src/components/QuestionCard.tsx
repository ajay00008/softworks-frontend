import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Question } from '@/services/questionPaperAPI';

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function QuestionCard({ question, index, onEdit, onDelete }: QuestionCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBloomsColor = (level: string) => {
    switch (level) {
      case 'REMEMBER':
        return 'bg-blue-100 text-blue-800';
      case 'UNDERSTAND':
        return 'bg-indigo-100 text-indigo-800';
      case 'APPLY':
        return 'bg-purple-100 text-purple-800';
      case 'ANALYZE':
        return 'bg-pink-100 text-pink-800';
      case 'EVALUATE':
        return 'bg-orange-100 text-orange-800';
      case 'CREATE':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="font-semibold">
                Q{index + 1}
              </Badge>
              <Badge variant="secondary">
                {question.marks} mark{question.marks !== 1 ? 's' : ''}
              </Badge>
              <Badge className={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Badge>
              <Badge className={getBloomsColor(question.bloomsLevel)}>
                {question.bloomsLevel}
              </Badge>
              <Badge variant="outline">
                {question.unit}
              </Badge>
            </div>

            <div className="mb-3">
              <p className="text-gray-900 font-medium mb-2">{question.question}</p>
              
              <div className="space-y-1">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`flex items-center space-x-2 text-sm ${
                      question.correctAnswer === optionIndex
                        ? 'text-green-700 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    <span className="w-4 text-center">
                      {String.fromCharCode(65 + optionIndex)})
                    </span>
                    <span>{option}</span>
                    {question.correctAnswer === optionIndex && (
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Correct
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {question.explanation && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Explanation:</span> {question.explanation}
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex items-center"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
