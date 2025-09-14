import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { QuestionModal } from './components/QuestionModal';
import { GameUI } from './components/GameUI';
import { useGameState } from './hooks/useGameState';
import { TreePine, RotateCcw, Trophy, Star } from 'lucide-react';

function App() {
  const { gameState, actions, getProgressInfo } = useGameState();
  const completedBoxes = gameState.treasureBoxes.filter(box => box.isCompleted).length;
  const totalBoxes = gameState.treasureBoxes.length;
  const progressInfo = getProgressInfo();

  return (
    <div className="w-full h-screen bg-gradient-to-b from-green-400 via-green-500 to-green-600 overflow-hidden relative">
      {/* Enhanced Game Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl px-8 py-4 border border-white border-opacity-30">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-2 rounded-xl">
              <TreePine className="text-green-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">NCERT Math Adventure</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600">Class 6-8 Mathematics</span>
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-500" size={16} />
                  <span className="text-sm font-medium text-gray-700">Level {progressInfo.currentLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="absolute inset-0">
        <GameCanvas
          player={gameState.player}
          onPlayerMove={actions.movePlayer}
          onTreasureBoxInteract={actions.interactWithTreasureBox}
          treasureBoxes={gameState.treasureBoxes}
          hintsEnabled={gameState.hintsEnabled}
        />
      </div>

      {/* Enhanced Game UI */}
      <GameUI
        player={gameState.player}
        hintsEnabled={gameState.hintsEnabled}
        onToggleHints={actions.toggleHints}
        completedBoxes={completedBoxes}
        totalBoxes={totalBoxes}
        getProgressInfo={getProgressInfo}
      />

      {/* Enhanced Question Modal */}
      <QuestionModal
        question={gameState.currentQuestion}
        isOpen={gameState.isQuestionModalOpen}
        attempts={gameState.attempts}
        onAnswer={actions.answerQuestion}
        onClose={actions.closeQuestionModal}
      />

      {/* Enhanced Reset Button */}
      <button
        onClick={actions.resetGame}
        className="fixed bottom-4 left-4 z-50 bg-red-500 hover:bg-red-600 text-white p-4 rounded-2xl shadow-xl transition-all duration-200 transform hover:scale-105 border border-red-400"
        title="Reset Game"
      >
        <RotateCcw size={24} />
      </button>

      {/* Enhanced Completion Message */}
      {completedBoxes === totalBoxes && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="text-8xl mb-6">🏆</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Congratulations!</h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                You've completed all the math challenges in the jungle! 
              </p>
              
              {/* Achievement Stats */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Your Achievements</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{gameState.player.coins}</div>
                    <div className="text-sm text-gray-600">Coins Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{gameState.player.xp}</div>
                    <div className="text-sm text-gray-600">XP Gained</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{progressInfo.currentLevel}</div>
                    <div className="text-sm text-gray-600">Final Level</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={actions.resetGame}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Play Again
                </button>
                
                <p className="text-sm text-gray-500">
                  Challenge yourself with new questions and improve your math skills!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Celebration */}
      {progressInfo.progressPercentage >= 100 && completedBoxes < totalBoxes && (
        <div className="fixed inset-0 bg-purple-900 bg-opacity-50 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-12 py-8 rounded-3xl shadow-2xl animate-bounce">
            <div className="text-center">
              <Trophy className="mx-auto mb-4" size={48} />
              <h3 className="text-3xl font-bold mb-2">LEVEL UP!</h3>
              <p className="text-purple-200 text-lg">You reached Level {progressInfo.currentLevel + 1}!</p>
              <div className="mt-4 text-yellow-300 text-sm">
                +{progressInfo.currentLevel * 100} Bonus Coins!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;