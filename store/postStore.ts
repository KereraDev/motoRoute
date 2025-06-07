import { create } from 'zustand';
import { Post, NewPostInput, Comment } from '@/types/Post';

type PostStore = {
  posts: Post[];
  addPost: (data: NewPostInput) => void;
  toggleLike: (id: string) => void;
  addComment: (postId: string, commentText: string) => void;
  toggleCommentLike: (postId: string, commentId: string) => void;
};

export const usePostStore = create<PostStore>(set => ({
  posts: [
    {
      id: '1',
      avatar: 'https://randomuser.me/api/portraits/men/31.jpg',
      username: 'rider_maipo',
      image:
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqjmThRbbLTZ78Q_f6tYrqmCE-2-0e1BGWfypg5-Yd5kywL2aftmASkPg0VnZQiYobKvZ3B_kkH9uFkjfuXHEba5llIn_i4wvhrFpHwlNhs6IYGSi_9-Vk-LhBpkpdW3iRfyqU=s680-w680-h510-rw',
      likes: 340,
      caption: 'Aquí la ruta a Cajón del Maipo en moto fue espectacular 🏍️🌄',
      liked: false,
      comments: [
        {
          id: 'c1',
          text: '¡Qué paisaje!',
          user: {
            username: 'camila_ride',
            avatar: 'https://randomuser.me/api/portraits/women/50.jpg',
          },
          likes: 2,
          liked: false,
        },
        {
          id: 'c2',
          text: 'Me dan ganas de ir 😍',
          user: {
            username: 'javi_trip',
            avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
          },
          likes: 1,
          liked: true,
        },
      ],
      route: [
        { latitude: -33.739, longitude: -70.342 },
        { latitude: -33.729, longitude: -70.319 },
        { latitude: -33.718, longitude: -70.305 },
      ],
    },
    {
      id: '2',
      username: 'lucas_explorer',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      likes: 890,
      caption: 'Atardecer en Valle del Elqui... sin palabras 🌅✨',
      liked: true,
      comments: [],
      route: [
        { latitude: -30.112, longitude: -70.491 },
        { latitude: -30.116, longitude: -70.479 },
        { latitude: -30.12, longitude: -70.468 },
      ],
    },
    {
      id: '3',
      username: 'valentina_trips',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      image:
        'https://media.istockphoto.com/id/1095468616/es/foto/camino-serpenteante-en-la-cordillera-entre-santiago-de-chile-y-mendoza-argentina.jpg?s=612x612&w=0&k=20&c=D328sOYfv5tqTCXHrtaUhAcxHIrbnbthcnWOZfzIh1w=',
      likes: 220,
      caption: 'Cruzando la cordillera con mi grupo motero 💨🇨🇱',
      liked: false,
      comments: [],
      route: [
        { latitude: -33.437, longitude: -70.65 },
        { latitude: -32.87, longitude: -69.82 },
        { latitude: -32.89, longitude: -68.84 },
      ],
    },
    {
      id: '4',
      username: 'rodrigo_trails',
      avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
      image:
        'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=800&q=80',
      likes: 1,
      caption: 'Ruta costera al atardecer. La brisa, el motor, la libertad.',
      liked: false,
      comments: [],
      route: [
        { latitude: -33.045, longitude: -71.619 },
        { latitude: -33.033, longitude: -71.552 },
        { latitude: -33.018, longitude: -71.509 },
      ],
    },
  ],

  addPost: data => {
    const newPost: Post = {
      id: Date.now().toString(),
      username: 'Mario',
      avatar:
        'https://preview.redd.it/one-piece-icons-by-me-v0-qweam8vkaxv91.jpg?width=640&crop=smart&auto=webp&s=9b7bdc3f934afe5a90f906d0d694c26ea83ff196',
      image: data.imageUri ?? 'https://reactnative.dev/img/tiny_logo.png',
      likes: 0,
      caption: data.text,
      liked: false,
      comments: [],
      route: data.route,
    };
    set(state => ({ posts: [newPost, ...state.posts] }));
  },

  toggleLike: id =>
    set(state => ({
      posts: state.posts.map(post =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      ),
    })),

  addComment: (postId, commentText) =>
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...(post.comments || []),
                {
                  id: Date.now().toString(),
                  text: commentText,
                  user: {
                    username: 'Mario',
                    avatar:
                      'https://preview.redd.it/one-piece-icons-by-me-v0-qweam8vkaxv91.jpg?width=640&crop=smart&auto=webp&s=9b7bdc3f934afe5a90f906d0d694c26ea83ff196',
                  },
                  likes: 0,
                  liked: false,
                },
              ],
            }
          : post
      ),
    })),

  toggleCommentLike: (postId, commentId) =>
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments?.map(comment =>
                comment.id === commentId
                  ? {
                      ...comment,
                      liked: !comment.liked,
                      likes: comment.liked
                        ? (comment.likes || 1) - 1
                        : (comment.likes || 0) + 1,
                    }
                  : comment
              ),
            }
          : post
      ),
    })),
}));
