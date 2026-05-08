import { Platform } from "react-native";
import Constants from "expo-constants";

export const APP_NAME = "NAIMIRIS";

const ENV_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

const guessDevHostIp = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (typeof hostUri === "string") {
    const host = hostUri.split(":")[0];
    return host || null;
  }

  const debuggerHost = Constants.manifest2?.extra?.expoClient?.debuggerHost || Constants.manifest?.debuggerHost;
  if (typeof debuggerHost === "string") {
    const host = debuggerHost.split(":")[0];
    return host || null;
  }

  return null;
};

const DEV_HOST_IP = guessDevHostIp();
const DEV_BACKEND_BASE_URL = DEV_HOST_IP ? `http://${DEV_HOST_IP}:8000` : null;

// `localhost` from a device/emulator is not your dev machine.
export const BACKEND_BASE_URL = Platform.select({
  android: ENV_BACKEND_BASE_URL || "http://10.0.2.2:8000",
  ios: ENV_BACKEND_BASE_URL || DEV_BACKEND_BASE_URL || "http://127.0.0.1:8000",
  default: ENV_BACKEND_BASE_URL || "http://127.0.0.1:8000"
});


export const WET_ZONE_LIMITS = {
  soilMoistureMin: 35,
  soilMoistureMax: 75,
  temperatureMinC: 18,
  temperatureMaxC: 30,
  humidityMin: 60,
  humidityMax: 90
};
