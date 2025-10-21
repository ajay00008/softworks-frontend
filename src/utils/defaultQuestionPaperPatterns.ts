// Default question paper patterns based on CBSE standards
export interface DefaultPattern {
  id: string;
  name: string;
  description: string;
  subject: string;
  class: string;
  totalMarks: number;
  duration: number; // in minutes
  sections: Section[];
  instructions: string[];
  headerInfo?: {
    qpCode: string;
    series: string;
    setNumber: string;
    readingTime: number; // in minutes
    totalPages: number;
  };
}

export interface Section {
  name: string;
  type: 'COMPULSORY' | 'OPTIONAL';
  questions: number;
  marksPerQuestion: number;
  totalMarks: number;
  questionTypes: string[];
  instructions?: string;
}

// CBSE Applied Mathematics Pattern (Class XII) - Based on actual CBSE paper structure
export const CBSE_APPLIED_MATHEMATICS_PATTERN: DefaultPattern = {
  id: 'cbse-applied-math-xii',
  name: 'CBSE Applied Mathematics (Class XII)',
  description: 'Standard CBSE pattern for Applied Mathematics Class XII - Q.P. Code 465',
  subject: 'Applied Mathematics',
  class: 'XII',
  totalMarks: 80,
  duration: 180, // 3 hours
  headerInfo: {
    qpCode: '465',
    series: 'W1XZY',
    setNumber: '4',
    readingTime: 15, // 15 minutes reading time
    totalPages: 23
  },
  instructions: [
    'This question paper contains 38 questions. All questions are compulsory.',
    'This question paper is divided into five Sections – Section A, B, C, D and E.',
    'In Section – A, Questions Number 1 to 18 are Multiple Choice Questions (MCQs) and questions Number 19 & 20 are Assertion-Reason based questions of 1 mark each.',
    'In Section – B, Questions Number 21 to 25 are Very Short Answer (VSA) type questions, carrying 2 marks each.',
    'In Section – C, Questions Number 26 to 31 are Short Answer (SA) type questions, carrying 3 marks each.',
    'In Section – D, Questions Number 32 to 35 are Long Answer (LA) type questions, carrying 5 marks each.',
    'In Section – E, Questions Number 36 to 38 are case study based questions, carrying 4 marks each.',
    'There is no overall choice. However, an internal choice has been provided in 2 questions in Section – B, 2 questions in Section – C, 2 questions in Section – D and 3 questions in Section – E.',
    'Use of calculators is NOT allowed.',
    '15 minutes (from 10:15 a.m. to 10:30 a.m.) are allotted for reading the question paper, during which candidates should only read and not write on the answer-book.',
    'Candidates must write the Q.P. Code on the title page of the answer-book.'
  ],
  sections: [
    {
      name: 'Section A',
      type: 'COMPULSORY',
      questions: 20,
      marksPerQuestion: 1,
      totalMarks: 20,
      questionTypes: ['MCQ', 'ASSERTION_REASON'],
      instructions: 'Questions 1 to 18 are Multiple Choice Questions (MCQs) and questions 19 & 20 are Assertion-Reason based questions of 1 mark each'
    },
    {
      name: 'Section B',
      type: 'COMPULSORY',
      questions: 5,
      marksPerQuestion: 2,
      totalMarks: 10,
      questionTypes: ['VERY_SHORT_ANSWER'],
      instructions: 'Questions 21 to 25 are Very Short Answer (VSA) type questions, carrying 2 marks each'
    },
    {
      name: 'Section C',
      type: 'COMPULSORY',
      questions: 6,
      marksPerQuestion: 3,
      totalMarks: 18,
      questionTypes: ['SHORT_ANSWER'],
      instructions: 'Questions 26 to 31 are Short Answer (SA) type questions, carrying 3 marks each'
    },
    {
      name: 'Section D',
      type: 'COMPULSORY',
      questions: 4,
      marksPerQuestion: 5,
      totalMarks: 20,
      questionTypes: ['LONG_ANSWER'],
      instructions: 'Questions 32 to 35 are Long Answer (LA) type questions, carrying 5 marks each'
    },
    {
      name: 'Section E',
      type: 'COMPULSORY',
      questions: 3,
      marksPerQuestion: 4,
      totalMarks: 12,
      questionTypes: ['CASE_STUDY'],
      instructions: 'Questions 36 to 38 are case study based questions, carrying 4 marks each'
    }
  ]
};

// CBSE Mathematics Pattern (Class X)
export const CBSE_MATHEMATICS_PATTERN_X: DefaultPattern = {
  id: 'cbse-math-x',
  name: 'CBSE Mathematics (Class X)',
  description: 'Standard CBSE pattern for Mathematics Class X',
  subject: 'Mathematics',
  class: 'X',
  totalMarks: 80,
  duration: 180, // 3 hours
  instructions: [
    'All questions are compulsory',
    'The question paper consists of 30 questions divided into 4 sections A, B, C and D',
    'Section A comprises of 6 questions of 1 mark each',
    'Section B comprises of 6 questions of 2 marks each',
    'Section C comprises of 10 questions of 3 marks each',
    'Section D comprises of 8 questions of 4 marks each',
    'There is no overall choice. However, an internal choice has been provided in 2 questions of 2 marks each, 2 questions of 3 marks each, 3 questions of 4 marks each. You have to attempt only one of the choices in such questions',
    'Use of calculators is not permitted'
  ],
  sections: [
    {
      name: 'Section A',
      type: 'COMPULSORY',
      questions: 6,
      marksPerQuestion: 1,
      totalMarks: 6,
      questionTypes: ['MCQ', 'FILL_BLANKS'],
      instructions: 'Questions 1 to 6 carry 1 mark each'
    },
    {
      name: 'Section B',
      type: 'COMPULSORY',
      questions: 6,
      marksPerQuestion: 2,
      totalMarks: 12,
      questionTypes: ['VERY_SHORT_ANSWER', 'SHORT_ANSWER'],
      instructions: 'Questions 7 to 12 carry 2 marks each'
    },
    {
      name: 'Section C',
      type: 'COMPULSORY',
      questions: 10,
      marksPerQuestion: 3,
      totalMarks: 30,
      questionTypes: ['SHORT_ANSWER', 'PROBLEM_SOLVING'],
      instructions: 'Questions 13 to 22 carry 3 marks each'
    },
    {
      name: 'Section D',
      type: 'COMPULSORY',
      questions: 8,
      marksPerQuestion: 4,
      totalMarks: 32,
      questionTypes: ['LONG_ANSWER', 'PROBLEM_SOLVING'],
      instructions: 'Questions 23 to 30 carry 4 marks each'
    }
  ]
};

// CBSE Science Pattern (Class X)
export const CBSE_SCIENCE_PATTERN_X: DefaultPattern = {
  id: 'cbse-science-x',
  name: 'CBSE Science (Class X)',
  description: 'Standard CBSE pattern for Science Class X',
  subject: 'Science',
  class: 'X',
  totalMarks: 80,
  duration: 180, // 3 hours
  instructions: [
    'All questions are compulsory',
    'The question paper consists of 39 questions divided into 5 sections A, B, C, D and E',
    'Section A comprises of 20 questions of 1 mark each',
    'Section B comprises of 6 questions of 2 marks each',
    'Section C comprises of 7 questions of 3 marks each',
    'Section D comprises of 3 questions of 5 marks each',
    'Section E comprises of 3 questions of 4 marks each',
    'There is no overall choice. However, an internal choice has been provided in 2 questions of 2 marks each, 2 questions of 3 marks each, 1 question of 5 marks each and 3 questions of 4 marks each. You have to attempt only one of the choices in such questions',
    'Use of calculators is not permitted'
  ],
  sections: [
    {
      name: 'Section A',
      type: 'COMPULSORY',
      questions: 20,
      marksPerQuestion: 1,
      totalMarks: 20,
      questionTypes: ['MCQ', 'FILL_BLANKS', 'TRUE_FALSE'],
      instructions: 'Questions 1 to 20 carry 1 mark each'
    },
    {
      name: 'Section B',
      type: 'COMPULSORY',
      questions: 6,
      marksPerQuestion: 2,
      totalMarks: 12,
      questionTypes: ['VERY_SHORT_ANSWER', 'SHORT_ANSWER'],
      instructions: 'Questions 21 to 26 carry 2 marks each'
    },
    {
      name: 'Section C',
      type: 'COMPULSORY',
      questions: 7,
      marksPerQuestion: 3,
      totalMarks: 21,
      questionTypes: ['SHORT_ANSWER', 'PROBLEM_SOLVING'],
      instructions: 'Questions 27 to 33 carry 3 marks each'
    },
    {
      name: 'Section D',
      type: 'COMPULSORY',
      questions: 3,
      marksPerQuestion: 5,
      totalMarks: 15,
      questionTypes: ['LONG_ANSWER', 'PROBLEM_SOLVING'],
      instructions: 'Questions 34 to 36 carry 5 marks each'
    },
    {
      name: 'Section E',
      type: 'COMPULSORY',
      questions: 3,
      marksPerQuestion: 4,
      totalMarks: 12,
      questionTypes: ['LONG_ANSWER', 'CASE_STUDY'],
      instructions: 'Questions 37 to 39 carry 4 marks each'
    }
  ]
};

// Function to get default pattern based on subject and class
export const getDefaultPattern = (subject: string, classLevel: string): DefaultPattern | null => {
  const subjectLower = subject.toLowerCase();
  const classLevelUpper = classLevel.toUpperCase();

  // Applied Mathematics Class XII
  if (subjectLower.includes('applied mathematics') && classLevelUpper.includes('XII')) {
    return CBSE_APPLIED_MATHEMATICS_PATTERN;
  }

  // Mathematics Class X
  if (subjectLower.includes('mathematics') && classLevelUpper.includes('X')) {
    return CBSE_MATHEMATICS_PATTERN_X;
  }

  // Science Class X
  if (subjectLower.includes('science') && classLevelUpper.includes('X')) {
    return CBSE_SCIENCE_PATTERN_X;
  }

  // Default fallback - use Applied Mathematics pattern
  return CBSE_APPLIED_MATHEMATICS_PATTERN;
};

// Function to convert default pattern to AI generation format
export const convertPatternToAIGeneration = (pattern: DefaultPattern) => {
  return {
    totalMarks: pattern.totalMarks,
    duration: pattern.duration,
    instructions: pattern.instructions,
    sections: pattern.sections.map(section => ({
      sectionName: section.name,
      questionCount: section.questions,
      marksPerQuestion: section.marksPerQuestion,
      totalMarks: section.totalMarks,
      questionTypes: section.questionTypes,
      instructions: section.instructions
    }))
  };
};

// All available patterns
export const ALL_DEFAULT_PATTERNS = [
  CBSE_APPLIED_MATHEMATICS_PATTERN,
  CBSE_MATHEMATICS_PATTERN_X,
  CBSE_SCIENCE_PATTERN_X
];
