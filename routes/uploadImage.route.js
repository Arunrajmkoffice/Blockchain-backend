const cloudinary = require('../config/cloudinary');

function extractBase64AndFormat(imageData) {
    const matches = imageData.match(/^data:image\/(\w+);base64,(.*)$/);
    if (!matches) {
        throw new Error('Invalid image data');
    }
    const format = matches[1];
    const base64Data = matches[2];
    return { format, base64Data };
}

async function uploadImage(imageData) {
    const { format, base64Data } = extractBase64AndFormat(imageData);


    const result = await cloudinary.uploader.upload(`data:image/${format};base64,${base64Data}`, {
        folder: 'uploads'
    });

    return result.secure_url;
}

module.exports = { uploadImage };