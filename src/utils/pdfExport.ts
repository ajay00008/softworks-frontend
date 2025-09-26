import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface QuestionExportData {
  id: string;
  question: string;
  subject: string;
  className: string;
  unit: string;
  bloomsLevel: string;
  difficulty: string;
  isTwisted: boolean;
  options: string[];
  correctAnswer: number;
  explanation: string;
  createdAt: string;
}

export class PDFExportService {
  /**
   * Export questions to PDF
   */
  static async exportQuestionsToPDF(
    questions: QuestionExportData[],
    options: {
      title?: string;
      includeAnswers?: boolean;
      includeExplanations?: boolean;
      filename?: string;
      subject?: string;
      className?: string;
      chapter?: string;
    } = {}
  ): Promise<void> {
    const {
      title = 'Question Bank Export',
      includeAnswers = false,
      includeExplanations = false,
      filename = `questions-export-${new Date().toISOString().split('T')[0]}.pdf`,
      subject = 'Mathematics',
      className = 'Class V',
      chapter = 'Chapter 1'
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      const lines = doc.splitTextToSize(text, contentWidth);
      const lineHeight = fontSize * 0.4;
      
      // Check if we need a new page
      if (yPosition + (lines.length * lineHeight) > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * lineHeight + 5;
    };

    // Add professional header
    doc.setFillColor(255, 140, 0); // Orange color
    doc.rect(0, 0, pageWidth, 8, 'F'); // Orange header bar
    
    // Add branding and class info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`${className} ${subject}`, 20, 15);
    doc.text(chapter, 100, 15);
    doc.text('EDUADMIN SYSTEM', pageWidth - 60, 15);
    doc.text('LIVE ONLINE TUTORING', pageWidth - 60, 20);
    
    // Add horizontal line
    doc.setDrawColor(139, 69, 19); // Brown color
    doc.setLineWidth(2);
    doc.line(20, 25, pageWidth - 20, 25);
    
    // Add main title
    yPosition = 35;
    addText('NCERT Solutions', 16, true);
    addText(`${subject} ${className}`, 14, true);
    addText(chapter, 14, true);
    yPosition += 15;

    // Add questions
    questions.forEach((question, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = margin;
      }

      // Question number (bold, like in the example)
      addText(`${index + 1}. ${question.question}`, 12, true);
      yPosition += 8;

      // Options (if multiple choice) - formatted like the example
      if (question.options && question.options.length > 0) {
        question.options.forEach((option, optIndex) => {
          const optionText = `${String.fromCharCode(65 + optIndex)}. ${option}`;
          addText(optionText, 11);
        });
        yPosition += 8;
      }

      // Answer (if requested)
      if (includeAnswers && question.options && question.options.length > 0) {
        const correctAnswerText = `Correct Answer: ${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}`;
        addText(correctAnswerText, 10, true);
        yPosition += 5;
      }

      // Explanation (if requested)
      if (includeExplanations && question.explanation) {
        addText(`Explanation: ${question.explanation}`, 10);
        yPosition += 5;
      }

      // Separator line
      if (index < questions.length - 1) {
        addText('─'.repeat(50), 10);
        yPosition += 10;
      }
    });

    // Save the PDF
    doc.save(filename);
  }

  /**
   * Export questions as a formatted question paper
   */
  static async exportQuestionPaper(
    questions: QuestionExportData[],
    options: {
      title?: string;
      instructions?: string;
      timeLimit?: number;
      totalMarks?: number;
      filename?: string;
      subject?: string;
      className?: string;
      chapter?: string;
    } = {}
  ): Promise<void> {
    const {
      title = 'Question Paper',
      instructions = 'Answer all questions. Each question carries equal marks.',
      timeLimit,
      totalMarks,
      filename = `question-paper-${new Date().toISOString().split('T')[0]}.pdf`,
      subject = 'Mathematics',
      className = 'Class V',
      chapter = 'Chapter 1'
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      const lines = doc.splitTextToSize(text, contentWidth);
      const lineHeight = fontSize * 0.4;
      
      // Check if we need a new page
      if (yPosition + (lines.length * lineHeight) > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * lineHeight + 5;
    };

    // Add professional header
    doc.setFillColor(255, 140, 0); // Orange color
    doc.rect(0, 0, pageWidth, 8, 'F'); // Orange header bar
    
    // Add branding and class info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`${className} ${subject}`, 20, 15);
    doc.text(chapter, 100, 15);
    doc.text('EDUADMIN SYSTEM', pageWidth - 60, 15);
    doc.text('LIVE ONLINE TUTORING', pageWidth - 60, 20);
    
    // Add horizontal line
    doc.setDrawColor(139, 69, 19); // Brown color
    doc.setLineWidth(2);
    doc.line(20, 25, pageWidth - 20, 25);
    
    // Add main title
    yPosition = 35;
    addText('NCERT Solutions', 16, true);
    addText(`${subject} ${className}`, 14, true);
    addText(chapter, 14, true);
    yPosition += 15;

    // Paper details
    const details = [
      `Date: ${new Date().toLocaleDateString()}`,
      `Total Questions: ${questions.length}`
    ];
    
    if (timeLimit) {
      details.push(`Time: ${timeLimit} minutes`);
    }
    
    if (totalMarks) {
      details.push(`Total Marks: ${totalMarks}`);
    }
    
    addText(details.join(' | '), 10);
    yPosition += 10;

    // Instructions
    addText('Instructions:', 12, true);
    addText(instructions, 10);
    yPosition += 10;

    // Questions
    questions.forEach((question, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = margin;
      }

      // Question
      addText(`${index + 1}. ${question.question}`, 12);
      yPosition += 5;

      // Options
      if (question.options && question.options.length > 0) {
        question.options.forEach((option, optIndex) => {
          const optionText = `   ${String.fromCharCode(65 + optIndex)}) ${option}`;
          addText(optionText, 10);
        });
        yPosition += 10;
      } else {
        yPosition += 10;
      }
    });

    // Save the PDF
    doc.save(filename);
  }

  /**
   * Export questions with answer key
   */
  static async exportAnswerKey(
    questions: QuestionExportData[],
    options: {
      title?: string;
      filename?: string;
      subject?: string;
      className?: string;
      chapter?: string;
    } = {}
  ): Promise<void> {
    const {
      title = 'Answer Key',
      filename = `answer-key-${new Date().toISOString().split('T')[0]}.pdf`,
      subject = 'Mathematics',
      className = 'Class V',
      chapter = 'Chapter 1'
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      const lines = doc.splitTextToSize(text, contentWidth);
      const lineHeight = fontSize * 0.4;
      
      // Check if we need a new page
      if (yPosition + (lines.length * lineHeight) > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * lineHeight + 5;
    };

    // Add professional header
    doc.setFillColor(255, 140, 0); // Orange color
    doc.rect(0, 0, pageWidth, 8, 'F'); // Orange header bar
    
    // Add branding and class info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`${className} ${subject}`, 20, 15);
    doc.text(chapter, 100, 15);
    doc.text('EDUADMIN SYSTEM', pageWidth - 60, 15);
    doc.text('LIVE ONLINE TUTORING', pageWidth - 60, 20);
    
    // Add horizontal line
    doc.setDrawColor(139, 69, 19); // Brown color
    doc.setLineWidth(2);
    doc.line(20, 25, pageWidth - 20, 25);
    
    // Add main title
    yPosition = 35;
    addText('NCERT Solutions', 16, true);
    addText(`${subject} ${className}`, 14, true);
    addText(chapter, 14, true);
    addText(`Generated on: ${new Date().toLocaleDateString()}`, 10);
    yPosition += 15;

    // Answer key
    questions.forEach((question, index) => {
      if (question.options && question.options.length > 0) {
        const correctAnswer = `${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}`;
        addText(`Q${index + 1}: ${correctAnswer}`, 12);
        yPosition += 5;
      }
    });

    // Save the PDF
    doc.save(filename);
  }
}
