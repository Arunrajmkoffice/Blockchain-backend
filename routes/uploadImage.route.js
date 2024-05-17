const cloudinary = require('../config/cloudinary');

function extractBase64AndFormat(imageData) {
    const matches = imageData.match(/^data:image\/(\w+);base64,(.*)$/);
    if (!matches) {
        return null;
    }
    const format = matches[1];
    const base64Data = matches[2];
    return { format, base64Data };
}

async function uploadImage(imageData) {
    if (imageData.startsWith('data:image')) {
        const { format, base64Data } = extractBase64AndFormat(imageData);
        const result = await cloudinary.uploader.upload(`data:image/${format};base64,${base64Data}`, {
            folder: 'uploads'
        });
        return result.secure_url;
    } else {
        // Assume it's a URL and return it
        return imageData;
    }
}

module.exports = { uploadImage };