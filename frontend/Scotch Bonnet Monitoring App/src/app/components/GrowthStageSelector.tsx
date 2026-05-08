import { motion } from 'motion/react';
import { Sprout, Leaf, TreePine, Flower, Apple } from 'lucide-react';
import type { GrowthStage } from '../types';

interface GrowthStageSelectorProps {
  currentStage: GrowthStage;
  onStageChange: (stage: GrowthStage) => void;
}

const stages = [
  {
    id: 'germination' as GrowthStage,
    name: 'Germination',
    duration: '7-21 days',
    icon: Sprout,
    color: 'from-yellow-400 to-amber-500',
  },
  {
    id: 'seedling' as GrowthStage,
    name: 'Seedling',
    duration: '2-4 weeks',
    icon: Leaf,
    color: 'from-lime-400 to-green-500',
  },
  {
    id: 'vegetative' as GrowthStage,
    name: 'Vegetative',
    duration: '4-8 weeks',
    icon: TreePine,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'flowering' as GrowthStage,
    name: 'Flowering',
    duration: '2-3 weeks',
    icon: Flower,
    color: 'from-pink-400 to-rose-500',
  },
  {
    id: 'fruiting' as GrowthStage,
    name: 'Fruiting',
    duration: '3-6 weeks',
    icon: Apple,
    color: 'from-red-500 to-orange-600',
  },
];

export default function GrowthStageSelector({ currentStage, onStageChange }: GrowthStageSelectorProps) {
  const currentStageIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Growth Stage</h2>

      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = stage.id === currentStage;
            const isPast = index < currentStageIndex;

            return (
              <button
                key={stage.id}
                onClick={() => onStageChange(stage.id)}
                className="flex flex-col items-center gap-2 relative group"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center shadow-md
                    ${isActive
                      ? `bg-gradient-to-br ${stage.color} text-white shadow-lg ring-4 ring-white`
                      : isPast
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>

                {isActive && (
                  <motion.div
                    layoutId="activeStage"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10" />

        <motion.div
          initial={false}
          animate={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-green-400 to-red-500 -z-10"
          transition={{ duration: 0.3 }}
        />
      </div>

      <motion.div
        key={currentStage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center"
      >
        <h3 className="font-bold text-lg mb-1">{stages[currentStageIndex].name}</h3>
        <p className="text-sm text-gray-600">{stages[currentStageIndex].duration}</p>
      </motion.div>
    </div>
  );
}
