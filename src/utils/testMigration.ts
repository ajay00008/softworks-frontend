import { dataMigrationService } from './dataMigration';

/**
 * Test script to check database connection and data
 * Run this in the browser console to test the migration service
 */
export const testMigration = async () => {
  try {
    // Test 1: Check backend connection
    const isConnected = await dataMigrationService.checkBackendConnection();
    if (!isConnected) {
      return;
    }

    // Test 2: Get current user
    const user = await dataMigrationService.getCurrentUser();
    // Test 3: Fetch students
    const students = await dataMigrationService.fetchAllStudents();
    if (students.length > 0) {
      // Test validation
      const validation = dataMigrationService.validateStudent(students[0]);
      }

    // Test 4: Fetch teachers
    const teachers = await dataMigrationService.fetchAllTeachers();
    if (teachers.length > 0) {
      // Test validation
      const validation = dataMigrationService.validateTeacher(teachers[0]);
      }

    } catch (error) {
    }
};

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).testMigration = testMigration;
}
                                      