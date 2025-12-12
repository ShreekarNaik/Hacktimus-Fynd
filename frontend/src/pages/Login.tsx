import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button3D from "../components/Button3D";
import client from "../api/client";

const Login: React.FC = () => {
  const { loginWithOtp, register, sendOtp } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState<"ID" | "OTP">("ID");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [requestId, setRequestId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [checkingUsername, setCheckingUsername] = useState(false);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const res = await client.get(
        `/auth/check-username?username=${encodeURIComponent(username)}`
      );
      setUsernameAvailable(res.data.available);
    } catch (err) {
      console.error("Failed to check username", err);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  useEffect(() => {
    if (isRegistering && username.length >= 3) {
      const timeoutId = setTimeout(
        () => checkUsernameAvailability(username),
        500
      );
      return () => clearTimeout(timeoutId);
    } else {
      setUsernameAvailable(null);
    }
  }, [username, isRegistering]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid Phone Number");
      return;
    }
    if (isRegistering && !username) {
      setError("Please enter a Username");
      return;
    }
    if (isRegistering && username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (isRegistering && usernameAvailable === false) {
      setError("Username is already taken. Please choose another.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await sendOtp(phoneNumber);
      const req = data?.requestId || data?.request_id || "";
      if (req) setRequestId(req);
      setStep("OTP");
    } catch (err: any) {
      console.error(err);
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!otp) {
      setError("Please enter OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isRegistering) {
        await register(phoneNumber, username, otp, requestId || undefined);
      } else {
        await loginWithOtp(phoneNumber, otp, requestId || undefined);
      }
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(typeof err === "string" ? err : "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setStep("ID");
    setOtp("");
    setError("");
    // Keep phone number if user switches mode, but clear username
    setUsername("");
  };

  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decor */}
      <div
        className="absolute inset-0 z-0 bg-game-bg opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.4) 2px, transparent 2.5px), radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.4) 2px, transparent 2.5px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="bg-panel-bg border-4 border-white rounded-[30px] p-8 w-full max-w-sm text-center shadow-xl relative z-10 animate-bounce-in">
        <div className="text-6xl mb-4 animate-bounce">🎮</div>
        <h1
          className="font-titan text-5xl text-orange-400 text-stroke-white mb-2 drop-shadow-md"
          style={{ WebkitTextStroke: "2px white" }}
        >
          FYND
          <br />
          GAMES
        </h1>
        <p className="font-nunito font-bold text-gray-500 uppercase tracking-widest mb-8">
          {isRegistering ? "Join the Fun" : "Play . Win . Shop"}
        </p>
        <div className="space-y-4 mb-6">
          {isRegistering && step === "ID" && (
            <div className="relative animate-fade-in">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-4 rounded-xl border-2 font-nunito font-bold text-gray-700 focus:outline-none bg-white shadow-inner ${
                  username.length >= 3
                    ? usernameAvailable === true
                      ? "border-green-400 focus:border-green-500"
                      : usernameAvailable === false
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-300 focus:border-orange-400"
                    : "border-gray-300 focus:border-orange-400"
                }`}
                placeholder="Choose a Username (min 3 chars)"
                minLength={3}
                required
              />
              {username.length >= 3 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {checkingUsername ? (
                    <span className="text-gray-400 text-sm">⏳</span>
                  ) : usernameAvailable === true ? (
                    <span className="text-green-500 text-xl">✓</span>
                  ) : usernameAvailable === false ? (
                    <span className="text-red-500 text-xl">✗</span>
                  ) : null}
                </div>
              )}
              {username.length >= 3 && usernameAvailable === false && (
                <div className="text-red-500 text-xs font-bold mt-1 text-left">
                  Username already taken
                </div>
              )}
              {username.length >= 3 && usernameAvailable === true && (
                <div className="text-green-500 text-xs font-bold mt-1 text-left">
                  Username available!
                </div>
              )}
            </div>
          )}

          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-4 rounded-xl border-2 border-gray-300 font-nunito font-bold text-gray-700 focus:outline-none focus:border-orange-400 bg-white shadow-inner"
            placeholder="Phone Number"
            disabled={step === "OTP"}
          />

          {step === "OTP" && (
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-300 font-nunito font-bold text-gray-700 focus:outline-none focus:border-orange-400 bg-white shadow-inner animate-fade-in"
              placeholder="Enter OTP (Any)"
            />
          )}
        </div>
        {error && (
          <div className="bg-red-100 text-red-500 font-bold p-3 rounded-xl mb-4 text-sm animate-pulse">
            ⚠️ {error}
          </div>
        )}{" "}
        {step === "ID" ? (
          <Button3D
            label={loading ? "SENDING..." : "SEND OTP"}
            onClick={handleSendOtp}
            variant="blue"
            disabled={loading}
          />
        ) : (
          <Button3D
            label={
              loading
                ? "VERIFYING..."
                : isRegistering
                ? "SIGN UP"
                : "START PLAYING"
            }
            onClick={handleAuth}
            variant="green"
            disabled={loading}
          />
        )}
        <div className="mt-6">
          <button
            onClick={toggleMode}
            className="text-gray-500 font-bold underline hover:text-orange-500 transition-colors"
          >
            {isRegistering
              ? "Already have an account? Login"
              : "New User? Sign Up"}
          </button>
        </div>
        <div className="mt-4 text-xs font-nunito font-bold text-gray-400">
          POWERED BY BOLTIC & FYND
        </div>
      </div>
    </div>
  );
};

export default Login;
