import type { SensorData, GrowthStage, Alert } from '../types';

const STAGE_THRESHOLDS = {
  germination: {
    soilMoisture: [1000, 2000],
    soilTemp: [25, 30],
    airHumidity: [70, 85],
    airTemp: [25, 30],
    ec: [0.5, 1.2],
  },
  seedling: {
    soilMoisture: [1200, 2200],
    soilTemp: [22, 28],
    airHumidity: [60, 75],
    airTemp: [22, 28],
    ec: [0.8, 1.5],
  },
  vegetative: {
    soilMoisture: [1500, 2500],
    soilTemp: [20, 28],
    airHumidity: [50, 70],
    airTemp: [24, 30],
    ec: [1.5, 2.5],
  },
  flowering: {
    soilMoisture: [1200, 2000],
    soilTemp: [20, 26],
    airHumidity: [50, 65],
    airTemp: [21, 29],
    ec: [1.5, 2.2],
  },
  fruiting: {
    soilMoisture: [1500, 2500],
    soilTemp: [20, 26],
    airHumidity: [45, 65],
    airTemp: [24, 30],
    ec: [1.2, 2.0],
  },
} as const;

export function generateMockSensorData(stage: GrowthStage): SensorData {
  const thresholds = STAGE_THRESHOLDS[stage];

  const randomInRange = (min: number, max: number, variance: number = 0.3) => {
    const range = max - min;
    const center = min + range / 2;
    const actualVariance = range * variance;
    return center + (Math.random() - 0.5) * 2 * actualVariance;
  };

  const occasionalOutlier = (min: number, max: number) => {
    if (Math.random() < 0.2) {
      return Math.random() < 0.5 ? min - Math.random() * 200 : max + Math.random() * 200;
    }
    return randomInRange(min, max);
  };

  return {
    soilMoisture: Math.round(occasionalOutlier(thresholds.soilMoisture[0], thresholds.soilMoisture[1])),
    soilTemp: parseFloat(randomInRange(thresholds.soilTemp[0], thresholds.soilTemp[1]).toFixed(1)),
    airHumidity: Math.round(randomInRange(thresholds.airHumidity[0], thresholds.airHumidity[1])),
    airTemp: parseFloat(randomInRange(thresholds.airTemp[0], thresholds.airTemp[1]).toFixed(1)),
    ec: parseFloat(randomInRange(thresholds.ec[0], thresholds.ec[1]).toFixed(2)),
    timestamp: new Date(),
    optimalRanges: {
      soilMoisture: thresholds.soilMoisture as [number, number],
      soilTemp: thresholds.soilTemp as [number, number],
      airHumidity: thresholds.airHumidity as [number, number],
      airTemp: thresholds.airTemp as [number, number],
      ec: thresholds.ec as [number, number],
    },
  };
}

export function evaluateAlerts(data: SensorData, stage: GrowthStage): Alert[] {
  const alerts: Alert[] = [];
  const ranges = data.optimalRanges;

  const isLow = (value: number, range: [number, number]) => value < range[0];
  const isHigh = (value: number, range: [number, number]) => value > range[1];
  const isNormal = (value: number, range: [number, number]) =>
    value >= range[0] && value <= range[1];

  if (isLow(data.soilMoisture, ranges.soilMoisture)) {
    alerts.push({
      id: 'c1',
      type: 'danger',
      case: 'Case 1',
      message: 'Soil Moisture LOW',
      action: stage === 'germination' ? 'Irrigation Required immediately. Seeds cannot recover from dry-out.' : 'Irrigation Required. Risk of rapid wilting.',
    });
  }

  const slowGrowth = stage === 'vegetative' || stage === 'flowering';
  if (slowGrowth && isLow(data.ec, ranges.ec)) {
    alerts.push({
      id: 'c2',
      type: 'warning',
      case: 'Case 2',
      message: 'Slow Growth + EC LOW',
      action: stage === 'flowering' ? 'Apply phosphorus-rich bloom formula.' : 'Apply nitrogen-rich vegetative feed.',
    });
  }

  if (slowGrowth && isHigh(data.soilTemp, ranges.soilTemp)) {
    alerts.push({
      id: 'c3',
      type: 'warning',
      case: 'Case 3',
      message: 'Slow Growth + Soil Temp HIGH',
      action: 'Root Stress Warning. Improve drainage and mulch to cool root zone.',
    });
  }

  if (isHigh(data.airHumidity, ranges.airHumidity) && isHigh(data.airTemp, ranges.airTemp)) {
    const diseaseMessage = stage === 'germination' || stage === 'seedling'
      ? 'Damping-off fungus risk'
      : stage === 'fruiting'
      ? 'Botrytis/Grey Mould Risk'
      : 'Disease Risk';
    alerts.push({
      id: 'c4',
      type: 'danger',
      case: 'Case 4',
      message: `Humidity HIGH + Temp HIGH`,
      action: `${diseaseMessage}. Increase ventilation immediately.`,
    });
  }

  if (
    isNormal(data.soilMoisture, ranges.soilMoisture) &&
    isNormal(data.soilTemp, ranges.soilTemp) &&
    isNormal(data.airHumidity, ranges.airHumidity) &&
    isNormal(data.airTemp, ranges.airTemp) &&
    isNormal(data.ec, ranges.ec)
  ) {
    alerts.push({
      id: 'c5',
      type: 'success',
      case: 'Case 5',
      message: 'All Parameters Normal',
      action: 'Crop Growing Properly. Continue monitoring.',
    });
  }

  return alerts;
}
