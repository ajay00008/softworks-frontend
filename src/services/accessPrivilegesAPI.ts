// Staff Access Management API - Isolated from main API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth-token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(errorData.error?.message || errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
export const accessPrivilegesAPI = {
  // Get all staff access records
  getAll: async (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }): Promise<{ success: boolean; data: any[]; total?: number }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      
      const response = await fetch(`${API_BASE_URL}/admin/staff-access?${queryParams.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any[]; total?: number }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Get staff access by ID
  getById: async (id: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/staff-access/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Create staff access
  create: async (data: {
    staffId: string;
    classAccess: Array<{
      classId: string;
      className: string;
      accessLevel: 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';
      canUploadSheets: boolean;
      canMarkAbsent: boolean;
      canMarkMissing: boolean;
      canOverrideAI: boolean;
    }>;
    subjectAccess: Array<{
      subjectId: string;
      subjectName: string;
      accessLevel: 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';
      canCreateQuestions: boolean;
      canUploadSyllabus: boolean;
    }>;
    globalPermissions: {
      canViewAllClasses: boolean;
      canViewAllSubjects: boolean;
      canAccessAnalytics: boolean;
      canPrintReports: boolean;
      canSendNotifications: boolean;
    };
    expiresAt?: string;
    notes?: string;
  }): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/staff-access`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Update staff access
  update: async (id: string, data: {
    classAccess?: Array<{
      classId: string;
      className: string;
      accessLevel: 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';
      canUploadSheets: boolean;
      canMarkAbsent: boolean;
      canMarkMissing: boolean;
      canOverrideAI: boolean;
    }>;
    subjectAccess?: Array<{
      subjectId: string;
      subjectName: string;
      accessLevel: 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';
      canCreateQuestions: boolean;
      canUploadSyllabus: boolean;
    }>;
    globalPermissions?: {
      canViewAllClasses: boolean;
      canViewAllSubjects: boolean;
      canAccessAnalytics: boolean;
      canPrintReports: boolean;
      canSendNotifications: boolean;
    };
    expiresAt?: string;
    notes?: string;
  }): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/staff-access/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await handleApiResponse<{ success: boolean; data: any }>(response);
    } catch (error) {
      throw error;
    }
  },

  // Delete staff access
  delete: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/staff-access/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleApiResponse<{ success: boolean; message?: string }>(response);
    } catch (error) {
      throw error;
    }
  },
};
