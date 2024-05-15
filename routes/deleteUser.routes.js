const { Router } = require("express");
const router = Router();
const { userModel } = require("../module/user.model");



router.delete('/:id', async (req, res) => {
    const userId = req.params.id
    try {
  
      const deletedUser = await userModel.findByIdAndDelete(userId);
      console.log("deletedUser",userId,deletedUser)
      if (deletedUser) {
        console.log(`User with ID ${userId} deleted successfully`);
        res.json({ success: true, message: `User with ID ${userId} deleted successfully` });
      } else {
        console.log(`User with ID ${userId} not found`);
        res.status(404).json({ success: false, message: `User with ID ${userId} not found` });
      }
    } catch (error) {
      console.error(`Error deleting user with ID ${userId}:`, error);
      res.status(500).json({ success: false, message: `Error deleting user with ID ${userId}: ${error.message}` });
    }
  });




  router.get('/', async (req, res) => {
    try {
    
      const user = await userModel.find({});
      if (user) {
       
        res.json({ success: true, message: `Success`, user:user });
      } else {
        
        res.status(404).json({ success: false, message: `Failed` });
      }
    } catch (error) {
      console.error(`Error `, error);
      res.status(500).json({ success: false, message: `Error ` });
    }
  });


  module.exports = router;