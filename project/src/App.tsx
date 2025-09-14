import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { QuestionModal } from './components/QuestionModal';
import { GameUI } from './components/GameUI';
import { useGameState } from './hooks/useGameState';
import { TreePine, RotateCcw } from 'lucide-react';

function App() {
  const { gameState, actions } = useGameState();
  const completedBoxes = gameState.treasureBoxes.filter(box => box.isCompleted).length;
  const totalBoxes = gameState.treasureBoxes.length;

  return (
    <div className="w-full h-screen bg-gradient-to-b from-green-400 to-green-600 overflow-hidden relative">
      {/* Game Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-lg px-6 py-3">
          <div className="flex items-center space-x-3">
            <TreePine className="text-green-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">NCERT Math Adventure</h1>
            <span className="text-sm text-gray-600 ml-2">Class 6-8 Mathematics</span>
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

      {/* Game UI */}
      <GameUI
        player={gameState.player}
        hintsEnabled={gameState.hintsEnabled}
        onToggleHints={actions.toggleHints}
        completedBoxes={completedBoxes}
        totalBoxes={totalBoxes}
      />

      {/* Question Modal */}
      <QuestionModal
        question={gameState.currentQuestion}
        isOpen={gameState.isQuestionModalOpen}
        attempts={gameState.attempts}
        onAnswer={actions.answerQuestion}
        onClose={actions.closeQuestionModal}
      />

      {/* Reset Button */}
      <button
        onClick={actions.resetGame}
        className="fixed bottom-4 left-4 z-50 bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
        title="Reset Game"
      >
        <RotateCcw size={20} />
      </button>

      {/* Completion Message */}
      {completedBoxes === totalBoxes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Congratulations!</h2>
            <p className="text-lg text-gray-600 mb-6">
              You've found all the treasures in the jungle! 
              You earned <span className="font-bold text-yellow-600">{gameState.player.coins}</span> coins 
              and <span className="font-bold text-purple-600">{gameState.player.xp}</span> XP!
            </p>
            <button
              onClick={actions.resetGame}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;