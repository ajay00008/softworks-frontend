import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  GraduationCap, 
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
const mockClassData = {
  classInfo: {
    name: '11A',
    totalStudents: 30,
    averagePerformance: 85.2,
    rank: 1,
    improvement: 8.5,
    attendance: 94.2,
    topPerformer: 'John Doe',
    needsAttention: 2
  },
  subjectBreakdown: [
    { subject: 'Mathematics', average: 88.5, highest: 98, lowest: 72, students: 30, improvement: 12.3 },
    { subject: 'Physics', average: 82.1, highest: 95, lowest: 65, students: 30, improvement: 8.7 },
    { subject: 'Chemistry', average: 85.7, highest: 96, lowest: 68, students: 30, improvement: 6.2 },
    { subject: 'English', average: 89.2, highest: 97, lowest: 75, students: 30, improvement: 4.8 },
    { subject: 'Biology', average: 80.3, highest: 92, lowest: 58, students: 30, improvement: 9.1 }
  ],
  studentPerformance: [
    { name: 'John Doe', rollNumber: '11A001', average: 92.5, rank: 1, improvement: 5.2, subjects: { math: 95, physics: 90, chemistry: 92, english: 93, biology: 90 } },
    { name: 'Jane Smith', rollNumber: '11A002', average: 89.8, rank: 2, improvement: 7.1, subjects: { math: 88, physics: 92, chemistry: 89, english: 91, biology: 89 } },
    { name: 'Mike Johnson', rollNumber: '11A003', average: 87.3, rank: 3, improvement: 4.3, subjects: { math: 85, physics: 88, chemistry: 87, english: 89, biology: 87 } },
    { name: 'Sarah Wilson', rollNumber: '11A004', average: 84.6, rank: 4, improvement: 6.8, subjects: { math: 82, physics: 85, chemistry: 84, english: 86, biology: 86 } },
    { name: 'David Brown', rollNumber: '11A005', average: 81.2, rank: 5, improvement: 3.9, subjects: { math: 78, physics: 82, chemistry: 81, english: 83, biology: 82 } }
  ],
  monthlyTrends: [
    { month: 'Jan', performance: 78.5, attendance: 92.3 },
    { month: 'Feb', performance: 80.2, attendance: 94.1 },
    { month: 'Mar', performance: 82.7, attendance: 93.8 },
    { month: 'Apr', performance: 81.9, attendance: 95.2 },
    { month: 'May', performance: 84.3, attendance: 94.7 },
    { month: 'Jun', performance: 85.2, attendance: 96.1 }
  ],
  gradeDistribution: [
    { grade: 'A+', count: 8, percentage: 26.7, color: '#10B981' },
    { grade: 'A', count: 12, percentage: 40.0, color: '#3B82F6' },
    { grade: 'A-', count: 6, percentage: 20.0, color: '#8B5CF6' },
    { grade: 'B+', count: 3, percentage: 10.0, color: '#F59E0B' },
    { grade: 'B', count: 1, percentage: 3.3, color: '#EF4444' }
  ]
};

const ClassPerformance = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [classId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Class Performance Analysis</h1>
          <p className="text-muted-foreground">Loading class performance data...</p>
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
                Class {mockClassData.classInfo.name} Performance
              </h1>
              <p className="text-muted-foreground">Detailed performance analysis and insights</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Award className="w-3 h-3 mr-1" />
            Rank #{mockClassData.classInfo.rank}
          </Badge>
        </div>
      </div>

      {/* Class Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {mockClassData.classInfo.averagePerformance}%
            </div>
            <p className="text-xs text-muted-foreground">
              +{mockClassData.classInfo.improvement}% improvement
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
              {mockClassData.classInfo.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/20 border-success/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {mockClassData.classInfo.attendance}%
            </div>
            <p className="text-xs text-muted-foreground">Average attendance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/20 border-warning/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {mockClassData.classInfo.needsAttention}
            </div>
            <p className="text-xs text-muted-foreground">Students requiring support</p>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Subject Performance Breakdown
          </CardTitle>
          <CardDescription>Performance across all subjects in this class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockClassData.subjectBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, 'Average Performance']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="average" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              Grade Distribution
            </CardTitle>
            <CardDescription>Distribution of grades in this class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockClassData.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {mockClassData.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} students`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Monthly Performance Trends
            </CardTitle>
            <CardDescription>Performance trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockClassData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'performance' ? `${value}%` : `${value}%`,
                      name === 'performance' ? 'Performance' : 'Attendance'
                    ]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="performance" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="attendance" 
                    stackId="2"
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-warning" />
            Top Performers
          </CardTitle>
          <CardDescription>Students with highest performance in this class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockClassData.studentPerformance.map((student, index) => (
              <div key={student.rollNumber} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">{student.average}%</p>
                    <p className="text-sm text-muted-foreground">
                      +{student.improvement}% improvement
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassPerformance;
