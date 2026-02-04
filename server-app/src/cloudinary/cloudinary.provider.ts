import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // וודא שזה קיים ב-.env
      api_key: process.env.CLOUDINARY_API_KEY,       // וודא שזה קיים ב-.env
      api_secret: process.env.CLOUDINARY_API_SECRET, // וודא שזה קיים ב-.env
    });
  },
};