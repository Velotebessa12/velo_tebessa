import cloudinary from "./cloudinary";

export async function uploadToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error || !result) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      )
      .end(buffer);
  });
}
