import storage from '@react-native-firebase/storage';
import { Platform } from 'react-native';
import uuid from 'react-native-uuid';

/**
 * Sube una imagen a Firebase Storage y retorna su URL pública
 * @param uri URI local (ej. file://)
 * @param carpeta Carpeta destino en el bucket
 */
export async function uploadImageToFirebase(
  uri: string,
  carpeta = 'rutas'
): Promise<string> {
  if (!uri) throw new Error('URI inválida para subir.');

  const filename = `${carpeta}/${uuid.v4()}.jpg`;
  const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
  const referencia = storage().ref(filename);

  const task = referencia.putFile(uploadUri);
  await task;

  const downloadURL = await referencia.getDownloadURL();
  return downloadURL;
}
