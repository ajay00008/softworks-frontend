// AI Correction Service
// Handles AI-powered answer sheet correction with multilingual support

export interface AICorrectionRequest {
  answerSheetId: string;
  examId: string;
  studentId: string;
  imageUrls: string[];
  language: SupportedLanguage;
  subject: string;
  syllabusData?: SyllabusData;
  correctionOptions: CorrectionOptions;
}

export interface AICorrectionResponse {
  answerSheetId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  confidence: number;
  corrections: AnswerCorrection[];
  summary: CorrectionSummary;
  processingTime: number;
  errors?: string[];
  warnings?: string[];
}

export interface AnswerCorrection {
  questionNumber: number;
  question: string;
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
  marks: number;
  maxMarks: number;
  confidence: number;
  reasoning: string;
  suggestions?: string[];
  stepByStepMarks?: StepMarks[];
}

export interface StepMarks {
  step: number;
  description: string;
  marks: number;
  maxMarks: number;
  isCorrect: boolean;
}

export interface CorrectionSummary {
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  strengths: string[];
  weaknesses: string[];
  unansweredQuestions: number[];
  irrelevantAnswers: number[];
  overallFeedback: string;
}

export interface ManualOverride {
  answerSheetId: string;
  questionNumber: number;
  originalMarks: number;
  overrideMarks: number;
  reason: string;
  overriddenBy: string;
  overriddenAt: string;
}

export interface LearningData {
  questionType: string;
  subject: string;
  language: string;
  correctAnswer: string;
  studentAnswer: string;
  aiMarks: number;
  manualMarks: number;
  confidence: number;
  overrideReason?: string;
}

export interface SupportedLanguage {
  code: 'en' | 'ta' | 'hi' | 'ml' | 'te' | 'kn' | 'fr';
  name: string;
  isActive: boolean;
}

export interface SyllabusData {
  subject: string;
  chapters: ChapterData[];
  questionTypes: QuestionTypeData[];
  markingScheme: MarkingSchemeData;
}

export interface ChapterData {
  id: string;
  name: string;
  topics: string[];
  weightage: number;
}

export interface QuestionTypeData {
  type: string;
  marksPerQuestion: number;
  totalQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MarkingSchemeData {
  totalMarks: number;
  passingMarks: number;
  gradeBoundaries: GradeBoundary[];
}

export interface GradeBoundary {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
}

export interface CorrectionOptions {
  enableSpellingCorrection: boolean;
  enableGrammarCorrection: boolean;
  enableStepWiseMarking: boolean;
  enablePartialMarks: boolean;
  strictMode: boolean;
  customInstructions?: string;
}

class AICorrectionService {
  private apiBaseUrl: string;
  private supportedLanguages: SupportedLanguage[] = [
    { code: 'en', name: 'English', isActive: true },
    { code: 'ta', name: 'Tamil', isActive: true },
    { code: 'hi', name: 'Hindi', isActive: true },
    { code: 'ml', name: 'Malayalam', isActive: false },
    { code: 'te', name: 'Telugu', isActive: false },
    { code: 'kn', name: 'Kannada', isActive: false },
    { code: 'fr', name: 'French', isActive: false }
  ];

  constructor(apiBaseUrl: string = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Submit answer sheet for AI correction
   */
  async submitForCorrection(request: AICorrectionRequest): Promise<AICorrectionResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-correction/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Failed to submit for AI correction');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get correction status
   */
  async getCorrectionStatus(answerSheetId: string): Promise<AICorrectionResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-correction/status/${answerSheetId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get correction status');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get correction results
   */
  async getCorrectionResults(answerSheetId: string): Promise<AICorrectionResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-correction/results/${answerSheetId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get correction results');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Apply manual override
   */
  async applyManualOverride(override: ManualOverride): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-correction/override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(override)
      });

      if (!response.ok) {
        throw new Error('Failed to apply manual override');
      }

      // Update learning data
      await this.updateLearningData(override);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get learning insights
   */
  async getLearningInsights(subject?: string, language?: string): Promise<{
    accuracy: number;
    commonMistakes: string[];
    improvementAreas: string[];
    confidenceTrends: number[];
  }> {
    try {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (language) params.append('language', language);

      const response = await fetch(`${this.apiBaseUrl}/ai-correction/insights?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get learning insights');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Detect language from text
   */
  async detectLanguage(text: string): Promise<SupportedLanguage> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-correction/detect-language`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Failed to detect language');
      }

      const result = await response.json();
      return result.language;
    } catch (error) {
      // Fallback to English
      return this.supportedLanguages[0];
    }
  }

  /**
   * Validate answer sheet image
   */
  async validateAnswerSheet(imageUrl: string): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-correction/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) {
        throw new Error('Failed to validate answer sheet');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return this.supportedLanguages.filter(lang => lang.isActive);
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.some(lang => 
      lang.code === languageCode && lang.isActive
    );
  }

  /**
   * Generate correction report
   */
  async generateCorrectionReport(answerSheetId: string): Promise<{
    reportUrl: string;
    summary: CorrectionSummary;
    detailedAnalysis: string;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-correction/report/${answerSheetId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate correction report');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Batch process multiple answer sheets
   */
  async batchProcess(answerSheetIds: string[]): Promise<{
    processed: string[];
    failed: string[];
    processing: string[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-correction/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ answerSheetIds })
      });

      if (!response.ok) {
        throw new Error('Failed to start batch processing');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get processing queue status
   */
  async getQueueStatus(): Promise<{
    total: number;
    processing: number;
    completed: number;
    failed: number;
    estimatedTime: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-correction/queue-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get queue status');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update learning data from manual overrides
   */
  private async updateLearningData(override: ManualOverride): Promise<void> {
    try {
      const learningData: LearningData = {
        questionType: 'unknown', // This would be determined from the question
        subject: 'unknown', // This would be determined from the exam
        language: 'en', // This would be determined from the answer sheet
        correctAnswer: 'unknown', // This would be retrieved from the question
        studentAnswer: 'unknown', // This would be retrieved from the answer sheet
        aiMarks: override.originalMarks,
        manualMarks: override.overrideMarks,
        confidence: 0, // This would be retrieved from the AI response
        overrideReason: override.reason
      };

      await fetch(`${this.apiBaseUrl}/ai-correction/learn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(learningData)
      });
    } catch (error) {
      // Don't throw error as this is not critical
    }
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  /**
   * Format confidence score
   */
  formatConfidence(confidence: number): string {
    if (confidence >= 90) return 'High';
    if (confidence >= 70) return 'Medium';
    if (confidence >= 50) return 'Low';
    return 'Very Low';
  }

  /**
   * Get confidence color
   */
  getConfidenceColor(confidence: number): string {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    if (confidence >= 50) return 'text-orange-600';
    return 'text-red-600';
  }

  /**
   * Calculate processing time estimate
   */
  calculateProcessingTime(answerSheetCount: number, language: string): number {
    const baseTime = 30; // seconds per sheet
    const languageMultiplier = language === 'en' ? 1 : 1.5;
    return Math.ceil(answerSheetCount * baseTime * languageMultiplier);
  }
}

// Export singleton instance
export const aiCorrectionService = new AICorrectionService();

// Export types
export type {
  AICorrectionRequest,
  AICorrectionResponse,
  AnswerCorrection,
  StepMarks,
  CorrectionSummary,
  ManualOverride,
  LearningData,
  SupportedLanguage,
  SyllabusData,
  ChapterData,
  QuestionTypeData,
  MarkingSchemeData,
  GradeBoundary,
  CorrectionOptions
};