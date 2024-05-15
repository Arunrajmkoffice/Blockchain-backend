const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: "dnbclknau", 
  api_key: "838397141496413", 
  api_secret: "REdRIEY6_448yQUSFupiN7aGcvY"
});

module.exports = cloudinary;