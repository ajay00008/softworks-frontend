import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ViewButton } from "@/components/ui/view-button";
import { ViewTabs } from "@/components/ui/view-tabs";
import {
  Upload,
  Brain,
  BookOpen,
  Award,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Target,
  CheckCircle,
  AlertTriangle,
  FileText,
  Zap,
  GraduationCap,
} from "lucide-react";
import { teacherDashboardAPI } from "@/services/api";
import ResultsChartsStaff from "@/components/Results/ResultsChartsStaff";

interface TeacherAccess {
  classAccess: Array<{
    classId: string;
    className: string;
    accessLevel: string;
    canUploadSheets: boolean;
    canMarkAbsent: boolean;
    canMarkMissing: boolean;
    canOverrideAI: boolean;
  }>;
  subjectAccess: Array<{
    subjectId: string;
    subjectName: string;
    accessLevel: string;
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
}

interface DashboardStats {
  totalClasses: number;
  totalSubjects: number;
  totalExams: number;
  pendingSheets: number;
  correctedSheets: number;
  averagePerformance: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
}

const TeacherDashboard = () => {
  const [teacherAccess, setTeacherAccess] = useState<TeacherAccess | null>(
    null
  );
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // Load access data (required for dashboard)
    try {
      const accessResponse = await teacherDashboardAPI.getAccess();
      if (accessResponse.success && accessResponse.data) {
        setTeacherAccess(accessResponse.data);
      } else {
        console.warn('[TEACHER DASHBOARD] Access response not successful:', accessResponse);
        setTeacherAccess(null);
      }
    } catch (error) {
      console.error('[TEACHER DASHBOARD] Failed to load access:', error);
      // Only show error toast if access is truly critical and failed
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.toLowerCase().includes('no data') && 
          !errorMessage.toLowerCase().includes('not found')) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Some features may be unavailable.",
          variant: "destructive",
        });
      }
      setTeacherAccess(null);
    }

    // Stats API doesn't exist yet, so we'll set default values or calculate from other data
    // For now, set stats to null to avoid errors (stats section is conditionally rendered)
    setStats(null);
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Classes</p>
                  <p className="text-2xl font-bold">{stats.totalClasses}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Subjects</p>
                  <p className="text-2xl font-bold">{stats.totalSubjects}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Sheets</p>
                  <p className="text-2xl font-bold">{stats.pendingSheets}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Performance</p>
                  <p className="text-2xl font-bold">
                    {stats.averagePerformance.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Charts Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Performance Analytics</h2>
          <p className="text-muted-foreground">
            Results analysis for your assigned classes and subjects
          </p>
        </div>
        <ResultsChartsStaff />
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest teaching activities and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {activity.type === "upload" && (
                      <Upload className="h-5 w-5 text-blue-500" />
                    )}
                    {activity.type === "correction" && (
                      <Brain className="h-5 w-5 text-purple-500" />
                    )}
                    {activity.type === "question" && (
                      <BookOpen className="h-5 w-5 text-green-500" />
                    )}
                    {activity.type === "result" && (
                      <Award className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Classes and Subjects Management */}
      {teacherAccess && (
        <Card>
          <CardHeader>
            <CardTitle>My Classes & Subjects</CardTitle>
            <CardDescription>
              Manage your assigned classes and subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="classes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="classes">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Classes ({teacherAccess.classAccess.length})
                </TabsTrigger>
                <TabsTrigger value="subjects">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Subjects ({teacherAccess.subjectAccess.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="classes" className="mt-4">
                <div className="space-y-3">
                  {teacherAccess.classAccess.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No classes assigned yet</p>
                    </div>
                  ) : (
                    teacherAccess.classAccess.map((cls, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{cls.className}</h4>
                            <div className="flex gap-2 mt-1">
                              {cls.canUploadSheets && (
                                <Badge variant="outline" className="text-xs">
                                  Upload Sheets
                                </Badge>
                              )}
                              {cls.canMarkAbsent && (
                                <Badge variant="outline" className="text-xs">
                                  Mark Absent
                                </Badge>
                              )}
                              {cls.canMarkMissing && (
                                <Badge variant="outline" className="text-xs">
                                  Mark Missing
                                </Badge>
                              )}
                              {cls.canOverrideAI && (
                                <Badge variant="outline" className="text-xs">
                                  Override AI
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{cls.accessLevel}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="subjects" className="mt-4">
                <div className="space-y-3">
                  {teacherAccess.subjectAccess.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No subjects assigned yet</p>
                    </div>
                  ) : (
                    teacherAccess.subjectAccess.map((subject, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {subject.subjectName}
                            </h4>
                            <div className="flex gap-2 mt-1">
                              {subject.canCreateQuestions && (
                                <Badge variant="outline" className="text-xs">
                                  Create Questions
                                </Badge>
                              )}
                              {subject.canUploadSyllabus && (
                                <Badge variant="outline" className="text-xs">
                                  Upload Syllabus
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{subject.accessLevel}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherDashboard;
