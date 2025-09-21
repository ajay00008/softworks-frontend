import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, TrendingUp, TrendingDown } from 'lucide-react';

interface GradeBucket {
  range: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  bgColor: string;
  isPass: boolean;
  isFail: boolean;
}

// Mock data - replace with actual data from API
const mockGradeData: GradeBucket[] = [
  { range: '100%', label: 'Perfect Score', count: 12, percentage: 1.2, color: 'text-green-800', bgColor: 'bg-green-100', isPass: true, isFail: false },
  { range: '95-100', label: 'Excellent', count: 45, percentage: 4.5, color: 'text-green-700', bgColor: 'bg-green-50', isPass: true, isFail: false },
  { range: '90-95', label: 'Very Good', count: 78, percentage: 7.8, color: 'text-green-600', bgColor: 'bg-green-50', isPass: true, isFail: false },
  { range: '80-90', label: 'Good', count: 156, percentage: 15.6, color: 'text-blue-600', bgColor: 'bg-blue-50', isPass: true, isFail: false },
  { range: '70-80', label: 'Satisfactory', count: 234, percentage: 23.4, color: 'text-blue-500', bgColor: 'bg-blue-50', isPass: true, isFail: false },
  { range: '60-70', label: 'Average', count: 198, percentage: 19.8, color: 'text-orange-600', bgColor: 'bg-orange-50', isPass: true, isFail: false },
  { range: '50-60', label: 'Below Average', count: 145, percentage: 14.5, color: 'text-orange-700', bgColor: 'bg-orange-100', isPass: true, isFail: false },
  { range: '<50', label: 'Fail', count: 132, percentage: 13.2, color: 'text-red-800', bgColor: 'bg-red-100', isPass: false, isFail: true }
];

const GradeBuckets: React.FC = () => {
  const totalStudents = mockGradeData.reduce((sum, bucket) => sum + bucket.count, 0);
  const passCount = mockGradeData.filter(bucket => bucket.isPass).reduce((sum, bucket) => sum + bucket.count, 0);
  const failCount = mockGradeData.filter(bucket => bucket.isFail).reduce((sum, bucket) => sum + bucket.count, 0);
  const passRate = ((passCount / totalStudents) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Pass Rate</p>
                <p className="text-2xl font-bold text-green-900">{passRate}%</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Students</p>
                <p className="text-2xl font-bold text-blue-900">{totalStudents.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Failed Students</p>
                <p className="text-2xl font-bold text-red-900">{failCount}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Grade Distribution
          </CardTitle>
          <CardDescription>
            Performance distribution across grade buckets with color-coded highlights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockGradeData.map((bucket, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${bucket.bgColor.replace('bg-', 'bg-').replace('-50', '-500').replace('-100', '-600')}`}></div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{bucket.range}</span>
                        <span className="text-sm text-muted-foreground">({bucket.label})</span>
                        {bucket.isFail && (
                          <Badge variant="destructive" className="text-xs">
                            FAIL
                          </Badge>
                        )}
                        {bucket.isPass && bucket.range === '50-60' && (
                          <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
                            LOW PASS
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold">{bucket.count} students</div>
                      <div className="text-sm text-muted-foreground">{bucket.percentage}%</div>
                    </div>
                    <div className="w-32">
                      <Progress 
                        value={bucket.percentage} 
                        className="h-2"
                        // Apply color based on grade bucket
                        style={{
                          backgroundColor: bucket.isFail ? '#fef2f2' : bucket.range === '50-60' ? '#fff7ed' : '#f0f9ff'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            Key insights from the grade distribution analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-800">Strengths</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{passRate}% pass rate indicates good overall performance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>13.5% of students achieved 90%+ (excellent range)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>39% of students scored 80%+ (good performance)</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-red-800">Areas for Improvement</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>13.2% failure rate needs attention</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>14.5% scored 50-60% (low pass range)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>27.7% scored below 70% (needs improvement)</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>
            Suggested interventions based on grade distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <h5 className="font-semibold text-red-800 mb-2">Immediate Attention</h5>
              <p className="text-sm text-red-700">
                Focus on the 13.2% of students who failed. Consider remedial classes and individual support.
              </p>
            </div>
            
            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <h5 className="font-semibold text-orange-800 mb-2">Support Needed</h5>
              <p className="text-sm text-orange-700">
                Provide additional support to the 14.5% in the 50-60% range to improve their performance.
              </p>
            </div>
            
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <h5 className="font-semibold text-green-800 mb-2">Maintain Excellence</h5>
              <p className="text-sm text-green-700">
                Continue supporting the 13.5% high achievers and encourage peer mentoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeBuckets;