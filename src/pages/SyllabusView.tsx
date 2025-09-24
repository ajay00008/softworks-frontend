import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  ArrowLeft,
  Edit,
  Download,
  Calendar,
  Users,
  GraduationCap,
  FileText,
  Clock,
  User,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { syllabusAPI } from '@/services/api';

interface Syllabus {
  _id: string;
  title: string;
  description: string;
  subjectId: {
    _id: string;
    name: string;
    code: string;
  };
  classId: {
    _id: string;
    name: string;
    displayName: string;
  };
  academicYear: string;
  units: {
    unitNumber: number;
    unitName: string;
    topics: {
      topicName: string;
      subtopics?: string[];
      learningObjectives?: string[];
      estimatedHours?: number;
    }[];
    totalHours?: number;
  }[];
  totalHours: number;
  version: string;
  language: string;
  fileUrl?: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const SyllabusView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load syllabus data
  useEffect(() => {
    const loadSyllabus = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await syllabusAPI.getById(id);
        setSyllabus(response.syllabus);
      } catch (err) {
        console.error('Error loading syllabus:', err);
        setError(err instanceof Error ? err.message : 'Failed to load syllabus');
        toast({
          title: "Error",
          description: "Failed to load syllabus",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSyllabus();
  }, [id, toast]);

  // Handle download
  const handleDownload = () => {
    if (syllabus?.fileUrl) {
      window.open(syllabus.fileUrl, '_blank');
    } else {
      toast({
        title: "No File",
        description: "No file available for download",
        variant: "destructive"
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading syllabus...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !syllabus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-destructive mb-4">
            <BookOpen className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Syllabus</p>
            <p className="text-muted-foreground">{error || 'Syllabus not found'}</p>
          </div>
          <Button onClick={() => navigate('/dashboard/syllabus')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Syllabi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/syllabus')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Syllabi
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{syllabus.title}</h1>
          </div>
          <p className="text-muted-foreground">
            Syllabus details and content
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/syllabus/edit/${syllabus._id}`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          {syllabus.fileUrl && (
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Title</Label>
              <p className="text-sm">{syllabus.title}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Version</Label>
              <Badge variant="secondary">{syllabus.version}</Badge>
            </div>
          </div>

          {syllabus.description && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
              <p className="text-sm">{syllabus.description}</p>
            </div>
          )}

          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{syllabus.subjectId.name}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Class</Label>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{syllabus.classId.displayName}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Academic Year</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{syllabus.academicYear}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Language</Label>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">{syllabus.language}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Total Hours</Label>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{syllabus.totalHours}h</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Units</Label>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{syllabus.units.length} units</span>
              </div>
            </div>
          </div>

          {syllabus.fileUrl && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">File</Label>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <Button
                  variant="link"
                  onClick={handleDownload}
                  className="p-0 h-auto text-primary"
                >
                  Download File
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Uploaded By</Label>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{syllabus.uploadedBy.name}</span>
              <span className="text-xs text-muted-foreground">
                ({new Date(syllabus.createdAt).toLocaleDateString()})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units */}
      <Card>
        <CardHeader>
          <CardTitle>Units</CardTitle>
          <CardDescription>
            Syllabus units and topics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {syllabus.units.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4" />
              <p>No units available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {syllabus.units.map((unit, unitIndex) => (
                <div key={unitIndex} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Unit {unit.unitNumber}: {unit.unitName}</h4>
                    {unit.totalHours && unit.totalHours > 0 && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {unit.totalHours}h
                      </Badge>
                    )}
                  </div>
                  
                  {unit.topics && unit.topics.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">Topics:</h5>
                      <div className="space-y-1">
                        {unit.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="text-sm">
                            <div className="font-medium">{topic.topicName}</div>
                            {topic.subtopics && topic.subtopics.length > 0 && (
                              <div className="ml-4 text-xs text-muted-foreground">
                                {topic.subtopics.map((subtopic, subIndex) => (
                                  <div key={subIndex}>• {subtopic}</div>
                                ))}
                              </div>
                            )}
                            {topic.learningObjectives && topic.learningObjectives.length > 0 && (
                              <div className="ml-4 text-xs text-muted-foreground">
                                <div className="font-medium">Learning Objectives:</div>
                                {topic.learningObjectives.map((objective, objIndex) => (
                                  <div key={objIndex}>• {objective}</div>
                                ))}
                              </div>
                            )}
                            {topic.estimatedHours && (
                              <div className="ml-4 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {topic.estimatedHours}h
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SyllabusView;
