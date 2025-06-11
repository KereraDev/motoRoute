import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthState } from '@/onAuthStateChanged';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user, initializing } = useAuthState();
  const router = useRouter();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!initializing) {
      if (user) {
        router.replace('/(tabs)/main');
      } else {
        router.replace('/login');
      }
    }
  }, [user, initializing]);

  if (!loaded || initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <StatusBar
              translucent={false}
              backgroundColor={colorScheme === 'dark' ? '#000' : '#fff'}
              barStyle={
                colorScheme === 'dark' ? 'light-content' : 'dark-content'
              }
            />

            <Stack
              screenOptions={{
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="amigos" options={{ headerShown: false }} />
              <Stack.Screen name="camera" options={{ headerShown: false }} />
            </Stack>

            {/* Este Slot se usa si prefieres navegación dinámica */}
            {/* <Slot /> */}
          </SafeAreaView>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
