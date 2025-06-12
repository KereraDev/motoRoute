import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useUserStore } from '../store/userStore';

type LikesData = {
  [postId: string]: {
    count: number;
    liked: boolean;
  };
};

export function useLikesFeed(posts: { id: string }[]) {
  const [likesData, setLikesData] = useState<LikesData>({});
  const user = useUserStore(state => state.user);
  const userId = user?.uid;

  useEffect(() => {
    if (!userId || !posts.length) return;
    const unsubscribes: (() => void)[] = [];

    posts.forEach(post => {
      // Listener para el contador de likes
      const unsub1 = firestore()
        .collection('rutas')
        .doc(post.id)
        .onSnapshot(docSnap => {
          setLikesData(prev => ({
            ...prev,
            [post.id]: {
              ...prev[post.id],
              count: docSnap.data()?.likesCount ?? 0,
            },
          }));
        });

      // Listener para saber si el usuario dio like
      const unsub2 = firestore()
        .collection('rutas')
        .doc(post.id)
        .collection('likes')
        .doc(userId)
        .onSnapshot(likeSnap => {
          setLikesData(prev => ({
            ...prev,
            [post.id]: {
              ...prev[post.id],
              liked: likeSnap.exists,
            },
          }));
        });

      unsubscribes.push(unsub1, unsub2);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [posts, userId]);

  return likesData;
}
