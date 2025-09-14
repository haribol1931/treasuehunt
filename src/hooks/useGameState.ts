import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, TreasureBox, Question } from '../types/game';
import { getRandomQuestions, getQuestionsByDifficulty } from '../data/questions';

const INITIAL_PLAYER: Player = {
  x: 0,
  y: 0,
  coins: 0,
  xp: 0,
  level: 1,
  completedBoxes: []
};

const createTreasureBoxes = (questions: Question[]): TreasureBox[] => {
  // Generate strategic positions based on difficulty
  const positions: { x: number; y: number }[] = [];
  
  // Sort questions by difficulty for strategic placement
  const sortedQuestions = [...questions].sort((a, b) => {
    const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });
  
  for (let i = 0; i < sortedQuestions.length; i++) {
    let x, y, tooClose;
    const difficulty = sortedQuestions[i].difficulty;
    
    do {
      // Place easier treasures closer to spawn, harder ones further away
      let minDistance, maxDistance;
      if (difficulty === 'easy') {
        minDistance = 25;
        maxDistance = 80;
      } else if (difficulty === 'medium') {
        minDistance = 60;
        maxDistance = 140;
      } else {
        minDistance = 100;
        maxDistance = 180;
      }
      
      const angle = Math.random() * Math.PI * 2;
      const distance = minDistance + Math.random() * (maxDistance - minDistance);
      x = Math.cos(angle) * distance;
      y = Math.sin(angle) * distance;
      
      // Check if too close to existing positions
      tooClose = positions.some(pos => 
        Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)) < 30
      );
    } while (tooClose);
    
    positions.push({ x, y });
  }

  return sortedQuestions.map((question, index) => ({
    id: `box_${index + 1}`,
    x: positions[index].x,
    y: positions[index].y,
    question,
    isUnlocked: index === 0, // First box is unlocked
    isCompleted: false,
    coins: getCoinsForDifficulty(question.difficulty) + (index * 25) // Progressive rewards
  }));
};

const getCoinsForDifficulty = (difficulty: string): number => {
  switch (difficulty) {
    case 'easy': return 50;
    case 'medium': return 100;
    case 'hard': return 200;
    default: return 50;
  }
};

const getXPForDifficulty = (difficulty: string): number => {
  switch (difficulty) {
    case 'easy': return 75;
    case 'medium': return 150;
    case 'hard': return 300;
    default: return 75;
  }
};

const calculateLevel = (xp: number): number => {
  // Level progression: 500 XP for level 2, then +750 XP for each subsequent level
  if (xp < 500) return 1;
  return Math.floor((xp - 500) / 750) + 2;
};

const getXPRequiredForNextLevel = (currentLevel: number): number => {
  if (currentLevel === 1) return 500;
  return 500 + (currentLevel - 1) * 750;
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Create a balanced mix of questions
    const easyQuestions = getQuestionsByDifficulty('easy', 4);
    const mediumQuestions = getQuestionsByDifficulty('medium', 3);
    const hardQuestions = getQuestionsByDifficulty('hard', 2);
    const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
    
    const treasureBoxes = createTreasureBoxes(allQuestions);
    
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

  // Save game state to localStorage with enhanced data
  useEffect(() => {
    const saveData = {
      player: gameState.player,
      completedBoxes: gameState.treasureBoxes.filter(box => box.isCompleted).map(box => box.id),
      unlockedBoxes: gameState.treasureBoxes.filter(box => box.isUnlocked).map(box => box.id),
      level: gameState.player.level,
      timestamp: Date.now()
    };
    localStorage.setItem('treasureHuntSave', JSON.stringify(saveData));
  }, [gameState]);

  // Load game state from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('treasureHuntSave');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Only load if save is less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setGameState(prev => ({
            ...prev,
            player: { ...prev.player, ...parsed.player },
            treasureBoxes: prev.treasureBoxes.map(box => ({
              ...box,
              isCompleted: parsed.completedBoxes.includes(box.id),
              isUnlocked: parsed.unlockedBoxes.includes(box.id)
            }))
          }));
        }
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
    const maxAttempts = 3;

    setGameState(prev => {
      const currentBox = prev.treasureBoxes.find(box => 
        box.question.id === prev.currentQuestion?.id
      );
      
      if (!currentBox) return prev;

      const updatedBoxes = prev.treasureBoxes.map(box => {
        if (box.question.id === prev.currentQuestion?.id) {
          if (isCorrect || newAttempts >= maxAttempts) {
            return { ...box, isCompleted: true };
          }
        }
        return box;
      });

      // Unlock next boxes based on level progression
      const completedBoxIndex = updatedBoxes.findIndex(box => 
        box.question.id === prev.currentQuestion?.id && box.isCompleted
      );
      
      if (completedBoxIndex !== -1) {
        // Unlock next box of same or higher difficulty
        const currentDifficulty = prev.currentQuestion!.difficulty;
        const nextBoxIndex = updatedBoxes.findIndex((box, index) => 
          index > completedBoxIndex && !box.isUnlocked && 
          (box.question.difficulty === currentDifficulty || 
           (currentDifficulty === 'easy' && box.question.difficulty === 'medium') ||
           (currentDifficulty === 'medium' && box.question.difficulty === 'hard'))
        );
        
        if (nextBoxIndex !== -1) {
          updatedBoxes[nextBoxIndex].isUnlocked = true;
        } else {
          // If no specific difficulty box found, unlock next available
          const anyNextBox = updatedBoxes.findIndex((box, index) => 
            index > completedBoxIndex && !box.isUnlocked
          );
          if (anyNextBox !== -1) {
            updatedBoxes[anyNextBox].isUnlocked = true;
          }
        }
      }

      // Calculate rewards based on performance and difficulty
      let coinsEarned = 0;
      let xpEarned = 0;
      
      if (isCorrect) {
        coinsEarned = getCoinsForDifficulty(prev.currentQuestion.difficulty);
        xpEarned = getXPForDifficulty(prev.currentQuestion.difficulty);
        
        // Bonus for first attempt
        if (newAttempts === 1) {
          coinsEarned = Math.floor(coinsEarned * 1.5);
          xpEarned = Math.floor(xpEarned * 1.5);
        }
      } else if (newAttempts >= maxAttempts) {
        // Consolation rewards for completing after max attempts
        coinsEarned = Math.floor(getCoinsForDifficulty(prev.currentQuestion.difficulty) * 0.3);
        xpEarned = Math.floor(getXPForDifficulty(prev.currentQuestion.difficulty) * 0.3);
      }

      const newXP = prev.player.xp + xpEarned;
      const newLevel = calculateLevel(newXP);
      const leveledUp = newLevel > prev.player.level;

      // Level up bonus
      if (leveledUp) {
        coinsEarned += newLevel * 100; // Bonus coins for leveling up
      }

      return {
        ...prev,
        treasureBoxes: updatedBoxes,
        attempts: newAttempts,
        player: {
          ...prev.player,
          coins: prev.player.coins + coinsEarned,
          xp: newXP,
          level: newLevel,
          completedBoxes: (isCorrect || newAttempts >= maxAttempts) 
            ? [...prev.player.completedBoxes, currentBox.id]
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
    const easyQuestions = getQuestionsByDifficulty('easy', 4);
    const mediumQuestions = getQuestionsByDifficulty('medium', 3);
    const hardQuestions = getQuestionsByDifficulty('hard', 2);
    const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
    
    const treasureBoxes = createTreasureBoxes(allQuestions);
    
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

  // Helper function to get progress info
  const getProgressInfo = useCallback(() => {
    const currentLevel = gameState.player.level;
    const currentXP = gameState.player.xp;
    const xpForNextLevel = getXPRequiredForNextLevel(currentLevel);
    const xpProgress = currentLevel === 1 ? currentXP : currentXP - (500 + (currentLevel - 2) * 750);
    const xpNeeded = currentLevel === 1 ? 500 : 750;
    
    return {
      currentLevel,
      currentXP,
      xpForNextLevel,
      xpProgress,
      xpNeeded,
      progressPercentage: (xpProgress / xpNeeded) * 100
    };
  }, [gameState.player.level, gameState.player.xp]);

  return {
    gameState,
    actions: {
      movePlayer,
      interactWithTreasureBox,
      answerQuestion,
      closeQuestionModal,
      toggleHints,
      resetGame
    },
    getProgressInfo
  };
};