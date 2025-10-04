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
import { authAPI } from "./services/api";
import "./utils/testMigration"; // Load test migration script

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('auth-token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
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
            <Route path="data-migration" element={<DataMigrationDashboard />} />
            <Route path="settings" element={<div className="p-6">System Settings - Super Admin Only</div>} />
            <Route path="analytics" element={<div className="p-6">System Analytics - Super Admin Only</div>} />
              
              {/* Regular Admin Routes */}
              <Route index element={<PerformanceDashboard />} />
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
              <Route path="access" element={<AccessPrivileges />} />
              <Route path="mirror" element={<div className="p-6">Mirror Login - Coming Soon</div>} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
