import React from 'react';
import { PDFExportService, QuestionExportData } from '../utils/pdfExport';

// Example component showing how to use the PDF export service with jsPDF
export const PDFExportExample: React.FC = () => {
  const sampleQuestions: QuestionExportData[] = [
    {
      id: '1',
      question: 'What is the capital of France?',
      subject: 'Geography',
      className: 'Class V',
      unit: 'Countries and Capitals',
      bloomsLevel: 'Remember',
      difficulty: 'Easy',
      isTwisted: false,
      options: ['London', 'Paris', 'Berlin', 'Madrid'],
      correctAnswer: 1,
      explanation: 'Paris is the capital and largest city of France.',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      question: 'What is 15 + 27?',
      subject: 'Mathematics',
      className: 'Class V',
      unit: 'Addition',
      bloomsLevel: 'Apply',
      difficulty: 'Medium',
      isTwisted: false,
      options: ['40', '41', '42', '43'],
      correctAnswer: 2,
      explanation: '15 + 27 = 42',
      createdAt: new Date().toISOString()
    }
  ];

  const handleExportQuestions = async () => {
    try {
      await PDFExportService.exportQuestionsToPDF(sampleQuestions, {
        includeAnswers: true,
        includeExplanations: true,
        subject: 'Mixed Subjects',
        className: 'Class V',
        chapter: 'Sample Chapter'
      });
    } catch (error) {
      console.error('Error exporting questions:', error);
    }
  };

  const handleExportQuestionPaper = async () => {
    try {
      await PDFExportService.exportQuestionPaper(sampleQuestions, {
        instructions: 'Answer all questions. Each question carries 2 marks.',
        timeLimit: 30,
        totalMarks: 4,
        subject: 'Mixed Subjects',
        className: 'Class V',
        chapter: 'Sample Chapter'
      });
    } catch (error) {
      console.error('Error exporting question paper:', error);
    }
  };

  const handleExportAnswerKey = async () => {
    try {
      await PDFExportService.exportAnswerKey(sampleQuestions, {
        subject: 'Mixed Subjects',
        className: 'Class V',
        chapter: 'Sample Chapter'
      });
    } catch (error) {
      console.error('Error exporting answer key:', error);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">PDF Export with jsPDF</h2>
      <p className="text-gray-600">Browser-compatible PDF generation with consistent spacing</p>
      
      <div className="space-y-2">
        <button
          onClick={handleExportQuestions}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Export Questions with Answers
        </button>
        
        <button
          onClick={handleExportQuestionPaper}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export Question Paper
        </button>
        
        <button
          onClick={handleExportAnswerKey}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Export Answer Key
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Features:</h3>
        <ul className="text-sm space-y-1">
          <li>✅ Browser-compatible with jsPDF</li>
          <li>✅ Smart 8-point spacing between questions only</li>
          <li>✅ Professional styling with colors</li>
          <li>✅ Word wrapping for long text</li>
          <li>✅ Clean, simple design</li>
          <li>✅ No external dependencies</li>
        </ul>
      </div>
    </div>
  );
};

export default PDFExportExample;
