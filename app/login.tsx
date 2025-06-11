import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function LoginScreen() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isRegistering ? -SCREEN_WIDTH : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [isRegistering]);

  const showError = error => {
    let mensaje = 'Ocurrió un error.';

    if (error && typeof error.code === 'string') {
      switch (error.code) {
        case 'auth/invalid-email':
          mensaje = 'El correo no tiene un formato válido.';
          break;
        case 'auth/user-not-found':
          mensaje = 'No existe una cuenta con este correo.';
          break;
        case 'auth/wrong-password':
          mensaje = 'La contraseña es incorrecta.';
          break;
        case 'auth/email-already-in-use':
          mensaje = 'Este correo ya está registrado.';
          break;
        case 'auth/too-many-requests':
          mensaje = 'Demasiados intentos fallidos. Intenta más tarde.';
          break;
        case 'auth/weak-password':
          mensaje = 'La contraseña debe tener al menos 6 caracteres.';
          break;
        case 'auth/missing-password':
          mensaje = 'Debes ingresar una contraseña.';
          break;
        case 'auth/missing-email':
          mensaje = 'Debes ingresar un correo electrónico.';
          break;
        default:
          mensaje = 'Error desconocido: ' + error.message;
      }
    } else {
      mensaje = 'Error inesperado. Verifica los datos ingresados.';
    }

    Alert.alert('Error', mensaje);
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Validación', 'Debes ingresar un correo electrónico.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Validación', 'Debes ingresar una contraseña.');
      return;
    }

    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      router.replace('/(tabs)/main');
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    // Validación de nombre realista
    const nombreValido =
      name &&
      name.trim().length >= 3 &&
      /^[a-zA-Z\s]+$/.test(name) &&
      !/^([a-zA-Z])\1{1,}$/.test(name.trim());

    if (!nombreValido) {
      Alert.alert('Nombre inválido', 'Ingresa un nombre real.');
      return;
    }

    if (!gender) {
      Alert.alert('Campo requerido', 'Selecciona un sexo.');
      return;
    }

    if (!birthDate) {
      Alert.alert(
        'Campo requerido',
        'Debes seleccionar tu fecha de nacimiento.'
      );
      return;
    }

    // Validación de rango de fecha realista
    const hoy = new Date();
    const minimo = new Date(1900, 0, 1); // 1 enero 1900
    if (birthDate > hoy || birthDate < minimo) {
      Alert.alert(
        'Fecha inválida',
        'Selecciona una fecha de nacimiento válida.'
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar un correo electrónico.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar una contraseña.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      Alert.alert('Éxito', 'Cuenta creada correctamente.');
      router.replace('/(tabs)/main');
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.fullContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View
        style={{ opacity: fadeAnim, alignItems: 'center', marginBottom: 24 }}
      >
        <Text style={styles.emoji}>🏍️</Text>
        <Text style={styles.title}>MotoRoute</Text>
      </Animated.View>

      <View style={{ overflow: 'hidden', width: SCREEN_WIDTH }}>
        <Animated.View
          style={{
            flexDirection: 'row',
            width: SCREEN_WIDTH * 2,
            transform: [
              {
                translateX: slideAnim,
              },
            ],
          }}
        >
          <View style={styles.formPage}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.togglePassword}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.5 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formPage}>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={setGender}
                style={styles.picker}
              >
                <Picker.Item
                  label="Selecciona tu sexo"
                  value=""
                  enabled={false}
                />
                <Picker.Item label="Masculino" value="Masculino" />
                <Picker.Item label="Femenino" value="Femenino" />
                <Picker.Item label="Prefiero no decirlo" value="Otro" />
              </Picker>
            </View>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.input, { justifyContent: 'center' }]}
            >
              <Text style={{ color: birthDate ? '#000' : '#888' }}>
                {birthDate
                  ? birthDate.toLocaleDateString()
                  : 'Fecha de nacimiento'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthDate || new Date(2000, 0, 1)}
                mode="date"
                display="spinner"
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setBirthDate(date);
                }}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.togglePassword}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.togglePassword}>
                  {showConfirmPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.5 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Cargando...' : 'Registrarse'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <TouchableOpacity
        onPress={() => setIsRegistering(!isRegistering)}
        disabled={loading}
      >
        <Text style={[styles.registerText, { color: '#007AFF' }]}>
          {isRegistering
            ? '¿Ya tienes cuenta? Inicia sesión'
            : '¿No tienes cuenta? Regístrate'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
  },
  togglePassword: {
    marginLeft: 10,
    fontSize: 18,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  formPage: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 24,
  },
});
