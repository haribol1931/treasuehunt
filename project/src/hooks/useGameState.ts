import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, TreasureBox, Question } from '../types/game';
import { getRandomQuestions } from '../data/questions';

const INITIAL_PLAYER: Player = {
  x: 0,
  y: 0,
  coins: 0,
  xp: 0,
  level: 1,
  completedBoxes: []
};

const createTreasureBoxes = (questions: Question[]): TreasureBox[] => {
  // Generate random positions across the large jungle map
  const positions: { x: number; y: number }[] = [];
  
  for (let i = 0; i < questions.length; i++) {
    let x, y, tooClose;
    
    do {
      // Generate positions within jungle bounds, avoiding center spawn area
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 120; // Between 30-150 units from center
      x = Math.cos(angle) * distance;
      y = Math.sin(angle) * distance;
      
      // Check if too close to existing positions
      tooClose = positions.some(pos => 
        Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)) < 25
      );
    } while (tooClose);
    
    positions.push({ x, y });
  }

  return questions.map((question, index) => ({
    id: `box_${index + 1}`,
    x: positions[index].x,
    y: positions[index].y,
    question,
    isUnlocked: index === 0, // First box is unlocked
    isCompleted: false,
    coins: 75 + (index * 35) // Increasing rewards for NCERT questions
  }));
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const questions = getRandomQuestions(8); // More questions for extended gameplay
    const treasureBoxes = createTreasureBoxes(questions);
    
    return {
      player: INITIAL_PLAYER,
      treasureBoxes,
      currentEnvironment: 'jungle',
      isQuestionModalOpen: false,
      currentQuestion: null,
      attempts: 0,
      hintsEnabled: true
    };
  });

  // Save game state to localStorage
  useEffect(() => {
    const saveData = {
      player: gameState.player,
      completedBoxes: gameState.treasureBoxes.filter(box => box.isCompleted).map(box => box.id),
      level: gameState.player.level
    };
    localStorage.setItem('treasureHuntSave', JSON.stringify(saveData));
  }, [gameState]);

  // Load game state from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('treasureHuntSave');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setGameState(prev => ({
          ...prev,
          player: { ...prev.player, ...parsed.player },
          treasureBoxes: prev.treasureBoxes.map(box => ({
            ...box,
            isCompleted: parsed.completedBoxes.includes(box.id),
            isUnlocked: box.isUnlocked || parsed.completedBoxes.includes(box.id)
          }))
        }));
      } catch (error) {
        console.error('Failed to load saved game:', error);
      }
    }
  }, []);

  const movePlayer = useCallback((x: number, y: number) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        x,
        y
      }
    }));
  }, []);

  const interactWithTreasureBox = useCallback((boxId: string) => {
    const box = gameState.treasureBoxes.find(b => b.id === boxId);
    if (box && box.isUnlocked && !box.isCompleted) {
      setGameState(prev => ({
        ...prev,
        isQuestionModalOpen: true,
        currentQuestion: box.question,
        attempts: 0
      }));
    }
  }, [gameState.treasureBoxes]);

  const answerQuestion = useCallback((answerIndex: number) => {
    if (!gameState.currentQuestion) return;

    const isCorrect = answerIndex === gameState.currentQuestion.correctAnswer;
    const newAttempts = gameState.attempts + 1;

    setGameState(prev => {
      const updatedBoxes = prev.treasureBoxes.map(box => {
        if (box.question.id === prev.currentQuestion?.id) {
          if (isCorrect || newAttempts >= 3) {
            // Mark box as completed and unlock next box
            const boxIndex = prev.treasureBoxes.findIndex(b => b.id === box.id);
            const nextBox = prev.treasureBoxes[boxIndex + 1];
            
            return { ...box, isCompleted: true };
          }
        }
        return box;
      });

      // Unlock next box if current is completed
      const completedBoxIndex = updatedBoxes.findIndex(box => 
        box.question.id === prev.currentQuestion?.id && box.isCompleted
      );
      
      if (completedBoxIndex !== -1 && completedBoxIndex < updatedBoxes.length - 1) {
        updatedBoxes[completedBoxIndex + 1].isUnlocked = true;
      }

      // Award coins and XP
      const coinsEarned = isCorrect ? (updatedBoxes.find(box => box.question.id === prev.currentQuestion?.id)?.coins || 0) : 0;
      const xpEarned = isCorrect ? 100 : (newAttempts >= 3 ? 25 : 0);

      return {
        ...prev,
        treasureBoxes: updatedBoxes,
        attempts: newAttempts,
        player: {
          ...prev.player,
          coins: prev.player.coins + coinsEarned,
          xp: prev.player.xp + xpEarned,
          completedBoxes: isCorrect || newAttempts >= 3 
            ? [...prev.player.completedBoxes, updatedBoxes.find(box => box.question.id === prev.currentQuestion?.id)?.id || '']
            : prev.player.completedBoxes
        }
      };
    });
  }, [gameState.currentQuestion, gameState.attempts]);

  const closeQuestionModal = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isQuestionModalOpen: false,
      currentQuestion: null,
      attempts: 0
    }));
  }, []);

  const toggleHints = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      hintsEnabled: !prev.hintsEnabled
    }));
  }, []);

  const resetGame = useCallback(() => {
    const questions = getRandomQuestions(8);
    const treasureBoxes = createTreasureBoxes(questions);
    
    setGameState({
      player: INITIAL_PLAYER,
      treasureBoxes,
      currentEnvironment: 'jungle',
      isQuestionModalOpen: false,
      currentQuestion: null,
      attempts: 0,
      hintsEnabled: true
    });
    
    localStorage.removeItem('treasureHuntSave');
  }, []);

  return {
    gameState,
    actions: {
      movePlayer,
      interactWithTreasureBox,
      answerQuestion,
      closeQuestionModal,
      toggleHints,
      resetGame
    }
  };
};