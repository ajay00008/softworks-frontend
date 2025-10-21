// Printing and Sharing Service
// Handles printing of answer sheets and sending results via WhatsApp/Email

export interface PrintOptions {
  includeAnswerKey?: boolean;
  includeMarks?: boolean;
  includeComments?: boolean;
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  watermark?: string;
}

export interface ShareOptions {
  method: 'whatsapp' | 'email' | 'both';
  recipients: string[];
  subject?: string;
  message?: string;
  includeAttachment?: boolean;
  attachmentFormat?: 'pdf' | 'image';
}

export interface StudentResult {
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  examName: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  answers: AnswerDetail[];
  comments?: string;
  teacherComments?: string;
  parentContact?: {
    email?: string;
    whatsapp?: string;
    phone?: string;
  };
}

export interface AnswerDetail {
  questionNumber: number;
  question: string;
  correctAnswer: string;
  studentAnswer: string;
  marks: number;
  maxMarks: number;
  isCorrect: boolean;
  comments?: string;
}

export interface ExamReport {
  examId: string;
  examName: string;
  subject: string;
  className: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passRate: number;
  gradeDistribution: {
    grade: string;
    count: number;
    percentage: number;
  }[];
  studentResults: StudentResult[];
}

class PrintingSharingService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Print individual student answer sheet
   */
  async printStudentSheet(
    studentId: string, 
    examId: string, 
    options: PrintOptions = {}
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/printing/student-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          studentId,
          examId,
          options
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate printable sheet');
      }

      const blob = await response.blob();
      this.downloadBlob(blob, `student-sheet-${studentId}-${examId}.pdf`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Print all student answer sheets for an exam
   */
  async printAllSheets(
    examId: string, 
    options: PrintOptions = {}
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/printing/all-sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          examId,
          options
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate printable sheets');
      }

      const blob = await response.blob();
      this.downloadBlob(blob, `all-sheets-${examId}.pdf`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate exam report
   */
  async generateExamReport(examId: string): Promise<ExamReport> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/printing/exam-report/${examId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate exam report');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Print exam report
   */
  async printExamReport(examId: string, options: PrintOptions = {}): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/printing/exam-report/${examId}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ options })
      });

      if (!response.ok) {
        throw new Error('Failed to generate printable report');
      }

      const blob = await response.blob();
      this.downloadBlob(blob, `exam-report-${examId}.pdf`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send results via WhatsApp
   */
  async sendWhatsAppResults(
    studentId: string, 
    examId: string, 
    options: ShareOptions
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/sharing/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          studentId,
          examId,
          options
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }

      const result = await response.json();
      } catch (error) {
      throw error;
    }
  }

  /**
   * Send results via Email
   */
  async sendEmailResults(
    studentId: string, 
    examId: string, 
    options: ShareOptions
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/sharing/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          studentId,
          examId,
          options
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const result = await response.json();
      } catch (error) {
      throw error;
    }
  }

  /**
   * Send results via both WhatsApp and Email
   */
  async sendResults(
    studentId: string, 
    examId: string, 
    options: ShareOptions
  ): Promise<void> {
    try {
      if (options.method === 'whatsapp' || options.method === 'both') {
        await this.sendWhatsAppResults(studentId, examId, options);
      }
      
      if (options.method === 'email' || options.method === 'both') {
        await this.sendEmailResults(studentId, examId, options);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send bulk results to multiple students
   */
  async sendBulkResults(
    examId: string, 
    studentIds: string[], 
    options: ShareOptions
  ): Promise<{ success: string[], failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };

    for (const studentId of studentIds) {
      try {
        await this.sendResults(studentId, examId, options);
        results.success.push(studentId);
      } catch (error) {
        results.failed.push(studentId);
      }
    }

    return results;
  }

  /**
   * Generate WhatsApp message template
   */
  generateWhatsAppMessage(studentResult: StudentResult): string {
    const { studentName, rollNumber, examName, subject, obtainedMarks, totalMarks, percentage, grade } = studentResult;
    
    return `📊 *Exam Results - ${examName}*

👤 *Student:* ${studentName}
🎓 *Roll Number:* ${rollNumber}
📚 *Subject:* ${subject}

📈 *Performance:*
• Marks: ${obtainedMarks}/${totalMarks}
• Percentage: ${percentage}%
• Grade: ${grade}

${grade === 'F' ? '❌ Needs Improvement' : '✅ Good Performance'}

For detailed analysis, please contact the school administration.

---
*Generated by Softworks Examination System*`;
  }

  /**
   * Generate Email template
   */
  generateEmailTemplate(studentResult: StudentResult): { subject: string, body: string } {
    const { studentName, examName, subject, obtainedMarks, totalMarks, percentage, grade } = studentResult;
    
    const subject = `Exam Results - ${examName} - ${studentName}`;
    
    const body = `
Dear Parent/Guardian,

We are pleased to share the examination results for your child.

Student Details:
- Name: ${studentName}
- Roll Number: ${studentResult.rollNumber}
- Class: ${studentResult.className}

Exam Details:
- Exam: ${examName}
- Subject: ${subject}
- Total Marks: ${totalMarks}
- Obtained Marks: ${obtainedMarks}
- Percentage: ${percentage}%
- Grade: ${grade}

${grade === 'F' ? 
  'We recommend additional support and guidance for your child to improve their performance.' : 
  'Congratulations on your child\'s performance!'
}

Please feel free to contact us if you have any questions or concerns.

Best regards,
School Administration

---
This is an automated message from Softworks Examination System.
    `.trim();

    return { subject, body };
  }

  /**
   * Get print preview URL
   */
  getPrintPreviewUrl(studentId: string, examId: string, options: PrintOptions = {}): string {
    const params = new URLSearchParams({
      studentId,
      examId,
      ...options
    });
    
    return `${this.apiBaseUrl}/printing/preview?${params.toString()}`;
  }

  /**
   * Download blob as file
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  /**
   * Check if WhatsApp is available
   */
  isWhatsAppAvailable(): boolean {
    return navigator.userAgent.includes('WhatsApp') || 
           window.location.protocol === 'https:';
  }

  /**
   * Open WhatsApp with pre-filled message
   */
  openWhatsApp(phoneNumber: string, message: string): void {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Open email client with pre-filled content
   */
  openEmailClient(email: string, subject: string, body: string): void {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoUrl = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
    window.location.href = mailtoUrl;
  }
}

// Export singleton instance
export const printingSharingService = new PrintingSharingService();

// Export types
export type {
  PrintOptions,
  ShareOptions,
  StudentResult,
  AnswerDetail,
  ExamReport
};