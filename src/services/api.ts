// API service for EduAdmin System
const API_BASE_URL = 'http://localhost:4000/api';

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
  userId?: any;
  student?: any;
  id: string;
  email: string;
  password?: string;
  name: string;
  rollNumber?: string;
  class?: {
    classId: string;
    name: string;
  };
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  parentsPhone?: string;
  parentsEmail?: string;
  address?: string;
  whatsappNumber?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: string;
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
  console.log('handleApiResponse called with status:', response.status);
  
  if (!response.ok) {
    console.log('Response not ok, status:', response.status, 'statusText:', response.statusText);
    const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.log('Error data:', errorData);
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('API Response data:', data);
  
  if (data.success !== undefined) {
    if (!data.success) {
      throw new Error('API request failed');
    }
    return data;
  } else if (Array.isArray(data)) {
    return data as T;
  } else {
    return data as T;
  }
};

// Students API
export const studentsAPI = {
  getAll: async (params: StudentParams = {}): Promise<{ students: { data: Student[]; pagination?: any } }> => {
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

      const data = await handleApiResponse<{ data: Student[]; pagination?: any }>(response);
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
      console.log('studentsAPI.create called with:', student);
      console.log('Making request to:', `${API_BASE_URL}/admin/students`);
      console.log('Headers:', getAuthHeaders());
      
      const response = await fetch(`${API_BASE_URL}/admin/students`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(student),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
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
  },

  bulkUpload: async (file: File): Promise<{ 
    success: boolean; 
    message: string; 
    data?: { 
      totalRows: number; 
      created: number; 
      errors: number; 
      students: any[] 
    } 
  }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/admin/students/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: formData,
      });

      return await handleApiResponse<{ 
        success: boolean; 
        message: string; 
        data?: { 
          totalRows: number; 
          created: number; 
          errors: number; 
          students: any[] 
        } 
      }>(response);
    } catch (error) {
      console.error('Error uploading students in bulk:', error);
      throw error;
    }
  }
};

// Teachers API
export const teachersAPI = {
  getAll: async (params: TeacherParams = {}): Promise<{ teachers: { data: Teacher[]; pagination?: any } }> => {
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

      const data = await handleApiResponse<{ data: Teacher[]; pagination?: any }>(response);
      return { teachers: data };
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
      
      console.log('teachersAPI.create called with:', teacher);
      console.log('Payload to send:', payload);
      console.log('Making request to:', `${API_BASE_URL}/admin/teachers`);
      console.log('Headers:', getAuthHeaders());
      
      const response = await fetch(`${API_BASE_URL}/admin/teachers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      return await handleApiResponse<Teacher>(response);
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }
  },

  update: async (id: string, teacher: Partial<Teacher>): Promise<Teacher> => {
    try {
      const payload = {
        ...teacher,
        subjectIds: teacher.subjectIds || [],
        classIds: teacher.classIds || [],
      };
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

  bulkUpload: async (file: File): Promise<{ 
    success: boolean; 
    message: string; 
    data?: { 
      totalRows: number; 
      created: number; 
      errors: number; 
      teachers: any[] 
    } 
  }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/admin/teachers/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: formData,
      });

      return await handleApiResponse<{ 
        success: boolean; 
        message: string; 
        data?: { 
          totalRows: number; 
          created: number; 
          errors: number; 
          teachers: any[] 
        } 
      }>(response);
    } catch (error) {
      console.error('Error uploading teachers in bulk:', error);
      throw error;
    }
  }
};


// Admins API (Super Admin endpoints)
export const adminsAPI = {
  getAll: async (params: PaginationParams = {}): Promise<{ admins: { data: User[] }; pagination?: any }> => {
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

      const data = await handleApiResponse<{ data: any[] }>(response);
      
      // Map _id to id for each admin
      const mappedAdmins = data.data.map((admin: any) => ({
        ...admin,
        id: admin._id || admin.id
      }));
      
      return { admins: { data: mappedAdmins } };
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
      const admin = await handleApiResponse<any>(response);
      return {
        ...admin,
        id: admin._id || admin.id
      };
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

      const createdAdmin = await handleApiResponse<any>(response);
      return {
        ...createdAdmin,
        id: createdAdmin._id || createdAdmin.id
      };
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

      const updatedAdmin = await handleApiResponse<any>(response);
      return {
        ...updatedAdmin,
        id: updatedAdmin._id || updatedAdmin.id
      };
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
  getAll: async (): Promise<{ data: ClassMapping[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/class-subject-mappings`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ data: ClassMapping[] }>(response);
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
export const subjectsAPI = {
  getAll: async (id: Number): Promise<Subject[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects/level/${id}`, {
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

// Dashboard API
export const dashboardAPI = {
  getStats: async (params: any = {}): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.classId) queryParams.append('classId', params.classId);
      if (params.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params.examType) queryParams.append('examType', params.examType);
      if (params.timeRange) queryParams.append('timeRange', params.timeRange);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getAnalytics: async (params: any = {}): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.classId) queryParams.append('classId', params.classId);
      if (params.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params.examType) queryParams.append('examType', params.examType);
      if (params.timeRange) queryParams.append('timeRange', params.timeRange);

      const response = await fetch(`${API_BASE_URL}/admin/dashboard/analytics?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  },

  getStudentPerformance: async (studentId: string, params: any = {}): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params.examType) queryParams.append('examType', params.examType);
      if (params.timeRange) queryParams.append('timeRange', params.timeRange);

      const response = await fetch(`${API_BASE_URL}/admin/dashboard/student/${studentId}?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error fetching student performance:', error);
      throw error;
    }
  }
};

// Performance API
export const performanceAPI = {
  getAnalytics: async (params: any = {}): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.classId) queryParams.append('classId', params.classId);
      if (params.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params.examType) queryParams.append('examType', params.examType);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.academicYear) queryParams.append('academicYear', params.academicYear);

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

  getClassPerformance: async (classId: string, params: any = {}): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params.examType) queryParams.append('examType', params.examType);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.academicYear) queryParams.append('academicYear', params.academicYear);

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

  getIndividualPerformance: async (studentId: string, params: any = {}): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params.examType) queryParams.append('examType', params.examType);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.academicYear) queryParams.append('academicYear', params.academicYear);

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

  getPerformanceReport: async (type: string, params: any = {}): Promise<any> => {
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
  }
};

// Syllabus API
export const syllabusAPI = {
  create: async (syllabusData: any): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/syllabi`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syllabusData),
      });

      return await handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error creating syllabus:', error);
      throw error;
    }
  },

  getAll: async (params: any = {}): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.academicYear) queryParams.append('academicYear', params.academicYear);
      if (params.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params.classId) queryParams.append('classId', params.classId);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await fetch(`${API_BASE_URL}/admin/syllabi?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error fetching syllabi:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/syllabi/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error fetching syllabus:', error);
      throw error;
    }
  },

  update: async (id: string, syllabusData: any): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/syllabi/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syllabusData),
      });

      return await handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error updating syllabus:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/syllabi/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error deleting syllabus:', error);
      throw error;
    }
  },

  getBySubjectClass: async (subjectId: string, classId: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/syllabi/subject/${subjectId}/class/${classId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error fetching syllabus by subject and class:', error);
      throw error;
    }
  },

  uploadFile: async (id: string, fileUrl: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/syllabi/${id}/upload`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl }),
      });

      return await handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error uploading syllabus file:', error);
      throw error;
    }
  },

  getStatistics: async (params: any = {}): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.academicYear) queryParams.append('academicYear', params.academicYear);

      const response = await fetch(`${API_BASE_URL}/admin/syllabi/statistics?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error fetching syllabus statistics:', error);
      throw error;
    }
  }
};