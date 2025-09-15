import { dataMigrationService } from './dataMigration';

/**
 * Test script to check database connection and data
 * Run this in the browser console to test the migration service
 */
export const testMigration = async () => {
  console.log('🧪 Testing Data Migration Service...');
  
  try {
    // Test 1: Check backend connection
    console.log('1️⃣ Testing backend connection...');
    const isConnected = await dataMigrationService.checkBackendConnection();
    console.log(isConnected ? '✅ Backend connected' : '❌ Backend connection failed');
    
    if (!isConnected) {
      console.log('Please make sure you are logged in and the backend is running');
      return;
    }

    // Test 2: Get current user
    console.log('2️⃣ Getting current user...');
    const user = await dataMigrationService.getCurrentUser();
    console.log('Current user:', user);

    // Test 3: Fetch students
    console.log('3️⃣ Fetching students...');
    const students = await dataMigrationService.fetchAllStudents();
    console.log(`Found ${students.length} students`);
    
    if (students.length > 0) {
      console.log('Sample student:', students[0]);
      
      // Test validation
      const validation = dataMigrationService.validateStudent(students[0]);
      console.log('Student validation:', validation);
    }

    // Test 4: Fetch teachers
    console.log('4️⃣ Fetching teachers...');
    const teachers = await dataMigrationService.fetchAllTeachers();
    console.log(`Found ${teachers.length} teachers`);
    
    if (teachers.length > 0) {
      console.log('Sample teacher:', teachers[0]);
      
      // Test validation
      const validation = dataMigrationService.validateTeacher(teachers[0]);
      console.log('Teacher validation:', validation);
    }

    console.log('✅ All tests completed successfully!');
    console.log('You can now run the migration from the Data Migration Dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).testMigration = testMigration;
  console.log('💡 Run testMigration() in the console to test the migration service');
}
