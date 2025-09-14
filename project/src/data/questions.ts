import { Question } from '../types/game';

export const questionBank: Question[] = [
  // Class 6 Mathematics - Fractions
  {
    id: 'math_6_frac_001',
    subject: 'Math',
    difficulty: 'easy',
    question: 'What is 3/4 + 1/4?',
    options: ['1', '4/8', '4/4', '1/2'],
    correctAnswer: 0,
    explanation: '3/4 + 1/4 = (3+1)/4 = 4/4 = 1. When adding fractions with the same denominator, add the numerators and keep the denominator same.'
  },
  {
    id: 'math_6_frac_002',
    subject: 'Math',
    difficulty: 'easy',
    question: 'Which fraction is equivalent to 2/6?',
    options: ['1/3', '2/3', '4/6', '3/9'],
    correctAnswer: 0,
    explanation: '2/6 = 1/3 when simplified by dividing both numerator and denominator by their GCD, which is 2.'
  },
  
  // Class 6 Mathematics - Decimals
  {
    id: 'math_6_dec_001',
    subject: 'Math',
    difficulty: 'easy',
    question: 'What is 0.5 + 0.3?',
    options: ['0.8', '0.53', '8', '5.3'],
    correctAnswer: 0,
    explanation: '0.5 + 0.3 = 0.8. When adding decimals, align the decimal points and add normally.'
  },
  {
    id: 'math_6_dec_002',
    subject: 'Math',
    difficulty: 'medium',
    question: 'Convert 3/5 to decimal form.',
    options: ['0.6', '0.35', '0.53', '0.65'],
    correctAnswer: 0,
    explanation: '3/5 = 3 ÷ 5 = 0.6. To convert a fraction to decimal, divide the numerator by the denominator.'
  },

  // Class 7 Mathematics - Algebra
  {
    id: 'math_7_alg_001',
    subject: 'Math',
    difficulty: 'medium',
    question: 'If x = 5, what is the value of 3x + 2?',
    options: ['17', '15', '13', '10'],
    correctAnswer: 0,
    explanation: '3x + 2 = 3(5) + 2 = 15 + 2 = 17. Substitute the value of x and perform the operations.'
  },
  {
    id: 'math_7_alg_002',
    subject: 'Math',
    difficulty: 'medium',
    question: 'Simplify: 5a + 3a - 2a',
    options: ['6a', '10a', '8a', '3a'],
    correctAnswer: 0,
    explanation: '5a + 3a - 2a = (5 + 3 - 2)a = 6a. Combine like terms by adding/subtracting their coefficients.'
  },

  // Class 7 Mathematics - Geometry
  {
    id: 'math_7_geo_001',
    subject: 'Math',
    difficulty: 'medium',
    question: 'What is the sum of angles in a triangle?',
    options: ['180°', '360°', '90°', '270°'],
    correctAnswer: 0,
    explanation: 'The sum of all interior angles in any triangle is always 180°. This is a fundamental property of triangles.'
  },
  {
    id: 'math_7_geo_002',
    subject: 'Math',
    difficulty: 'medium',
    question: 'If two angles of a triangle are 60° and 70°, what is the third angle?',
    options: ['50°', '60°', '40°', '30°'],
    correctAnswer: 0,
    explanation: 'Third angle = 180° - (60° + 70°) = 180° - 130° = 50°. The sum of all angles in a triangle is 180°.'
  },

  // Class 8 Mathematics - Mensuration
  {
    id: 'math_8_men_001',
    subject: 'Math',
    difficulty: 'hard',
    question: 'Find the area of a rectangle with length 8 cm and breadth 5 cm.',
    options: ['40 cm²', '26 cm²', '13 cm²', '45 cm²'],
    correctAnswer: 0,
    explanation: 'Area of rectangle = length × breadth = 8 × 5 = 40 cm². The area is measured in square units.'
  },
  {
    id: 'math_8_men_002',
    subject: 'Math',
    difficulty: 'hard',
    question: 'What is the perimeter of a square with side 6 cm?',
    options: ['24 cm', '36 cm', '12 cm', '18 cm'],
    correctAnswer: 0,
    explanation: 'Perimeter of square = 4 × side = 4 × 6 = 24 cm. Perimeter is the total length of all sides.'
  },

  // Class 8 Mathematics - Data Handling
  {
    id: 'math_8_data_001',
    subject: 'Math',
    difficulty: 'medium',
    question: 'Find the mean of: 10, 15, 20, 25, 30',
    options: ['20', '25', '15', '30'],
    correctAnswer: 0,
    explanation: 'Mean = (10 + 15 + 20 + 25 + 30) ÷ 5 = 100 ÷ 5 = 20. Mean is the sum of all values divided by the number of values.'
  },
  {
    id: 'math_8_data_002',
    subject: 'Math',
    difficulty: 'medium',
    question: 'What is the median of: 3, 7, 9, 12, 15?',
    options: ['9', '7', '12', '10'],
    correctAnswer: 0,
    explanation: 'Median is the middle value when data is arranged in order. Here, 9 is the middle value (3rd position out of 5 values).'
  },

  // Class 6 Mathematics - Basic Operations
  {
    id: 'math_6_basic_001',
    subject: 'Math',
    difficulty: 'easy',
    question: 'What is 144 ÷ 12?',
    options: ['12', '10', '14', '16'],
    correctAnswer: 0,
    explanation: '144 ÷ 12 = 12. You can verify: 12 × 12 = 144.'
  },
  {
    id: 'math_6_basic_002',
    subject: 'Math',
    difficulty: 'easy',
    question: 'Find the LCM of 4 and 6.',
    options: ['12', '24', '8', '10'],
    correctAnswer: 0,
    explanation: 'LCM of 4 and 6: Multiples of 4: 4, 8, 12, 16... Multiples of 6: 6, 12, 18... The smallest common multiple is 12.'
  },

  // Class 7 Mathematics - Integers
  {
    id: 'math_7_int_001',
    subject: 'Math',
    difficulty: 'medium',
    question: 'What is (-5) + (+3)?',
    options: ['-2', '+2', '-8', '+8'],
    correctAnswer: 0,
    explanation: '(-5) + (+3) = -5 + 3 = -2. When adding integers with different signs, subtract and take the sign of the larger absolute value.'
  },
  {
    id: 'math_7_int_002',
    subject: 'Math',
    difficulty: 'medium',
    question: 'What is (-4) × (-6)?',
    options: ['+24', '-24', '+10', '-10'],
    correctAnswer: 0,
    explanation: '(-4) × (-6) = +24. When multiplying two negative integers, the result is positive.'
  }
];

export const getRandomQuestions = (count: number = 8): Question[] => {
  const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getQuestionsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard', count: number = 3): Question[] => {
  const filtered = questionBank.filter(q => q.difficulty === difficulty);
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};