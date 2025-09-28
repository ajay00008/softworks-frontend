import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  BookOpen, 
  TrendingUp, 
  Users, 
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

// Mock data for demonstration
const mockSubjectData = {
  subjectInfo: {
    name: 'Mathematics',
    totalStudents: 1250,
    averagePerformance: 78.5,
    rank: 1,
    improvement: 7.2,
    difficulty: 'High',
    topPerformer: 'John Doe',
    needsAttention: 45
  },
  classBreakdown: [
    { class: '11A', average: 88.5, students: 30, rank: 1, improvement: 12.3 },
    { class: '11B', average: 85.2, students: 28, rank: 2, improvement: 8.7 },
    { class: '11C', average: 82.1, students: 32, rank: 3, improvement: 6.2 },
    { class: '10A', average: 79.8, students: 31, rank: 4, improvement: 9.1 },
    { class: '10B', average: 76.3, students: 27, rank: 5, improvement: 4.8 },
    { class: '10C', average: 73.2, students: 33, rank: 6, improvement: 3.7 }
  ],
  topicPerformance: [
    { topic: 'Algebra', average: 82.3, students: 1250, improvement: 8.5 },
    { topic: 'Geometry', average: 75.8, students: 1250, improvement: 6.2 },
    { topic: 'Calculus', average: 71.4, students: 850, improvement: 9.1 },
    { topic: 'Statistics', average: 79.6, students: 920, improvement: 7.8 },
    { topic: 'Trigonometry', average: 77.2, students: 1100, improvement: 5.4 }
  ],
  monthlyTrends: [
    { month: 'Jan', performance: 72.5, exams: 8 },
    { month: 'Feb', performance: 75.2, exams: 12 },
    { month: 'Mar', performance: 78.1, exams: 15 },
    { month: 'Apr', performance: 76.8, exams: 10 },
    { month: 'May', performance: 79.3, exams: 18 },
    { month: 'Jun', performance: 81.7, exams: 14 }
  ],
  gradeDistribution: [
    { grade: 'A+', count: 125, percentage: 10.0, color: '#10B981' },
    { grade: 'A', count: 200, percentage: 16.0, color: '#3B82F6' },
    { grade: 'A-', count: 180, percentage: 14.4, color: '#8B5CF6' },
    { grade: 'B+', count: 250, percentage: 20.0, color: '#F59E0B' },
    { grade: 'B', count: 200, percentage: 16.0, color: '#EF4444' },
    { grade: 'C+', count: 150, percentage: 12.0, color: '#F97316' },
    { grade: 'C', count: 100, percentage: 8.0, color: '#84CC16' },
    { grade: 'D', count: 50, percentage: 4.0, color: '#06B6D4' },
    { grade: 'F', count: 45, percentage: 3.6, color: '#DC2626' }
  ]
};

const SubjectPerformance = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [subjectId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Subject Performance Analysis</h1>
          <p className="text-muted-foreground">Loading subject performance data...</p>
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
                <div className="h-32 bg-muted rounded"></div>
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
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard/performance')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {mockSubjectData.subjectInfo.name} Performance
              </h1>
              <p className="text-muted-foreground">Detailed performance analysis across all classes</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Award className="w-3 h-3 mr-1" />
            Rank #{mockSubjectData.subjectInfo.rank}
          </Badge>
        </div>
      </div>

      {/* Subject Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {mockSubjectData.subjectInfo.averagePerformance}%
            </div>
            <p className="text-xs text-muted-foreground">
              +{mockSubjectData.subjectInfo.improvement}% improvement
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/20 border-accent/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {mockSubjectData.subjectInfo.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/20 border-success/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Difficulty Level</CardTitle>
            <Target className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {mockSubjectData.subjectInfo.difficulty}
            </div>
            <p className="text-xs text-muted-foreground">Subject complexity</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/20 border-warning/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {mockSubjectData.subjectInfo.needsAttention}
            </div>
            <p className="text-xs text-muted-foreground">Students requiring support</p>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Class Performance Breakdown
          </CardTitle>
          <CardDescription>Performance across all classes for this subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSubjectData.classBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, 'Average Performance']}
                  labelFormatter={(label) => `Class ${label}`}
                />
                <Bar dataKey="average" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Topic Performance and Grade Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              Topic Performance
            </CardTitle>
            <CardDescription>Performance across different topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockSubjectData.topicPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, 'Average Performance']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="average" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              Grade Distribution
            </CardTitle>
            <CardDescription>Distribution of grades for this subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockSubjectData.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {mockSubjectData.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} students`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-warning" />
            Monthly Performance Trends
          </CardTitle>
          <CardDescription>Performance trends over time for this subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockSubjectData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'performance' ? `${value}%` : value,
                    name === 'performance' ? 'Performance' : 'Number of Exams'
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectPerformance;
