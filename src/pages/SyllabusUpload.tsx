import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Upload, 
  Plus, 
  Trash2, 
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Users,
  GraduationCap,
  Save,
  Eye,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { classesAPI, subjectsAPI, syllabusAPI } from '@/services/api';
import FileUpload from '@/components/FileUpload';

// Types
interface Unit {
  unitNumber: number;
  unitName: string;
  topics: Topic[];
  totalHours: number;
}

interface Topic {
  topicName: string;
  subtopics: string[];
  learningObjectives: string[];
  estimatedHours: number;
}

interface SyllabusFormData {
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  academicYear: string;
  units: Unit[];
  totalHours: number;
  fileUrl: string;
  version: string;
  language: string;
}

const SyllabusUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<SyllabusFormData>({
    title: '',
    description: '',
    subjectId: '',
    classId: '',
    academicYear: new Date().getFullYear().toString(),
    units: [],
    totalHours: 0,
    fileUrl: '',
    version: '1.0',
    language: 'ENGLISH'
  });

  // Academic years (current year ± 2)
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [classesResponse, subjectsResponse] = await Promise.all([
          classesAPI.getAll(),
          subjectsAPI.getAll(10) // Use level 10 which we just added subjects for
        ]);
        
        setClasses(classesResponse.data || []);
        setSubjects(subjectsResponse.data || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        toast({
          title: "Error",
          description: "Failed to load classes and subjects",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Handle form input changes
  const handleInputChange = (field: keyof SyllabusFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new unit
  const addUnit = () => {
    const newUnit: Unit = {
      unitNumber: formData.units.length + 1,
      unitName: '',
      topics: [],
      totalHours: 0
    };
    
    setFormData(prev => ({
      ...prev,
      units: [...prev.units, newUnit]
    }));
  };

  // Update unit
  const updateUnit = (index: number, field: keyof Unit, value: any) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === index ? { ...unit, [field]: value } : unit
      )
    }));
  };

  // Remove unit
  const removeUnit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.filter((_, i) => i !== index)
    }));
  };

  // Add topic to unit
  const addTopic = (unitIndex: number) => {
    const newTopic: Topic = {
      topicName: '',
      subtopics: [],
      learningObjectives: [],
      estimatedHours: 0
    };
    
    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === unitIndex 
          ? { ...unit, topics: [...unit.topics, newTopic] }
          : unit
      )
    }));
  };

  // Update topic
  const updateTopic = (unitIndex: number, topicIndex: number, field: keyof Topic, value: any) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === unitIndex 
          ? {
              ...unit,
              topics: unit.topics.map((topic, j) => 
                j === topicIndex ? { ...topic, [field]: value } : topic
              )
            }
          : unit
      )
    }));
  };

  // Remove topic
  const removeTopic = (unitIndex: number, topicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === unitIndex 
          ? { ...unit, topics: unit.topics.filter((_, j) => j !== topicIndex) }
          : unit
      )
    }));
  };

  // Add subtopic
  const addSubtopic = (unitIndex: number, topicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === unitIndex 
          ? {
              ...unit,
              topics: unit.topics.map((topic, j) => 
                j === topicIndex 
                  ? { ...topic, subtopics: [...topic.subtopics, ''] }
                  : topic
              )
            }
          : unit
      )
    }));
  };

  // Update subtopic
  const updateSubtopic = (unitIndex: number, topicIndex: number, subtopicIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === unitIndex 
          ? {
              ...unit,
              topics: unit.topics.map((topic, j) => 
                j === topicIndex 
                  ? {
                      ...topic,
                      subtopics: topic.subtopics.map((subtopic, k) => 
                        k === subtopicIndex ? value : subtopic
                      )
                    }
                  : topic
              )
            }
          : unit
      )
    }));
  };

  // Remove subtopic
  const removeSubtopic = (unitIndex: number, topicIndex: number, subtopicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === unitIndex 
          ? {
              ...unit,
              topics: unit.topics.map((topic, j) => 
                j === topicIndex 
                  ? { ...topic, subtopics: topic.subtopics.filter((_, k) => k !== subtopicIndex) }
                  : topic
              )
            }
          : unit
      )
    }));
  };

  // Add learning objective
  const addLearningObjective = (unitIndex: number, topicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === unitIndex 
          ? {
              ...unit,
              topics: unit.topics.map((topic, j) => 
                j === topicIndex 
                  ? { ...topic, learningObjectives: [...topic.learningObjectives, ''] }
                  : topic
              )
            }
          : unit
      )
    }));
  };

  // Update learning objective
  const updateLearningObjective = (unitIndex: number, topicIndex: number, objectiveIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === unitIndex 
          ? {
              ...unit,
              topics: unit.topics.map((topic, j) => 
                j === topicIndex 
                  ? {
                      ...topic,
                      learningObjectives: topic.learningObjectives.map((objective, k) => 
                        k === objectiveIndex ? value : objective
                      )
                    }
                  : topic
              )
            }
          : unit
      )
    }));
  };

  // Remove learning objective
  const removeLearningObjective = (unitIndex: number, topicIndex: number, objectiveIndex: number) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === unitIndex 
          ? {
              ...unit,
              topics: unit.topics.map((topic, j) => 
                j === topicIndex 
                  ? { ...topic, learningObjectives: topic.learningObjectives.filter((_, k) => k !== objectiveIndex) }
                  : topic
              )
            }
          : unit
      )
    }));
  };

  // Calculate total hours
  const calculateTotalHours = () => {
    const total = formData.units.reduce((sum, unit) => sum + unit.totalHours, 0);
    setFormData(prev => ({ ...prev, totalHours: total }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subjectId || !formData.classId || formData.units.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one unit",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Calculate total hours before submission
      calculateTotalHours();
      
      // Call the syllabus API
      const response = await syllabusAPI.create(formData);
      
      toast({
        title: "Success",
        description: "Syllabus created successfully!",
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subjectId: '',
        classId: '',
        academicYear: new Date().getFullYear().toString(),
        units: [],
        totalHours: 0,
        fileUrl: '',
        version: '1.0',
        language: 'ENGLISH'
      });
      
    } catch (err) {
      console.error('Error creating syllabus:', err);
      toast({
        title: "Error",
        description: "Failed to create syllabus",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading syllabus form...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-destructive mb-4">
            <BookOpen className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Form</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Try Again
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
              onClick={() => navigate('/dashboard')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Syllabus Upload</h1>
          </div>
          <p className="text-muted-foreground">
            Create and upload syllabus for subjects and classes
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/syllabus')}>
            <Eye className="w-4 h-4 mr-2" />
            View Syllabi
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter the basic details for the syllabus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Syllabus Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter syllabus title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Select
                  value={formData.academicYear}
                  onValueChange={(value) => handleInputChange('academicYear', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
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

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter syllabus description"
                rows={3}
              />
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) => handleInputChange('subjectId', value)}
                >
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
                <Label htmlFor="class">Class *</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) => handleInputChange('classId', value)}
                >
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
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => handleInputChange('language', value)}
                >
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
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  placeholder="1.0"
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <Label>Upload Syllabus File (Optional)</Label>
              <FileUpload
                onFileUrlChange={(url) => handleInputChange('fileUrl', url)}
                acceptedTypes=".pdf,.doc,.docx,.txt"
                maxSize={10}
              />
            </div>
          </CardContent>
        </Card>

        {/* Units Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Syllabus Units
                </CardTitle>
                <CardDescription>
                  Define the units and topics for the syllabus
                </CardDescription>
              </div>
              <Button type="button" onClick={addUnit} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.units.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No units added yet. Click "Add Unit" to get started.</p>
              </div>
            ) : (
              formData.units.map((unit, unitIndex) => (
                <Card key={unitIndex} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Unit {unit.unitNumber}</Badge>
                        <Input
                          value={unit.unitName}
                          onChange={(e) => updateUnit(unitIndex, 'unitName', e.target.value)}
                          placeholder="Unit name"
                          className="font-medium"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={unit.totalHours}
                            onChange={(e) => updateUnit(unitIndex, 'totalHours', parseInt(e.target.value) || 0)}
                            placeholder="Hours"
                            className="w-20"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => addTopic(unitIndex)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Topic
                        </Button>
                        <Button
                          type="button"
                          onClick={() => removeUnit(unitIndex)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {unit.topics.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>No topics added yet. Click "Add Topic" to get started.</p>
                      </div>
                    ) : (
                      unit.topics.map((topic, topicIndex) => (
                        <Card key={topicIndex} className="bg-muted/50">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <Input
                                value={topic.topicName}
                                onChange={(e) => updateTopic(unitIndex, topicIndex, 'topicName', e.target.value)}
                                placeholder="Topic name"
                                className="font-medium"
                              />
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    value={topic.estimatedHours}
                                    onChange={(e) => updateTopic(unitIndex, topicIndex, 'estimatedHours', parseInt(e.target.value) || 0)}
                                    placeholder="Hours"
                                    className="w-20"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => removeTopic(unitIndex, topicIndex)}
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Subtopics */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Subtopics</Label>
                                <Button
                                  type="button"
                                  onClick={() => addSubtopic(unitIndex, topicIndex)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </Button>
                              </div>
                              {topic.subtopics.map((subtopic, subtopicIndex) => (
                                <div key={subtopicIndex} className="flex items-center space-x-2">
                                  <Input
                                    value={subtopic}
                                    onChange={(e) => updateSubtopic(unitIndex, topicIndex, subtopicIndex, e.target.value)}
                                    placeholder="Subtopic"
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => removeSubtopic(unitIndex, topicIndex, subtopicIndex)}
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>

                            {/* Learning Objectives */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Learning Objectives</Label>
                                <Button
                                  type="button"
                                  onClick={() => addLearningObjective(unitIndex, topicIndex)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </Button>
                              </div>
                              {topic.learningObjectives.map((objective, objectiveIndex) => (
                                <div key={objectiveIndex} className="flex items-center space-x-2">
                                  <Input
                                    value={objective}
                                    onChange={(e) => updateLearningObjective(unitIndex, topicIndex, objectiveIndex, e.target.value)}
                                    placeholder="Learning objective"
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => removeLearningObjective(unitIndex, topicIndex, objectiveIndex)}
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Total Units: {formData.units.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Total Hours: {formData.totalHours}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Academic Year: {formData.academicYear}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || formData.units.length === 0}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Syllabus
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SyllabusUpload;
