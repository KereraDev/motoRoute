import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type Notificacion = {
  id: string;
  tipo: 'comentario' | 'meGusta' | 'invitacion';
  mensaje: string;
  leido: boolean;
  timestamp: FirebaseFirestoreTypes.Timestamp;
};
