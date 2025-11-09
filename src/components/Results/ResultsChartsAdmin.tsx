import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart3, TrendingUp, Users, BookOpen, GraduationCap, AlertTriangle } from 'lucide-react';
import { teacherDashboardAPI, classManagementAPI, subjectManagementAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
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
  Legend,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7300'];

const ResultsChartsAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [chartData, setChartData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadClassesAndSubjects();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [selectedClass, selectedSubject]);

  const loadClassesAndSubjects = async () => {
    try {
      const [classesResponse, subjectsResponse] = await Promise.all([
        classManagementAPI.getAll().catch(() => ({ classes: [] })),
        subjectManagementAPI.getAll().catch(() => ({ subjects: [] }))
      ]);
      setClasses(classesResponse?.classes || []);
      setSubjects(subjectsResponse?.subjects || []);
    } catch (error) {
      console.error('Error loading classes/subjects:', error);
    }
  };

  const loadChartData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedClass !== 'all') params.classId = selectedClass;
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;

      const response = await teacherDashboardAPI.getPerformanceGraphs(params);
      
      if (response.success && response.data) {
        setChartData(response.data);
      } else {
        setChartData(null);
      }
    } catch (error: any) {
      console.error('Error loading chart data:', error);
      
      // Only show error toast for actual errors, not for "no data" scenarios
      const errorMessage = error?.message || '';
      const isNoDataError = errorMessage.toLowerCase().includes('no data') || 
                           errorMessage.toLowerCase().includes('not found') ||
                           errorMessage.toLowerCase().includes('no results');
      
      if (!isNoDataError) {
        toast({
          title: "Error",
          description: errorMessage || "Failed to load performance analytics",
          variant: "destructive",
        });
      }
      
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  // Transform data for charts
  const subjectChartData = chartData?.subjectPerformance?.map((item: any) => ({
    name: item.subjectName || 'Unknown',
    subjectId: item._id || item.subjectId,
    average: Math.round(item.averagePercentage || 0),
    passRate: item.totalStudents > 0 
      ? Math.round((item.passedStudents / item.totalStudents) * 100) 
      : (item.passPercentage ? Math.round(item.passPercentage) : 0),
    totalExams: item.totalExams || item.totalStudents || 0,
    passedExams: item.passedExams || item.passedStudents || 0,
    passed: item.passedExams || item.passedStudents || 0,
    total: item.totalExams || item.totalStudents || 0
  })) || [];

  // Class-wise performance (if available in response)
  const classChartData = chartData?.classSummary?.map((item: any) => ({
    name: item.className || 'Unknown',
    average: Math.round(item.averagePercentage || 0),
    passed: item.passedStudents || 0,
    total: item.totalStudents || 0,
    passRate: item.totalStudents > 0 
      ? Math.round((item.passedStudents / item.totalStudents) * 100) 
      : 0
  })) || [];

  // Grade distribution
  const gradeDistributionData = chartData?.gradeDistribution 
    ? Object.entries(chartData.gradeDistribution).map(([grade, count]: [string, any]) => ({
        name: grade,
        value: count
      }))
    : [];

  // Failure analysis (from teacher endpoint response)
  const failureAnalysis = chartData?.failureAnalysis || {
    totalStudents: 0,
    failedStudents: 0,
    absentStudents: 0,
    missingSheets: 0,
    failureRate: 0
  };

  // Overview stats (derived from failure analysis if overview not available)
  const overview = chartData?.overview || {
    totalResults: failureAnalysis.totalStudents || 0,
    averagePercentage: 0,
    passedResults: (failureAnalysis.totalStudents || 0) - (failureAnalysis.failedStudents || 0),
    failedResults: failureAnalysis.failedStudents || 0,
    absentResults: failureAnalysis.absentStudents || 0,
    missingSheets: failureAnalysis.missingSheets || 0,
    passPercentage: failureAnalysis.totalStudents > 0 
      ? (((failureAnalysis.totalStudents - failureAnalysis.failedStudents) / failureAnalysis.totalStudents) * 100)
      : 0
  };

  const trends = chartData?.trends || [];

  // Prepare trend data for line chart
  const trendChartData = trends.map((item: any) => ({
    month: item._id?.month || '',
    year: item._id?.year || '',
    label: `${item._id?.month}/${item._id?.year}` || '',
    average: Math.round(item.averagePercentage || 0),
    total: item.totalResults || 0
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 animate-pulse text-muted-foreground" />
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show charts even if some data is 0, but show empty state only if completely no data
  const hasAnyData = chartData && (
    (chartData.subjectPerformance && chartData.subjectPerformance.length > 0) ||
    (chartData.classSummary && chartData.classSummary.length > 0) ||
    (chartData.overview && chartData.overview.totalResults > 0) ||
    (chartData.gradeDistribution && Object.keys(chartData.gradeDistribution).length > 0) ||
    (trendChartData && trendChartData.length > 0)
  );

  if (!chartData || !hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            School Performance Analytics
          </CardTitle>
          <CardDescription>
            No data available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No results data found.</p>
            <p className="text-sm mt-2">Analytics will appear here once exam results are available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter analytics by class and subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.displayName || cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.name} {subject.code && `(${subject.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failureAnalysis.totalStudents || overview.totalResults || 0}</div>
            <p className="text-xs text-muted-foreground">All students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{overview.averagePercentage?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">School-wide average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overview.passPercentage?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">{overview.passedResults || 0} passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Failed Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failureAnalysis.failedStudents || overview.failedResults || 0}</div>
            <p className="text-xs text-muted-foreground">
              {failureAnalysis.totalStudents > 0 
                ? `${Math.round(failureAnalysis.failureRate)}% failure rate`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Performance Chart */}
      {subjectChartData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Subject-wise Performance
            </CardTitle>
            <CardDescription>
              Average percentage and pass rate by subject across all classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={subjectChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#0088FE" name="Average %" />
                <Bar dataKey="passRate" fill="#00C49F" name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Subject-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No subject data available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class-wise Performance Chart */}
      {classChartData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Class-wise Performance
            </CardTitle>
            <CardDescription>
              Average percentage and pass rate by class across all subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={classChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#8884D8" name="Average %" />
                <Bar dataKey="passRate" fill="#82CA9D" name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Class-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No class data available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Distribution */}
      {gradeDistributionData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Grade Distribution
            </CardTitle>
            <CardDescription>
              Distribution of grades across all results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={gradeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gradeDistributionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No grade distribution data available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Trends Over Time */}
      {trendChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Trends
            </CardTitle>
            <CardDescription>
              School performance trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="#8884d8" name="Average %" strokeWidth={2} />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" name="Total Results" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Subject Performance Comparison */}
      {subjectChartData.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Subjects</CardTitle>
              <CardDescription>Subjects with highest average performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subjectChartData
                  .sort((a: any, b: any) => b.average - a.average)
                  .slice(0, 5)
                  .map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{idx + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.totalExams} exams</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{item.average}%</p>
                        <p className="text-xs text-muted-foreground">{item.passRate}% pass</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subject Pass Rates</CardTitle>
              <CardDescription>Pass rate distribution across subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={subjectChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="passRate" fill="#00C49F" name="Pass Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResultsChartsAdmin;

