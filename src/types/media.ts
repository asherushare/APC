export interface Media {
  id: string;
  url: string;
  altText?: string;
  title?: string;
  type: "image" | "video" | "document";
}
