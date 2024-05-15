const express = require('express');
const router = express.Router();
const csv = require('csv-parser');
const { productDetailsModel } = require("../module/productDetails.model");
const { Readable } = require('stream');
const { v4: uuidv4 } = require('uuid');


async function generateUniqueIds(count) {
  const ids = [];

  for (let i = 0; i < count; i++) {
      const id = uuidv4();
       ids.push(id);
  }
  return ids;
}

router.post('/', async (req, res) => {
  try {
    const { csvData, vendorId } = req.body;

    if (!csvData || !Array.isArray(csvData) || csvData?.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty CSV data provided.' });
    }

    const data = [
      {
        productAt: "Us Warehouse",
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString(),
        complete: true
      },
      {
        productAt: "Medorna Office",
        date: "",
        time: "",
        complete: false
      },
      {
        productAt: "IGO Office",
        date: "",
        time: "",
        complete: false
      },
      {
        productAt: "Amazon Office",
        date: "",
        time: "",
        complete: false
      },
    ];

    const generateUniqueProductName = async (productName, count = 1) => {
 
      const nameParts = productName.split('-');
      const lastPart = nameParts[nameParts.length - 1];
      const existingCount = isNaN(parseInt(lastPart)) ? null : parseInt(lastPart);
    
      const currentCount = existingCount !== null ? existingCount : count;
      const name = existingCount !== null ? nameParts.slice(0, -1).join('-') : productName;
    
      const existingProduct = await productDetailsModel.findOne({ product: productName }).sort({ createdDate: -1 });
    
      if (existingProduct) {
  
        const newCount = currentCount + 1;
        const newProductName = `${name}-${newCount}`;

        return generateUniqueProductName(newProductName, newCount);
      } else {
        return productName;
      }
    };


    const products = [];

    const generateUniqueProductNameLocal = async (productName, count = 1) => {
      const nameParts = productName.split('-');
      const lastPart = nameParts[nameParts.length - 1];
      const existingCount = isNaN(parseInt(lastPart)) ? null : parseInt(lastPart);
  
      const currentCount = existingCount !== null ? existingCount : count;
    
      const name = existingCount !== null ? nameParts.slice(0, -1).join('-') : productName;
    
      const existingProduct = products.find(product => product.product === productName);
    
      if (existingProduct) {

        const newCount = currentCount + 1;
        const newProductName = `${name}-${newCount}`;

        return generateUniqueProductNameLocal(newProductName, products, newCount);
      } else {
        return productName;
      }
    };


    async function generateQRCode() {
      let qrCode = []
    
      for(let i=0; i<row.inventory; i++){
      
       let sData = {
        tracking:data
       }
      
        qrCode.push(sData)
      }
      return qrCode
    }


    for (const row of csvData) {

      const uniqueProductName = await generateUniqueProductName(row.product);
      const uniqueLocalProductName = await generateUniqueProductNameLocal(uniqueProductName);
      const uniqueProductNameFinalize = await generateUniqueProductName(uniqueLocalProductName);
      const modifiedProductName = uniqueProductNameFinalize.replace(/\s+/g, '-').toLowerCase();

      const trackingInfo = data.map(entry => ({ ...entry }));

      const product = {
        product: uniqueProductNameFinalize, 
        createdDate: new Date().toISOString().slice(0, 10),
        createdTime: new Date().toLocaleTimeString(),
        price: row.price,
        tracking: trackingInfo,
        sku: row.sku,
        branchNumber: row.branchNumber,
        countryOfOrigin: row.countryOfOrigin,
        inventory: row.inventory,
        description: row.description,
        tag: row.tag,
        brand: row.brand,
        category: row.category,
        salesPrice: row.salesPrice,
        image: [],
        id: modifiedProductName,
        vendorId:vendorId,
        qr:await generateQRCode()
      };

      products.push(product);
    }

    

    await productDetailsModel.insertMany(products);
   
    res.status(200).json({ message: 'CSV data uploaded successfully.', products });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;