const { Router } = require("express");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require("express");
const { v4: uuidv4 } = require('uuid');
const { productDetailsModel } = require("../module/productDetails.model");
const { searchPath } = require("../module/searchPath.model");
const { authenticateToken } = require("../middleware/authenticateToken");

const router = Router();
const dotenv = require('dotenv');


router.use(authenticateToken);

dotenv.config();

const apiKey = process.env.GOOGLE_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const embedingUrl =  process.env.EMBEDING_URL
const hfToken =   process.env.HFTOKEN





// async function generateEmbedding(text){
//     // console.log("testttt",text)
//     try {
//         const response = await axios.post(
//             embedingUrl,
//             { inputs: text },
//             { headers: { Authorization: `Bearer ${hfToken}` } }
//         );

//         if (response.status !== 200) {
//          console.log("response",response)
//         }

//          return response.data;
//     } catch(error) {
//         console.log("error", error);
//     }
// }


async function generateEmbedding(text) {


    try {
        const response = await fetch(embedingUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${hfToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: text })
        });

        if (!response.ok) {
            console.log("response", response);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.log("error", error);
    }
}



router.post('/ai-two', async (req, res) => {

    const {query} = req.body
    console.log("query",query)
        results = await productDetailsModel.aggregate([
            {
                $vectorSearch:{
                    "index":"AiSearch",
                    "queryVector": await generateEmbedding(query),
                    "path":"plot_embedding_hf",
                    "numCandidates":100,
                    "limit":5
    
                }
            },
            {$project:{
                _id:1,
                product:1,
           
    branchNumber:1,
    sku: 1,
    countryOfOrigin: 1,
    inventory: 1,
    description: 1,
    tag: 1,
    price: 1,
    brand: 1,
    category: 1,
    salesPrice: 1,
    image: [
      
    ]
    
            },}
           ])
    
           res.json({ results });
    });


    router.post('/ai-test', async (req, res) => {

        const {query} = req.body
            results = await searchPath.aggregate([
                {
                    $vectorSearch:{
                        "index":"PathSearch",
                        "queryVector": await generateEmbedding(query),
                        "path":"plot_embedding_hf",
                        "numCandidates":100,
                        "limit":1
        
                    }
                },
                {$project:{
                    _id:1,
                   name:1,
                   path:1,
                   description:1
        
                },}
               ])
        
               res.json({ results });




            //   if(results){
            //     try {
                  
                    
            
            
            //         const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            //         const prompt = query;
            //         const result = await model.generateContent(`${results} from this data "${query}", just fill the details inside the data in proper stracture and return the stractue as same, donot add any other single words.`);
            //         const response = await result.response;
            //         const text = response.text();
             

                  
            //         res.json({generatedContent: text, yes:"success"});
            //     } catch (error) {
            //         console.error("Error generating or fetching content:", error);
            //         res.status(500).json({ error: 'An error occurred while generating or fetching content' });
            //     }
            //   }
  
            



        });
    





router.post('/', async (req, res) => {
    const {query} = req.body
  
    try {
       
        const products = await productDetailsModel.find({}, { image: 0, plot_embedding_hf: 0 });


        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = query;
        const result = await model.generateContent(``);
        const response = await result.response;
        const text = response.text();
 

      
        res.json({generatedContent: text });
    } catch (error) {
        console.error("Error generating or fetching content:", error);
        res.status(500).json({ error: 'An error occurred while generating or fetching content' });
    }
});

module.exports = router;