import React, { useState, useEffect } from 'react';
import { Question } from '../types/game';
import { X, Award, AlertCircle } from 'lucide-react';
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
      
      // Animate modal in
      gsap.fromTo('.question-modal', 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen, question]);

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const correct = selectedAnswer === question?.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);
    
    // Animate result
    gsap.fromTo('.result-indicator',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'bounce.out' }
    );
    
    setTimeout(() => {
      onAnswer(selectedAnswer);
      if (correct || attempts >= 3) {
        setTimeout(onClose, 2000);
      } else {
        setShowExplanation(false);
        setIsCorrect(null);
        setSelectedAnswer(null);
      }
    }, 2000);
  };

  if (!isOpen || !question) return null;

  const attemptsLeft = Math.max(0, 3 - attempts);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="question-modal bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Award className="text-white" size={24} />
              <div>
                <h2 className="text-xl font-bold text-white">Treasure Question</h2>
                <p className="text-green-100 text-sm">
                  {question.subject} • {question.difficulty}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-100 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {attempts > 0 && attemptsLeft > 0 && (
            <div className="mt-4 flex items-center space-x-2 bg-yellow-400 bg-opacity-20 p-3 rounded-lg">
              <AlertCircle className="text-yellow-200" size={20} />
              <p className="text-yellow-100 text-sm">
                {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
              </p>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 leading-relaxed">
              {question.question}
            </h3>
          </div>

          {!showExplanation && (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                    selectedAnswer === index
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === index && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-lg text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
              
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className={`w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  selectedAnswer !== null
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
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
                    <Award size={48} className="mx-auto mb-3" />
                    <h3 className="text-2xl font-bold">Correct!</h3>
                    <p className="text-green-700 mt-2">Great job! You earned coins and XP!</p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <AlertCircle size={48} className="mx-auto mb-3" />
                    <h3 className="text-2xl font-bold">
                      {attemptsLeft > 0 ? 'Try Again!' : 'Solution Revealed'}
                    </h3>
                    <p className="text-red-700 mt-2">
                      {attemptsLeft > 0 
                        ? `You have ${attemptsLeft} more attempt${attemptsLeft !== 1 ? 's' : ''}!`
                        : 'Don\'t worry, you can still continue!'
                      }
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-xl">
                <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                <p className="text-blue-700 leading-relaxed">{question.explanation}</p>
              </div>

              {(isCorrect || attemptsLeft === 0) && (
                <div className="text-center">
                  <p className="text-gray-600">Moving to next treasure...</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full animate-pulse w-full"></div>
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