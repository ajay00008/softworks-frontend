import { PDFExportService, QuestionExportData } from './utils/pdfExport';

// Sample test data with varying question lengths to test spacing
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
    question: 'Which planet is known as the Red Planet and why is it called so? Explain the characteristics that make it unique in our solar system.',
    subject: 'Science',
    className: 'Class V',
    unit: 'Solar System',
    bloomsLevel: 'Remember',
    difficulty: 'Easy',
    isTwisted: false,
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
    explanation: 'Mars is called the Red Planet due to iron oxide on its surface.',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
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
  },
  {
    id: '4',
    question: 'A',
    subject: 'Test',
    className: 'Class V',
    unit: 'Spacing Test',
    bloomsLevel: 'Remember',
    difficulty: 'Easy',
    isTwisted: false,
    options: ['Option 1', 'Option 2'],
    correctAnswer: 0,
    explanation: 'This is a very short question to test spacing.',
    createdAt: new Date().toISOString()
  }
];

// Test function to demonstrate the new PDF export with jsPDF
export async function testPDFExport() {
  try {
    console.log('Testing PDF export with jsPDF...');
    
    // Test 1: Export questions with answers and explanations
    await PDFExportService.exportQuestionsToPDF(sampleQuestions, {
      title: 'Sample Question Bank',
      includeAnswers: true,
      includeExplanations: true,
      subject: 'Mixed Subjects',
      className: 'Class V',
      chapter: 'Sample Chapter',
      filename: 'sample-questions-with-answers.pdf'
    });
    
    console.log('✅ Questions with answers exported successfully');
    
    // Test 2: Export as question paper
    await PDFExportService.exportQuestionPaper(sampleQuestions, {
      title: 'Sample Question Paper',
      instructions: 'Answer all questions. Each question carries 2 marks.',
      timeLimit: 30,
      totalMarks: 8,
      subject: 'Mixed Subjects',
      className: 'Class V',
      chapter: 'Sample Chapter',
      filename: 'sample-question-paper.pdf'
    });
    
    console.log('✅ Question paper exported successfully');
    
    // Test 3: Export answer key
    await PDFExportService.exportAnswerKey(sampleQuestions, {
      title: 'Sample Answer Key',
      subject: 'Mixed Subjects',
      className: 'Class V',
      chapter: 'Sample Chapter',
      filename: 'sample-answer-key.pdf'
    });
    
    console.log('✅ Answer key exported successfully');
    
    console.log('🎉 All PDF exports completed successfully with jsPDF!');
    console.log('✨ Features: Browser-compatible, smart spacing (8pts between questions only), clean design with jsPDF');
    
  } catch (error) {
    console.error('❌ Error testing PDF export:', error);
  }
}

// Export the test function for use in components
export { testPDFExport };
