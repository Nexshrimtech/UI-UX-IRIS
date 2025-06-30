import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import AddBillScreen from './src/screens/AddBillScreen';
import AddEMIScreen from './src/screens/AddEMIScreen';
import AddSubscriptionScreen from './src/screens/AddSubscriptionScreen';
import AddUtilityScreen from './src/screens/AddUtilityScreen';
import LoanApplicationScreen from './src/screens/LoanApplicationScreen';
import MobileRechargeScreen from './src/screens/MobileRechargeScreen';
import EMIHubScreen from './src/screens/EMIHubScreen';
import SubscriptionHubScreen from './src/screens/SubscriptionHubScreen';
import UtilityHubScreen from './src/screens/UtilityHubScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bills') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Pay') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Cards') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Rewards') {
            iconName = focused ? 'gift' : 'gift-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5046e5',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#1a1a3a',
          borderTopColor: '#2a2a5a',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Bills" component={DashboardScreen} />
      <Tab.Screen name="Pay" component={MobileRechargeScreen} />
      <Tab.Screen name="Cards" component={DashboardScreen} />
      <Tab.Screen name="Rewards" component={DashboardScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1a1a3a" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a3a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddBill" 
          component={AddBillScreen}
          options={{ title: 'Add Bill' }}
        />
        <Stack.Screen 
          name="AddEMI" 
          component={AddEMIScreen}
          options={{ title: 'Add EMI' }}
        />
        <Stack.Screen 
          name="AddSubscription" 
          component={AddSubscriptionScreen}
          options={{ title: 'Add Subscription' }}
        />
        <Stack.Screen 
          name="AddUtility" 
          component={AddUtilityScreen}
          options={{ title: 'Add Utility' }}
        />
        <Stack.Screen 
          name="LoanApplication" 
          component={LoanApplicationScreen}
          options={{ title: 'Loan Application' }}
        />
        <Stack.Screen 
          name="MobileRecharge" 
          component={MobileRechargeScreen}
          options={{ title: 'Mobile Recharge' }}
        />
        <Stack.Screen 
          name="EMIHub" 
          component={EMIHubScreen}
          options={{ title: 'EMI Management' }}
        />
        <Stack.Screen 
          name="SubscriptionHub" 
          component={SubscriptionHubScreen}
          options={{ title: 'Subscriptions' }}
        />
        <Stack.Screen 
          name="UtilityHub" 
          component={UtilityHubScreen}
          options={{ title: 'Utilities' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}