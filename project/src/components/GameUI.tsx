import React from 'react';
import { Player } from '../types/game';
import { Coins, Star, Map, Lightbulb } from 'lucide-react';

interface GameUIProps {
  player: Player;
  hintsEnabled: boolean;
  onToggleHints: () => void;
  completedBoxes: number;
  totalBoxes: number;
}

export const GameUI: React.FC<GameUIProps> = ({
  player,
  hintsEnabled,
  onToggleHints,
  completedBoxes,
  totalBoxes
}) => {
  return (
    <>
      {/* Top UI Bar */}
      <div className="fixed top-4 left-4 right-4 z-40">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Coins className="text-yellow-500" size={24} />
                <span className="font-bold text-xl text-gray-800">{player.coins}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Star className="text-purple-500" size={24} />
                <span className="font-bold text-xl text-gray-800">{player.xp} XP</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Map className="text-green-500" size={24} />
                <span className="font-bold text-xl text-gray-800">
                  Level {player.level}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Progress: {completedBoxes}/{totalBoxes}
              </div>
              
              <button
                onClick={onToggleHints}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  hintsEnabled
                    ? 'bg-yellow-500 text-white shadow-md hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Lightbulb size={18} />
                <span className="font-medium">Hints</span>
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(completedBoxes / totalBoxes) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-4 text-center text-sm text-gray-600 mb-2">
              Touch Controls
            </div>
            <div></div>
            <button className="bg-green-500 text-white p-3 rounded-xl font-bold text-lg">W</button>
            <button className="bg-blue-500 text-white p-3 rounded-xl font-bold text-sm">JUMP</button>
            <div></div>
            <button className="bg-green-500 text-white p-3 rounded-xl font-bold text-lg">A</button>
            <button className="bg-green-500 text-white p-3 rounded-xl font-bold text-lg">S</button>
            <button className="bg-green-500 text-white p-3 rounded-xl font-bold text-lg">D</button>
            <div></div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-2">
            Desktop: WASD + Mouse + SPACE to jump
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 right-4 z-40 hidden lg:block">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-4 max-w-xs">
          <h3 className="font-bold text-gray-800 mb-2">🎮 Controls</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">WASD</span> - Move around</p>
            <p><span className="font-medium">Mouse</span> - Look around</p>
            <p><span className="font-medium">SPACE</span> - Jump</p>
            <p><span className="font-medium">Click</span> - Lock mouse cursor</p>
            <p className="text-green-600 font-medium mt-2">Walk near glowing boxes to interact!</p>
          </div>
        </div>
      </div>
    </>
  );
};