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
        return null
    }
    const format = matches[1];
    const base64Data = matches[2];
    return { format, base64Data };
}

// Route to upload image
router.post('/', async (req, res) => {
    try {
        const { imageData } = req.body;

        // Check if the imageData is base64 encoded
        const base64Data = extractBase64AndFormat(imageData);
        let imageUrl;

        if (base64Data) {
            // If it's base64 data, upload to Cloudinary
            const { format, base64Data: data } = base64Data;  // Renaming base64Data to data to avoid re-declaration
            const result = await cloudinary.uploader.upload(`data:image/${format};base64,${data}`, {
                folder: 'uploads'
            });
            imageUrl = result.secure_url;
        } else {
            // If it's a URL, use it directly
            imageUrl = imageData;
        }

        // Save the file path in MongoDB
        const newImage = new imageModel({ path: imageUrl });
        await newImage.save();

        res.json({ message: 'Image uploaded successfully', imageUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while uploading the image' });
    }
});

module.exports = router;