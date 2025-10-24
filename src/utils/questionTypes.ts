// Question Types Mapping
export const QUESTION_TYPES = [
  {
    id: "CHOOSE_BEST_ANSWER",
    name: "Multiple Choice",
    description: "Multiple choice with one correct answer",
  },
  {
    id: "FILL_BLANKS",
    name: "Fill in the Blanks",
    description: "Complete missing words or phrases",
  },
  {
    id: "ONE_WORD_ANSWER",
    name: "One Word Answer",
    description: "Answer in one word",
  },
  {
    id: "TRUE_FALSE",
    name: "True/False",
    description: "Select true or false",
  },
  {
    id: "CHOOSE_MULTIPLE_ANSWERS",
    name: "Multiple Answers",
    description: "Select multiple correct answers",
  },
  {
    id: "MATCHING_PAIRS",
    name: "Matching Pairs",
    description: "Match items using arrows",
  },
  {
    id: "DRAWING_DIAGRAM",
    name: "Drawing/Diagram",
    description: "Draw diagrams and mark parts",
  },
  {
    id: "MARKING_PARTS",
    name: "Marking Parts",
    description: "Mark correct objects or parts",
  },
  {
    id: "SHORT_ANSWER",
    name: "Short Answer",
    description: "Brief text response",
  },
  {
    id: "LONG_ANSWER",
    name: "Long Answer",
    description: "Detailed text response",
  },
];

// Legacy mapping for backward compatibility
export const LEGACY_QUESTION_TYPES = {
  "MCQ": "CHOOSE_BEST_ANSWER",
  "MULTIPLE_CHOICE": "CHOOSE_BEST_ANSWER",
  "SHORT_ANSWER": "SHORT_ANSWER",
  "LONG_ANSWER": "LONG_ANSWER",
  "TRUE_FALSE": "TRUE_FALSE",
  "FILL_BLANKS": "FILL_BLANKS",
  "ONE_WORD": "ONE_WORD_ANSWER",
  "ONE_WORD_ANSWER": "ONE_WORD_ANSWER",
};

// Function to get question type display name
export const getQuestionTypeName = (questionType: string): string => {
  // First check if it's already a valid type
  const type = QUESTION_TYPES.find(t => t.id === questionType);
  if (type) {
    return type.name;
  }
  
  // Check legacy mapping
  const mappedType = LEGACY_QUESTION_TYPES[questionType as keyof typeof LEGACY_QUESTION_TYPES];
  if (mappedType) {
    const mappedTypeObj = QUESTION_TYPES.find(t => t.id === mappedType);
    return mappedTypeObj?.name || questionType;
  }
  
  // Fallback to original value
  return questionType;
};

// Function to normalize question type to standard format
export const normalizeQuestionType = (questionType: string): string => {
  // If it's already a valid type, return as is
  if (QUESTION_TYPES.find(t => t.id === questionType)) {
    return questionType;
  }
  
  // Check legacy mapping
  const mappedType = LEGACY_QUESTION_TYPES[questionType as keyof typeof LEGACY_QUESTION_TYPES];
  if (mappedType) {
    return mappedType;
  }
  
  // Fallback to original value
  return questionType;
};
