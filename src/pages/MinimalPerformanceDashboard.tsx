import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  GraduationCap,
  Target,
  Award,
  Activity,
  ArrowRight,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MinimalPerformanceDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">School Performance Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive analytics across classes, subjects, and students</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Activity className="w-3 h-3 mr-1" />
              Live Analytics
            </Badge>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,250</div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/20 border-accent/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">78.5%</div>
            <p className="text-xs text-muted-foreground">School average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/20 border-success/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Class</CardTitle>
            <Award className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">11A</div>
            <p className="text-xs text-muted-foreground">Best performing</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/20 border-warning/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement Rate</CardTitle>
            <Target className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">+12.3%</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => navigate('/dashboard/performance/class/overview')}>
          <CardHeader className="text-center">
            <GraduationCap className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Class Analytics</CardTitle>
            <CardDescription>Detailed class-wise performance analysis</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full">
              View Class Performance
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => navigate('/dashboard/performance/subject/overview')}>
          <CardHeader className="text-center">
            <BookOpen className="h-12 w-12 text-accent mx-auto mb-2" />
            <CardTitle>Subject Analytics</CardTitle>
            <CardDescription>Detailed subject-wise performance analysis</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full">
              View Subject Performance
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => navigate('/dashboard/performance/students')}>
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-success mx-auto mb-2" />
            <CardTitle>Student Analytics</CardTitle>
            <CardDescription>Individual student performance tracking</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full">
              View Student Performance
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Performance Overview
          </CardTitle>
          <CardDescription>School-wide performance metrics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Class Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                  <span className="font-medium">11A</span>
                  <span className="text-primary font-bold">85.2%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-accent/5 rounded">
                  <span className="font-medium">11B</span>
                  <span className="text-accent font-bold">82.8%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-success/5 rounded">
                  <span className="font-medium">11C</span>
                  <span className="text-success font-bold">79.5%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-warning/5 rounded">
                  <span className="font-medium">11D</span>
                  <span className="text-warning font-bold">76.3%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Subject Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                  <span className="font-medium">Mathematics</span>
                  <span className="text-primary font-bold">78.5%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-accent/5 rounded">
                  <span className="font-medium">Physics</span>
                  <span className="text-accent font-bold">82.3%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-success/5 rounded">
                  <span className="font-medium">Chemistry</span>
                  <span className="text-success font-bold">85.7%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-warning/5 rounded">
                  <span className="font-medium">English</span>
                  <span className="text-warning font-bold">88.2%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MinimalPerformanceDashboard;
