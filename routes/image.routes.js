const express = require('express');
const fs = require('fs');
const path = require('path');
const { imageModel } = require('../module/image.model');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// Helper function to extract base64 data and image format
function extractBase64AndFormat(imageData) {
    const matches = imageData.match(/^data:image\/(\w+);base64,(.*)$/);
    if (!matches) {
        throw new Error('Invalid image data');
    }
    const format = matches[1];
    const base64Data = matches[2];
    return { format, base64Data };
}

// Route to upload image
router.post('/', async (req, res) => {
    try {
        const { imageData } = req.body;
        const { format, base64Data } = extractBase64AndFormat(imageData);

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(`data:image/${format};base64,${base64Data}`, {
            folder: 'uploads'
        });

        // Save the file path in MongoDB
        const newImage = new imageModel({ path: result.secure_url });
        await newImage.save();

        res.json({ message: 'Image uploaded successfully', imageUrl: result.secure_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while uploading the image' });
    }
});

module.exports = router;