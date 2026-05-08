import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import WelcomeScreen from "../screens/WelcomeScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import PreAnalysisServicesScreen from "../screens/PreAnalysisServicesScreen";
import MonitoringServicesScreen from "../screens/MonitoringServicesScreen";
import PestServicesScreen from "../screens/PestServicesScreen";
import LandAnalysisScreen from "../screens/LandAnalysisScreen";
import BudgetPlanningScreen from "../screens/BudgetPlanningScreen";
import ProfitPredictionScreen from "../screens/ProfitPredictionScreen";
import IoTDashboardScreen from "../screens/IoTDashboardScreen";
import GrowthMonitoringScreen from "../screens/GrowthMonitoringScreen";
import StageDashboardScreen from "../screens/StageDashboardScreen";
import DataAnalysisScreen from "../screens/DataAnalysisScreen";
import PestDetectionScreen from "../screens/PestDetectionScreen";
import SeverityAnalysisScreen from "../screens/SeverityAnalysisScreen";
import TreatmentPlanScreen from "../screens/TreatmentPlanScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="PreAnalysisServices" component={PreAnalysisServicesScreen} options={{ title: "Pre-analysis Services" }} />
      <Stack.Screen name="MonitoringServices" component={MonitoringServicesScreen} options={{ title: "Monitoring Services" }} />
      <Stack.Screen name="PestServices" component={PestServicesScreen} options={{ title: "Pest Control Services" }} />
      <Stack.Screen name="LandAnalysis" component={LandAnalysisScreen} options={{ title: "Land Analysis" }} />
      <Stack.Screen name="BudgetPlanning" component={BudgetPlanningScreen} options={{ title: "Budget Planning" }} />
      <Stack.Screen name="ProfitPrediction" component={ProfitPredictionScreen} options={{ title: "Profit Prediction" }} />
      <Stack.Screen name="IoTDashboard" component={IoTDashboardScreen} options={{ title: "IoT Dashboard" }} />
      <Stack.Screen name="StageDashboard" component={StageDashboardScreen} options={{ title: "Stage Dashboard" }} />
      <Stack.Screen name="GrowthMonitoring" component={GrowthMonitoringScreen} options={{ title: "Growth Monitoring" }} />
      <Stack.Screen name="DataAnalysis" component={DataAnalysisScreen} options={{ title: "Data Analysis" }} />
      <Stack.Screen name="PestDetection" component={PestDetectionScreen} options={{ title: "Pest Detection" }} />
      <Stack.Screen name="SeverityAnalysis" component={SeverityAnalysisScreen} options={{ title: "Severity Analysis" }} />
      <Stack.Screen name="TreatmentPlan" component={TreatmentPlanScreen} options={{ title: "Treatment Plan" }} />
    </Stack.Navigator>
  );
}
