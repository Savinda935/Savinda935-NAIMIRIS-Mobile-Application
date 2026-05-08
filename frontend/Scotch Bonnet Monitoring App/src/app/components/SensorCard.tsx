import { motion } from 'motion/react';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  optimal: [number, number];
  color: 'blue' | 'orange' | 'cyan' | 'red' | 'purple';
  rawValue?: number;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500',
    progress: 'bg-blue-500',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-500',
    progress: 'bg-orange-500',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  cyan: {
    bg: 'bg-cyan-50',
    icon: 'bg-cyan-500',
    progress: 'bg-cyan-500',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-500',
    progress: 'bg-red-500',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-500',
    progress: 'bg-purple-500',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
};

export default function SensorCard({ title, value, unit, icon, optimal, color, rawValue }: SensorCardProps) {
  const colors = colorMap[color];
  const [min, max] = optimal;

  const displayValue = rawValue !== undefined ? rawValue : value;
  const isInRange = value >= min && value <= max;
  const isLow = value < min;
  const isHigh = value > max;

  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${colors.bg} border ${isInRange ? colors.border : isLow ? 'border-yellow-300' : 'border-red-300'} rounded-2xl p-4 shadow-sm`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`${colors.icon} p-2 rounded-xl text-white shadow-md`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
            <p className={`text-2xl font-bold ${colors.text}`}>
              {displayValue}{unit}
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
          isInRange ? 'bg-green-100 text-green-700' : isLow ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
        }`}>
          {isInRange ? 'Normal' : isLow ? 'Low' : 'High'}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Optimal: {min} - {max}{unit}</span>
          <span className="font-medium">{percentage.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${colors.progress} rounded-full`}
          />
        </div>
      </div>
    </motion.div>
  );
}
