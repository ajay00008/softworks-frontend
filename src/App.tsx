import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Login from "./pages/Login";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Dashboard from "./pages/Dashboard";
import ClassAverages from "./pages/ClassAverages";
import TopPerformers from "./pages/TopPerformers";
import ClassPerformance from "./pages/ClassPerformance";
import SubjectAnalysis from "./pages/SubjectAnalysis";
import IndividualReports from "./pages/IndividualReports";
import PerformanceTrends from "./pages/PerformanceTrends";
import SyllabusUpload from "./pages/SyllabusUpload";
import SyllabusList from "./pages/SyllabusList";
import SyllabusEdit from "./pages/SyllabusEdit";
import SyllabusView from "./pages/SyllabusView";
import StudentPerformance from "./pages/StudentPerformance";
import AdminManagement from "./components/AdminManagement";
import DataMigrationDashboard from "./components/DataMigrationDashboard";
import DashboardLayout from "./components/Layout/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
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
            <Route path="admin-management" element={<AdminManagement />} />
            <Route path="data-migration" element={<DataMigrationDashboard />} />
            <Route path="settings" element={<div className="p-6">System Settings - Super Admin Only</div>} />
            <Route path="analytics" element={<div className="p-6">System Analytics - Super Admin Only</div>} />
              
              {/* Regular Admin Routes */}
              <Route index element={<Dashboard />} />
              <Route path="students" element={
                <ErrorBoundary>
                  <Students />
                </ErrorBoundary>
              } />
              <Route path="teachers" element={<Teachers />} />
              <Route path="performance" element={<Navigate to="/dashboard" replace />} />
              <Route path="performance/class-averages" element={<ClassAverages />} />
              <Route path="performance/top-performers" element={<TopPerformers />} />
              <Route path="performance/class-performance" element={<ClassPerformance />} />
              <Route path="performance/subject-analysis" element={<SubjectAnalysis />} />
              <Route path="performance/individual-reports" element={<IndividualReports />} />
              <Route path="performance/trends" element={<PerformanceTrends />} />              <Route path="performance/student" element={<StudentPerformance />} />
              {/* <Route path="teacher-assignment" element={<TeacherAssignment />} /> */}
              {/* <Route path="questions" element={<QuestionManagement />} /> */}
              <Route path="syllabus" element={<SyllabusList />} />
              <Route path="syllabus/upload" element={<SyllabusUpload />} />
              <Route path="syllabus/edit/:id" element={<SyllabusEdit />} />
              <Route path="syllabus/view/:id" element={<SyllabusView />} />
              {/* <Route path="absenteeism" element={<AbsenteeismTracking />} /> */}
              <Route path="books" element={<div className="p-6">Books Management - Coming Soon</div>} />
              <Route path="access" element={<div className="p-6">Access Privileges - Coming Soon</div>} />
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
