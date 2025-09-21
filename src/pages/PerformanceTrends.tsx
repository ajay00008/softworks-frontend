import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  ArrowLeft,
  Download,
  Filter,
  Target,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { performanceAPI } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const PerformanceTrends = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [trends, setTrends] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Mock data for performance trends
        const mockTrends = {
          monthly: [
            { month: 'Jan', average: 75, students: 120, exams: 15 },
            { month: 'Feb', average: 78, students: 125, exams: 18 },
            { month: 'Mar', average: 82, students: 130, exams: 20 },
            { month: 'Apr', average: 79, students: 128, exams: 16 },
            { month: 'May', average: 85, students: 135, exams: 22 },
            { month: 'Jun', average: 88, students: 140, exams: 25 }
          ],
          quarterly: [
            { quarter: 'Q1 2024', average: 78, students: 125, exams: 53 },
            { quarter: 'Q2 2024', average: 84, students: 135, exams: 63 },
            { quarter: 'Q3 2024', average: 87, students: 142, exams: 71 },
            { quarter: 'Q4 2024', average: 90, students: 148, exams: 78 }
          ],
          yearly: [
            { year: '2021', average: 72, students: 110, exams: 180 },
            { year: '2022', average: 76, students: 115, exams: 195 },
            { year: '2023', average: 81, students: 125, exams: 210 },
            { year: '2024', average: 85, students: 135, exams: 225 }
          ],
          classTrends: [
            { class: '11A', trend: 'up', change: 5.2, current: 88 },
            { class: '11B', trend: 'up', change: 3.8, current: 82 },
            { class: '11C', trend: 'down', change: -1.5, current: 75 },
            { class: '12A', trend: 'up', change: 7.1, current: 91 },
            { class: '12B', trend: 'up', change: 2.3, current: 79 }
          ],
          subjectTrends: [
            { subject: 'Mathematics', trend: 'up', change: 4.5, current: 85 },
            { subject: 'Physics', trend: 'up', change: 3.2, current: 82 },
            { subject: 'Chemistry', trend: 'down', change: -2.1, current: 78 },
            { subject: 'English', trend: 'up', change: 6.8, current: 89 }
          ]
        };
        
        setTrends(mockTrends);
      } catch (error) {
        console.error('Error loading trends:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getCurrentData = () => {
    if (!trends) return [];
    return trends[selectedPeriod] || [];
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→';
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Performance Trends</h1>
          <p className="text-muted-foreground">Loading performance trends data...</p>
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
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Performance Trends</h1>
          </div>
          <p className="text-muted-foreground">
            Track performance changes over time
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Export Trends
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Time Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="11A">Class 11A</SelectItem>
                  <SelectItem value="11B">Class 11B</SelectItem>
                  <SelectItem value="11C">Class 11C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Performance Over Time
          </CardTitle>
          <CardDescription>
            Average performance trends for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              average: {
                label: "Average %",
              },
              students: {
                label: "Students",
              },
              exams: {
                label: "Exams",
              },
            }}
            className="h-[400px]"
          >
            <LineChart data={getCurrentData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={selectedPeriod === 'monthly' ? 'month' : selectedPeriod === 'quarterly' ? 'quarter' : 'year'} 
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#8884d8" 
                strokeWidth={3}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Class Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Class Performance Trends
          </CardTitle>
          <CardDescription>
            Current performance and trend changes by class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trends?.classTrends.map((classTrend) => (
              <Card key={classTrend.class} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{classTrend.class}</h3>
                    <Badge variant="outline">{classTrend.current}%</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getTrendIcon(classTrend.trend)}</span>
                    <span className={`font-medium ${getTrendColor(classTrend.trend)}`}>
                      {classTrend.change > 0 ? '+' : ''}{classTrend.change}%
                    </span>
                    <span className="text-sm text-muted-foreground">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Subject Performance Trends
          </CardTitle>
          <CardDescription>
            Performance trends by subject area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {trends?.subjectTrends.map((subjectTrend) => (
              <Card key={subjectTrend.subject} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{subjectTrend.subject}</h3>
                    <Badge variant="outline">{subjectTrend.current}%</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getTrendIcon(subjectTrend.trend)}</span>
                    <span className={`font-medium text-sm ${getTrendColor(subjectTrend.trend)}`}>
                      {subjectTrend.change > 0 ? '+' : ''}{subjectTrend.change}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {getCurrentData().length}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedPeriod === 'monthly' ? 'Months' : selectedPeriod === 'quarterly' ? 'Quarters' : 'Years'} Tracked
              </div>
            </div>
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">
                {getCurrentData().length > 0 ? getCurrentData()[getCurrentData().length - 1].average : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Current Average</div>
            </div>
            <div className="text-center p-4 bg-warning/5 rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {getCurrentData().length > 1 ? 
                  (getCurrentData()[getCurrentData().length - 1].average - getCurrentData()[0].average).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Change</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {trends?.classTrends.filter(ct => ct.trend === 'up').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Classes Improving</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceTrends;
