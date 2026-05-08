import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { SensorData } from '../types';

interface SensorChartProps {
  sensorData: SensorData;
}

export default function SensorChart({ sensorData }: SensorChartProps) {
  const generateHistoricalData = () => {
    const data = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const variance = () => (Math.random() - 0.5) * 2;

      data.push({
        time: `${time.getHours()}:00`,
        soilTemp: parseFloat((sensorData.soilTemp + variance()).toFixed(1)),
        airTemp: parseFloat((sensorData.airTemp + variance()).toFixed(1)),
        humidity: Math.round(sensorData.airHumidity + variance() * 5),
        ec: parseFloat((sensorData.ec + variance() * 0.2).toFixed(2)),
      });
    }

    return data;
  };

  const data = generateHistoricalData();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            stroke="#9ca3af"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px' }}
          />
          <Line
            type="monotone"
            dataKey="soilTemp"
            stroke="#f97316"
            strokeWidth={2}
            name="Soil Temp (°C)"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="airTemp"
            stroke="#ef4444"
            strokeWidth={2}
            name="Air Temp (°C)"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            stroke="#06b6d4"
            strokeWidth={2}
            name="Humidity (%)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
