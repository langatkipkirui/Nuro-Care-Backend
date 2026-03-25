const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const uploadMultipleToCloudinary = async (files, folder) => {
  if (!files || files.length === 0) return [];
  const uploads = files.map((file) =>
    cloudinary.uploader.upload(file.path, {
      folder,
    }),
  );

  const results = await Promise.all(uploads);

  return results.map((img) => ({
    url: img.secure_url,
    publicId: img.public_id,
  }));
};

module.exports = { uploadToCloudinary, uploadMultipleToCloudinary };
