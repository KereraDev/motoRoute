import { create } from "zustand";
import { Post, NewPostInput } from "@/types/Post";

type PostStore = {
  posts: Post[];
  addPost: (data: NewPostInput) => void;
  toggleLike: (id: string) => void;
};

export const usePostStore = create<PostStore>((set) => ({
  posts: [
    {
      id: "1",
      username: "rider_maipo",
      image:
        "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqjmThRbbLTZ78Q_f6tYrqmCE-2-0e1BGWfypg5-Yd5kywL2aftmASkPg0VnZQiYobKvZ3B_kkH9uFkjfuXHEba5llIn_i4wvhrFpHwlNhs6IYGSi_9-Vk-LhBpkpdW3iRfyqU=s680-w680-h510-rw",
      likes: 340,
      caption: "Aquí la ruta a Cajón del Maipo en moto fue espectacular 🏍️🌄",
      liked: false,
      comments: ["¡Qué paisaje!", "Me dan ganas de ir 😍"],
    },
    {
      id: "2",
      username: "lucas_explorer",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      likes: 890,
      caption: "Atardecer en Valle del Elqui... sin palabras 🌅✨",
      liked: true,
      comments: ["Hermoso lugar", "Lo tengo pendiente 🔥"],
    },
    {
      id: "3",
      username: "valentina_trips",
      image:
        "https://media.istockphoto.com/id/1095468616/es/foto/camino-serpenteante-en-la-cordillera-entre-santiago-de-chile-y-mendoza-argentina.jpg?s=612x612&w=0&k=20&c=D328sOYfv5tqTCXHrtaUhAcxHIrbnbthcnWOZfzIh1w=",
      likes: 220,
      caption: "Cruzando la cordillera con mi grupo motero 💨🇨🇱",
      liked: false,
      comments: ["¡Qué aventura!", "Ese cielo 😍"],
    },
    {
      id: "4",
      username: "rodrigo_trails",
      image:
        "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=800&q=80",
      likes: 1,
      caption: "Ruta costera al atardecer. La brisa, el motor, la libertad.",
      liked: false,
      comments: ["¡Épico!", "Pura vida 🔥"],
    },
  ],

  addPost: (data) => {
    const newPost: Post = {
      id: Date.now().toString(),
      username: "current_user",
      image: data.imageUri ?? "https://reactnative.dev/img/tiny_logo.png",
      likes: 0,
      caption: data.text,
      liked: false,
      comments: [],
    };
    set((state) => ({ posts: [newPost, ...state.posts] }));
  },

  toggleLike: (id) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    })),
}));
