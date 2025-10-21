import { API_BASE_URL } from './config';

export interface Question {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  bloomsLevel: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
  unit: string;
  marks: number;
}

export interface QuestionPaper {
  _id: string;
  title: string;
  className: string;
  subjects: string[];
  questions: Question[];
  pdfUrl: string;
  totalMarks: number;
  duration: number;
  instructions: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface CreateQuestionPaperRequest {
  title: string;
  className: string;
  subjects: string[];
  questions: Question[];
  duration?: number;
  instructions?: string;
}

export interface UpdateQuestionPaperRequest {
  title?: string;
  className?: string;
  subjects?: string[];
  questions?: Question[];
  duration?: number;
  instructions?: string;
}

export interface QuestionPaperResponse {
  success: boolean;
  data: QuestionPaper;
  message?: string;
}

export interface QuestionPaperListResponse {
  success: boolean;
  data: QuestionPaper[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class QuestionPaperAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async createQuestionPaper(data: CreateQuestionPaperRequest): Promise<QuestionPaperResponse> {
    const response = await fetch(`${API_BASE_URL}/question-papers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question paper');
    }

    return response.json();
  }

  async getQuestionPaper(id: string): Promise<QuestionPaperResponse> {
    const response = await fetch(`${API_BASE_URL}/question-papers/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch question paper');
    }

    return response.json();
  }

  async updateQuestionPaper(id: string, data: UpdateQuestionPaperRequest): Promise<QuestionPaperResponse> {
    const response = await fetch(`${API_BASE_URL}/question-papers/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update question paper');
    }

    return response.json();
  }

  async deleteQuestionPaper(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/question-papers/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete question paper');
    }

    return response.json();
  }

  async getAllQuestionPapers(params?: {
    page?: number;
    limit?: number;
    className?: string;
    subjects?: string[];
    createdBy?: string;
  }): Promise<QuestionPaperListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.className) queryParams.append('className', params.className);
    if (params?.subjects) queryParams.append('subjects', params.subjects.join(','));
    if (params?.createdBy) queryParams.append('createdBy', params.createdBy);

    const response = await fetch(`${API_BASE_URL}/question-papers?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch question papers');
    }

    return response.json();
  }

  async downloadPDF(pdfUrl: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${pdfUrl}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `question-paper-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const questionPaperAPI = new QuestionPaperAPI();
