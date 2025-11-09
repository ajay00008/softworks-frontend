import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart3, TrendingUp, Users, BookOpen, AlertTriangle } from 'lucide-react';
import { teacherDashboardAPI } from '@/services/api';
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
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ResultsChartsStaff = () => {
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [chartData, setChartData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadChartData();
  }, [selectedClass, selectedSubject]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedClass !== 'all') params.classId = selectedClass;
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;

      console.log('[CHARTS] Loading performance graphs with params:', params);
      const response = await teacherDashboardAPI.getPerformanceGraphs(params);
      
      console.log('[CHARTS] API Response:', response);
      
      if (response.success && response.data) {
        console.log('[CHARTS] Chart data received:', {
          subjectPerformance: response.data.subjectPerformance?.length || 0,
          classSummary: response.data.classSummary?.length || 0,
          failureAnalysis: response.data.failureAnalysis,
          gradeDistribution: Object.keys(response.data.gradeDistribution || {}).length
        });
        setChartData(response.data);
      } else {
        console.log('[CHARTS] No data received or response not successful');
        setChartData(null);
      }
    } catch (error: any) {
      console.error('[CHARTS] Error loading chart data:', error);
      
      // Only show error toast for actual errors, not for "no data" scenarios
      const errorMessage = error?.message || '';
      const isNoDataError = errorMessage.toLowerCase().includes('no data') || 
                           errorMessage.toLowerCase().includes('not found') ||
                           errorMessage.toLowerCase().includes('no results');
      
      if (!isNoDataError) {
        toast({
          title: "Error",
          description: errorMessage || "Failed to load performance charts",
          variant: "destructive",
        });
      } else {
        // Silently handle "no data" scenarios
        console.log('[CHARTS] No data available, showing empty state');
      }
      
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  // Transform data for charts
  const subjectChartData = chartData?.subjectPerformance?.map((item: any) => ({
    name: item.subjectName || 'Unknown',
    average: Math.round(item.averagePercentage || 0),
    passed: item.passedStudents || 0,
    total: item.totalStudents || 0,
    passRate: item.totalStudents > 0 
      ? Math.round((item.passedStudents / item.totalStudents) * 100) 
      : 0
  })) || [];

  const classChartData = chartData?.classSummary?.map((item: any) => ({
    name: item.className || 'Unknown',
    average: Math.round(item.averagePercentage || 0),
    passed: item.passedStudents || 0,
    total: item.totalStudents || 0,
    passRate: item.totalStudents > 0 
      ? Math.round((item.passedStudents / item.totalStudents) * 100) 
      : 0
  })) || [];

  const gradeDistributionData = chartData?.gradeDistribution 
    ? Object.entries(chartData.gradeDistribution).map(([grade, count]: [string, any]) => ({
        name: grade,
        value: count
      }))
    : [];

  const failureAnalysis = chartData?.failureAnalysis || {
    totalStudents: 0,
    failedStudents: 0,
    absentStudents: 0,
    missingSheets: 0,
    failureRate: 0
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 animate-pulse text-muted-foreground" />
              <p className="text-muted-foreground">Loading charts...</p>
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
    (chartData.failureAnalysis && chartData.failureAnalysis.totalStudents > 0) ||
    (chartData.gradeDistribution && Object.keys(chartData.gradeDistribution).length > 0)
  );

  if (!chartData || !hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Performance Analytics
          </CardTitle>
          <CardDescription>
            No data available for your assigned classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No results data found for your assigned classes and subjects.</p>
            <p className="text-sm mt-2">Results will appear here once exams are completed and results are published.</p>
            <p className="text-xs mt-2 text-muted-foreground">
              Debug: {chartData ? 'Data exists but empty' : 'No data response'}
            </p>
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
          <CardDescription>Filter results by class and subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classChartData.map((item: any, idx: number) => (
                    <SelectItem key={idx} value={item.classId || idx.toString()}>
                      {item.name}
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
                  {subjectChartData.map((item: any, idx: number) => (
                    <SelectItem key={idx} value={item.subjectId || idx.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failure Analysis Summary */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failureAnalysis.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Failed Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failureAnalysis.failedStudents}</div>
            <p className="text-xs text-muted-foreground">
              {failureAnalysis.totalStudents > 0 
                ? `${Math.round(failureAnalysis.failureRate)}% failure rate`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Absent Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{failureAnalysis.absentStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Missing Sheets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{failureAnalysis.missingSheets}</div>
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
              Average percentage and pass rate by subject
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
              <Users className="w-5 h-5 mr-2" />
              Class-wise Performance
            </CardTitle>
            <CardDescription>
              Average percentage and pass rate by class
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
              <Users className="w-5 h-5 mr-2" />
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
    </div>
  );
};

export default ResultsChartsStaff;

