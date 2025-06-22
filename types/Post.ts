export type LocationCoords = {
  latitude: number;
  longitude: number;
};
export type Comment = {
  id: string;
  text: string;
  user: {
    username: string;
    avatar: string;
  };
  likes?: number;
  liked?: boolean;
};
export type Post = {
  id: string;
  username: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
  liked?: boolean;
  comments?: Comment[];
  route?: LocationCoords[];
  fotoPerfilURL?: string;
};

export type NewPostInput = {
  text: string;
  imageUri?: string;
  route?: LocationCoords[];
};
