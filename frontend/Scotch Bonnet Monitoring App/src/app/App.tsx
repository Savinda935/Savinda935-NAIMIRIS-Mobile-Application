import { useState, useEffect } from 'react';
import { Thermometer, Droplet, Wind, Zap, TrendingUp, AlertTriangle, CheckCircle, Sprout, Leaf, Flower, Apple } from 'lucide-react';
import SensorCard from './components/SensorCard';
import AlertPanel from './components/AlertPanel';
import GrowthStageSelector from './components/GrowthStageSelector';
import SensorChart from './components/SensorChart';
import { evaluateAlerts, generateMockSensorData } from './utils/sensorLogic';
import type { SensorData, GrowthStage, Alert } from './types';

export default function App() {
  const [currentStage, setCurrentStage] = useState<GrowthStage>('germination');
  const [sensorData, setSensorData] = useState<SensorData>(generateMockSensorData('germination'));
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateMockSensorData(currentStage);
      setSensorData(newData);
      const newAlerts = evaluateAlerts(newData, currentStage);
      setAlerts(newAlerts);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentStage]);

  const allNormal = alerts.length === 0 || alerts.every(a => a.type === 'success');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-2 rounded-xl shadow-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl">Scotch Bonnet</h1>
                <p className="text-xs text-gray-600">IoT Monitoring System</p>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              allNormal ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {allNormal ? '● Live' : '● Alert'}
            </div>
          </div>
        </header>

        <GrowthStageSelector
          currentStage={currentStage}
          onStageChange={setCurrentStage}
        />

        <div className="mt-6">
          <AlertPanel alerts={alerts} allNormal={allNormal} />
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Real-Time Sensors
          </h2>
          <div className="space-y-3">
            <SensorCard
              title="Soil Moisture"
              value={sensorData.soilMoisture}
              unit=""
              icon={<Droplet className="w-5 h-5" />}
              optimal={sensorData.optimalRanges.soilMoisture}
              color="blue"
              rawValue={sensorData.soilMoisture}
            />
            <SensorCard
              title="Soil Temperature"
              value={sensorData.soilTemp}
              unit="°C"
              icon={<Thermometer className="w-5 h-5" />}
              optimal={sensorData.optimalRanges.soilTemp}
              color="orange"
            />
            <SensorCard
              title="Air Humidity"
              value={sensorData.airHumidity}
              unit="%"
              icon={<Wind className="w-5 h-5" />}
              optimal={sensorData.optimalRanges.airHumidity}
              color="cyan"
            />
            <SensorCard
              title="Air Temperature"
              value={sensorData.airTemp}
              unit="°C"
              icon={<Thermometer className="w-5 h-5" />}
              optimal={sensorData.optimalRanges.airTemp}
              color="red"
            />
            <SensorCard
              title="EC (Nutrients)"
              value={sensorData.ec}
              unit="mS/cm"
              icon={<Zap className="w-5 h-5" />}
              optimal={sensorData.optimalRanges.ec}
              color="purple"
            />
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">24-Hour Trends</h2>
          <SensorChart sensorData={sensorData} />
        </div>
      </div>
    </div>
  );
}
