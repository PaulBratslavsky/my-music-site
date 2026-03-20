export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText?: string | null;
}

export interface Artist {
  id: number;
  documentId: string;
  name: string;
  bio?: string | null;
  dob?: string | null;
  email?: string | null;
  phone?: string | null;
  education?: string | null;
  location?: string | null;
  website?: string | null;
  spotify?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  image?: StrapiMedia | null;
}

export interface Song {
  id: number;
  documentId: string;
  title: string;
  createdAt: string;
  image?: StrapiMedia | null;
  artist?: Artist | null;
  peaks?: number[] | null;
  duration?: number | null;
}
