import React from "react";
import { GameCard } from "../components/GameCard";

const Dashboard: React.FC = () => {
  return (
    <div className="text-center pt-4">
      <h2 className="font-titan text-3xl text-gray-700 mb-6 drop-shadow-sm">
        CHOOSE GAME
      </h2>

      {/* Strategic Games Section */}
      <div className="relative mb-6 p-4 border-4 border-dashed border-emerald-400 rounded-3xl bg-gradient-to-br from-emerald-50/80 to-blue-50/80 shadow-lg">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full border-4 border-emerald-400 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-titan text-sm text-emerald-600 tracking-wider">
              STRATEGIC GAMES
            </span>
            <span className="text-xl">🧠</span>
          </div>
        </div>

        <div className="mt-4">
          <GameCard
            to="/game/sandfall"
            title="SAND FALL"
            icon="⏳"
            color="bg-orange-400"
            description="Puzzle Adventure"
          />

          <GameCard
            to="/game/quiz"
            title="QUIZ"
            icon="🧠"
            color="bg-blue-400"
            description="Test Your IQ"
          />
        </div>
      </div>

      {/* Luck-Based Games Section */}
      <div className="relative mb-6 p-4 border-4 border-dashed border-purple-400 rounded-3xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 shadow-lg">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full border-4 border-purple-400 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍀</span>
            <span className="font-titan text-sm text-purple-600 tracking-wider">
              LUCK GAMES
            </span>
            <span className="text-xl">✨</span>
          </div>
        </div>

        <div className="mt-4">
          <GameCard
            to="/game/spin"
            title="SPIN WHEEL"
            icon="🎡"
            color="bg-purple-500"
            description="Daily Luck Test"
          />

          <GameCard
            to="/game/scratch"
            title="SCRATCH"
            icon="🎫"
            color="bg-teal-400"
            description="Instant Rewards"
          />
        </div>
      </div>

      <div className="mt-8 bg-blue-50/50 rounded-2xl p-6 border-2 border-blue-100">
        <h3 className="font-titan text-xl text-blue-400 mb-2">
          WEEKLY CHALLENGE
        </h3>
        <p className="font-nunito text-gray-500 text-sm font-bold mb-4">
          Top 10 players win 50% OFF coupons!
        </p>
        <div className="w-full bg-white h-3 rounded-full overflow-hidden">
          <div className="bg-blue-400 h-full w-2/3"></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-400 mt-2">
          <span>YOUR RANK: #42</span>
          <span>TOP: #1</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
