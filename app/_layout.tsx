import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthState } from '@/onAuthStateChanged';
import type { User } from '@/store/userStore';
import { useUserStore } from '@/store/userStore';
import firestore from '@react-native-firebase/firestore';
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
console.log('App _layout.tsx renderizado');

SplashScreen.preventAutoHideAsync();

const AVATAR_DEFAULT =
  'https://cdn-icons-png.flaticon.com/512/3177/3177440.png';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user, initializing } = useAuthState();
  const router = useRouter();
  const setUser = useUserStore(state => state.setUser);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Oculta el splash cuando las fuentes están listas
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Redirección según estado de autenticación
  useEffect(() => {
    if (!initializing) {
      if (user) {
        router.replace('/(tabs)/main');
      } else {
        router.replace('/login');
      }
    }
  }, [user, initializing, router]);

  // Carga datos del usuario desde Firestore y setea avatar por defecto si falta
  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        try {
          const doc = await firestore()
            .collection('usuarios')
            .doc(user.uid)
            .get();
          if (doc.exists()) {
            const data = doc.data() as User;
            setUser({
              ...data,
              uid: doc.id,
              fotoPerfilURL: data.fotoPerfilURL || AVATAR_DEFAULT,
            });
          } else {
            setUser(null);
          }
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, [user, setUser]);

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
              <Stack.Screen name="friends" options={{ headerShown: false }} />
              <Stack.Screen name="camera" options={{ headerShown: false }} />
              <Stack.Screen name="perfil/[uid]" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaView>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
