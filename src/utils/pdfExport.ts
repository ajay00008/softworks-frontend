import jsPDF from 'jspdf';

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
   * Export questions to PDF using jsPDF
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

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addText = (
        text: string,
        fontSize: number = 12,
        isBold: boolean = false,
        color: [number, number, number] = [0, 0, 0]
      ): number => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0] * 255, color[1] * 255, color[2] * 255);

        const lines = doc.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.6; // better spacing
        const blockHeight = lines.length * lineHeight;

        // Page break check BEFORE writing
        if (yPosition + blockHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        doc.text(lines, margin, yPosition);
        yPosition += blockHeight;
        return blockHeight;
      };

      // Add header
      addText('EDUADMIN SYSTEM - LIVE ONLINE TUTORING', 14, true, [1, 0.55, 0]);

      // Add class info
      addText(`${className} ${subject} | ${chapter}`, 10, false, [0.4, 0.4, 0.4]);
      addText(`Generated: ${new Date().toLocaleDateString()}`, 10, false, [0.4, 0.4, 0.4]);

      // Add title
      addText('NCERT Solutions', 18, true, [0.17, 0.2, 0.31]);
      addText(`${subject} ${className}`, 14, true, [0.2, 0.27, 0.36]);
      addText(chapter, 14, true, [0.2, 0.27, 0.36]);

      // Add questions
      questions.forEach((question, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        // Question
        addText(`${index + 1}. ${question.question}`, 12, true);

        // Options
        if (question.options && question.options.length > 0) {
          question.options.forEach((option, optIndex) => {
            addText(`${String.fromCharCode(65 + optIndex)}. ${option}`, 11);
          });
        }

        // Answer (if requested)
        if (includeAnswers && question.options && question.options.length > 0) {
          const correctAnswerText = `Answer: ${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}`;
          addText(correctAnswerText, 10, true, [0.15, 0.68, 0.38]);
        }

        // Explanation (if requested)
        if (includeExplanations && question.explanation) {
          addText(`Explanation: ${question.explanation}`, 10, false, [0.5, 0.55, 0.55]);
        }

        // Add spacing only between questions (not after the last question)
        if (index < questions.length - 1) {
          yPosition += 5;
        }
      });

      // Save the PDF
      doc.save(filename);

    } catch (error) {
      throw new Error('Failed to generate PDF');
    }
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

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addText = (
        text: string,
        fontSize: number = 12,
        isBold: boolean = false,
        color: [number, number, number] = [0, 0, 0]
      ): number => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0] * 255, color[1] * 255, color[2] * 255);

        const lines = doc.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.6; // better spacing
        const blockHeight = lines.length * lineHeight;

        // Page break check BEFORE writing
        if (yPosition + blockHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        doc.text(lines, margin, yPosition);
        yPosition += blockHeight;
        return blockHeight;
      };

      // Add header
      addText('EDUADMIN SYSTEM - LIVE ONLINE TUTORING', 14, true, [1, 0.55, 0]);

      // Add class info
      addText(`${className} ${subject} | ${chapter}`, 10, false, [0.4, 0.4, 0.4]);
      addText(`Generated: ${new Date().toLocaleDateString()}`, 10, false, [0.4, 0.4, 0.4]);

      // Add title
      addText('NCERT Solutions', 18, true, [0.17, 0.2, 0.31]);
      addText(`${subject} ${className}`, 14, true, [0.2, 0.27, 0.36]);
      addText(chapter, 14, true, [0.2, 0.27, 0.36]);

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

      addText(details.join(' | '), 10, false, [0.4, 0.4, 0.4]);

      // Instructions
      addText('Instructions:', 12, true, [0.1, 0.46, 0.82]);
      addText(instructions, 10, false, [0.2, 0.2, 0.2]);

      // Add questions
      questions.forEach((question, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        // Question
        addText(`${index + 1}. ${question.question}`, 12, true);

        // Options
        if (question.options && question.options.length > 0) {
          question.options.forEach((option, optIndex) => {
            addText(`${String.fromCharCode(65 + optIndex)}) ${option}`, 10);
          });
        }

        // Add spacing only between questions (not after the last question)
        if (index < questions.length - 1) {
          yPosition += 5;
        }
      });

      // Save the PDF
      doc.save(filename);

    } catch (error) {
      throw new Error('Failed to generate PDF');
    }
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

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addText = (
        text: string,
        fontSize: number = 12,
        isBold: boolean = false,
        color: [number, number, number] = [0, 0, 0]
      ): number => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0] * 255, color[1] * 255, color[2] * 255);

        const lines = doc.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.6; // better spacing
        const blockHeight = lines.length * lineHeight;

        // Page break check BEFORE writing
        if (yPosition + blockHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        doc.text(lines, margin, yPosition);
        yPosition += blockHeight;
        return blockHeight;
      };

      // Add header
      addText('EDUADMIN SYSTEM - LIVE ONLINE TUTORING', 14, true, [1, 0.55, 0]);

      // Add class info
      addText(`${className} ${subject} | ${chapter}`, 10, false, [0.4, 0.4, 0.4]);
      addText(`Generated: ${new Date().toLocaleDateString()}`, 10, false, [0.4, 0.4, 0.4]);

      // Add title
      addText('NCERT Solutions', 18, true, [0.17, 0.2, 0.31]);
      addText(`${subject} ${className}`, 14, true, [0.2, 0.27, 0.36]);
      addText(chapter, 14, true, [0.2, 0.27, 0.36]);

      // Answer key title
      addText('Answer Key', 16, true, [0.29, 0.31, 0.33]);

      // Add answers
      questions.forEach((question, index) => {
        if (question.options && question.options.length > 0) {
          const correctAnswer = `${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}`;
          addText(`Q${index + 1}: ${correctAnswer}`, 12, true, [0.16, 0.65, 0.27]);
        }
      });

      // Save the PDF
      doc.save(filename);

    } catch (error) {
      throw new Error('Failed to generate PDF');
    }
  }
}
