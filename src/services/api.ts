// API service for EduAdmin System
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log(API_BASE_URL,"API_BASE_URL");

// Test if backend is reachable
const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test', password: 'test' })
    });
    console.log('Backend connection test - Status:', response.status);
    return response.status !== 404;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};

// Test connection on module load
testBackendConnection();

export interface Student {
  userId: any;
  student: any;
  id: string;
  email: string;
  password: string;
  name: string;
  rollNumber: string;
  class:Array<any>;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  parentsPhone?: string;
  parentsEmail?: string;
  address?: string;
  whatsappNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  _id: string;
  id?: string;
  code: string;
  name: string;
  shortName?: string;
  category?: string;
  level?: number[];
}

export interface Teacher {
  _id: string;
  userId: any;
  id: string;
  email: string;
  password: string;
  name: string;
  subjectIds?: string[];
  classIds?: string[];
  subjects?: Subject[];
  classes?: ClassMapping[];
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
  email: string;
  password?: string;
  name: string;
  role: 'super_admin' | 'admin' | 'teacher' | 'student';
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
  error: string;
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
  return {
    'Content-Type': 'application/json',
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
        const errorData: ApiError = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || 'Login failed');
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
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('API Response data:', data);
  
  if (data.success !== undefined) {
    if (!data.success) {
      throw new Error('API request failed');
    }
    // Handle different response structures
    if (data.data) {
      console.log('Returning data.data:', data.data);
      return data.data;
    } else if (data.question) {
      console.log('Returning data.question:', data.question);
      return data.question;
    } else if (data.questions) {
      console.log('Returning data.questions:', data.questions);
      return data.questions;
    } else {
      console.log('Returning data as T:', data);
      return data as T;
    }
  } else if (Array.isArray(data)) {
    console.log('Returning array data:', data);
    return data as T;
  } else {
    console.log('Returning data as T (fallback):', data);
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

      const data = await handleApiResponse<Student[]>(response);
      return { students: data };
    } catch (error) {
      console.error('Error fetching students:', error);
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
      console.error('Error fetching student:', error);
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
      console.error('Error creating student:', error);
      throw error;
    }
  },
  update: async (
    userId: string,
    student: Partial<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Student> => {
    try {
      console.log(userId,student,"formUp")
      const response = await fetch(`${API_BASE_URL}/admin/students/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(student),
      });
  
      return await handleApiResponse<Student>(response);
    } catch (error) {
      console.error('Error updating student:', error);
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
      console.error('Error deleting student:', error);
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
      console.error('Error activating student:', error);
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
      console.error('Error fetching students by class:', error);
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
      return { teachers: result.data || result, pagination: result.pagination };
    } catch (error) {
      console.error('Error fetching teachers:', error);
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
      console.error('Error fetching teacher:', error);
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
      console.error('Error creating teacher:', error);
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
      
      console.log('API update payload:', payload);
      
      const response = await fetch(`${API_BASE_URL}/admin/teachers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      return await handleApiResponse<Teacher>(response);
    } catch (error) {
      console.error('Error updating teacher:', error);
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
      console.error('Error deleting teacher:', error);
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
      console.error('Error assigning subjects:', error);
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
      console.error('Error assigning classes:', error);
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

      const data = await handleApiResponse<User[]>(response);
      return { admins: data };
    } catch (error) {
      console.error('Error fetching admins:', error);
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
      console.error('Error fetching admin:', error);
      throw error;
    }
  },

  create: async (admin: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/super/admins`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(admin),
      });

      return await handleApiResponse<User>(response);
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  update: async (id: string, admin: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/super/admins/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(admin),
      });

      return await handleApiResponse<User>(response);
    } catch (error) {
      console.error('Error updating admin:', error);
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
      console.error('Error deleting admin:', error);
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
      console.error('Error activating admin:', error);
      throw error;
    }
  }
};



export const classesAPI = {
  getAll: async (): Promise<ClassMapping[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/class-subject-mappings`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<ClassMapping[]>(response);
    } catch (error) {
      console.error("Error fetching classes:", error);
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
      console.error("Error fetching class mapping:", error);
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
      console.error("Error creating class mapping:", error);
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
      console.error("Error updating class mapping:", error);
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
      console.error("Error deleting class mapping:", error);
      throw error;
    }
  },
};
// Class Management API interfaces
export interface Class {
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
  id: string;
  code: string;
  name: string;
  shortName: string;
  category: 'SCIENCE' | 'MATHEMATICS' | 'LANGUAGES' | 'SOCIAL_SCIENCES' | 'COMMERCE' | 'ARTS' | 'PHYSICAL_EDUCATION' | 'COMPUTER_SCIENCE' | 'OTHER';
  classIds: string[]; // Array of class IDs
  classes: Class[]; // Populated class data from aggregation
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectRequest {
  code: string;
  name: string;
  shortName: string;
  category: 'SCIENCE' | 'MATHEMATICS' | 'LANGUAGES' | 'SOCIAL_SCIENCES' | 'COMMERCE' | 'ARTS' | 'PHYSICAL_EDUCATION' | 'COMPUTER_SCIENCE' | 'OTHER';
  classIds: string[];
  description?: string;
  color?: string;
}

export interface UpdateSubjectRequest {
  code?: string;
  name?: string;
  shortName?: string;
  category?: 'SCIENCE' | 'MATHEMATICS' | 'LANGUAGES' | 'SOCIAL_SCIENCES' | 'COMMERCE' | 'ARTS' | 'PHYSICAL_EDUCATION' | 'COMPUTER_SCIENCE' | 'OTHER';
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
      return await handleApiResponse<{ classes: Class[]; total: number; page: number; limit: number }>(response);
    } catch (error) {
      console.error('Error fetching classes:', error);
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
      console.error('Error fetching class:', error);
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
      console.error('Error creating class:', error);
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
      console.error('Error updating class:', error);
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
      console.error('Error deleting class:', error);
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
      console.error('Error fetching classes by level:', error);
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
      return await handleApiResponse<{ subjects: Subject[]; total: number; page: number; limit: number }>(response);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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
      console.error('Error fetching subject:', error);
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
      console.error('Error creating subject:', error);
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
      console.error('Error updating subject:', error);
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
      console.error('Error deleting subject:', error);
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
      console.error('Error fetching subjects by category:', error);
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
      console.error('Error fetching subjects by level:', error);
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
      return await handleApiResponse<Subject[]>(response);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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
      const data = await handleApiResponse<{ questions: Question[]; pagination?: any }>(response);
      return { questions: Array.isArray(data) ? data : data.questions, pagination: data.pagination };
    } catch (error) {
      console.error('Error fetching questions:', error);
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
      console.error('Error fetching question:', error);
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
      console.error('Error creating question:', error);
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
      console.error('Error updating question:', error);
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
      console.error('Error deleting question:', error);
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
      console.error('Error generating questions:', error);
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
      console.error('Error fetching question statistics:', error);
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
      console.error('Error fetching question paper templates:', error);
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
      console.error('Error fetching question paper template:', error);
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
      console.error('Error creating question paper template:', error);
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
      console.error('Error updating question paper template:', error);
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
      console.error('Error deleting question paper template:', error);
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
      console.error('Error generating question paper:', error);
      throw error;
    }
  },
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
      console.error('Error fetching syllabi:', error);
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
      console.error('Error fetching syllabus:', error);
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
      console.error('Error creating syllabus:', error);
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
      console.error('Error updating syllabus:', error);
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
      console.error('Error deleting syllabus:', error);
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
      console.error('Error fetching syllabus by subject and class:', error);
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
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: formData,
      });
      return await handleApiResponse<Syllabus>(response);
    } catch (error) {
      console.error('Error uploading syllabus file:', error);
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
      console.error('Error fetching syllabus statistics:', error);
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
      console.error('Error fetching performance analytics:', error);
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
      console.error('Error fetching class performance:', error);
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
      console.error('Error fetching individual performance:', error);
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
      console.error('Error fetching performance report:', error);
      throw error;
    }
  },
};