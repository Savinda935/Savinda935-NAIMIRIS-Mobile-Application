import Constants from "expo-constants";


const ENV_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
const DEFAULT_PC_BACKEND_BASE_URL = "http://10.68.28.18:8000";

const getExpoHostUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (typeof hostUri === "string" && hostUri.includes(":")) {
    return `http://${hostUri.split(":")[0]}:8000`;
  }

  const debuggerHost = Constants.manifest2?.extra?.expoClient?.debuggerHost || Constants.manifest?.debuggerHost;
  if (typeof debuggerHost === "string" && debuggerHost.includes(":")) {
    return `http://${debuggerHost.split(":")[0]}:8000`;
  }

  return null;
};

export const API_BASE_URL = ENV_BACKEND_BASE_URL || getExpoHostUrl() || DEFAULT_PC_BACKEND_BASE_URL;
