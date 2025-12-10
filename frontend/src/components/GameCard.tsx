import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface GameCardProps {
  to: string;
  title: string;
  color: string;
  icon: string;
  description: string;
}

export const GameCard: React.FC<GameCardProps> = ({ to, title, color, icon, description }) => {
  return (
    <Link to={to}>
      <motion.div 
        whileHover={{ scale: 1.02, rotate: 1 }}
        whileTap={{ scale: 0.95 }}
        className={`bg-white rounded-[24px] p-6 mb-4 border-b-8 border-r-4 border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer`}
      >
        <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-bl-full transform group-hover:scale-110 transition-transform`}></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-3xl shadow-inner text-white`}>
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-titan text-2xl text-gray-800 leading-none mb-1">{title}</h3>
            <p className="font-nunito font-bold text-gray-400 text-sm">{description}</p>
          </div>
          <div className="ml-auto">
             <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                ▶
             </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
