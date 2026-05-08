import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import LandAnalysisScreen from "../screens/LandAnalysisScreen";
import IoTDashboardScreen from "../screens/IoTDashboardScreen";
import StageDashboardScreen from "../screens/StageDashboardScreen";
import PestDetectionScreen from "../screens/PestDetectionScreen";
import { theme } from "../config/theme";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.borderStrong,
          borderTopWidth: 1,
          height: 80
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.medium,
          fontSize: 11,
          letterSpacing: 1.1,
          textTransform: "uppercase",
          marginBottom: 12
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarIconStyle: { marginTop: 8 }
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="PreAnalysis"
        component={LandAnalysisScreen}
        options={{
          title: "Pre-Analysis",
          tabBarIcon: ({ color, size }) => <Ionicons name="leaf" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Monitoring"
        component={IoTDashboardScreen}
        options={{
          title: "Monitoring",
          tabBarIcon: ({ color, size }) => <Ionicons name="pulse" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="StageDashboard"
        component={StageDashboardScreen}
        options={{
          title: "Stage",
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Pest"
        component={PestDetectionScreen}
        options={{
          title: "Pest",
          tabBarIcon: ({ color, size }) => <Ionicons name="bug" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}
