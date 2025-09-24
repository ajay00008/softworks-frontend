import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { syllabusAPI, classesAPI, subjectsAPI } from '@/services/api';

interface Syllabus {
  _id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
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
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Class {
  classId: string;
  className: string;
}

const SyllabusEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Academic years
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const [syllabusResponse, subjectsResponse, classesResponse] = await Promise.all([
          syllabusAPI.getById(id),
          subjectsAPI.getAll(100),
          classesAPI.getAll()
        ]);
        
        setSyllabus(syllabusResponse.syllabus);
        setSubjects(subjectsResponse || []);
        setClasses(classesResponse.data || []);
      } catch (err) {
        console.error('Error loading data:', err);
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

    loadData();
  }, [id, toast]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabus || !id) return;

    try {
      setIsSaving(true);
      await syllabusAPI.update(id, syllabus);
      toast({
        title: "Success",
        description: "Syllabus updated successfully",
      });
      navigate('/dashboard/syllabus');
    } catch (err) {
      console.error('Error updating syllabus:', err);
      toast({
        title: "Error",
        description: "Failed to update syllabus",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    if (!syllabus) return;
    setSyllabus(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Handle unit changes
  const handleUnitChange = (unitIndex: number, field: string, value: any) => {
    if (!syllabus) return;
    const updatedUnits = [...syllabus.units];
    updatedUnits[unitIndex] = { ...updatedUnits[unitIndex], [field]: value };
    setSyllabus(prev => prev ? { ...prev, units: updatedUnits } : null);
  };

  // Add new unit
  const addUnit = () => {
    if (!syllabus) return;
    const newUnit = {
      unitNumber: syllabus.units.length + 1,
      unitName: '',
      topics: [],
      totalHours: 0
    };
    setSyllabus(prev => prev ? { ...prev, units: [...prev.units, newUnit] } : null);
  };

  // Remove unit
  const removeUnit = (unitIndex: number) => {
    if (!syllabus) return;
    const updatedUnits = syllabus.units.filter((_, index) => index !== unitIndex);
    setSyllabus(prev => prev ? { ...prev, units: updatedUnits } : null);
  };

  // Calculate total hours
  const calculateTotalHours = () => {
    if (!syllabus) return 0;
    return syllabus.units.reduce((total, unit) => total + (unit.totalHours || 0), 0);
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Edit Syllabus</h1>
          </div>
          <p className="text-muted-foreground">
            Update syllabus information and content
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update the basic details of the syllabus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={syllabus.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter syllabus title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={syllabus.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  placeholder="1.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={syllabus.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter syllabus description"
                rows={3}
              />
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={syllabus.subjectId} onValueChange={(value) => handleInputChange('subjectId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select value={syllabus.classId} onValueChange={(value) => handleInputChange('classId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.classId} value={cls.classId}>
                        {cls.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select value={syllabus.academicYear} onValueChange={(value) => handleInputChange('academicYear', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year} - {parseInt(year) + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={syllabus.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENGLISH">English</SelectItem>
                    <SelectItem value="TAMIL">Tamil</SelectItem>
                    <SelectItem value="HINDI">Hindi</SelectItem>
                    <SelectItem value="MALAYALAM">Malayalam</SelectItem>
                    <SelectItem value="TELUGU">Telugu</SelectItem>
                    <SelectItem value="KANNADA">Kannada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalHours">Total Hours</Label>
                <Input
                  id="totalHours"
                  type="number"
                  value={syllabus.totalHours}
                  onChange={(e) => handleInputChange('totalHours', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Units */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Units</CardTitle>
                <CardDescription>
                  Manage syllabus units and topics
                </CardDescription>
              </div>
              <Button type="button" onClick={addUnit} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {syllabus.units.map((unit, unitIndex) => (
              <div key={unitIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Unit {unit.unitNumber}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeUnit(unitIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`unitName-${unitIndex}`}>Unit Name</Label>
                    <Input
                      id={`unitName-${unitIndex}`}
                      value={unit.unitName}
                      onChange={(e) => handleUnitChange(unitIndex, 'unitName', e.target.value)}
                      placeholder="Enter unit name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`unitHours-${unitIndex}`}>Total Hours</Label>
                    <Input
                      id={`unitHours-${unitIndex}`}
                      type="number"
                      value={unit.totalHours || 0}
                      onChange={(e) => handleUnitChange(unitIndex, 'totalHours', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {syllabus.units.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4" />
                <p>No units added yet. Click "Add Unit" to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/syllabus')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SyllabusEdit;

