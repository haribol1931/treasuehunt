export interface Question {
  id: string;
  subject: 'Math' | 'Science' | 'History' | 'Geography' | 'Literature';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface TreasureBox {
  id: string;
  x: number;
  y: number;
  question: Question;
  isUnlocked: boolean;
  isCompleted: boolean;
  coins: number;
}

export interface Player {
  x: number;
  y: number;
  coins: number;
  xp: number;
  level: number;
  completedBoxes: string[];
}

export interface GameState {
  player: Player;
  treasureBoxes: TreasureBox[];
  currentEnvironment: 'jungle' | 'city' | 'desert' | 'space';
  isQuestionModalOpen: boolean;
  currentQuestion: Question | null;
  attempts: number;
  hintsEnabled: boolean;
}