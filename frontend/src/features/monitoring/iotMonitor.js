export function getMockSensorSnapshot() {
  return {
    soilMoisture: 62,
    ec: 1.4,
    temperature: 27,
    humidity: 78
  };
}

const FIREBASE_IOT_URL =
  "https://sensorsdata-dd238-default-rtdb.asia-southeast1.firebasedatabase.app";

export async function getRealtimeSensorSnapshot() {
  const response = await fetch(`${FIREBASE_IOT_URL}/.json`);

  if (!response.ok) {
    throw new Error(`Failed to fetch IoT data: ${response.status}`);
  }

  const data = await response.json();
  return data?.sensors ?? data;
}
