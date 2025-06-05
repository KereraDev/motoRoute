export type LocationCoords = {
  latitude: number;
  longitude: number;
};
export type Post = {
  id: string;
  username: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
  liked?: boolean;
  comments?: string[];
  route?: LocationCoords[];
};

export type NewPostInput = {
  text: string;
  imageUri?: string;
  route?: LocationCoords[];
};
