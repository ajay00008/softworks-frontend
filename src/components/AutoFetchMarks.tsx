import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Wand2, 
  CheckCircle, 
  AlertCircle, 
  Star,
  Download,
  Eye
} from 'lucide-react';
import { questionPaperTemplateAPI } from '@/services/api';

interface AutoFetchMarksProps {
  subjectId: string;
  examType: string;
  onMarksFetched: (markDistribution: any, bloomsDistribution: any, customMarks?: Array<{mark: number, count: number}>) => void;
  onClose: () => void;
}

interface TemplateForAutoFetch {
  _id: string;
  title: string;
  confidence: number;
  markDistribution: {
    oneMark: number;
    twoMark: number;
    threeMark: number;
    fiveMark: number;
    totalMarks: number;
  };
  totalQuestions: number;
  questionTypes: string[];
  sections?: Array<{
    name: string;
    questions: number;
    marks: number;
  }>;
  bloomsDistribution?: Array<{
    level: string;
    percentage: number;
  }>;
}

export default function AutoFetchMarks({
  subjectId,
  examType,
  onMarksFetched,
  onClose
}: AutoFetchMarksProps) {
  const [templates, setTemplates] = useState<TemplateForAutoFetch[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, [subjectId, examType]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const templatesData = await questionPaperTemplateAPI.getTemplatesForAutoFetch(
        subjectId,
        examType
      );
      setTemplates(templatesData);
      
      // Auto-select first template if available
      if (templatesData.length > 0) {
        setSelectedTemplate(templatesData[0]._id);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates for auto-fetch",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchMarks = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsFetching(true);
      const template = templates.find(t => t._id === selectedTemplate);
      
      if (!template) {
        toast({
          title: "Error",
          description: "Selected template not found",
          variant: "destructive",
        });
        return;
      }

      // Extract mark distribution from template
      // Use markDistribution as primary source since it has the complete data
      // Sections might not include all sections, so we prioritize markDistribution
      let markDistribution: any = {
        oneMark: template.markDistribution?.oneMark || 0,
        twoMark: template.markDistribution?.twoMark || 0,
        threeMark: template.markDistribution?.threeMark || 0,
        fiveMark: template.markDistribution?.fiveMark || 0,
        totalMarks: template.markDistribution?.totalMarks || 0
      };
      
      const customMarks: Array<{mark: number, count: number}> = [];
      
      // Extract custom marks from sections (marks that aren't 1, 2, 3, or 5)
      // This supplements the markDistribution data
      if (template.sections && template.sections.length > 0) {
        template.sections.forEach((section: any) => {
          if (section.questions > 0 && section.marks > 0) {
            const markPerQuestion = section.marks / section.questions;
            
            // Only track custom marks from sections (non-standard marks)
            if (markPerQuestion !== 1 && markPerQuestion !== 2 && markPerQuestion !== 3 && markPerQuestion !== 5) {
              customMarks.push({
                mark: markPerQuestion,
                count: section.questions
              });
            }
          }
        });
      }

      // Don't auto-fetch blooms distribution - let admin set it manually
      // Pass undefined for blooms distribution to keep existing values
      onMarksFetched(markDistribution, undefined, customMarks.length > 0 ? customMarks : undefined);
      
      toast({
        title: "Success",
        description: `Marks fetched from template "${template.title}"${customMarks.length > 0 ? ` with ${customMarks.length} custom mark type(s)` : ''}`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error fetching marks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch marks from template",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-800";
    if (confidence >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5" />
            <span>Auto-Fetch Marks</span>
          </CardTitle>
          <CardDescription>
            {isLoading ? "Loading and scanning templates with AI..." : "Loading available templates..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">
              {isLoading ? "AI is scanning templates, please wait..." : "Loading templates..."}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5" />
            <span>Auto-Fetch Marks</span>
          </CardTitle>
          <CardDescription>
            No validated templates found for this combination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No templates with AI validation confidence ≥ 70% found for:
            </p>
            <div className="text-sm font-medium space-y-1">
              <p>Subject: {subjectId}</p>
              <p>Exam Type: {examType}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Please upload and validate a template first, or configure marks manually.
            </p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="h-5 w-5" />
          <span>Auto-Fetch Marks</span>
        </CardTitle>
        <CardDescription>
          Select a validated template to automatically fetch mark distribution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="template-select">Select Template</Label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template._id} value={template._id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <span>{template.title}</span>
                    </div>
                    <Badge className={`ml-2 ${getConfidenceBadge(template.confidence)}`}>
                      {template.confidence}%
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTemplate && (
          <div className="border rounded-lg p-4 bg-muted/50">
            {(() => {
              const template = templates.find(t => t._id === selectedTemplate);
              if (!template) return null;
              
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{template.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={getConfidenceBadge(template.confidence)}>
                        {template.confidence}% Confidence
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Mark Distribution:</p>
                      <div className="space-y-1">
                        {template.markDistribution?.oneMark > 0 && (
                          <p>1 Mark: {template.markDistribution.oneMark} questions</p>
                        )}
                        {template.markDistribution?.twoMark > 0 && (
                          <p>2 Mark: {template.markDistribution.twoMark} questions</p>
                        )}
                        {template.markDistribution?.threeMark > 0 && (
                          <p>3 Mark: {template.markDistribution.threeMark} questions</p>
                        )}
                        {template.markDistribution?.fiveMark > 0 && (
                          <p>5 Mark: {template.markDistribution.fiveMark} questions</p>
                        )}
                        {template.sections && template.sections.length > 0 && template.sections.map((section: any, idx: number) => {
                          if (section.questions > 0 && section.marks > 0) {
                            const markPerQuestion = section.marks / section.questions;
                            if (![1, 2, 3, 5].includes(markPerQuestion)) {
                              return (
                                <p key={idx} className="text-blue-600 font-medium">
                                  {markPerQuestion} Mark: {section.questions} questions (Custom)
                                </p>
                              );
                            }
                          }
                          return null;
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Summary:</p>
                      <div className="space-y-1">
                        <p>Total Questions: {template.totalQuestions}</p>
                        <p>Total Marks: {template.markDistribution.totalMarks}</p>
                        <p>Question Types: {template.questionTypes.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleFetchMarks}
            disabled={!selectedTemplate || isFetching}
            className="flex items-center space-x-2"
          >
            <Wand2 className="h-4 w-4" />
            <span>{isFetching ? "Fetching..." : "Fetch Marks"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
