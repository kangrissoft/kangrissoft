import React from 'react';
import type { Skill } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SkillChartProps {
  skills: Skill[];
  theme?: string;
}

// Color palettes for light and dark themes
const lightColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#6366F1'];
const darkColors = ['#58A6FF', '#3FB950', '#F0883E', '#A371F7', '#E8534A', '#F472B6', '#818CF8'];


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-secondary p-2 border border-border-color dark:border-dark-border-color rounded shadow-lg text-sm">
        <p className="font-bold text-text-primary dark:text-dark-text-primary">{`${label}`}</p>
        <p className="text-accent dark:text-dark-accent">{`Proficiency: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};


const SkillChart: React.FC<SkillChartProps> = ({ skills, theme = 'light' }) => {
    const colors = theme === 'dark' ? darkColors : lightColors;
    const tickColor = theme === 'dark' ? '#8B949E' : '#4B5563';

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={skills} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis 
            dataKey="name" 
            tick={{ fill: tickColor, fontSize: 12 }} 
            stroke={tickColor}
            />
          <YAxis 
            tick={{ fill: tickColor, fontSize: 12 }} 
            stroke={tickColor}
            />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}/>
          <Bar dataKey="level" radius={[4, 4, 0, 0]}>
            {skills.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillChart;