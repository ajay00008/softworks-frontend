import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ArrowLeft,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '@/services/api';
import { Input } from '@/components/ui/input';

const ClassAverages = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [classAverages, setClassAverages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get dashboard data with class performance statistics
        const dashboardData = await dashboardAPI.getStats();
        console.log('Dashboard data:', dashboardData);
        
        // Get the total number of students from overview
        const totalStudentsInSystem = dashboardData.data?.overview?.totalStudents || 0;
        const classPerformanceData = dashboardData.data?.classPerformance || [];
        
        // Calculate total results across all classes to distribute students proportionally
        const totalResultsAcrossClasses = classPerformanceData.reduce((sum: number, cls: any) => sum + (cls.totalResults || 0), 0);
        
        // Map the real data to the expected format
        const averages = classPerformanceData.map((cls: any) => {
          // Calculate students per class based on proportion of results
          const resultsProportion = totalResultsAcrossClasses > 0 ? (cls.totalResults || 0) / totalResultsAcrossClasses : 0;
          const studentsInClass = Math.round(totalStudentsInSystem * resultsProportion);
          
          // Ensure minimum of 1 student per class if there are results
          const totalStudents = cls.totalResults > 0 ? Math.max(studentsInClass, 1) : 0;
          
          return {
            classId: cls._id,
            className: cls.className,
            totalStudents: totalStudents,
            averagePercentage: Math.round(cls.averagePercentage * 100) / 100,
            passRate: Math.round(cls.passPercentage * 100) / 100,
            excellentStudents: Math.floor((cls.passedResults * 0.3)), // Estimate excellent students
            gradeDistribution: {
              'A+': Math.floor((cls.passedResults * 0.4)),
              'A': Math.floor((cls.passedResults * 0.3)),
              'B+': Math.floor((cls.passedResults * 0.2)),
              'B': Math.floor((cls.passedResults * 0.1)),
              'C': Math.floor((cls.totalResults - cls.passedResults))
            }
          };
        });
        console.log(averages,"averages")
        
        setClassAverages(averages);
        console.log(averages,"averages")
      } catch (error) {
        console.error('Error loading class averages:', error);
        setError('Failed to load class averages data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  // console.log(classAverages,"filteredAverages")

  const filteredAverages = classAverages.filter(cls =>
    cls.className.toLowerCase().includes(searchTerm.toLowerCase())
  );
// console.log(filteredAverages,"filteredAverages")
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Class Averages</h1>
          <p className="text-muted-foreground">Loading class performance data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Class Averages</h1>
          <p className="text-destructive">{error}</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Failed to load class averages data</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/performance')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Class Averages</h1>
          </div>
          <p className="text-muted-foreground">
            Performance overview across all classes
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

            {/* Summary Stats */}
            <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {classAverages.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Classes</div>
            </div>
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">
                {Math.round(classAverages.reduce((sum, cls) => sum + cls.averagePercentage, 0) / classAverages.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Average</div>
            </div>
            <div className="text-center p-4 bg-warning/5 rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {classAverages.reduce((sum, cls) => sum + cls.totalStudents, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {classAverages.reduce((sum, cls) => sum + cls.excellentStudents, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Excellent Students</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Averages Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAverages.map((cls) => (
          <Card key={cls.classId} className="hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{cls.className}</CardTitle>
                  <CardDescription>
                    {cls.totalStudents} students enrolled
                  </CardDescription>
                </div>
                <Badge 
                  variant={cls.averagePercentage >= 80 ? "default" : cls.averagePercentage >= 60 ? "secondary" : "destructive"}
                >
                  {cls.averagePercentage}%
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{cls.averagePercentage}%</div>
                  <div className="text-xs text-muted-foreground">Average</div>
                </div>
                <div className="text-center p-3 bg-success/5 rounded-lg">
                  <div className="text-2xl font-bold text-success">{cls.passRate}%</div>
                  <div className="text-xs text-muted-foreground">Pass Rate</div>
                </div>
              </div>

              {/* Grade Distribution */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Grade Distribution</div>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(cls.gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="text-center">
                      <div className="text-lg font-bold">{count as number}</div>
                      <div className="text-xs text-muted-foreground">{grade}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full" 
                onClick={() => navigate(`/dashboard/performance/class-detail/${cls.classId}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>


    </div>
  );
};

export default ClassAverages;
