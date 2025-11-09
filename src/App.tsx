import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import MinimalPerformanceDashboard from "./pages/MinimalPerformanceDashboard";
import ClassPerformance from "./pages/ClassPerformance";
import SubjectPerformance from "./pages/SubjectPerformance";
import StudentPerformance from "./pages/StudentPerformance";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminSubjectManagement from "./pages/SuperAdminSubjectManagement";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import PerformanceAnalytics from "./pages/PerformanceAnalytics";
import TeacherAssignment from "./pages/TeacherAssignment";
import TeacherDashboard from "./pages/TeacherDashboard";
import AccessPrivileges from "./pages/AccessPrivileges";
import QuestionPaperManagement from "./pages/QuestionPaperManagement";
import ExamManagement from "./pages/ExamManagement";
import ClassSubjectManagement from "./pages/ClassSubjectManagement";
import AbsenteeismTracking from "./pages/AbsenteeismTracking";
import AdminManagement from "./components/AdminManagement";
import DataMigrationDashboard from "./components/DataMigrationDashboard";
import DashboardLayout from "./components/Layout/DashboardLayout";
import NotFound from "./pages/NotFound";
// Teacher specific pages
import AnswerSheetUpload from "./pages/teacher/AnswerSheetUpload";
import AIAnswerChecking from "./pages/teacher/AIAnswerChecking";
import TeacherResults from "./pages/teacher/TeacherResults";
import TeacherAnalytics from "./pages/teacher/TeacherAnalytics";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import { authAPI } from "./services/api";
import "./utils/testMigration"; // Load test migration script
// Initialize notification service (socket connection) when app loads
import "./services/notifications";

const queryClient = new QueryClient();

// Global token validation and cleanup on app load
if (typeof window !== 'undefined') {
  // Check token expiration on app load
  const checkTokenOnLoad = () => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;
        if (exp && exp < Math.floor(Date.now() / 1000)) {
          // Token expired, clear it
          localStorage.removeItem('auth-token');
          localStorage.removeItem('user');
          console.log('[AUTH] 🧹 Cleared expired token on app load', {
            timestamp: new Date().toISOString()
          });
        }
      } catch (e) {
        // Invalid token, clear it
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
      }
    }
  };

  // Check immediately
  checkTokenOnLoad();

  // Listen for storage changes (when token is cleared in another tab)
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth-token' && !e.newValue) {
      // Token was removed in another tab, reload to redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  });
}

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Import token utils and validate token
    const validateAuth = async () => {
      try {
        const { validateAndCleanToken, isTokenExpired } = await import('@/utils/tokenUtils');
        const token = localStorage.getItem('auth-token');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsValidating(false);
          return;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
          // Token expired, clear it
          validateAndCleanToken();
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateAuth();
    
    // Set up interval to periodically check token expiration
    const interval = setInterval(() => {
      validateAuth();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Show nothing while validating
  if (isValidating) {
    return null; // Or a loading spinner
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Role-based access control is now handled in DashboardLayout

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
            {/* Super Admin Routes */}
            <Route path="super-admin" element={<SuperAdminDashboard />} />
            <Route path="admin-management" element={<AdminManagement />} />
            <Route path="subject-management" element={<SuperAdminSubjectManagement />} />
            <Route path="data-migration" element={<DataMigrationDashboard />} />
            <Route path="settings" element={<div className="p-6">System Settings - Super Admin Only</div>} />
            <Route path="analytics" element={<div className="p-6">System Analytics - Super Admin Only</div>} />
              
              {/* Regular Admin Routes */}
              <Route index element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="access-privileges" element={<AccessPrivileges />} />
              <Route path="performance" element={<PerformanceAnalytics />} />
              <Route path="performance/class/:classId" element={<ClassPerformance />} />
              <Route path="performance/subject/:subjectId" element={<SubjectPerformance />} />
              <Route path="performance/students" element={<StudentPerformance />} />
              <Route path="teacher-assignment" element={<TeacherAssignment />} />
              <Route path="class-subject-management" element={<ClassSubjectManagement />} />
              <Route path="question-papers" element={<QuestionPaperManagement />} />
              <Route path="exams" element={<ExamManagement />} />
              <Route path="absenteeism" element={<AbsenteeismTracking />} />
              <Route path="books" element={<div className="p-6">Books Management - Coming Soon</div>} />
              <Route path="access-privileges" element={<AccessPrivileges />} />
              <Route path="mirror" element={<div className="p-6">Mirror Login - Coming Soon</div>} />
              
              {/* Teacher Specific Routes */}
              <Route path="teacher/students" element={<TeacherStudents />} />
              <Route path="teacher/upload-sheets" element={<AnswerSheetUpload />} />
              <Route path="teacher/ai-checking" element={<AIAnswerChecking />} />
              <Route path="teacher/question-papers" element={<QuestionPaperManagement />} />
              <Route path="teacher/results" element={<TeacherResults />} />
              <Route path="teacher/analytics" element={<TeacherAnalytics />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
