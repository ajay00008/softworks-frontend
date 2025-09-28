import { useEffect, useState } from 'react';
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
import { performanceAPI } from '@/services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

// Default empty data structure
const emptyPerformanceData = {
  schoolOverview: {
    totalStudents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    averagePerformance: 0,
    topPerformingClass: 'N/A',
    topPerformingSubject: 'N/A',
    improvementRate: 0
  },
  classPerformance: [],
  subjectPerformance: [],
  studentPerformance: [],
  monthlyTrends: []
};

const PerformanceDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(emptyPerformanceData);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to fetch real data from backend
        const analyticsData = await performanceAPI.getAnalytics();
        console.log('Backend analytics data:', analyticsData);
        
        // Transform backend data to match our component structure
        if (analyticsData && analyticsData.data) {
          setPerformanceData(analyticsData.data);
          setHasData(true);
          console.log('✅ Using real backend data');
        } else {
          // No data available from backend
          console.log('⚠️ No data available from backend');
          setPerformanceData(emptyPerformanceData);
          setHasData(false);
        }
      } catch (error) {
        console.error('Error loading performance data:', error);
        setError('Failed to load performance data');
        // No fallback data - show empty state
        setPerformanceData(emptyPerformanceData);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadPerformanceData();
  }, []);

  const handleChartClick = (type: string, data: any) => {
    if (type === 'class') {
      navigate(`/dashboard/performance/class/overview`);
    } else if (type === 'subject') {
      navigate(`/dashboard/performance/subject/overview`);
    } else if (type === 'students') {
      navigate(`/dashboard/performance/students`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">School Performance Dashboard</h1>
          <p className="text-muted-foreground">Loading performance analytics...</p>
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

  // Show empty state if no data is available
  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">School Performance Dashboard</h1>
              <p className="text-muted-foreground">Comprehensive analytics across classes, subjects, and students</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
                <Activity className="w-3 h-3 mr-1" />
                No Data Available
              </Badge>
              {error && (
                <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                  API Error
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Performance Data Available</h2>
            <p className="text-muted-foreground mb-6">
              {error 
                ? 'Unable to load performance data from the backend. Please check your connection and try again.'
                : 'No performance data is currently available. Data will appear here once exams and results are recorded.'
              }
            </p>
            {error && (
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="mr-4"
              >
                Retry
              </Button>
            )}
            <Button onClick={() => navigate('/dashboard/students')}>
              Manage Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">School Performance Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive analytics across classes, subjects, and students</p>
          </div>
          <div className="flex items-center gap-2">
            {hasData ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <Activity className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
                <Activity className="w-3 h-3 mr-1" />
                No Data Available
              </Badge>
            )}
            {error && (
              <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                API Error
              </Badge>
            )}
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
            <div className="text-2xl font-bold text-primary">
              {performanceData.schoolOverview.totalStudents.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/20 border-accent/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {performanceData.schoolOverview.averagePerformance}%
            </div>
            <p className="text-xs text-muted-foreground">School average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/20 border-success/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Class</CardTitle>
            <Award className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {performanceData.schoolOverview.topPerformingClass}
            </div>
            <p className="text-xs text-muted-foreground">Best performing</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/20 border-warning/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement Rate</CardTitle>
            <Target className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              +{performanceData.schoolOverview.improvementRate}%
            </div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Performance Charts - Only show if data exists */}
      {performanceData.classPerformance.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Class Performance Chart */}
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer" 
                onClick={() => handleChartClick('class', { class: 'overview' })}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Class Performance
                  </CardTitle>
                  <CardDescription>Performance across all classes</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData.classPerformance}>
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

          {/* Subject Performance Chart */}
          {performanceData.subjectPerformance.length > 0 && (
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleChartClick('subject', { subject: 'overview' })}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-accent" />
                      Subject Performance
                    </CardTitle>
                    <CardDescription>Performance across all subjects</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData.subjectPerformance}>
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
          )}
        </div>
      )}

      {/* Student Performance Distribution - Only show if data exists */}
      {performanceData.studentPerformance.length > 0 && (
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleChartClick('students', {})}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-success" />
                  Student Performance Distribution
                </CardTitle>
                <CardDescription>Grade distribution across all students</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Details
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceData.studentPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {performanceData.studentPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} students`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Performance Trends - Only show if data exists */}
      {performanceData.monthlyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-warning" />
              Monthly Performance Trends
            </CardTitle>
            <CardDescription>Performance trends over the academic year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'performance' ? `${value}%` : value,
                      name === 'performance' ? 'Average Performance' : 'Number of Exams'
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
      )}

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
    </div>
  );
};

export default PerformanceDashboard;
