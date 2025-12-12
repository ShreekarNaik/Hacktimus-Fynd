import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button3D from "../components/Button3D";
import Layout from "../components/Layout";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const QUESTIONS = [
  {
    q: "What connects 1st party, 2nd party, and 3rd party data in a flash?",
    options: ["Boltic", "Bluetooth", "Wifi", "Magic"],
    a: 0,
  },
  {
    q: "Which platform helps brands sell everywhere?",
    options: ["Fynd", "Lost", "Found", "Search"],
    a: 0,
  },
  {
    q: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    a: 2,
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0); // Correct answers
  const [finished, setFinished] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const handleStart = async () => {
    if (!user?.mobileNumber) return;
    setStarted(true);
    setCurrentQ(0);
    setScore(0);
    setFinished(false);
    setLastResult(null);
    try {
      const res = await client.post("/games/start", {
        mobileNumber: user.mobileNumber,
        gameName: "quiz",
      });
      setCurrentSessionId(res.data.sessionId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnswer = (idx: number) => {
    const isCorrect = idx === QUESTIONS[currentQ].a;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      finishQuiz(newScore);
    }
  };

  const finishQuiz = async (finalScore: number) => {
    setFinished(true);
    // Calculate points: e.g. 100 points per correct answer
    const points = finalScore * 100;

    try {
      if (currentSessionId) {
        const res = await client.post("/games/submit", {
          sessionId: currentSessionId,
          score: points,
        });
        setLastResult(res.data);
        // Refresh profile to update coins
        refreshProfile();
      }
    } catch (e) {}
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto p-4 text-center">
        <h1 className="font-titan text-4xl text-green-500 mb-8">QUIZ TIME</h1>

        {!started && !finished && (
          <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-green-100">
            <p className="mb-8 font-bold text-gray-500">
              Answer {QUESTIONS.length} questions correctly to win coins!
            </p>
            <Button3D
              label="START QUIZ"
              onClick={handleStart}
              variant="green"
            />
          </div>
        )}

        {started && !finished && (
          <div className="animate-bounce-in">
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-4 uppercase">
              <span>
                Question {currentQ + 1}/{QUESTIONS.length}
              </span>
              <span>Score: {score}</span>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {QUESTIONS[currentQ].q}
              </h2>
            </div>

            <div className="space-y-3">
              {QUESTIONS[currentQ].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold py-3 px-4 rounded-xl border-2 border-blue-200 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {finished && (
          <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-green-100 animate-bounce-in">
            <h2 className="text-3xl font-black text-gray-800 mb-2">
              FINISHED!
            </h2>
            <p className="text-lg text-gray-500 mb-6">
              You got{" "}
              <span className="text-green-500 font-bold">
                {score}/{QUESTIONS.length}
              </span>{" "}
              correct.
            </p>

            {lastResult && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <div className="text-sm font-bold text-yellow-600">EARNED</div>
                <div className="text-3xl font-black text-yellow-500">
                  {lastResult.coinsEarned} Coins
                </div>
              </div>
            )}

            <Button3D label="PLAY AGAIN" onClick={handleStart} />
            <button
              onClick={() => navigate("/")}
              className="mt-4 text-gray-400 text-sm font-bold underline block w-full"
            >
              EXIT
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default Quiz;
