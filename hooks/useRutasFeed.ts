import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';

export function useRutasFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('rutas')
      .orderBy('fechaCreacion', 'desc')
      .onSnapshot(async snapshot => {
        const docs = await Promise.all(
          snapshot.docs.map(async doc => {
            const data = doc.data();
            let username = 'Usuario';
            let avatar = '';
            try {
              const userDoc = await firestore()
                .collection('usuarios')
                .doc(data.creadorUid)
                .get();
              if (userDoc.exists()) {
                const userData = userDoc.data();
                username = userData?.nombreVisible ?? 'Usuario';
                avatar = userData?.avatar ?? '';
              }
            } catch {}
            return {
              id: doc.id,
              username: data.nombreVisible ?? username,
              avatar,
              title: data.titulo,
              caption: data.descripcion,
              route: data.coordenadas,
              image: data.fotoUrl || undefined,
              commentsCount: data.commentsCount ?? 0,
              likesCount: data.likesCount ?? 0,
              likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
            };
          })
        );
        setPosts(docs);
        setLoading(false);
      });

    return unsubscribe;
  }, []);

  return { posts, loading };
}
