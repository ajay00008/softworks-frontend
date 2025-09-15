import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Users, 
  GraduationCap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dataMigrationService, MigrationStats, MigrationError } from '@/utils/dataMigration';

const DataMigrationDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [errors, setErrors] = useState<MigrationError[]>([]);
  const [migrationLog, setMigrationLog] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await dataMigrationService.checkBackendConnection();
      setIsConnected(connected);
      
      if (connected) {
        const user = await dataMigrationService.getCurrentUser();
        setCurrentUser(user);
        addToLog(`Connected as: ${user?.name} (${user?.role})`);
      }
    } catch (error) {
      setIsConnected(false);
      addToLog(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMigrationLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const runMigration = async () => {
    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "Please check your connection and login first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setStats(null);
    setErrors([]);
    setMigrationLog([]);
    
    addToLog('Starting data migration...');

    try {
      const result = await dataMigrationService.runMigration();
      setStats(result.stats);
      setErrors(result.errors);
      
      addToLog('Migration completed successfully!');
      
      toast({
        title: "Migration Complete",
        description: `Updated ${result.stats.students.updated} students and ${result.stats.teachers.updated} teachers.`,
      });

    } catch (error) {
      addToLog(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadErrorReport = () => {
    if (errors.length === 0) {
      toast({
        title: "No Errors",
        description: "There are no errors to download.",
      });
      return;
    }

    const errorReport = errors.map(error => ({
      Type: error.type,
      ID: error.id,
      Name: error.name,
      Error: error.error
    }));

    const csv = [
      'Type,ID,Name,Error',
      ...errorReport.map(row => `"${row.Type}","${row.ID}","${row.Name}","${row.Error}"`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `migration-errors-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadMigrationLog = () => {
    const logContent = migrationLog.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `migration-log-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getTotalProgress = () => {
    if (!stats) return 0;
    const total = stats.students.total + stats.teachers.total;
    const completed = stats.students.updated + stats.students.skipped + stats.teachers.updated + stats.teachers.skipped;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Data Migration Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Update existing teachers and students according to the new data flow
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5" />
            <span>Connection Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {isConnected === null ? (
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                ) : isConnected ? (
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                ) : (
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                )}
                <span className="font-medium">
                  {isConnected === null ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {currentUser && (
                <p className="text-sm text-muted-foreground">
                  Logged in as: {currentUser.name} ({currentUser.role})
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkConnection}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Migration Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Controls</CardTitle>
          <CardDescription>
            Run data migration to update existing records according to the new flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={runMigration}
              disabled={!isConnected || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Migration...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Run Migration
                </>
              )}
            </Button>
            
            {errors.length > 0 && (
              <Button 
                variant="outline" 
                onClick={downloadErrorReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Error Report
              </Button>
            )}
            
            {migrationLog.length > 0 && (
              <Button 
                variant="outline" 
                onClick={downloadMigrationLog}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Log
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Migration Progress</span>
                <span>{Math.round(getTotalProgress())}%</span>
              </div>
              <Progress value={getTotalProgress()} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Migration Results */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Students Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>Students</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{stats.students.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{stats.students.updated}</div>
                  <div className="text-sm text-muted-foreground">Updated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{stats.students.skipped}</div>
                  <div className="text-sm text-muted-foreground">Skipped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{stats.students.errors}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teachers Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-green-500" />
                <span>Teachers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{stats.teachers.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{stats.teachers.updated}</div>
                  <div className="text-sm text-muted-foreground">Updated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{stats.teachers.skipped}</div>
                  <div className="text-sm text-muted-foreground">Skipped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{stats.teachers.errors}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span>Migration Errors ({errors.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{error.type === 'student' ? 'Student' : 'Teacher'}:</strong> {error.name} ({error.id})
                    <br />
                    <span className="text-sm">{error.error}</span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Migration Log */}
      {migrationLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {migrationLog.join('\n')}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataMigrationDashboard;
