const { Router } = require("express");
const { productDetailsModel } = require("../module/productDetails.model");
const router = Router();

router.patch("/:id", async (req, res) => {
  
    const qrId = req.params.id;

    try {
      // const product = await productDetailsModel.findOne({ qr: { $elemMatch: { $eq: productId } } });
      const product = await productDetailsModel.findOne({ "qr._id": qrId },  {"plot_embedding_hf": 0 });
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
      const qrIndex = product.qr.findIndex(qr => qr._id.toString() === qrId);
//       const matchingTrackIndex = product.qr[qrIndex].tracking
// console.log("matchingTrackIndex",matchingTrackIndex)
      const currentDate = new Date().toISOString().slice(0, 10);
      const currentTime = new Date().toLocaleTimeString();
  
      product.qr[qrIndex].tracking.forEach((track) => {
        if(!track.complete){
          track.complete =    true;
          track.date = currentDate;
          track.time = currentTime;
        }     
    });
   
      await product.save();
  
      res.status(200).json({
        success: true,
        message: "Product found successfully",
        product: product,
        track: product.qr[qrIndex].tracking
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
});

module.exports = router;
