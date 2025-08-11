import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

import Map from '../screens/Map';
import RouteSetup from '../screens/RouteSetup';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';

const Tab = createBottomTabNavigator();
const MapStack = createNativeStackNavigator();

// ✅ Small stack for the Map flow: RouteSetup -> Map
function MapFlow() {
  return (
    <MapStack.Navigator initialRouteName="RouteSetup" screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="RouteSetup" component={RouteSetup} />
      <MapStack.Screen name="Map" component={Map} />
    </MapStack.Navigator>
  );
}

export default function BottomTabNavigator() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Tab.Navigator
      initialRouteName="Map" // ✅ open the Map flow (which starts on RouteSetup)
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Map') iconName = 'map';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Settings') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFD941',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#2D2D2D',
        },
      })}
    >
      <Tab.Screen name="Profile" component={Profile} />
      {/* ✅ Replace Map screen with the Map flow */}
      <Tab.Screen name="Map" component={MapFlow} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
