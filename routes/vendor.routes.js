const { Router } = require("express");
const { userModel } = require("../module/user.model");
const authenticateToken = require("../middleware/authenticateToken");
const router = Router();
router.use(authenticateToken);

router.get("/", async (req, res) => {

    try {
    const vendor = await userModel.find({}).select('email vendorId -_id').lean();
    
      if (!vendor) {
        res.status(404).json({
          success: false,
          message: "Vendor not found"
      });

      } else {
        res.json({
            vendor
        });
      }
    } catch (error) {
      console.error("Error fetching vendor:", error);
      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "Invalid vendor"
        });
      }
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
});

  module.exports = router;