import React, { useState, useEffect } from 'react';
import { Question } from '../types/game';
import { X, Award, AlertCircle, Star, Trophy, Target } from 'lucide-react';
import { gsap } from 'gsap';

interface QuestionModalProps {
  question: Question | null;
  isOpen: boolean;
  attempts: number;
  onAnswer: (answerIndex: number) => void;
  onClose: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  isOpen,
  attempts,
  onAnswer,
  onClose
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen && question) {
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsCorrect(null);
      
      // Enhanced modal animation
      gsap.fromTo('.question-modal', 
        { scale: 0, opacity: 0, rotationY: 180 },
        { scale: 1, opacity: 1, rotationY: 0, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen, question]);

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const correct = selectedAnswer === question?.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);
    
    // Enhanced result animation
    gsap.fromTo('.result-indicator',
      { scale: 0, opacity: 0, y: 50 },
      { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'bounce.out' }
    );
    
    // Confetti effect for correct answers
    if (correct) {
      createConfetti();
    }
    
    setTimeout(() => {
      onAnswer(selectedAnswer);
      if (correct || attempts >= 2) {
        setTimeout(onClose, 2500);
      } else {
        setShowExplanation(false);
        setIsCorrect(null);
        setSelectedAnswer(null);
      }
    }, 2500);
  };

  const createConfetti = () => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.borderRadius = '50%';
      confettiContainer.appendChild(confetti);

      gsap.to(confetti, {
        y: window.innerHeight + 100,
        x: (Math.random() - 0.5) * 200,
        rotation: Math.random() * 360,
        duration: 3 + Math.random() * 2,
        ease: 'power2.out',
        onComplete: () => confetti.remove()
      });
    }

    setTimeout(() => confettiContainer.remove(), 5000);
  };

  if (!isOpen || !question) return null;

  const attemptsLeft = Math.max(0, 3 - attempts);
  const difficultyColors = {
    easy: { bg: 'from-green-500 to-green-600', text: 'text-green-100', icon: '🌱' },
    medium: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-100', icon: '⭐' },
    hard: { bg: 'from-red-500 to-red-600', text: 'text-red-100', icon: '🔥' }
  };

  const difficultyStyle = difficultyColors[question.difficulty];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="question-modal bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        {/* Enhanced Header */}
        <div className={`bg-gradient-to-r ${difficultyStyle.bg} p-6 rounded-t-3xl relative overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-2xl">
                <Trophy className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Math Challenge</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`${difficultyStyle.text} text-sm font-medium`}>
                    {difficultyStyle.icon} {question.difficulty.toUpperCase()} Level
                  </span>
                  <span className={`${difficultyStyle.text} text-sm`}>
                    {question.subject}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Attempts Warning */}
          {attempts > 0 && attemptsLeft > 0 && (
            <div className="mt-4 flex items-center space-x-3 bg-yellow-400 bg-opacity-20 p-4 rounded-xl">
              <AlertCircle className="text-yellow-200" size={20} />
              <p className="text-yellow-100 text-sm font-medium">
                {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
              </p>
            </div>
          )}
        </div>

        <div className="p-8">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Target className="text-gray-600" size={20} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 leading-relaxed flex-1">
                {question.question}
              </h3>
            </div>
          </div>

          {!showExplanation && (
            <div className="space-y-4">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full p-5 text-left rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg text-gray-800 font-medium">{option}</span>
                  </div>
                </button>
              ))}
              
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className={`w-full mt-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  selectedAnswer !== null
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            </div>
          )}

          {showExplanation && (
            <div className="space-y-6">
              <div className="result-indicator text-center">
                {isCorrect ? (
                  <div className="text-green-600">
                    <div className="bg-green-100 p-6 rounded-3xl inline-block mb-4">
                      <Award size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">Excellent Work!</h3>
                    <p className="text-green-700 text-lg">
                      You earned coins and XP! 🎉
                    </p>
                    {attempts === 0 && (
                      <div className="mt-3 inline-flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
                        <Star className="text-yellow-600" size={16} />
                        <span className="text-yellow-800 font-medium text-sm">First Try Bonus!</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    <div className="bg-red-100 p-6 rounded-3xl inline-block mb-4">
                      <AlertCircle size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">
                      {attemptsLeft > 0 ? 'Try Again!' : 'Keep Learning!'}
                    </h3>
                    <p className="text-red-700 text-lg">
                      {attemptsLeft > 0 
                        ? `You have ${attemptsLeft} more attempt${attemptsLeft !== 1 ? 's' : ''}!`
                        : 'Every mistake is a learning opportunity!'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Explanation */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-6 rounded-r-2xl">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                  <Star className="mr-2" size={20} />
                  Explanation:
                </h4>
                <p className="text-blue-700 leading-relaxed text-lg">{question.explanation}</p>
              </div>

              {/* Correct Answer Highlight */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-2xl">
                <h4 className="font-semibold text-green-800 mb-2">Correct Answer:</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                    {String.fromCharCode(65 + question.correctAnswer)}
                  </div>
                  <span className="text-green-700 font-medium">
                    {question.options[question.correctAnswer]}
                  </span>
                </div>
              </div>

              {(isCorrect || attemptsLeft === 0) && (
                <div className="text-center">
                  <p className="text-gray-600 mb-3">Moving to next treasure...</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full animate-pulse w-full"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};