import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

export default function PerfilPublicoScreen() {
  const { uid } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAmigo, setIsAmigo] = useState(false);
  const [solicitudPendiente, setSolicitudPendiente] = useState(false);

  const [totalPublicaciones, setTotalPublicaciones] = useState(0);
  const [totalRutasCreadas, setTotalRutasCreadas] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (!uid || typeof uid !== 'string') {
      console.warn('UID inválido:', uid);
      setLoading(false);
      return;
    }

    console.log('Cargando perfil de UID:', uid);

    timeoutId = setTimeout(() => {
      if (loading) {
        console.warn(
          'Carga demorada. Posible error de conexión o UID inválido.'
        );
        setUserData(null);
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = firestore()
      .collection('usuarios')
      .doc(uid)
      .onSnapshot(async doc => {
        clearTimeout(timeoutId);

        if (doc.exists()) {
          setUserData(doc.data());
          const currentUid = auth().currentUser?.uid;

          if (currentUid && uid !== currentUid) {
            // 🔄 Consulta unificada SOLO en /amigos
            const snapshot = await firestore()
              .collection('amigos')
              .where('usuarios', 'in', [
                [currentUid, uid],
                [uid, currentUid],
              ])
              .get();

            setIsAmigo(false);
            setSolicitudPendiente(false);

            if (!snapshot.empty) {
              const data = snapshot.docs[0].data();
              if (data.estado === 'aceptado') setIsAmigo(true);
              else if (data.estado === 'pendiente') setSolicitudPendiente(true);
            }
          }
        } else {
          console.warn('UID no encontrado en la base de datos.');
          setUserData(null);
        }
        setLoading(false);
      });

    firestore()
      .collection('rutas')
      .where('creadorUid', '==', uid)
      .get()
      .then(snapshot => {
        const publicaciones = snapshot.docs.filter(doc => {
          const data = doc.data();
          return !!data.descripcion || !!data.fotoUrl; // ← verifica si es una publicación real
        });

        setTotalPublicaciones(publicaciones.length);
        setTotalRutasCreadas(snapshot.size);
      });

    firestore()
      .collection('rutas')
      .where('creadorUid', '==', uid)
      .get()
      .then(snapshot => setTotalRutasCreadas(snapshot.size));

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [uid]);
  const enviarSolicitudAmistad = async () => {
    const currentUid = auth().currentUser?.uid;
    if (!currentUid || !uid || currentUid === uid) return;

    try {
      await firestore()
        .collection('amistades')
        .doc(currentUid)
        .collection(uid)
        .doc('estado')
        .set({
          estado: 'pendiente',
          desde: firestore.FieldValue.serverTimestamp(),
        });

      setSolicitudPendiente(true);
      Alert.alert(
        'Solicitud enviada',
        'Se ha enviado una solicitud de amistad.'
      );
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      Alert.alert('Error', 'No se pudo enviar la solicitud.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          Cargando perfil...
        </Text>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text style={styles.userNotFound}>Usuario no encontrado.</Text>
      </SafeAreaView>
    );
  }

  const fechaNacimiento =
    userData?.fechaNacimiento?.toDate?.()?.toDateString?.() ?? 'No definida';

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#121212' : '#fff' },
      ]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{
            uri:
              userData.fotoPerfilURL ||
              'https://ui-avatars.com/api/?name=Usuario',
          }}
          style={styles.avatar}
        />

        <View style={styles.headerNombre}>
          <Text style={[styles.username, { color: isDark ? '#fff' : '#000' }]}>
            {userData.nombreVisible}
          </Text>

          {auth().currentUser?.uid !== uid && (
            <>
              {isAmigo ? (
                <View
                  style={[styles.iconBadge, { backgroundColor: '#d4edda' }]}
                >
                  <Ionicons name="checkmark-circle" size={22} color="#4caf50" />
                </View>
              ) : solicitudPendiente ? (
                <View
                  style={[styles.iconBadge, { backgroundColor: '#fff3cd' }]}
                >
                  <Ionicons name="time" size={22} color="#fbc02d" />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={enviarSolicitudAmistad}
                  style={[styles.iconBadge, { backgroundColor: '#1e90ff' }]}
                  accessibilityLabel="Agregar amigo"
                >
                  <Ionicons name="person-add" size={22} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View
          style={[
            styles.bioCard,
            { backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9' },
          ]}
        >
          <Text style={styles.cardTitle}>
            <Feather name="message-circle" size={18} /> Biografía
          </Text>
          <Text style={styles.cardText}>
            {userData.biografia?.trim() ||
              'Este usuario no ha escrito una biografía.'}
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9' },
          ]}
        >
          <Text style={styles.cardTitle}>
            <Feather name="user" size={18} /> Datos personales
          </Text>
          <Text style={styles.cardText}>
            <Feather name="calendar" size={16} /> Fecha de nacimiento:{' '}
            {fechaNacimiento}
          </Text>
          <Text style={styles.cardText}>
            <Feather name="map-pin" size={16} /> Ciudad:{' '}
            {userData.ciudad || 'No definida'}
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9' },
          ]}
        >
          <Text style={styles.cardTitle}>
            <Feather name="activity" size={18} /> Motocicleta
          </Text>
          <Text style={styles.cardText}>
            <Feather name="tag" size={16} /> Marca:{' '}
            {userData.motoMarca || 'No definida'}
          </Text>
          <Text style={styles.cardText}>
            <Feather name="layers" size={16} /> Modelo:{' '}
            {userData.motoModelo || 'No definido'}
          </Text>
          <Text style={styles.cardText}>
            <Feather name="cpu" size={16} /> Cilindrada:{' '}
            {userData.cilindradaCC
              ? `${userData.cilindradaCC} cc`
              : 'No definida'}
          </Text>
        </View>

        <View
          style={[
            styles.statsCard,
            { backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9' },
          ]}
        >
          <Text style={styles.cardTitle}>
            <Feather name="bar-chart-2" size={18} /> Estadísticas
          </Text>
          <Text style={styles.cardText}>
            <Feather name="map" size={16} /> Rutas creadas: {totalRutasCreadas}
          </Text>
          <Text style={styles.cardText}>
            <Feather name="edit-2" size={16} /> Publicaciones:{' '}
            {totalPublicaciones}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  bioCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e90ff',
  },
  cardText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
  },
  statsCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    backgroundColor: '#f9f9f9',
  },
  userNotFound: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  headerNombre: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  inviteButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  estadoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 4,
  },
  estadoText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#555',
    fontWeight: 'bold',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8, // bordes suavemente redondeados
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2, // efecto en Android
  },
});
