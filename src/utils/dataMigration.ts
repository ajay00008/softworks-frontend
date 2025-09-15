import { studentsAPI, teachersAPI, authAPI } from '@/services/api';
import { Student, Teacher, User } from '@/services/api';

export interface MigrationStats {
  students: {
    total: number;
    updated: number;
    errors: number;
    skipped: number;
  };
  teachers: {
    total: number;
    updated: number;
    errors: number;
    skipped: number;
  };
}

export interface MigrationError {
  type: 'student' | 'teacher';
  id: string;
  name: string;
  error: string;
}

class DataMigrationService {
  private errors: MigrationError[] = [];
  private stats: MigrationStats = {
    students: { total: 0, updated: 0, errors: 0, skipped: 0 },
    teachers: { total: 0, updated: 0, errors: 0, skipped: 0 }
  };

  /**
   * Check if backend is accessible
   */
  async checkBackendConnection(): Promise<boolean> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('No authentication token found. Please login first.');
      }

      // Test with a simple API call
      await studentsAPI.getAll({ limit: 1 });
      return true;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      return authAPI.getCurrentUser();
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Fetch all students from the database
   */
  async fetchAllStudents(): Promise<Student[]> {
    try {
      const response = await studentsAPI.getAll({ limit: 1000 }); // Get all students
      return response.students;
    } catch (error) {
      console.error('Failed to fetch students:', error);
      throw error;
    }
  }

  /**
   * Fetch all teachers from the database
   */
  async fetchAllTeachers(): Promise<Teacher[]> {
    try {
      const response = await teachersAPI.getAll({ limit: 1000 }); // Get all teachers
      return response.teachers;
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      throw error;
    }
  }

  /**
   * Validate student data according to new flow
   */
  validateStudent(student: Student): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Required fields
    if (!student.name || student.name.trim() === '') {
      issues.push('Name is required');
    }
    if (!student.email || student.email.trim() === '') {
      issues.push('Email is required');
    }
    if (!student.rollNumber || student.rollNumber.trim() === '') {
      issues.push('Roll number is required');
    }
    if (!student.className || student.className.trim() === '') {
      issues.push('Class name is required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (student.email && !emailRegex.test(student.email)) {
      issues.push('Invalid email format');
    }

    // Phone number validation (if provided)
    if (student.whatsappNumber && student.whatsappNumber.trim() !== '') {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(student.whatsappNumber.replace(/\s/g, ''))) {
        issues.push('Invalid WhatsApp number format');
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Validate teacher data according to new flow
   */
  validateTeacher(teacher: Teacher): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Required fields
    if (!teacher.name || teacher.name.trim() === '') {
      issues.push('Name is required');
    }
    if (!teacher.email || teacher.email.trim() === '') {
      issues.push('Email is required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (teacher.email && !emailRegex.test(teacher.email)) {
      issues.push('Invalid email format');
    }

    // Phone number validation (if provided)
    if (teacher.phone && teacher.phone.trim() !== '') {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(teacher.phone.replace(/\s/g, ''))) {
        issues.push('Invalid phone number format');
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Update student data to match new flow
   */
  async updateStudent(student: Student): Promise<boolean> {
    try {
      const validation = this.validateStudent(student);
      if (!validation.isValid) {
        this.errors.push({
          type: 'student',
          id: student.id,
          name: student.name,
          error: `Validation failed: ${validation.issues.join(', ')}`
        });
        this.stats.students.errors++;
        return false;
      }

      // Check if student needs updating
      const needsUpdate = this.studentNeedsUpdate(student);
      if (!needsUpdate) {
        this.stats.students.skipped++;
        return true;
      }

      // Update student
      const updatedStudent = await studentsAPI.update(student.id, {
        name: student.name.trim(),
        email: student.email.trim(),
        rollNumber: student.rollNumber.trim(),
        className: student.className.trim(),
        fatherName: student.fatherName?.trim() || '',
        motherName: student.motherName?.trim() || '',
        whatsappNumber: student.whatsappNumber?.trim() || '',
        address: student.address?.trim() || '',
        isActive: student.isActive
      });

      console.log(`Updated student: ${student.name} (${student.id})`);
      this.stats.students.updated++;
      return true;

    } catch (error) {
      console.error(`Failed to update student ${student.name}:`, error);
      this.errors.push({
        type: 'student',
        id: student.id,
        name: student.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.stats.students.errors++;
      return false;
    }
  }

  /**
   * Update teacher data to match new flow
   */
  async updateTeacher(teacher: Teacher): Promise<boolean> {
    try {
      const validation = this.validateTeacher(teacher);
      if (!validation.isValid) {
        this.errors.push({
          type: 'teacher',
          id: teacher.id,
          name: teacher.name,
          error: `Validation failed: ${validation.issues.join(', ')}`
        });
        this.stats.teachers.errors++;
        return false;
      }

      // Check if teacher needs updating
      const needsUpdate = this.teacherNeedsUpdate(teacher);
      if (!needsUpdate) {
        this.stats.teachers.skipped++;
        return true;
      }

      // Update teacher
      const updatedTeacher = await teachersAPI.update(teacher.id, {
        name: teacher.name.trim(),
        email: teacher.email.trim(),
        phone: teacher.phone?.trim() || '',
        address: teacher.address?.trim() || '',
        qualification: teacher.qualification?.trim() || '',
        experience: teacher.experience?.trim() || '',
        department: teacher.department?.trim() || '',
        subjectIds: teacher.subjectIds || [],
        isActive: teacher.isActive
      });

      console.log(`Updated teacher: ${teacher.name} (${teacher.id})`);
      this.stats.teachers.updated++;
      return true;

    } catch (error) {
      console.error(`Failed to update teacher ${teacher.name}:`, error);
      this.errors.push({
        type: 'teacher',
        id: teacher.id,
        name: teacher.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.stats.teachers.errors++;
      return false;
    }
  }

  /**
   * Check if student needs updating
   */
  private studentNeedsUpdate(student: Student): boolean {
    // Check for common issues that need fixing
    return (
      student.name !== student.name.trim() ||
      student.email !== student.email.trim() ||
      student.rollNumber !== student.rollNumber.trim() ||
      student.className !== student.className.trim() ||
      (student.fatherName && student.fatherName !== student.fatherName.trim()) ||
      (student.motherName && student.motherName !== student.motherName.trim()) ||
      (student.whatsappNumber && student.whatsappNumber !== student.whatsappNumber.trim()) ||
      (student.address && student.address !== student.address.trim())
    );
  }

  /**
   * Check if teacher needs updating
   */
  private teacherNeedsUpdate(teacher: Teacher): boolean {
    // Check for common issues that need fixing
    return (
      teacher.name !== teacher.name.trim() ||
      teacher.email !== teacher.email.trim() ||
      (teacher.phone && teacher.phone !== teacher.phone.trim()) ||
      (teacher.address && teacher.address !== teacher.address.trim()) ||
      (teacher.qualification && teacher.qualification !== teacher.qualification.trim()) ||
      (teacher.experience && teacher.experience !== teacher.experience.trim()) ||
      (teacher.department && teacher.department !== teacher.department.trim())
    );
  }

  /**
   * Run complete data migration
   */
  async runMigration(): Promise<{ stats: MigrationStats; errors: MigrationError[] }> {
    console.log('Starting data migration...');
    
    // Reset stats
    this.stats = {
      students: { total: 0, updated: 0, errors: 0, skipped: 0 },
      teachers: { total: 0, updated: 0, errors: 0, skipped: 0 }
    };
    this.errors = [];

    try {
      // Check backend connection
      const isConnected = await this.checkBackendConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to backend. Please check your connection and login.');
      }

      // Get current user
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Cannot get current user. Please login again.');
      }

      console.log(`Running migration as: ${currentUser.name} (${currentUser.role})`);

      // Fetch and update students
      console.log('Fetching students...');
      const students = await this.fetchAllStudents();
      this.stats.students.total = students.length;
      console.log(`Found ${students.length} students`);

      for (const student of students) {
        await this.updateStudent(student);
      }

      // Fetch and update teachers
      console.log('Fetching teachers...');
      const teachers = await this.fetchAllTeachers();
      this.stats.teachers.total = teachers.length;
      console.log(`Found ${teachers.length} teachers`);

      for (const teacher of teachers) {
        await this.updateTeacher(teacher);
      }

      console.log('Migration completed!');
      console.log('Stats:', this.stats);
      console.log('Errors:', this.errors);

      return {
        stats: this.stats,
        errors: this.errors
      };

    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Get migration statistics
   */
  getStats(): MigrationStats {
    return this.stats;
  }

  /**
   * Get migration errors
   */
  getErrors(): MigrationError[] {
    return this.errors;
  }

  /**
   * Clear migration data
   */
  clear(): void {
    this.stats = {
      students: { total: 0, updated: 0, errors: 0, skipped: 0 },
      teachers: { total: 0, updated: 0, errors: 0, skipped: 0 }
    };
    this.errors = [];
  }
}

export const dataMigrationService = new DataMigrationService();
