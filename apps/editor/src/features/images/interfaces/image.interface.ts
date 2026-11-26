export interface Image {
  imageId: string;
  imageLink: string;
  imageName?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface ImageUploadResponse {
  imageId: string;
  imageLink: string;
  imageName?: string | null;
  createdAt: Date;
}
