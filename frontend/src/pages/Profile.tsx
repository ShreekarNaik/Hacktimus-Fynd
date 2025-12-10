import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button3D from '../components/Button3D';
import Modal from '../components/Modal';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [rewards, setRewards] = useState<any[]>([]);
    const [pendingRewards, setPendingRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Claim State
    const [claiming, setClaiming] = useState(false);
    const [claimReward, setClaimReward] = useState<any>(null);
    const [showClaimModal, setShowClaimModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchRewards();
            fetchPendingRewards();
        }
    }, [user]);

    const fetchRewards = async () => {
        try {
            const res = await client.get(`/user/profile?userId=${user?.userId}`);
            if (res.data.rewards) {
                setRewards(res.data.rewards);
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchPendingRewards = async () => {
        try {
            const res = await client.get(`/games/pending-rewards?userId=${user?.userId}`);
            setPendingRewards(res.data);
        } catch(e) {
            console.error(e);
        }
    };
    
    const handleClaim = async (gameName: string) => {
        setClaiming(true);
        try {
            const res = await client.post('/games/claim-leaderboard', {
                userId: user?.userId,
                gameName
            });
            setClaimReward(res.data.reward);
            setShowClaimModal(true);
            
            // Refresh logic
            fetchPendingRewards();
            fetchRewards();
        } catch(e) {
            console.error(e);
            alert("Failed to claim reward.");
        } finally {
            setClaiming(false);
        }
    };

    if (!user) return null;

    return (
        <Layout>
            <div className="p-4 max-w-lg mx-auto">
                <div className="bg-white rounded-[30px] p-6 shadow-xl border-4 border-purple-100 mb-8">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-md mb-4 border-4 border-white">
                            {user.userId.charAt(0).toUpperCase()}
                        </div>
                        <h1 className="font-titan text-2xl text-gray-800 mb-1">{user.userId}</h1>
                        <div className="flex space-x-4 mt-4 w-full">
                            <div className="flex-1 bg-yellow-50 rounded-xl p-3 text-center border border-yellow-200">
                                <div className="text-xs font-bold text-yellow-600 uppercase">Coins</div>
                                <div className="text-2xl font-black text-yellow-500">{user.coinsBalance}</div>
                            </div>
                            <div className="flex-1 bg-green-50 rounded-xl p-3 text-center border border-green-200">
                                <div className="text-xs font-bold text-green-600 uppercase">Wins</div>
                                <div className="text-2xl font-black text-green-500">{user.totalWins}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PENDING REWARDS */}
                {pendingRewards.length > 0 && (
                    <div className="mb-8">
                         <h2 className="font-titan text-xl text-yellow-500 mb-4 pl-2 animate-pulse">🏆 UNCLAIMED CHAMPIONSHIP</h2>
                         <div className="space-y-4">
                             {pendingRewards.map((p, i) => (
                                 <div key={i} className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded-2xl shadow-lg border-4 border-yellow-200 text-white relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 bg-white/20 rounded-bl-full text-4xl">👑</div>
                                     <h3 className="font-black text-lg uppercase mb-1">{p.gameName} CHAMPION</h3>
                                     <p className="text-xs font-bold w-2/3 mb-4">You are currently Rank #1! Claim your reward now (removes you from leaderboard).</p>
                                     <button 
                                        onClick={() => handleClaim(p.gameName)}
                                        disabled={claiming}
                                        className="bg-white text-orange-500 font-black text-sm px-6 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                                     >
                                        {claiming ? 'CLAIMING...' : 'CLAIM REWARD'}
                                     </button>
                                 </div>
                             ))}
                         </div>
                    </div>
                )}

                <h2 className="font-titan text-2xl text-purple-600 mb-4 pl-2">MY REWARDS</h2>
                
                {loading ? (
                    <div className="text-center p-8 text-gray-400">Loading...</div>
                ) : rewards.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-200">
                        No rewards won yet. play games!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rewards.map((reward, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl shadow-md border-l-4 border-purple-400 flex justify-between items-center relative overflow-hidden">
                                <div className="absolute right-0 top-0 opacity-10 text-6xl transform translate-x-4 -translate-y-4">🎁</div>
                                <div>
                                    <div className="font-titan text-xl text-gray-800">{reward.discountPercentage}% OFF</div>
                                    <div className="text-xs font-bold text-gray-400 break-all pr-2">Code: <span className="bg-purple-100 px-2 py-1 rounded text-purple-600 select-all font-mono">{reward.couponCode}</span></div>
                                    <div className="text-[10px] text-gray-300 mt-1">Exp: {new Date(reward.expiryDate).toLocaleDateString()}</div>
                                </div>
                                <button className="bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow hover:bg-purple-600 transition-colors">
                                    COPY
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 flex flex-col space-y-4">
                    <Button3D label="BACK HOME" onClick={() => navigate('/')} variant="blue" />
                    <button onClick={logout} className="text-red-400 font-bold text-sm hover:text-red-500">Log Out</button>
                </div>
                
                <Modal isOpen={showClaimModal}>
                     <div className="p-6 text-center w-full">
                         {claimReward && (
                             <div className="animate-bounce-in">
                                 <h3 className="font-titan text-3xl text-yellow-500 mb-2 drop-shadow-sm">CHAMPION!</h3>
                                 <p className="font-bold text-gray-500 text-sm mb-6">You've claimed your reward for being #1!</p>
                                 
                                 <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-xl mb-6 text-yellow-800 font-bold border-2 border-yellow-300 border-dashed relative overflow-hidden">
                                      <div className="text-xs uppercase mb-1 opacity-70">Coupon Code</div>
                                      <div className="text-xl font-black break-all font-mono">{claimReward.couponCode}</div>
                                      <div className="text-sm mt-1">{claimReward.discountPercentage}% OFF</div>
                                 </div>
                                 
                                 <Button3D label="AWESOME" onClick={() => setShowClaimModal(false)} variant="green" />
                             </div>
                         )}
                     </div>
                </Modal>
            </div>
        </Layout>
    );
};

export default Profile;
