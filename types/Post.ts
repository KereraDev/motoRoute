export type Post = {
  id: string;
  username: string;
  image: string;
  likes: number;
  caption: string;
};

export type NewPostInput = {
  text: string;
  imageUri?: string;
};