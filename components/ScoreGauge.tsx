
import React, { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number; // 0-100
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setDisplayScore(score));
    return () => cancelAnimationFrame(animation);
  }, [score]);

  const getScoreColor = (s: number) => {
    if (s < 50) return '#EF4444'; // red-500
    if (s < 90) return '#F59E0B'; // amber-500
    return '#22C55E'; // green-500
  };

  const color = getScoreColor(displayScore);
  const strokeWidth = 10;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-52 h-52 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        {/* Background Circle */}
        <circle
          className="text-gray-200 dark:text-dark-highlight"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx="100"
          cy="100"
        />
        {/* Progress Circle */}
        <circle
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="100"
          cy="100"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.8s ease-out',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-5xl font-bold" style={{ color, transition: 'color 0.8s ease-out' }}>
          {Math.round(displayScore)}
        </span>
        <span className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">dari 100</span>
      </div>
    </div>
  );
};

export default ScoreGauge;
