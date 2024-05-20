const { Router } = require("express");
const router = Router();
const jwt = require('jsonwebtoken');
const { searchPath } = require("../module/searchPath.model");
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const axios = require('axios');


const embedingUrl =  process.env.EMBEDING_URL
const hfToken =   process.env.HFTOKEN

async function generateEmbedding(text){
    try {
        const response = await axios.post(
            embedingUrl,
            { inputs: text },
            { headers: { Authorization: `Bearer ${hfToken}` } }
        );

        if (response.status !== 200) {
            throw new Error(`Request Failed`);
        }

         return response.data;
    } catch(error) {
   
    }
}

router.post("/", async (req, res) => {
    const { path, name, description, data } = req.body;

let vText = `${name} ${description}`

    if (!path || !name || !description ) {
        return res.status(400).json({
            success: false,
            message: "All fields are mandatory."
        });
    }

  



    try {

        const newSearchPath = new searchPath({
            path, name, description,  plot_embedding_hf:await generateEmbedding(vText),data
          
        });


        await newSearchPath.save();
        res.json({
            success: true,
            message: "Success.",
            newSearchPath
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message
        });
    }
});


router.delete("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const deletedSearchPath = await searchPath.findByIdAndDelete(id);

        if (!deletedSearchPath) {
            return res.status(404).json({
                success: false,
                message: "Document not found."
            });
        }

        res.json({
            success: true,
            message: "Document deleted successfully.",
            deletedSearchPath
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete document",
            error: error.message
        });
    }
});



router.get("/", async (req, res) => {
    

    try {
        const products = await searchPath.find();

       

        res.json({
            success: true,
            message: "Success",
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Fail",
            error: error.message
        });
    }
});




module.exports = router;