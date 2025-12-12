import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button3D from "../components/Button3D";
import Modal from "../components/Modal";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

interface LeaderboardEntry {
  mobileNumber: string;
  username?: string;
  gameName: string;
  score: number;
  weekNumber: number;
  timestamp: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameFilter, setGameFilter] = useState("sandfall");

  // Claim State
  const [claiming, setClaiming] = useState(false);
  const [claimReward, setClaimReward] = useState<any>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [gameFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/games/leaderboard/${gameFilter}`);
      setEntries(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!user) return;
    setClaiming(true);
    try {
      const res = await client.post("/games/claim-leaderboard", {
        mobileNumber: user.phoneNumber || user.userId,
        gameName: gameFilter,
      });
      setClaimReward(res.data.reward);
      setShowClaimModal(true);
      // Refresh leaderboard to show removal
      fetchLeaderboard();
    } catch (e) {
      console.error(e);
      alert("Failed to claim reward.");
    } finally {
      setClaiming(false);
    }
  };

  const games = [
    { id: "sandfall", label: "Sand Fall" },
    { id: "spin", label: "Spin Wheel" },
    { id: "scratch", label: "Scratch" },
    { id: "quiz", label: "Quiz" },
  ];

  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto">
        <h1 className="font-titan text-4xl text-yellow-500 mb-6 text-center text-stroke-white drop-shadow-md">
          LEADERBOARD
        </h1>

        {/* Filter Tabs */}
        <div className="flex justify-center space-x-2 mb-6 overflow-x-auto pb-2">
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => setGameFilter(g.id)}
              className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                gameFilter === g.id
                  ? "bg-yellow-400 text-white shadow-lg scale-105"
                  : "bg-white text-gray-400 hover:bg-gray-50"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-yellow-100">
          <div className="bg-yellow-50 p-3 font-bold text-gray-400 text-xs flex uppercase tracking-wide">
            <span className="w-12 text-center">Rank</span>
            <span className="flex-1">Player</span>
            <span className="w-20 text-right">Score</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 font-bold animate-pulse">
              Loading scores...
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-bold">
              No High Scores Yet!
            </div>
          ) : (
            <div>
              {entries.map((entry, idx) => {
                const identifier =
                  user?.phoneNumber || user?.userId || user?.mobileNumber;
                const isMe = user && entry.mobileNumber === identifier;
                const isRank1 = idx === 0;

                return (
                  <div
                    key={idx}
                    className={`flex items-center p-4 border-b border-gray-100 relative ${
                      isMe ? "bg-purple-50" : idx < 3 ? "bg-yellow-50/30" : ""
                    }`}
                  >
                    <div
                      className={`w-12 text-center font-black text-xl ${
                        idx === 0
                          ? "text-yellow-500"
                          : idx === 1
                          ? "text-gray-400"
                          : idx === 2
                          ? "text-orange-400"
                          : "text-gray-300"
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div className="flex-1 font-bold text-gray-700 truncate px-2">
                      {entry.username || entry.mobileNumber}
                      {isMe && (
                        <span className="ml-2 text-[10px] bg-purple-200 text-purple-700 px-1 rounded">
                          YOU
                        </span>
                      )}
                    </div>

                    {isMe && isRank1 ? (
                      <button
                        onClick={handleClaim}
                        disabled={claiming}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-black px-3 py-1 rounded-lg shadow-md animate-pulse ml-2"
                      >
                        {claiming ? "..." : "CLAIM 🎁"}
                      </button>
                    ) : (
                      <div className="w-20 text-right font-black text-gray-800">
                        {entry.score}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Button3D
            label="BACK HOME"
            onClick={() => navigate("/")}
            variant="blue"
          />
        </div>

        <Modal isOpen={showClaimModal}>
          <div className="p-6 text-center w-full">
            {claimReward && (
              <div className="animate-bounce-in">
                <h3 className="font-titan text-3xl text-yellow-500 mb-2 drop-shadow-sm">
                  CHAMPION!
                </h3>
                <p className="font-bold text-gray-500 text-sm mb-6">
                  You've claimed your reward for being #1!
                </p>

                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-xl mb-6 text-yellow-800 font-bold border-2 border-yellow-300 border-dashed relative overflow-hidden">
                  <div className="text-xs uppercase mb-1 opacity-70">
                    Coupon Code
                  </div>
                  <div className="text-xl font-black break-all">
                    {claimReward.couponCode}
                  </div>
                  <div className="text-sm mt-1">
                    {claimReward.discountPercentage}% OFF
                  </div>
                </div>

                <Button3D
                  label="AWESOME"
                  onClick={() => setShowClaimModal(false)}
                  variant="green"
                />
              </div>
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Leaderboard;
