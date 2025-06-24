import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { TipoNotificacion } from './types';

/**
 * Crea una notificación en Firestore para un usuario.
 */
const crearNotificacion = async ({
  destinatarioUid,
  tipo,
  mensaje,
}: {
  destinatarioUid: string;
  tipo: TipoNotificacion;
  mensaje: string;
}) => {
  const emisorUid = auth().currentUser?.uid;
  if (!emisorUid || emisorUid === destinatarioUid) return;

  await firestore()
    .collection('notificaciones')
    .doc(destinatarioUid)
    .collection('lista')
    .add({
      tipo,
      mensaje,
      leido: false,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
};

/**
 * Notificación por like
 */
export const crearNotificacionLike = async ({
  destinatarioUid,
  emisorNombre,
  rutaId,
}: {
  destinatarioUid: string;
  emisorNombre: string;
  rutaId: string;
}) => {
  const mensaje = `${emisorNombre} le dio like a tu ruta.`;
  await crearNotificacion({ destinatarioUid, tipo: 'meGusta', mensaje });
};

/**
 * Notificación por comentario
 */
export const crearNotificacionComentario = async ({
  destinatarioUid,
  emisorNombre,
  rutaId,
}: {
  destinatarioUid: string;
  emisorNombre: string;
  rutaId: string;
}) => {
  const mensaje = `${emisorNombre} comentó en tu ruta.`;
  await crearNotificacion({ destinatarioUid, tipo: 'comentario', mensaje });
};

/**
 * Notificación por solicitud de amistad
 */
export const crearNotificacionInvitacion = async ({
  destinatarioUid,
  emisorNombre,
}: {
  destinatarioUid: string;
  emisorNombre: string;
}) => {
  const mensaje = `${emisorNombre} te envió una solicitud de amistad.`;
  await crearNotificacion({ destinatarioUid, tipo: 'invitacion', mensaje });
};
