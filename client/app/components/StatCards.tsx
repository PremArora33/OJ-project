import React from 'react';

interface StatCardsProps {
  totalProblemsSolved: number;
  acceptanceRate: number;
}

const StatCards: React.FC<StatCardsProps> = ({ totalProblemsSolved, acceptanceRate }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-2">
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white text-center">
        <h3 className="text-xl font-semibold mb-2">Problems Solved</h3>
        <p className="text-3xl font-bold text-purple-400">{totalProblemsSolved}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white text-center">
        <h3 className="text-xl font-semibold mb-2">Acceptance Rate</h3>
        <p className="text-3xl font-bold text-green-400">{acceptanceRate}%</p>
      </div>
    </div>
  );
};

export default StatCards;
