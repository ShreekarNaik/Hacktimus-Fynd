import React, { useState } from 'react';
import Modal from './Modal'; // Assuming base Modal handles overlay/portal
import Button3D from './Button3D';

interface Reward {
    company?: string;
    gameName?: string;
    couponCode: string;
    discountPercentage: number;
    redeemUrl?: string;
    terms?: string;
}

interface RewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    reward: Reward | null;
}

const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose, reward }) => {
    const [showTerms, setShowTerms] = useState(false);

    if (!reward) return null;

    const handleRedeem = () => {
        if (reward.redeemUrl) {
            window.open(reward.redeemUrl, '_blank');
        } else {
            console.warn("No redeem URL found");
        }
    };

    const handleClose = () => {
        setShowTerms(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} overflowHidden={false} className="!bg-transparent !shadow-none !p-0 !max-w-md">
            <div className="relative w-full bg-white rounded-3xl p-6 text-center overflow-visible shadow-2xl border-4 border-white">
                {/* Gamified Red X Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute -top-4 -right-4 bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-full font-black border-4 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-50"
                >
                    ✕
                </button>

                {!showTerms ? (
                    <div className="animate-bounce-in">
                        {/* Header Info */}
                        <div className="mb-4">
                            <div className="text-4xl mb-2">🎉</div>
                            <h3 className="font-titan text-2xl text-gray-800 uppercase leading-none">
                                YOU WON A REWARD!
                            </h3>
                            {reward.company && (
                                <p className="text-gray-500 font-bold text-sm mt-1">
                                    from <span className="text-purple-600">{reward.company}</span>
                                    {reward.gameName && <span> via {reward.gameName}</span>}
                                </p>
                            )}
                        </div>

                        {/* Coupon Receipt */}
                        <div className="bg-gradient-to-b from-yellow-50 to-orange-50 border-2 border-dashed border-orange-300 rounded-xl p-6 mb-6 relative">
                            <div className="absolute -left-3 top-1/2 w-6 h-6 bg-white rounded-full translate-y-[-50%] border-r-2 border-orange-300"></div>
                            <div className="absolute -right-3 top-1/2 w-6 h-6 bg-white rounded-full translate-y-[-50%] border-l-2 border-orange-300"></div>
                            
                            <h4 className="text-orange-500 font-bold text-xs uppercase mb-1 tracking-widest">COUPON CODE</h4>
                            <div className="text-3xl font-black text-gray-800 font-mono tracking-wider break-all mb-2 select-all">
                                {reward.couponCode}
                            </div>
                            <div className="inline-block bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">
                                {reward.discountPercentage}% OFF
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <Button3D 
                                label="REDEEM NOW" 
                                onClick={handleRedeem} 
                                variant="green" 
                            />
                            
                            <button 
                                onClick={() => setShowTerms(true)}
                                className="text-gray-400 text-xs font-bold underline hover:text-gray-600"
                            >
                                Terms & Conditions
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in text-left">
                        <h3 className="font-titan text-xl text-gray-700 mb-4 text-center">Terms & Conditions</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-600 font-bold h-48 overflow-y-auto mb-4 custom-scrollbar">
                            {reward.terms ? (
                                <p>{reward.terms}</p>
                            ) : (
                                <p>Standard terms and conditions apply. Check the official website for more details.</p>
                            )}
                            <br/>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>One time use only.</li>
                                <li>Valid until {new Date().getFullYear() + 1}.</li>
                                <li>Cannot be combined with other offers.</li>
                            </ul>
                        </div>
                        <Button3D label="BACK" onClick={() => setShowTerms(false)} variant="blue" />
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default RewardModal;
