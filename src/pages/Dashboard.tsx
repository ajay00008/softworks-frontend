import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  HelpCircle, 
  Settings, 
  BarChart3,
  Plus,
  Upload,
  UserPlus,
  BookMarked,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { studentsAPI, teachersAPI } from '@/services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalBooks: 0,
    totalQuestions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [studentsResponse, teachersResponse] = await Promise.all([
          studentsAPI.getAll(),
          teachersAPI.getAll()
        ]);
        
        setStats({
          totalStudents: studentsResponse.students.length,
          totalTeachers: teachersResponse.teachers.length,
          totalBooks: 45, // Mock data
          totalQuestions: 128 // Mock data
        });
      } catch (error) {
        } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const dashboardCards = [
    {
      title: 'Create Students',
      description: 'Manage student information and enrollment',
      icon: Users,
      color: 'primary',
      required: ['Student Name', 'Roll Number', 'Father Name'],
      actionText: 'Manage Students',
      onClick: () => navigate('/dashboard/students'),
      stats: `${stats.totalStudents} enrolled`,
      badge: 'Primary'
    },
    {
      title: 'Create Teachers',
      description: 'Add and manage teaching staff',
      icon: GraduationCap,
      color: 'accent',
      required: ['Teacher Name', 'Staff ID', 'Subject'],
      actionText: 'Manage Teachers',
      onClick: () => navigate('/dashboard/teachers'),
      stats: `${stats.totalTeachers} active`,
      badge: null
    },
    {
      title: 'Upload Books',
      description: 'Upload and organize educational content',
      icon: BookOpen,
      color: 'success',
      required: ['Class', 'Subject'],
      actionText: 'Upload Content',
      onClick: () => navigate('/dashboard/books'),
      stats: `${stats.totalBooks} books`,
      badge: null
    },
    {
      title: 'Create Questions',
      description: 'Build assessments and question banks',
      icon: HelpCircle,
      color: 'warning',
      required: ['Class and Subject (BCI)', 'Foreign Based Questions', 'Subject Syllabus'],
      actionText: 'Manage Questions',
      onClick: () => navigate('/dashboard/questions'),
      stats: `${stats.totalQuestions} questions`,
      badge: null
    },
    {
      title: 'Access Privileges',
      description: 'Control user permissions and settings',
      icon: Settings,
      color: 'secondary',
      required: ['Can edit teacher settings'],
      actionText: 'Manage Access',
      onClick: () => navigate('/dashboard/access'),
      stats: 'System settings',
      badge: null
    },
    {
      title: 'Performance Analytics',
      description: 'Individual and class performance with graphical representation',
      icon: BarChart3,
      color: 'primary',
      required: ['Individual Performance', 'Class Performance', 'Percentage Analytics'],
      actionText: 'View Analytics',
      onClick: () => navigate('/dashboard/performance'),
      stats: 'Latest insights',
      badge: 'New'
    },
    {
      title: 'Teacher Assignment',
      description: 'Assign staff access and class/subject limitations',
      icon: Settings,
      color: 'secondary',
      required: ['Class Assignment', 'Subject Assignment', 'Permission Control'],
      actionText: 'Manage Access',
      onClick: () => navigate('/dashboard/teacher-assignment'),
      stats: 'Access control',
      badge: null
    },
    {
      title: 'Question Management',
      description: 'Create questions based on Blooms Taxonomy with AI',
      icon: HelpCircle,
      color: 'warning',
      required: ['Blooms Taxonomy', 'AI Generation', 'Difficulty Levels'],
      actionText: 'Manage Questions',
      onClick: () => navigate('/dashboard/questions'),
      stats: `${stats.totalQuestions} questions`,
      badge: 'AI Powered'
    },
    {
      title: 'Syllabus Management',
      description: 'Upload and manage educational syllabi',
      icon: BookOpen,
      color: 'success',
      required: ['File Upload', 'Version Control', 'Class Organization'],
      actionText: 'Manage Syllabus',
      onClick: () => navigate('/dashboard/syllabus'),
      stats: 'Content management',
      badge: null
    },
    {
      title: 'Absenteeism Tracking',
      description: 'Track student absenteeism with red flag system',
      icon: AlertTriangle,
      color: 'destructive',
      required: ['Red Flag System', 'Admin Acknowledgment', 'Missing Answer Sheets'],
      actionText: 'Track Absenteeism',
      onClick: () => navigate('/dashboard/absenteeism'),
      stats: 'Critical alerts',
      badge: 'Priority'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-4">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage all aspects of your educational platform</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            Administrator Access
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30 dark:from-primary/20 dark:to-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/20 border-accent/30 dark:from-accent/20 dark:to-accent/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teaching Staff</CardTitle>
            <GraduationCap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Active teachers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/20 border-success/30 dark:from-success/20 dark:to-success/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Educational Content</CardTitle>
            <BookOpen className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">Books uploaded</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/20 border-warning/30 dark:from-warning/20 dark:to-warning/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Question Bank</CardTitle>
            <HelpCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">Total questions</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((card) => (
          <Card key={card.title} className="group hover:shadow-lg transition-all duration-200 border-0 bg-card/80 backdrop-blur dark:bg-card/90 dark:border-border/50">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${card.color}/10 border border-${card.color}/20 dark:bg-${card.color}/20 dark:border-${card.color}/30`}>
                  <card.icon className={`w-6 h-6 text-${card.color}`} />
                </div>
                {card.badge && (
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    {card.badge}
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {card.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {card.description}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Required Fields:
                </p>
                <ul className="space-y-1">
                  {card.required.map((field, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center">
                      <span className="w-1 h-1 bg-primary rounded-full mr-2"></span>
                      {field}
                    </li>
                  ))}
                </ul>
                {card.required.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{card.required.length - 3} more fields</p>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">{card.stats}</span>
                <Button 
                  onClick={card.onClick}
                  className={`bg-${card.color} hover:bg-${card.color}/90 text-${card.color}-foreground h-9`}
                >
                  {card.actionText}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;