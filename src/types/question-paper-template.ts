export interface QuestionPaperTemplate {
  _id: string;
  title: string;
  description?: string;
  subjectId: {
    _id: string;
    code: string;
    name: string;
    shortName: string;
  };
  classId: {
    _id: string;
    name: string;
    displayName: string;
    level: number;
    section: string;
  };
  adminId: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  
  // Template file information
  templateFile: {
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadedAt: string;
    downloadUrl: string;
  };
  
  // Template analysis data
  analysis: TemplateAnalysis;
  
  // AI settings
  aiSettings: {
    useTemplate: boolean;
    followPattern: boolean;
    maintainStructure: boolean;
    customInstructions?: string;
  };
  
  isActive: boolean;
  version: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateAnalysis {
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
}

export interface CreateTemplateRequest {
  title: string;
  description?: string;
  subjectId: string;
  classId: string;
  language?: string;
  templateFile?: File;
}

export interface UpdateTemplateRequest {
  title?: string;
  description?: string;
  aiSettings?: {
    useTemplate?: boolean;
    followPattern?: boolean;
    maintainStructure?: boolean;
    customInstructions?: string;
  };
}
