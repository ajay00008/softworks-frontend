// API service for EduAdmin System
import { CreateTemplateRequest, UpdateTemplateRequest, TemplateAnalysis } from '@/types/question-paper-template';
import { SamplePaper, CreateSamplePaperRequest, UpdateSamplePaperRequest, SamplePaperAnalysis } from '@/types/sample-paper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Backend connection will be tested when needed through actual API calls

// Updated Student interface with correct class type
export interface Student {
  userId?: any;
  student?: any;
  id: string;
  email?: string;
  password?: string;
  name?: string;
  rollNumber?: string;
  class?: {
    id: string;
    name: string;
    displayName?: string;
    level?: number;
    section?: string;
    academicYear?: string;
  };
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  parentsPhone?: string;
  parentsEmail?: string;
  address?: string;
  whatsappNumber?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  _id: string;
  id: string;
  code: string;
  name: string;
  shortName: string;
  category: 'SCIENCE' | 'MATHEMATICS' | 'LANGUAGES' | 'SOCIAL_SCIENCES' | 'COMMERCE' | 'ARTS' | 'PHYSICAL_EDUCATION' | 'COMPUTER_SCIENCE' | 'OTHER';
  level: number[];
}

export interface Teacher {
  _id: string;
  userId?: any;
  id?: string;
  email: string;
  password: string;
  name: string;
  subjectIds?: string[];
  classIds?: string[];
  subjects?: Subject[];
  classes?: {
    id: string;
    name: string;
    displayName?: string;
    level?: number;
    section?: string;
  }[];
  phone?: string;
  address?: string;
  qualification?: string;
  experience?: number;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  _id: string;
  email: string;
  password?: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'teacher' | 'student';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  error: {
    message: string;
    stack?: string;
  };
  details?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface StudentParams extends PaginationParams {
  className?: string;
}

export interface TeacherParams extends PaginationParams {
  department?: string;
}

// Classes API
export interface ClassMapping {
  classId: string;
  className: string;
  subjects?: { subjectId: string; subjectName: string }[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth-token');
  if (!token) {
    console.error('No auth token found in localStorage');
    throw new Error('No authentication token found. Please log in again.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to get auth headers for file uploads (without Content-Type)
const getAuthHeadersForUpload = () => {
  const token = localStorage.getItem('auth-token');
  if (!token) {
    console.error('No auth token found in localStorage');
    throw new Error('No authentication token found. Please log in again.');
  }
  return {
    'Authorization': `Bearer ${token}`
  };
};

// All API calls now use real backend endpoints
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({ error: { message: 'Login failed' } }));
        throw new Error(errorData.error?.message || (typeof errorData.error === 'string' ? errorData.error : 'Login failed'));
      }

      const data: LoginResponse = await response.json();
      if (!data.success) {
        throw new Error('Login failed');
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Helper function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  console.log('API Response Status:', response.status);
  console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData: ApiError = await response.json();
      console.log('API Error Data:', errorData);
      errorMessage = errorData.error?.message || (typeof errorData.error === 'string' ? errorData.error : errorMessage);
    } catch (jsonError) {
      console.log('Failed to parse error response as JSON:', jsonError);
      // Try to get text response
      try {
        const textResponse = await response.text();
        console.log('API Error Text Response:', textResponse);
        errorMessage = textResponse || errorMessage;
      } catch (textError) {
        console.log('Failed to get text response:', textError);
      }
    }
    
    // Handle authentication errors globally
    if (response.status === 401 || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid or expired token')) {
      console.log('Authentication error detected, clearing auth data');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    console.log('Throwing error:', errorMessage);
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  console.log('handleApiResponse - Raw data:', data);
  
  if (data.success !== undefined) {
    console.log('handleApiResponse - Success field found:', data.success);
    if (!data.success) {
      throw new Error('API request failed');
    }
    // Handle different response structures
    if (data.data) {
      console.log('handleApiResponse - Returning data.data:', data.data);
      return data as T;
    } else if (data.question) {
      console.log('handleApiResponse - Returning data.question:', data.question);
      return data.question;
    } else if (data.questions) {
      console.log('handleApiResponse - Returning data.questions:', data.questions);
      return data as T;
    } else if (data.student) {
      console.log('handleApiResponse - Returning data.student:', data.student);
      return data.student;
    } else if (data.teacher) {
      console.log('handleApiResponse - Returning data.teacher:', data.teacher);
      return data.teacher;
    } else if (data.class) {
      console.log('handleApiResponse - Returning data.class:', data.class);
      return data.class;
    } else if (data.subject) {
      console.log('handleApiResponse - Returning data.subject:', data.subject);
      return data.subject;
    } else if (data.exam) {
      console.log('handleApiResponse - Returning data.exam:', data.exam);
      return data.exam;
    } else if (data.questionPaper) {
      console.log('handleApiResponse - Returning data.questionPaper:', data.questionPaper);
      return data.questionPaper;
    } else {
      console.log('handleApiResponse - Returning data as T:', data);
      return data as T;
    }
  } else if (Array.isArray(data)) {
    console.log('handleApiResponse - Returning array data:', data);
    return data as T;
  } else {
    console.log('handleApiResponse - Returning data as T (fallback):', data);
    return data as T;
  }
};

// Students API
export const studentsAPI = {
  getAll: async (params: StudentParams = {}): Promise<{ students: Student[]; pagination?: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.className) queryParams.append('className', params.className);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

      const response = await fetch(`${API_BASE_URL}/admin/students?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await handleApiResponse<{ data: Student[]; pagination?: any }>(response);
      return { students: result.data || [], pagination: result.pagination };
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<Student | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/students/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.status === 404) return null;
      return await handleApiResponse<Student>(response);
    } catch (error) {
      throw error;
    }
  },

  create: async (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/students`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(student),
      });

      return await handleApiResponse<Student>(response);
    } catch (error) {
      throw error;
    }
  },
  update: async (
    userId: string,
    student: Partial<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Student> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/students/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(student),
      });
  
      return await handleApiResponse<Student>(response);
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/students/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  activate: async (id: string): Promise<Student> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/students/${id}/activate`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      return await handleApiResponse<Student>(response);
    } catch (error) {
      throw error;
    }
  },

  getByClass: async (className: string, params: PaginationParams = {}): Promise<{ students: Student[]; pagination?: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_BASE_URL}/admin/students/class/${className}?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await handleApiResponse<Student[]>(response);
      return { students: data };
    } catch (error) {
      throw error;
    }
  }
};

// Teachers API
export const teachersAPI = {
  getAll: async (params: TeacherParams = {}): Promise<{ teachers: Teacher[]; pagination?: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.department) queryParams.append('department', params.department);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

      const url = `${API_BASE_URL}/admin/teachers?${queryParams}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await handleApiResponse<{ data: Teacher[]; pagination?: any }>(response);
      return { teachers: result.data || [], pagination: result.pagination };
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<Teacher | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/teachers/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (response.status === 404) return null;
      return await handleApiResponse<Teacher>(response);
    } catch (error) {
      throw error;
    }
  },

  create: async (teacher: Partial<Teacher>): Promise<Teacher> => {
    try {
      const payload = {
        ...teacher,
        subjectIds: teacher.subjectIds || [],
        classIds: teacher.classIds || [],
      };
      const response = await fetch(`${API_BASE_URL}/admin/teachers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      return await handleApiResponse<Teacher>(response);
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, teacher: Partial<Teacher>): Promise<Teacher> => {
    try {
      const payload = { ...teacher };
      
      // Only include subjectIds if they exist and have values
      if (teacher.subjectIds && teacher.subjectIds.length > 0) {
        payload.subjectIds = teacher.subjectIds;
      }
      
      // Only include classIds if they exist and have values
      if (teacher.classIds && teacher.classIds.length > 0) {
        payload.classIds = teacher.classIds;
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/teachers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      return await handleApiResponse<Teacher>(response);
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/teachers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  assignSubjects: async (id: string, subjectIds: string[]): Promise<Teacher> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/teachers/${id}/subjects`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ subjectIds }),
      });
      return await handleApiResponse<Teacher>(response);
    } catch (error) {
      throw error;
    }
  },

  assignClasses: async (id: string, classIds: string[]): Promise<Teacher> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/teachers/${id}/classes`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ classIds }),
      });
      return await handleApiResponse<Teacher>(response);
    } catch (error) {
      throw error;
    }
  },
};

// Admins API (Super Admin endpoints)
export const adminsAPI = {
  getAll: async (params: PaginationParams = {}): Promise<{ admins: User[]; pagination?: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

      const response = await fetch(`${API_BASE_URL}/super/admins?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await handleApiResponse<{ data: User[]; pagination?: any }>(response);
      return { admins: data.data, pagination: data.pagination };
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/super/admins/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.status === 404) return null;
      return await handleApiResponse<User>(response);
    } catch (error) {
      throw error;
    }
  },

  create: async (admin: Omit<User, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/super/admins`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(admin),
      });

      return await handleApiResponse<User>(response);
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, admin: Partial<Omit<User, 'id' | '_id' | 'createdAt' | 'updatedAt'>>): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/super/admins/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(admin),
      });

      return await handleApiResponse<User>(response);
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/super/admins/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  activate: async (id: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/super/admins/${id}/activate`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      return await handleApiResponse<User>(response);
    } catch (error) {
      throw error;
    }
  }
};

export const classesAPI = {
  getAll: async (): Promise<ClassMapping[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/classes`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{ data: ClassMapping[]; pagination?: any }>(response);
      return result.data || [];
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<ClassMapping | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/class-subject-mappings/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (response.status === 404) return null;
      return await handleApiResponse<ClassMapping>(response);
    } catch (error) {
      throw error;
    }
  },

  create: async (cls: Omit<ClassMapping, "classId" | "createdAt" | "updatedAt">): Promise<ClassMapping> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/class-subject-mappings`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(cls),
      });
      return await handleApiResponse<ClassMapping>(response);
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, cls: Partial<ClassMapping>): Promise<ClassMapping> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/class-subject-mappings/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(cls),
      });
      return await handleApiResponse<ClassMapping>(response);
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/class-subject-mappings/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },
};
// Class Management API interfaces
export interface Class {
  _id: string;
  id: string;
  name: string;
  displayName: string;
  level: number;
  section: string;
  academicYear: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassRequest {
  name: string;
  displayName: string;
  level: number;
  section: string;
  academicYear: string;
  description?: string;
}

export interface UpdateClassRequest {
  name?: string;
  displayName?: string;
  level?: number;
  section?: string;
  academicYear?: string;
  description?: string;
  isActive?: boolean;
}

export interface ClassFilters {
  page?: number;
  limit?: number;
  search?: string;
  level?: number;
  academicYear?: string;
  isActive?: boolean;
}

// Subject Management API interfaces
export interface Subject {
  _id: string;
  id: string;
  code: string;
  name: string;
  shortName: string;
  category: 'SCIENCE' | 'MATHEMATICS' | 'ENGLISH' | 'HINDI' | 'LANGUAGES' | 'SOCIAL_SCIENCES' | 'HISTORY' | 'GEOGRAPHY' | 'CIVICS' | 'ECONOMICS' | 'COMMERCE' | 'ACCOUNTANCY' | 'BUSINESS_STUDIES' | 'ARTS' | 'PHYSICAL_EDUCATION' | 'COMPUTER_SCIENCE' | 'INFORMATION_TECHNOLOGY' | 'OTHER';
  classIds: string[]; // Array of class IDs
  classes: Class[]; // Populated class data from aggregation
  level: number[]; // Array of levels from associated classes
  description?: string;
  color?: string;
  isActive: boolean;
  referenceBook?: {
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    uploadedAt: string;
    uploadedBy: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectRequest {
  code: string;
  name: string;
  shortName: string;
  category: 'SCIENCE' | 'MATHEMATICS' | 'ENGLISH' | 'HINDI' | 'LANGUAGES' | 'SOCIAL_SCIENCES' | 'HISTORY' | 'GEOGRAPHY' | 'CIVICS' | 'ECONOMICS' | 'COMMERCE' | 'ACCOUNTANCY' | 'BUSINESS_STUDIES' | 'ARTS' | 'PHYSICAL_EDUCATION' | 'COMPUTER_SCIENCE' | 'INFORMATION_TECHNOLOGY' | 'OTHER';
  classIds: string[];
  description?: string;
  color?: string;
}

export interface UpdateSubjectRequest {
  code?: string;
  name?: string;
  shortName?: string;
  category?: 'SCIENCE' | 'MATHEMATICS' | 'ENGLISH' | 'HINDI' | 'LANGUAGES' | 'SOCIAL_SCIENCES' | 'HISTORY' | 'GEOGRAPHY' | 'CIVICS' | 'ECONOMICS' | 'COMMERCE' | 'ACCOUNTANCY' | 'BUSINESS_STUDIES' | 'ARTS' | 'PHYSICAL_EDUCATION' | 'COMPUTER_SCIENCE' | 'INFORMATION_TECHNOLOGY' | 'OTHER';
  classIds?: string[];
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface SubjectFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: number;
  isActive?: boolean;
}

// Class Management API
export const classManagementAPI = {
  getAll: async (filters?: ClassFilters): Promise<{ classes: Class[]; total: number; page: number; limit: number }> => {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.level) params.append('level', filters.level.toString());
      if (filters?.academicYear) params.append('academicYear', filters.academicYear);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      const response = await fetch(`${API_BASE_URL}/admin/classes?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{ data: Class[]; pagination?: any }>(response);
      return { 
        classes: result.data || [], 
        total: result.pagination?.total || 0, 
        page: result.pagination?.page || 1, 
        limit: result.pagination?.limit || 10 
      };
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<Class> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/classes/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<Class>(response);
    } catch (error) {
      throw error;
    }
  },

  create: async (data: CreateClassRequest): Promise<Class> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/classes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<Class>(response);
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, data: UpdateClassRequest): Promise<Class> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/classes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<Class>(response);
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/classes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  getByLevel: async (level: number): Promise<Class[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/classes/level/${level}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<Class[]>(response);
    } catch (error) {
      throw error;
    }
  },
};

// Subject Management API
export const subjectManagementAPI = {
  getAll: async (filters?: SubjectFilters): Promise<{ subjects: Subject[]; total: number; page: number; limit: number }> => {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.level) params.append('level', filters.level.toString());
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      const response = await fetch(`${API_BASE_URL}/admin/subjects?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{ data: Subject[]; pagination?: any }>(response);
      return { 
        subjects: result.data || [], 
        total: result.pagination?.total || 0, 
        page: result.pagination?.page || 1, 
        limit: result.pagination?.limit || 10 
      };
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<Subject> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<Subject>(response);
    } catch (error) {
      throw error;
    }
  },

  create: async (data: CreateSubjectRequest): Promise<Subject> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<Subject>(response);
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, data: UpdateSubjectRequest): Promise<Subject> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<Subject>(response);
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  getByCategory: async (category: string): Promise<Subject[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects/category/${category}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<Subject[]>(response);
    } catch (error) {
      throw error;
    }
  },

  getByLevel: async (level: number): Promise<Subject[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects/level/${level}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<Subject[]>(response);
    } catch (error) {
      throw error;
    }
  },

  getAllByAdmin: async (adminId: string, filters?: SubjectFilters): Promise<{ subjects: Subject[]; total: number; page: number; limit: number }> => {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.level) params.append('level', filters.level.toString());
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      const response = await fetch(`${API_BASE_URL}/admin/subjects/admin/${adminId}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{ data: Subject[]; pagination?: any }>(response);
      return { 
        subjects: result.data || [], 
        total: result.pagination?.total || 0, 
        page: result.pagination?.page || 1, 
        limit: result.pagination?.limit || 10 
      };
    } catch (error) {
      throw error;
    }
  },

  // Upload reference book
  uploadReferenceBook: async (id: string, file: File): Promise<Subject> => {
    try {
      console.log('API - Converting file to base64:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data URL prefix (data:application/pdf;base64,)
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      console.log('API - Base64 conversion completed, length:', base64.length);
      
      const requestBody = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: base64
      };
      
      console.log('API - Request body prepared:', {
        fileName: requestBody.fileName,
        fileSize: requestBody.fileSize,
        fileType: requestBody.fileType,
        dataLength: requestBody.fileData.length
      });

      const headers = getAuthHeaders();
      console.log('API - Request headers:', headers);
      console.log('API - Request URL:', `${API_BASE_URL}/admin/subjects/${id}/reference-book-base64`);
      
      // Test if backend is accessible
      try {
        const testResponse = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
        console.log('Backend health check:', testResponse.status);
      } catch (healthError) {
        console.log('Backend health check failed:', healthError);
      }

      const response = await fetch(`${API_BASE_URL}/admin/subjects/${id}/reference-book-base64`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });
      
      console.log('API - Response status:', response.status);
      console.log('API - Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.log('API - Error response text:', errorText);
        } catch (e) {
          console.log('API - Could not read error response:', e);
        }
        throw new Error(`Upload failed: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
      }
      
      // Debug: Log the raw response before processing
      const responseClone = response.clone();
      const rawResponse = await responseClone.text();
      console.log('API - Raw response:', rawResponse);
      
      const result = await handleApiResponse<Subject>(response);
      console.log('API - Processed result:', result);
      return result;
    } catch (error) {
      console.error('API - Upload error:', error);
      throw error;
    }
  },

  // Check if reference book file exists
  checkReferenceBookExists: async (id: string): Promise<{ exists: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects/${id}/reference-book/check-upload`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to check reference book');
      }
      
      const result = await handleApiResponse<{ exists: boolean; message: string }>(response);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Download reference book
  downloadReferenceBook: async (id: string): Promise<Blob> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects/${id}/reference-book`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to download reference book');
      }
      
      return await response.blob();
    } catch (error) {
      throw error;
    }
  },

  // Delete reference book
  deleteReferenceBook: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects/${id}/reference-book`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },
};

export const subjectsAPI = {
  getAll: async (): Promise<Subject[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{ data: Subject[]; pagination?: any }>(response);
      return result.data || []; // Extract the data array from the response
    } catch (error) {
      throw error;
    }
  },
};

// Questions API
export interface Question {
  id: string;
  questionText: string;
  questionType: string;
  subjectId: string;
  classId: string;
  unit: string;
  bloomsTaxonomyLevel: string;
  difficulty: string;
  isTwisted: boolean;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  marks: number;
  timeLimit?: number;
  createdBy: string;
  isActive: boolean;
  tags?: string[];
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionGenerationRequest {
  subjectId: string;
  classId: string;
  unit: string;
  questionDistribution: Array<{
    bloomsLevel: string;
    difficulty: string;
    percentage: number;
    twistedPercentage?: number;
  }>;
  totalQuestions: number;
  language: string;
}

export const questionsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
    classId?: string;
    bloomsLevel?: string;
    difficulty?: string;
  }): Promise<{ questions: Question[]; pagination?: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params?.classId) queryParams.append('classId', params.classId);
      if (params?.bloomsLevel) queryParams.append('bloomsLevel', params.bloomsLevel);
      if (params?.difficulty) queryParams.append('difficulty', params.difficulty);

      const response = await fetch(`${API_BASE_URL}/admin/questions?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{ data: Question[]; pagination?: any }>(response);
      return { questions: result.data || [], pagination: result.pagination };
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<Question> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<Question>(response);
    } catch (error) {
      throw error;
    }
  },

  create: async (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(question),
      });
      return await handleApiResponse<Question>(response);
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, question: Partial<Question>): Promise<Question> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(question),
      });
      return await handleApiResponse<Question>(response);
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  generate: async (request: QuestionGenerationRequest): Promise<Question[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/questions/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });
      return await handleApiResponse<Question[]>(response);
    } catch (error) {
      throw error;
    }
  },

  getStatistics: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/questions/statistics`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<any>(response);
    } catch (error) {
      throw error;
    }
  },
};

// Question Paper Template Interfaces
export interface QuestionPaperTemplate {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  classId: string;
  gradeLevel: string;
  totalMarks: number;
  examName: string;
  duration: number;
  markDistribution: MarkDistribution[];
  bloomsDistribution: BloomsDistribution[];
  questionTypeDistribution: QuestionTypeDistribution[];
  unitSelections: UnitSelection[];
  twistedQuestionsPercentage: number;
  gradeSpecificSettings: GradeSpecificSettings;
  isPublic: boolean;
  tags: string[];
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarkDistribution {
  marks: number;
  count: number;
  percentage: number;
}

export interface BloomsDistribution {
  level: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
  percentage: number;
  twistedPercentage?: number;
}

export interface QuestionTypeDistribution {
  type: 'MULTIPLE_CHOICE' | 'FILL_BLANKS' | 'ONE_WORD_ANSWER' | 'TRUE_FALSE' | 'MULTIPLE_ANSWERS' | 'MATCHING_PAIRS' | 'DRAWING_DIAGRAM' | 'MARKING_PARTS';
  percentage: number;
  marksPerQuestion: number;
}

export interface UnitSelection {
  unitId: string;
  unitName: string;
  pages?: {
    startPage: number;
    endPage: number;
  };
  topics?: string[];
}

export interface GradeSpecificSettings {
  ageAppropriate: boolean;
  cognitiveLevel: 'PRE_SCHOOL' | 'PRIMARY' | 'MIDDLE' | 'SECONDARY' | 'SENIOR_SECONDARY';
  languageComplexity: 'VERY_SIMPLE' | 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'VERY_COMPLEX';
  visualAids: boolean;
  interactiveElements: boolean;
}

export interface GeneratedQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  marks: number;
  timeLimit?: number;
  matchingPairs?: { left: string; right: string }[];
  multipleCorrectAnswers?: string[];
  drawingInstructions?: string;
  markingInstructions?: string;
  visualAids?: string[];
  interactiveElements?: string[];
}

export interface QuestionPaperGenerationRequest {
  templateId: string;
  customSettings?: {
    totalMarks?: number;
    duration?: number;
    twistedQuestionsPercentage?: number;
    unitSelections?: UnitSelection[];
  };
}

export interface QuestionPaperGenerationResponse {
  questions: GeneratedQuestion[];
  template: {
    name: string;
    totalMarks: number;
    duration: number;
    gradeLevel: string;
  };
  statistics: {
    totalQuestions: number;
    questionTypes: Record<string, number>;
    bloomsDistribution: Record<string, number>;
    twistedQuestions: number;
  };
}

// Question Paper Template API
export const questionPaperTemplatesAPI = {
  // Get all templates
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
    classId?: string;
    gradeLevel?: string;
    isPublic?: boolean;
  }): Promise<{ templates: QuestionPaperTemplate[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params?.classId) queryParams.append('classId', params.classId);
      if (params?.gradeLevel) queryParams.append('gradeLevel', params.gradeLevel);
      if (params?.isPublic !== undefined) queryParams.append('isPublic', params.isPublic.toString());

      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ templates: QuestionPaperTemplate[]; pagination: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get single template
  getById: async (id: string): Promise<QuestionPaperTemplate> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<QuestionPaperTemplate>(response);
    } catch (error) {
      throw error;
    }
  },

  // Create template
  create: async (template: Omit<QuestionPaperTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed'>): Promise<QuestionPaperTemplate> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(template),
      });
      return await handleApiResponse<QuestionPaperTemplate>(response);
    } catch (error) {
      throw error;
    }
  },

  // Update template
  update: async (id: string, template: Partial<QuestionPaperTemplate>): Promise<QuestionPaperTemplate> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(template),
      });
      return await handleApiResponse<QuestionPaperTemplate>(response);
    } catch (error) {
      throw error;
    }
  },

  // Delete template
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  // Generate question paper from template
  generate: async (request: QuestionPaperGenerationRequest): Promise<QuestionPaperGenerationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });
      return await handleApiResponse<QuestionPaperGenerationResponse>(response);
    } catch (error) {
      throw error;
    }
  },
};

// Enhanced Question Paper Management API interfaces
export interface QuestionPaper {
  _id: string;
  id: string;
  title: string;
  description?: string;
  examId: string;
  subjectId: string;
  classId: string;
  type: 'AI_GENERATED' | 'PDF_UPLOADED' | 'MANUAL';
  status: 'DRAFT' | 'GENERATED' | 'PUBLISHED' | 'ARCHIVED';
  markDistribution: {
    oneMark: number;
    twoMark: number;
    threeMark: number;
    fiveMark: number;
    totalMarks?: number;
  };
  bloomsDistribution: {
    level: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
    percentage: number;
  }[];
  questionTypeDistribution: {
    type: 'CHOOSE_BEST_ANSWER' | 'FILL_BLANKS' | 'ONE_WORD_ANSWER' | 'TRUE_FALSE' | 'CHOOSE_MULTIPLE_ANSWERS' | 'MATCHING_PAIRS' | 'DRAWING_DIAGRAM' | 'MARKING_PARTS' | 'SHORT_ANSWER' | 'LONG_ANSWER';
    percentage: number;
  }[];
  generatedPdf?: {
    fileName: string;
    filePath: string;
    fileSize: number;
    generatedAt: string;
    downloadUrl: string;
  };
  aiSettings?: {
    useSubjectBook: boolean;
    customInstructions?: string;
    difficultyLevel: 'EASY' | 'MODERATE' | 'TOUGHEST';
    twistedQuestionsPercentage: number;
  };
  createdBy: string;
  isActive: boolean;
  generatedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  questions: string[]; // Array of question IDs
  uploadedPdf?: {
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    uploadedAt: string;
  };
}

export interface CreateQuestionPaperRequest {
  title: string;
  description?: string;
  examId: string;
  markDistribution: {
    oneMark: number;
    twoMark: number;
    threeMark: number;
    fiveMark: number;
    totalMarks?: number; // Optional, will be calculated automatically
  };
  bloomsDistribution: {
    level: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
    percentage: number;
  }[];
  questionTypeDistribution: {
    type: 'CHOOSE_BEST_ANSWER' | 'FILL_BLANKS' | 'ONE_WORD_ANSWER' | 'TRUE_FALSE' | 'CHOOSE_MULTIPLE_ANSWERS' | 'MATCHING_PAIRS' | 'DRAWING_DIAGRAM' | 'MARKING_PARTS' | 'SHORT_ANSWER' | 'LONG_ANSWER';
    percentage: number;
  }[];
  aiSettings?: {
    useSubjectBook: boolean;
    customInstructions?: string;
    difficultyLevel: 'EASY' | 'MODERATE' | 'TOUGHEST';
    twistedQuestionsPercentage: number;
  };
}

export interface QuestionPaperFilters {
  page?: number;
  limit?: number;
  search?: string;
  examId?: string;
  subjectId?: string;
  classId?: string;
  type?: 'AI_GENERATED' | 'PDF_UPLOADED' | 'MANUAL';
  status?: 'DRAFT' | 'GENERATED' | 'PUBLISHED' | 'ARCHIVED';
  isActive?: boolean;
}

export interface GenerateAIQuestionPaperRequest {
  customSettings?: {
    referenceBookUsed: boolean;
    customInstructions?: string;
    difficultyLevel: 'EASY' | 'MODERATE' | 'TOUGHEST';
    twistedQuestionsPercentage: number;
  };
}

// Exam Management API interfaces
export interface Exam {
  id: string;
  title: string;
  description?: string;
  examType: 'UNIT_TEST' | 'MID_TERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT' | 'PRACTICAL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'UNIT_WISE' | 'PAGE_WISE' | 'TERM_TEST' | 'ANNUAL_EXAM';
  subjectIds: string[]; // Changed to array for multiple subjects
  classId: string;
  duration: number; // in minutes
  status: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  endDate?: string;
  questions: string[]; // Array of question IDs
  questionDistribution: {
    unit: string;
    bloomsLevel: string;
    difficulty: string;
    percentage: number;
    twistedPercentage?: number;
  }[];
  instructions?: string;
  allowLateSubmission: boolean;
  lateSubmissionPenalty?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamRequest {
  title: string;
  description?: string;
  examType: 'UNIT_TEST' | 'MID_TERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT' | 'PRACTICAL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'UNIT_WISE' | 'PAGE_WISE' | 'TERM_TEST' | 'ANNUAL_EXAM';
  subjectIds: string[]; // Changed to array for multiple subjects
  classId: string;
  adminId?: string; // Optional, will be set from auth if not provided
  duration: number;
  scheduledDate: string;
  endDate?: string;
  questions?: string[];
  questionDistribution?: {
    unit: string;
    bloomsLevel: string;
    difficulty: string;
    percentage: number;
    twistedPercentage?: number;
  }[];
  instructions?: string;
  allowLateSubmission?: boolean;
  lateSubmissionPenalty?: number;
}

export interface ExamFilters {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  classId?: string;
  examType?: 'UNIT_TEST' | 'MID_TERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT' | 'PRACTICAL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'UNIT_WISE' | 'PAGE_WISE' | 'TERM_TEST' | 'ANNUAL_EXAM';
  status?: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  isActive?: boolean;
}

// Exam Management API
export const examsAPI = {
  // Get all exams
  getAll: async (filters?: ExamFilters): Promise<{ exams: Exam[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.subjectId) queryParams.append('subjectId', filters.subjectId);
      if (filters?.classId) queryParams.append('classId', filters.classId);
      if (filters?.examType) queryParams.append('examType', filters.examType);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());

      const response = await fetch(`${API_BASE_URL}/admin/exams?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{ success: boolean; data: Exam[]; pagination: any }>(response);
      return {
        exams: result.data || [],
        pagination: result.pagination || {}
      };
    } catch (error) {
      throw error;
    }
  },

  // Get single exam
  getById: async (id: string): Promise<Exam> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<Exam>(response);
    } catch (error) {
      throw error;
    }
  },

  // Create exam
  create: async (exam: CreateExamRequest): Promise<Exam> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(exam),
      });
      return await handleApiResponse<Exam>(response);
    } catch (error) {
      throw error;
    }
  },

  // Update exam
  update: async (id: string, exam: Partial<CreateExamRequest>): Promise<Exam> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(exam),
      });
      return await handleApiResponse<Exam>(response);
    } catch (error) {
      throw error;
    }
  },

  // Delete exam
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  // Start exam
  start: async (id: string): Promise<Exam> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams/${id}/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<Exam>(response);
    } catch (error) {
      throw error;
    }
  },

  // End exam
  end: async (id: string): Promise<Exam> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams/${id}/end`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<Exam>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get exam results
  getResults: async (id: string, page?: number, limit?: number): Promise<{ results: any[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page.toString());
      if (limit) queryParams.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/admin/exams/${id}/results?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ results: any[]; pagination: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get exam statistics
  getStatistics: async (id: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams/${id}/statistics`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<any>(response);
    } catch (error) {
      throw error;
    }
  },
};

// Enhanced Question Paper Management API
export const questionPaperAPI = {
  // Get all question papers
  getAll: async (filters?: QuestionPaperFilters): Promise<{ questionPapers: QuestionPaper[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.examId) queryParams.append('examId', filters.examId);
      if (filters?.subjectId) queryParams.append('subjectId', filters.subjectId);
      if (filters?.classId) queryParams.append('classId', filters.classId);
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());

      const response = await fetch(`${API_BASE_URL}/admin/question-papers?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ questionPapers: QuestionPaper[]; pagination: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get single question paper
  getById: async (id: string): Promise<QuestionPaper> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<QuestionPaper>(response);
    } catch (error) {
      throw error;
    }
  },

  // Create question paper
  create: async (questionPaper: CreateQuestionPaperRequest): Promise<QuestionPaper> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(questionPaper),
      });
      return await handleApiResponse<QuestionPaper>(response);
    } catch (error) {
      throw error;
    }
  },

  // Update question paper
  update: async (id: string, questionPaper: Partial<CreateQuestionPaperRequest>): Promise<QuestionPaper> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(questionPaper),
      });
      return await handleApiResponse<QuestionPaper>(response);
    } catch (error) {
      throw error;
    }
  },

  // Delete question paper
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  // Generate AI question paper
  generateAI: async (id: string, request?: GenerateAIQuestionPaperRequest): Promise<QuestionPaper> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${id}/generate-ai`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request || {}),
      });
      return await handleApiResponse<QuestionPaper>(response);
    } catch (error) {
      throw error;
    }
  },

  // Generate complete question paper with AI (direct generation)
  generateCompleteAI: async (request: CreateQuestionPaperRequest & { subjectId: string; classId: string }): Promise<QuestionPaper> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/generate-complete-ai`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });
      return await handleApiResponse<QuestionPaper>(response);
    } catch (error) {
      throw error;
    }
  },

  // Upload pattern file
  uploadPattern: async (file: File): Promise<{ patternId: string; fileName: string; filePath: string; fileSize: number; mimeType: string; uploadedAt: string }> => {
    try {
      const formData = new FormData();
      formData.append('patternFile', file);

      const response = await fetch(`${API_BASE_URL}/admin/question-papers/upload-pattern`, {
        method: 'POST',
        headers: {
          ...getAuthHeadersForUpload(),
          // Don't set Content-Type, let browser set it for FormData
        },
        body: formData,
      });
      const result = await handleApiResponse<{ patternId: string; fileName: string; filePath: string; fileSize: number; mimeType: string; uploadedAt: string }>(response);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Upload PDF question paper
  uploadPDF: async (id: string, file: File): Promise<QuestionPaper> => {
    try {
      const formData = new FormData();
      formData.append('questionPaper', file);

      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${id}/upload-pdf`, {
        method: 'POST',
        headers: getAuthHeadersForUpload(),
        body: formData,
      });
      return await handleApiResponse<QuestionPaper>(response);
    } catch (error) {
      throw error;
    }
  },

  // Download question paper as PDF
  download: async (id: string): Promise<{ success: boolean; downloadUrl: string }> => {
    try {
      // Create download URL - the backend will serve the file directly
      const downloadUrl = `${API_BASE_URL}/admin/question-papers/${id}/download`;
      
      // Test if the endpoint is accessible (optional check)
      const response = await fetch(downloadUrl, {
        method: 'HEAD', // Use HEAD to check if file exists without downloading
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('Question paper not found or PDF not generated yet.');
        } else {
          throw new Error(`Failed to access question paper download: ${response.status} ${response.statusText}`);
        }
      }
      
      return { success: true, downloadUrl };
    } catch (error) {
      // If it's an auth error from getAuthHeaders, re-throw it
      if (error instanceof Error && error.message.includes('No authentication token found')) {
        throw new Error('Please log in to download the PDF.');
      }
      throw error;
    }
  },

  // Regenerate PDF with updated questions
  regeneratePDF: async (id: string): Promise<{ success: boolean; questionPaper: QuestionPaper; downloadUrl: string }> => {
    try {
      console.log('api.ts regeneratePDF called with id:', id);
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${id}/regenerate-pdf`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      console.log('api.ts regeneratePDF response status:', response.status);
      console.log('api.ts regeneratePDF response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('api.ts regeneratePDF error:', errorData);
        throw new Error(errorData.message || 'Failed to regenerate PDF');
      }

      const data = await response.json();
      console.log('api.ts Raw regenerate response:', data);
      
      // Return the full response object with downloadUrl
      return {
        success: data.success,
        questionPaper: data.questionPaper,
        downloadUrl: data.downloadUrl
      };
    } catch (error) {
      console.error('api.ts regeneratePDF catch error:', error);
      throw error;
    }
  },

  // Publish question paper
  publish: async (id: string): Promise<QuestionPaper> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${id}/publish`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<QuestionPaper>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get questions for a question paper
  getQuestions: async (id: string): Promise<Question[]> => {
    try {
      const url = `${API_BASE_URL}/admin/question-papers/${id}/questions`;
      console.log('API - Fetching questions from:', url);
      console.log('API - Question paper ID:', id);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      console.log('API - Response status:', response.status);
      console.log('API - Response ok:', response.ok);
      
      const result = await handleApiResponse<{success: boolean, questions: Question[]}>(response);
      console.log('API - Parsed result:', result);
      console.log('API - Questions from result:', result.questions);
      
      return result.questions || [];
    } catch (error) {
      console.error('API - Error fetching questions:', error);
      return [];
    }
  },

  // Update a question
  updateQuestion: async (questionPaperId: string, questionId: string, question: Partial<Question>): Promise<Question> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${questionPaperId}/questions/${questionId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(question),
      });
      const result = await handleApiResponse<{success: boolean, question: Question}>(response);
      return result.question;
    } catch (error) {
      throw error;
    }
  },


  // Delete a question
  deleteQuestion: async (questionPaperId: string, questionId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${questionPaperId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  // Add a new question to a question paper
  addQuestion: async (questionPaperId: string, question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${questionPaperId}/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(question),
      });
      const result = await handleApiResponse<{success: boolean, question: Question}>(response);
      return result.question;
    } catch (error) {
      throw error;
    }
  },

  // Generate questions with AI
  generateWithAI: async (questionPaperId: string, params: {
    difficulty?: string;
    questionCount?: number;
    subject?: string;
    className?: string;
  }): Promise<{success: boolean, questions: Question[]}> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${questionPaperId}/generate-ai`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
      });
      return await handleApiResponse<{success: boolean, questions: Question[]}>(response);
    } catch (error) {
      throw error;
    }
  },

  // Delete old PDF file
  deleteOldPDF: async (questionPaperId: string, oldPdfUrl: string): Promise<{success: boolean}> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${questionPaperId}/delete-pdf`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ pdfUrl: oldPdfUrl }),
      });
      return await handleApiResponse<{success: boolean}>(response);
    } catch (error) {
      throw error;
    }
  },

  // Save edited PDF
  saveEditedPDF: async (questionPaperId: string, edits: any): Promise<{success: boolean, pdfUrl: string}> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-papers/${questionPaperId}/save-edits`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ edits }),
      });
      return await handleApiResponse<{success: boolean, pdfUrl: string}>(response);
    } catch (error) {
      throw error;
    }
  }
};

// Syllabus API
export interface Syllabus {
  id: string;
  title: string;
  subjectId: string;
  classId: string;
  academicYear: string;
  term: string;
  description: string;
  language: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  downloadCount: number;
  lastModified: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSyllabusRequest {
  title: string;
  subjectId: string;
  classId: string;
  academicYear: string;
  term: string;
  description: string;
  language: string;
}

export interface UpdateSyllabusRequest {
  title?: string;
  subjectId?: string;
  classId?: string;
  academicYear?: string;
  term?: string;
  description?: string;
  language?: string;
  status?: 'active' | 'draft' | 'archived';
}

export interface SyllabusStatistics {
  totalSyllabi: number;
  activeSyllabi: number;
  draftSyllabi: number;
  archivedSyllabi: number;
  totalDownloads: number;
  subjectsWithSyllabi: number;
  classesWithSyllabi: number;
}

export const syllabusAPI = {
  // Get all syllabi with filtering
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
    classId?: string;
    status?: string;
    academicYear?: string;
  }): Promise<{ syllabi: Syllabus[]; total: number; page: number; limit: number }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params?.classId) queryParams.append('classId', params.classId);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.academicYear) queryParams.append('academicYear', params.academicYear);

      const response = await fetch(`${API_BASE_URL}/admin/syllabi?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ syllabi: Syllabus[]; total: number; page: number; limit: number }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get single syllabus
  getById: async (id: string): Promise<Syllabus> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/syllabi/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<Syllabus>(response);
    } catch (error) {
      throw error;
    }
  },

  // Create syllabus
  create: async (data: CreateSyllabusRequest): Promise<Syllabus> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/syllabi`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<Syllabus>(response);
    } catch (error) {
      throw error;
    }
  },

  // Update syllabus
  update: async (id: string, data: UpdateSyllabusRequest): Promise<Syllabus> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/syllabi/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<Syllabus>(response);
    } catch (error) {
      throw error;
    }
  },

  // Delete syllabus
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/syllabi/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get syllabus by subject and class
  getBySubjectClass: async (subjectId: string, classId: string): Promise<Syllabus> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/syllabi/subject/${subjectId}/class/${classId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<Syllabus>(response);
    } catch (error) {
      throw error;
    }
  },

  // Upload syllabus file
  uploadFile: async (id: string, file: File): Promise<Syllabus> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/admin/syllabi/${id}/upload`, {
        method: 'POST',
        headers: getAuthHeadersForUpload(),
        body: formData,
      });
      return await handleApiResponse<Syllabus>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get syllabus statistics
  getStatistics: async (): Promise<SyllabusStatistics> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/syllabi/statistics`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<SyllabusStatistics>(response);
    } catch (error) {
      throw error;
    }
  },
};

// Teacher Dashboard API
export const teacherDashboardAPI = {
  // Get teacher's assigned classes and subjects
  getAccess: async (): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/access`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Create question paper for assigned subjects
  createQuestionPaper: async (data: any): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Upload answer sheets for evaluation
  uploadAnswerSheets: async (data: any): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/upload-answers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Mark student as absent or missing
  markStudentStatus: async (data: any): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/mark-status`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Evaluate answer sheets with AI and manual override
  evaluateAnswerSheets: async (data: any): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/evaluate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get results for assigned classes
  getResults: async (params?: any): Promise<{ success: boolean; data: any }> => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/teacher/results?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get performance graphs and analytics
  getPerformanceGraphs: async (params?: any): Promise<{ success: boolean; data: any }> => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/teacher/performance-graph?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get exams for teacher
  getExams: async (params?: {
    classId?: string;
    subjectId?: string;
  }): Promise<{ success: boolean; data: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.classId) queryParams.append('classId', params.classId);
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);

      const response = await fetch(`${API_BASE_URL}/teacher/exams?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get answer sheets for an exam
  getAnswerSheets: async (examId: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/answer-sheets/${examId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Process answer sheet with AI
  processAnswerSheet: async (sheetId: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/answer-sheets/${sheetId}/process`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get question papers
  getQuestionPapers: async (params?: {
    classId?: string;
    subjectId?: string;
    status?: string;
  }): Promise<{ success: boolean; data: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.classId) queryParams.append('classId', params.classId);
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params?.status) queryParams.append('status', params.status);

      const response = await fetch(`${API_BASE_URL}/teacher/question-papers?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Create teacher question paper
  createTeacherQuestionPaper: async (data: any): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/question-papers`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Generate AI question paper
  generateAIQuestionPaper: async (paperId: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/question-papers/${paperId}/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Generate AI questions for a question paper
  generateAIQuestions: async (questionPaperId: string, params: any): Promise<{ success: boolean; questions: any[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/question-papers/${questionPaperId}/generate-questions`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      return await handleApiResponse<{ success: boolean; questions: any[] }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Add questions to a question paper
  addQuestionsToPaper: async (questionPaperId: string, data: any): Promise<{ success: boolean; questions: any[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/question-papers/${questionPaperId}/questions`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await handleApiResponse<{ success: boolean; questions: any[] }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get exam results
  getExamResults: async (examId: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/results/${examId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get class statistics
  getClassStats: async (examId: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/results/${examId}/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get analytics data
  getAnalytics: async (params?: {
    classId?: string;
    subjectId?: string;
    timeRange?: string;
  }): Promise<{ success: boolean; data: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.classId) queryParams.append('classId', params.classId);
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params?.timeRange) queryParams.append('timeRange', params.timeRange);

      const response = await fetch(`${API_BASE_URL}/teacher/analytics?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Upload answer sheets with files
  uploadAnswerSheetFiles: async (examId: string, formData: FormData): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/answer-sheets/upload/${examId}`, {
        method: 'POST',
        headers: getAuthHeadersForUpload(),
        body: formData,
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get notifications
  getNotifications: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/teacher/notifications?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async (): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/notifications/read-all`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // ==================== AI ANSWER CHECKING API ====================

  // Check single answer sheet with AI
  checkAnswerSheetWithAI: async (answerSheetId: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/answer-sheets/${answerSheetId}/ai-check`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Batch check multiple answer sheets with AI
  batchCheckAnswerSheetsWithAI: async (answerSheetIds: string[]): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/answer-sheets/batch-ai-check`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ answerSheetIds }),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get AI results for an answer sheet
  getAIResults: async (answerSheetId: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/answer-sheets/${answerSheetId}/ai-results`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get AI statistics for an exam
  getAIStats: async (examId: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/exams/${examId}/ai-stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Override AI result for specific question
  overrideAIResult: async (answerSheetId: string, data: {
    questionId: string;
    correctedAnswer: string;
    correctedMarks: number;
    reason: string;
  }): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/answer-sheets/${answerSheetId}/ai-override`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get answer sheets ready for AI checking
  getAnswerSheetsForAIChecking: async (examId: string, params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_BASE_URL}/admin/exams/${examId}/answer-sheets-for-ai?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Recheck answer sheet with AI
  recheckAnswerSheetWithAI: async (answerSheetId: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/answer-sheets/${answerSheetId}/ai-recheck`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Delete answer sheet
    deleteAnswerSheet: async (answerSheetId: string): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/answer-sheets/${answerSheetId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        return await handleApiResponse<{ success: boolean; message: string }>(response);
      } catch (error) {
        throw error;
      }
    },

    matchAnswerSheetToStudent: async (answerSheetId: string, rollNumber: string): Promise<{ success: boolean; message: string; data: any }> => {
      try {
        const response = await fetch(`${API_BASE_URL}/teacher/answer-sheets/match`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ answerSheetId, rollNumber }),
        });
        return await handleApiResponse<{ success: boolean; message: string; data: any }>(response);
      } catch (error) {
        throw error;
      }
    },

    getExamStudents: async (examId: string): Promise<{ success: boolean; data: any }> => {
      try {
        const response = await fetch(`${API_BASE_URL}/teacher/exams/${examId}/students`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
        return await handleApiResponse<{ success: boolean; data: any }>(response);
      } catch (error) {
        throw error;
      }
    },

    // Update answer sheet marks manually
    updateAnswerSheetMarks: async (answerSheetId: string, marks: number): Promise<{ success: boolean; data: any }> => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/answer-sheets/${answerSheetId}/manual-marks`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ marks }),
        });
        return await handleApiResponse<{ success: boolean; data: any }>(response);
      } catch (error) {
        throw error;
      }
    },

    // Get students for exam (for notification)
    getStudentsForExam: async (examId: string): Promise<{ success: boolean; data: any }> => {
      try {
        const response = await fetch(`${API_BASE_URL}/teacher/exams/${examId}/students`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
        return await handleApiResponse<{ success: boolean; data: any }>(response);
      } catch (error) {
        throw error;
      }
    },

    // Send notification for missing answer sheets
    sendMissingAnswerSheetNotification: async (examId: string, studentIds: string[]): Promise<{ success: boolean; data: any }> => {
      try {
        const response = await fetch(`${API_BASE_URL}/teacher/notifications/missing-answer-sheets`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ examId, studentIds }),
        });
        return await handleApiResponse<{ success: boolean; data: any }>(response);
      } catch (error) {
        throw error;
      }
    },
};

// Performance Analytics API
export const performanceAPI = {
  // Get school-wide performance analytics
  getAnalytics: async (params?: {
    classId?: string;
    subjectId?: string;
    examType?: string;
    startDate?: string;
    endDate?: string;
    academicYear?: string;
  }): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.classId) queryParams.append('classId', params.classId);
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params?.examType) queryParams.append('examType', params.examType);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.academicYear) queryParams.append('academicYear', params.academicYear);

      const response = await fetch(`${API_BASE_URL}/admin/performance/analytics?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<any>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get class performance
  getClassPerformance: async (classId: string, params?: {
    subjectId?: string;
    examType?: string;
    startDate?: string;
    endDate?: string;
    academicYear?: string;
  }): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params?.examType) queryParams.append('examType', params.examType);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.academicYear) queryParams.append('academicYear', params.academicYear);

      const response = await fetch(`${API_BASE_URL}/admin/performance/class/${classId}?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<any>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get individual student performance
  getIndividualPerformance: async (studentId: string, params?: {
    subjectId?: string;
    examType?: string;
    startDate?: string;
    endDate?: string;
    academicYear?: string;
  }): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params?.examType) queryParams.append('examType', params.examType);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.academicYear) queryParams.append('academicYear', params.academicYear);

      const response = await fetch(`${API_BASE_URL}/admin/performance/individual/${studentId}?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<any>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get performance report
  getPerformanceReport: async (type: 'individual' | 'class', params: {
    studentId?: string;
    classId?: string;
    subjectId?: string;
    examId?: string;
  }): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.studentId) queryParams.append('studentId', params.studentId);
      if (params.classId) queryParams.append('classId', params.classId);
      if (params.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params.examId) queryParams.append('examId', params.examId);

      const response = await fetch(`${API_BASE_URL}/admin/performance/reports/${type}?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<any>(response);
    } catch (error) {
      throw error;
    }
  },
};

// Question Paper Template Management API
export const questionPaperTemplateAPI = {
  // Get all templates
  getAll: async (params?: { subjectId?: string }): Promise<QuestionPaperTemplate[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
      
      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{success: boolean, templates: QuestionPaperTemplate[]}>(response);
      return result.templates || [];
    } catch (error) {
      throw error;
    }
  },

  // Get template by ID
  getById: async (id: string): Promise<QuestionPaperTemplate> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{success: boolean, template: QuestionPaperTemplate}>(response);
      return result.template;
    } catch (error) {
      throw error;
    }
  },

  // Create template
  create: async (data: CreateTemplateRequest): Promise<QuestionPaperTemplate> => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('subjectId', data.subjectId);
      if (data.templateFile) formData.append('templateFile', data.templateFile);

      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates`, {
        method: 'POST',
        headers: getAuthHeadersForUpload(),
        body: formData,
      });
      const result = await handleApiResponse<{success: boolean, template: QuestionPaperTemplate}>(response);
      return result.template;
    } catch (error) {
      throw error;
    }
  },

  // Update template
  update: async (id: string, data: UpdateTemplateRequest): Promise<QuestionPaperTemplate> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const result = await handleApiResponse<{success: boolean, template: QuestionPaperTemplate}>(response);
      return result.template;
    } catch (error) {
      throw error;
    }
  },

  // Delete template
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  // Download template
  download: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates/${id}/download`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `template-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  },

  // Analyze template
  analyze: async (id: string): Promise<TemplateAnalysis> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/question-paper-templates/${id}/analyze`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{success: boolean, analysis: TemplateAnalysis}>(response);
      return result.analysis;
    } catch (error) {
      throw error;
    }
  }
};

// Sample Paper Management API
export const samplePaperAPI = {
  // Get all sample papers
  getAll: async (params?: { subjectId?: string }): Promise<SamplePaper[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
      
      const response = await fetch(`${API_BASE_URL}/admin/sample-papers?${queryParams.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{success: boolean, samplePapers: SamplePaper[]}>(response);
      return result.samplePapers;
    } catch (error) {
      throw error;
    }
  },

  // Get sample paper by ID
  getById: async (id: string): Promise<SamplePaper> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sample-papers/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{success: boolean, samplePaper: SamplePaper}>(response);
      return result.samplePaper;
    } catch (error) {
      throw error;
    }
  },

  // Create sample paper
  create: async (data: CreateSamplePaperRequest): Promise<SamplePaper> => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('subjectId', data.subjectId);
      if (data.sampleFile) formData.append('sampleFile', data.sampleFile);

      const response = await fetch(`${API_BASE_URL}/admin/sample-papers`, {
        method: 'POST',
        headers: getAuthHeadersForUpload(),
        body: formData,
      });
      const result = await handleApiResponse<{success: boolean, samplePaper: SamplePaper}>(response);
      return result.samplePaper;
    } catch (error) {
      throw error;
    }
  },

  // Update sample paper
  update: async (id: string, data: UpdateSamplePaperRequest): Promise<SamplePaper> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sample-papers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const result = await handleApiResponse<{success: boolean, samplePaper: SamplePaper}>(response);
      return result.samplePaper;
    } catch (error) {
      throw error;
    }
  },

  // Delete sample paper
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sample-papers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      throw error;
    }
  },

  // Download sample paper
  download: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sample-papers/${id}/download`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to download sample paper');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sample-paper-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw error;
    }
  },

  // Analyze sample paper
  analyze: async (id: string): Promise<SamplePaperAnalysis> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sample-papers/${id}/analyze`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{success: boolean, analysis: SamplePaperAnalysis}>(response);
      return result.analysis;
    } catch (error) {
      throw error;
    }
  }
};
