import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import RootNavigator from "./src/navigation/RootNavigator";
import { AppProvider } from "./src/state/AppContext";
import { theme } from "./src/config/theme";

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <AppProvider>
      <NavigationContainer theme={theme.navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
