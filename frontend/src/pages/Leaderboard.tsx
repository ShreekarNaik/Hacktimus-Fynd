import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button3D from '../components/Button3D';
import client from '../api/client';

interface LeaderboardEntry {
    userId: string;
    gameName: string;
    score: number;
    weekNumber: number;
    timestamp: number;
}

const Leaderboard = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [gameFilter, setGameFilter] = useState('sandfall');

    useEffect(() => {
        fetchLeaderboard();
    }, [gameFilter]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await client.get(`/games/leaderboard/${gameFilter}`);
            setEntries(res.data);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const games = [
        { id: 'sandfall', label: 'Sand Fall' },
        { id: 'spin', label: 'Spin Wheel' },
        { id: 'scratch', label: 'Scratch' },
        { id: 'quiz', label: 'Quiz' }
    ];

    return (
        <Layout>
            <div className="p-4 max-w-lg mx-auto">
                <h1 className="font-titan text-4xl text-yellow-500 mb-6 text-center text-stroke-white drop-shadow-md">LEADERBOARD</h1>
                
                {/* Filter Tabs */}
                <div className="flex justify-center space-x-2 mb-6 overflow-x-auto pb-2">
                    {games.map(g => (
                        <button
                            key={g.id}
                            onClick={() => setGameFilter(g.id)}
                            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                                gameFilter === g.id 
                                ? 'bg-yellow-400 text-white shadow-lg scale-105' 
                                : 'bg-white text-gray-400 hover:bg-gray-50'
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
                         <div className="p-8 text-center text-gray-400 font-bold animate-pulse">Loading scores...</div>
                    ) : entries.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 font-bold">No High Scores Yet!</div>
                    ) : (
                        <div>
                            {entries.map((entry, idx) => (
                                <div key={idx} className={`flex items-center p-4 border-b border-gray-100 ${idx < 3 ? 'bg-yellow-50/30' : ''}`}>
                                     <div className={`w-12 text-center font-black text-xl ${
                                         idx === 0 ? 'text-yellow-500' : 
                                         idx === 1 ? 'text-gray-400' :
                                         idx === 2 ? 'text-orange-400' : 'text-gray-300'
                                     }`}>
                                         #{idx + 1}
                                     </div>
                                     <div className="flex-1 font-bold text-gray-700 truncate px-2">
                                         {entry.userId}
                                     </div>
                                     <div className="w-20 text-right font-black text-gray-800">
                                         {entry.score}
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <Button3D label="BACK HOME" onClick={() => navigate('/')} variant="blue" />
                </div>
            </div>
        </Layout>
    );
};

export default Leaderboard;
