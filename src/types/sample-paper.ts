export interface SamplePaper {
  _id: string;
  title: string;
  description?: string;
  subjectId: {
    _id: string;
    code: string;
    name: string;
    shortName: string;
  };
  adminId: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  
  // Sample paper file information
  sampleFile: {
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadedAt: string;
    downloadUrl: string;
  };
  
  // Sample paper analysis data
  analysis: SamplePaperAnalysis;
  
  // Template settings
  templateSettings: {
    useAsTemplate: boolean;
    followDesign: boolean;
    maintainStructure: boolean;
    customInstructions?: string;
  };
  
  isActive: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface SamplePaperAnalysis {
  totalQuestions: number;
  questionTypes: string[];
  markDistribution: {
    oneMark: number;
    twoMark: number;
    threeMark: number;
    fiveMark: number;
    totalMarks: number;
  };
  difficultyLevels: string[];
  bloomsDistribution: {
    remember: number;
    understand: number;
    apply: number;
    analyze: number;
    evaluate: number;
    create: number;
  };
  timeDistribution: {
    totalTime: number;
    perQuestion: number;
  };
  sections: Array<{
    name: string;
    questions: number;
    marks: number;
  }>;
  designPattern: {
    layout: string;
    formatting: string;
    questionNumbering: string;
    sectionHeaders: string[];
  };
}

export interface CreateSamplePaperRequest {
  title: string;
  description?: string;
  subjectId: string;
  sampleFile?: File;
}

export interface UpdateSamplePaperRequest {
  title?: string;
  description?: string;
  templateSettings?: {
    useAsTemplate?: boolean;
    followDesign?: boolean;
    maintainStructure?: boolean;
    customInstructions?: string;
  };
}
