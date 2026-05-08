export type GrowthStage = 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'fruiting';

export interface SensorData {
  soilMoisture: number;
  soilTemp: number;
  airHumidity: number;
  airTemp: number;
  ec: number;
  timestamp: Date;
  optimalRanges: {
    soilMoisture: [number, number];
    soilTemp: [number, number];
    airHumidity: [number, number];
    airTemp: [number, number];
    ec: [number, number];
  };
}

export interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'success';
  case: string;
  message: string;
  action: string;
}

export interface StageInfo {
  name: string;
  duration: string;
  description: string;
  icon: any;
  color: string;
}
