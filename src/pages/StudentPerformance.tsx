import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  Users, 
  TrendingUp, 
  Search, 
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
  Filter,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
const mockStudentData = {
  overview: {
    totalStudents: 1250,
    averagePerformance: 78.5,
    topPerformers: 125,
    needsAttention: 45,
    improvementRate: 12.3
  },
  gradeDistribution: [
    { grade: 'A+', count: 45, percentage: 3.6, color: '#10B981' },
    { grade: 'A', count: 120, percentage: 9.6, color: '#3B82F6' },
    { grade: 'A-', count: 180, percentage: 14.4, color: '#8B5CF6' },
    { grade: 'B+', count: 200, percentage: 16.0, color: '#F59E0B' },
    { grade: 'B', count: 150, percentage: 12.0, color: '#EF4444' },
    { grade: 'C+', count: 100, percentage: 8.0, color: '#F97316' },
    { grade: 'C', count: 80, percentage: 6.4, color: '#84CC16' },
    { grade: 'D', count: 60, percentage: 4.8, color: '#06B6D4' },
    { grade: 'F', count: 65, percentage: 5.2, color: '#DC2626' }
  ],
  classPerformance: [
    { class: '11A', average: 85.2, students: 30, rank: 1, improvement: 8.5 },
    { class: '11B', average: 82.8, students: 28, rank: 2, improvement: 6.2 },
    { class: '11C', average: 79.5, students: 32, rank: 3, improvement: 4.1 },
    { class: '11D', average: 76.3, students: 29, rank: 4, improvement: 2.8 },
    { class: '10A', average: 74.8, students: 31, rank: 5, improvement: 5.3 },
    { class: '10B', average: 72.1, students: 27, rank: 6, improvement: 3.7 }
  ],
  subjectPerformance: [
    { subject: 'Mathematics', average: 78.5, students: 1250, improvement: 7.2 },
    { subject: 'Physics', average: 82.3, students: 850, improvement: 9.1 },
    { subject: 'Chemistry', average: 85.7, students: 920, improvement: 6.8 },
    { subject: 'English', average: 88.2, students: 1250, improvement: 5.4 },
    { subject: 'Biology', average: 80.1, students: 780, improvement: 8.3 }
  ],
  monthlyTrends: [
    { month: 'Jan', performance: 72.5, attendance: 92.3 },
    { month: 'Feb', performance: 75.2, attendance: 94.1 },
    { month: 'Mar', performance: 78.1, attendance: 93.8 },
    { month: 'Apr', performance: 76.8, attendance: 95.2 },
    { month: 'May', performance: 79.3, attendance: 94.7 },
    { month: 'Jun', performance: 81.7, attendance: 96.1 }
  ],
  topPerformers: [
    { name: 'John Doe', rollNumber: '11A001', class: '11A', average: 92.5, rank: 1, improvement: 5.2 },
    { name: 'Jane Smith', rollNumber: '11A002', class: '11A', average: 89.8, rank: 2, improvement: 7.1 },
    { name: 'Mike Johnson', rollNumber: '11B001', class: '11B', average: 87.3, rank: 3, improvement: 4.3 },
    { name: 'Sarah Wilson', rollNumber: '11C001', class: '11C', average: 84.6, rank: 4, improvement: 6.8 },
    { name: 'David Brown', rollNumber: '11D001', class: '11D', average: 81.2, rank: 5, improvement: 3.9 }
  ],
  needsAttention: [
    { name: 'Alice Johnson', rollNumber: '10A015', class: '10A', average: 45.2, subjects: ['Mathematics', 'Physics'], lastExam: '2024-01-15' },
    { name: 'Bob Smith', rollNumber: '10B008', class: '10B', average: 38.7, subjects: ['Chemistry', 'Biology'], lastExam: '2024-01-12' },
    { name: 'Carol Davis', rollNumber: '9C012', class: '9C', average: 42.1, subjects: ['English', 'Mathematics'], lastExam: '2024-01-10' }
  ]
};

const StudentPerformance = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Student Performance Analytics</h1>
          <p className="text-muted-foreground">Loading student performance data...</p>
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
              <h1 className="text-3xl font-bold text-foreground">Student Performance Analytics</h1>
              <p className="text-muted-foreground">Comprehensive student performance tracking and analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select 
            value={selectedFilter} 
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Students</option>
            <option value="top">Top Performers</option>
            <option value="needs-attention">Needs Attention</option>
            <option value="improving">Improving</option>
          </select>
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
            <div className="text-2xl font-bold text-primary">
              {mockStudentData.overview.totalStudents.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/20 border-accent/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {mockStudentData.overview.averagePerformance}%
            </div>
            <p className="text-xs text-muted-foreground">School average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/20 border-success/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {mockStudentData.overview.topPerformers}
            </div>
            <p className="text-xs text-muted-foreground">A+ grade students</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/20 border-warning/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {mockStudentData.overview.needsAttention}
            </div>
            <p className="text-xs text-muted-foreground">Students requiring support</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution and Class Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              Grade Distribution
            </CardTitle>
            <CardDescription>Distribution of grades across all students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockStudentData.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {mockStudentData.gradeDistribution.map((entry, index) => (
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
              <BarChart3 className="h-5 w-5 text-primary" />
              Class Performance
            </CardTitle>
            <CardDescription>Average performance by class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockStudentData.classPerformance}>
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
      </div>

      {/* Subject Performance and Monthly Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Subject Performance
            </CardTitle>
            <CardDescription>Average performance by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockStudentData.subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
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
              <TrendingUp className="h-5 w-5 text-warning" />
              Monthly Trends
            </CardTitle>
            <CardDescription>Performance and attendance trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockStudentData.monthlyTrends}>
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
                  <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
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
          <CardDescription>Students with highest performance across all classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStudentData.topPerformers.map((student, index) => (
              <div key={student.rollNumber} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.rollNumber} - {student.class}</p>
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

      {/* Students Needing Attention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Students Needing Attention
          </CardTitle>
          <CardDescription>Students requiring additional support and intervention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStudentData.needsAttention.map((student, index) => (
              <div key={student.rollNumber} className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-destructive/10 text-destructive rounded-full font-bold">
                    !
                  </div>
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.rollNumber} - {student.class}</p>
                    <p className="text-xs text-destructive">Struggling in: {student.subjects.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg text-destructive">{student.average}%</p>
                    <p className="text-sm text-muted-foreground">
                      Last exam: {student.lastExam}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Take Action
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

export default StudentPerformance;
