import React from 'react';
import { Player } from '../types/game';
import { Coins, Star, Map, Lightbulb, Trophy, Target } from 'lucide-react';

interface GameUIProps {
  player: Player;
  hintsEnabled: boolean;
  onToggleHints: () => void;
  completedBoxes: number;
  totalBoxes: number;
  getProgressInfo: () => {
    currentLevel: number;
    currentXP: number;
    xpForNextLevel: number;
    xpProgress: number;
    xpNeeded: number;
    progressPercentage: number;
  };
}

export const GameUI: React.FC<GameUIProps> = ({
  player,
  hintsEnabled,
  onToggleHints,
  completedBoxes,
  totalBoxes,
  getProgressInfo
}) => {
  const progressInfo = getProgressInfo();

  return (
    <>
      {/* Enhanced Top UI Bar */}
      <div className="fixed top-4 left-4 right-4 z-40">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white border-opacity-30">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              {/* Coins */}
              <div className="flex items-center space-x-2">
                <div className="bg-yellow-100 p-2 rounded-xl">
                  <Coins className="text-yellow-600" size={24} />
                </div>
                <div>
                  <span className="font-bold text-2xl text-gray-800">{player.coins}</span>
                  <p className="text-xs text-gray-500">Coins</p>
                </div>
              </div>
              
              {/* XP and Level */}
              <div className="flex items-center space-x-2">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Star className="text-purple-600" size={24} />
                </div>
                <div>
                  <span className="font-bold text-2xl text-gray-800">{player.xp} XP</span>
                  <p className="text-xs text-gray-500">Experience</p>
                </div>
              </div>
              
              {/* Level */}
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-2 rounded-xl">
                  <Trophy className="text-green-600" size={24} />
                </div>
                <div>
                  <span className="font-bold text-2xl text-gray-800">Level {player.level}</span>
                  <p className="text-xs text-gray-500">Current Level</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Progress */}
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <Target className="text-blue-500" size={18} />
                  <span className="text-sm font-medium text-gray-700">
                    Progress: {completedBoxes}/{totalBoxes}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round((completedBoxes / totalBoxes) * 100)}% Complete
                </div>
              </div>
              
              {/* Hints Toggle */}
              <button
                onClick={onToggleHints}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  hintsEnabled
                    ? 'bg-yellow-500 text-white shadow-lg hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Lightbulb size={18} />
                <span className="font-medium">Hints</span>
              </button>
            </div>
          </div>
          
          {/* Enhanced Progress Bars */}
          <div className="mt-4 space-y-3">
            {/* Overall Progress */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Quest Progress</span>
                <span className="text-sm text-gray-500">{completedBoxes}/{totalBoxes}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${(completedBoxes / totalBoxes) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* XP Progress to Next Level */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Level {progressInfo.currentLevel} Progress
                </span>
                <span className="text-sm text-gray-500">
                  {progressInfo.xpProgress}/{progressInfo.xpNeeded} XP
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(progressInfo.progressPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Up Notification */}
      {progressInfo.progressPercentage >= 100 && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce">
            <div className="text-center">
              <Trophy className="mx-auto mb-2" size={32} />
              <h3 className="text-xl font-bold">Level Up!</h3>
              <p className="text-purple-200">You reached Level {progressInfo.currentLevel + 1}!</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mobile Controls */}
      <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white border-opacity-30">
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-5 text-center text-sm text-gray-600 mb-2 font-medium">
              Touch Controls
            </div>
            <div></div>
            <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl font-bold text-lg shadow-md transition-all duration-200 transform active:scale-95">
              W
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl font-bold text-xs shadow-md transition-all duration-200 transform active:scale-95">
              JUMP
            </button>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-xl font-bold text-xs shadow-md transition-all duration-200 transform active:scale-95">
              E
            </button>
            <div></div>
            <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl font-bold text-lg shadow-md transition-all duration-200 transform active:scale-95">
              A
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl font-bold text-lg shadow-md transition-all duration-200 transform active:scale-95">
              S
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl font-bold text-lg shadow-md transition-all duration-200 transform active:scale-95">
              D
            </button>
            <div></div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-3">
            Desktop: WASD + Mouse + SPACE + E to interact
          </div>
        </div>
      </div>

      {/* Enhanced Instructions Panel */}
      <div className="fixed bottom-4 right-4 z-40 hidden lg:block">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-xl p-4 max-w-xs border border-white border-opacity-30">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center">
            <Map className="mr-2" size={18} />
            Game Controls
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">WASD</span>
              <span>Move around</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Mouse</span>
              <span>Look around</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">SPACE</span>
              <span>Jump</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">E</span>
              <span>Interact</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Click</span>
              <span>Lock cursor</span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-green-50 rounded-lg">
            <p className="text-green-700 font-medium text-sm flex items-center">
              <Target className="mr-1" size={14} />
              Find glowing treasures to solve math problems!
            </p>
          </div>
        </div>
      </div>

      {/* Achievement Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {/* This would be populated by achievement system */}
      </div>
    </>
  );
};