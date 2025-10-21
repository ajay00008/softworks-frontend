import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
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
  Zap
} from 'lucide-react';
import { teacherDashboardAPI } from '@/services/api';

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
  const [teacherAccess, setTeacherAccess] = useState<TeacherAccess | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [accessResponse, statsResponse] = await Promise.all([
        teacherDashboardAPI.getAccess(),
        teacherDashboardAPI.getDashboardStats()
      ]);
      
      setTeacherAccess(accessResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Upload Answer Sheets',
      description: 'Upload and process student answer sheets with AI',
      icon: Upload,
      color: 'bg-blue-500',
      href: '/dashboard/teacher/upload-sheets',
      enabled: true
    },
    {
      title: 'AI Answer Checking',
      description: 'Review and manage AI-corrected answer sheets',
      icon: Brain,
      color: 'bg-purple-500',
      href: '/dashboard/teacher/ai-checking',
      enabled: true
    },
    {
      title: 'Question Papers',
      description: 'Create and manage question papers with AI assistance',
      icon: BookOpen,
      color: 'bg-green-500',
      href: '/dashboard/teacher/question-papers',
      enabled: teacherAccess?.subjectAccess.some(subject => subject.canCreateQuestions) || false
    },
    {
      title: 'Results',
      description: 'View and analyze student performance and results',
      icon: Award,
      color: 'bg-orange-500',
      href: '/dashboard/teacher/results',
      enabled: true
    },
    {
      title: 'Analytics',
      description: 'Comprehensive analytics and insights for teaching performance',
      icon: BarChart3,
      color: 'bg-indigo-500',
      href: '/dashboard/teacher/analytics',
      enabled: teacherAccess?.globalPermissions.canAccessAnalytics || false
    }
  ];

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your teaching management dashboard
          </p>
        </div>
      </div>

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
                  <p className="text-2xl font-bold">{stats.averagePerformance.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access your most frequently used teaching tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !action.enabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => action.enabled && navigate(action.href)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                      {!action.enabled && (
                        <Badge variant="outline" className="mt-1">
                          Access Restricted
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

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
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'upload' && <Upload className="h-5 w-5 text-blue-500" />}
                    {activity.type === 'correction' && <Brain className="h-5 w-5 text-purple-500" />}
                    {activity.type === 'question' && <BookOpen className="h-5 w-5 text-green-500" />}
                    {activity.type === 'result' && <Award className="h-5 w-5 text-orange-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={activity.status === 'completed' ? 'default' : 'secondary'}
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

      {/* Access Information */}
      {teacherAccess && (
        <Card>
          <CardHeader>
            <CardTitle>Your Access</CardTitle>
            <CardDescription>
              Your current teaching permissions and access levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Class Access</h4>
                <div className="space-y-2">
                  {teacherAccess.classAccess.map((cls, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{cls.className}</span>
                      <Badge variant="outline">{cls.accessLevel}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Subject Access</h4>
                <div className="space-y-2">
                  {teacherAccess.subjectAccess.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{subject.subjectName}</span>
                      <div className="flex gap-1">
                        {subject.canCreateQuestions && (
                          <Badge variant="outline" className="text-xs">Questions</Badge>
                        )}
                        {subject.canUploadSyllabus && (
                          <Badge variant="outline" className="text-xs">Syllabus</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherDashboard;