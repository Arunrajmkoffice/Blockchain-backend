const { Router } = require("express");
const { v4: uuidv4 } = require('uuid');
const { productDetailsModel } = require("../module/productDetails.model");
const { productSetModel } = require("../module/productSet.model");
const { userModel } = require("../module/user.model");
const authenticateToken = require("../middleware/authenticateToken");
const axios = require('axios');
const router = Router();
router.use(authenticateToken);
const { uploadImage } = require("./uploadImage.route");
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

async function generateUniqueIds(count) {
  const ids = [];
  for (let i = 0; i < count; i++) {
      const id = uuidv4();
      ids.push(id);
  }
  return ids;
}

const crypto = require("crypto");


function generateImageName(imageData) {
  const hash = crypto.createHash("sha1").update(imageData).digest("hex");
  return hash.slice(0, 10); 
}

router.post("/", async (req, res) => {


  const {
    product,
    price,
    sku,
    branchNumber,
    countryOfOrigin,
    inventory,
    description,
    tag,
    brand,
    category,
    salesPrice,
    image,
    vendorId
  } = req.body;

  if (
    !product ||
    !countryOfOrigin ||
    !description ||
    !brand ||
    !sku ||
    !inventory ||
    !vendorId
  ) {
    return res.status(400).json({
      success: false,
      message: "Fill the mandatory fields."
    });
  }


  try {

    let data = [

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


    
    const uniqueProduct = await generateUniqueProductName(product);
    const modifiedProductName = uniqueProduct.replace(/\s+/g, '-').toLowerCase();


   
    const imageLinks = [];

    for (const img of image) {
      const imageUrl = await uploadImage(img.imageData);
      imageLinks.push({ imageData: imageUrl, id: img.id });
    }
  
let vText = `${uniqueProduct} ${description} ${brand} ${category} ${tag}`
    


async function generateQRCode() {
  let qrCode = []

  for(let i=0; i<inventory; i++){
  
   let sData = {
    // qrCode:uuidv4(),
    tracking:data
   }
  
    qrCode.push(sData)
  }
  return qrCode
}

if(uniqueProduct===product){

  const newProduct = new productDetailsModel({
    product: uniqueProduct,
    createdDate: new Date().toISOString().slice(0, 10),
    createdTime: new Date().toLocaleTimeString(),
    price: price,
    tracking: data,
    sku: sku,
    branchNumber: branchNumber,
    countryOfOrigin: countryOfOrigin,
    inventory: inventory,
    description: description,
    tag: tag,
    brand: brand,
    category: category,
    salesPrice: salesPrice,
    image: imageLinks,
    id:modifiedProductName,
    plot_embedding_hf:await generateEmbedding(vText),
    vendorId:vendorId,
    qr:await generateQRCode()
  });


  const newUniqueProduct = new productSetModel({
    product: uniqueProduct,
    createdDate: new Date().toISOString().slice(0, 10),
    createdTime: new Date().toLocaleTimeString(),
    price: price,
    tracking: data,
    sku: sku,
    branchNumber: branchNumber,
    countryOfOrigin: countryOfOrigin,
    inventory: inventory,
    description: description,
    tag: tag,
    brand: brand,
    category: category,
    salesPrice: salesPrice,
    image: imageLinks,
    id:modifiedProductName,
    plot_embedding_hf:await generateEmbedding(vText),
    vendorId:vendorId,
    qr:await generateQRCode()
  });
  
  
  await newUniqueProduct.save();
  await newProduct.save();

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: newProduct,
  });

}

if(uniqueProduct!==product){
  const newProduct = new productDetailsModel({
    product: uniqueProduct,
    createdDate: new Date().toISOString().slice(0, 10),
    createdTime: new Date().toLocaleTimeString(),
    price: price,
    tracking: data,
    sku: sku,
    branchNumber: branchNumber,
    countryOfOrigin: countryOfOrigin,
    inventory: inventory,
    description: description,
    tag: tag,
    brand: brand,
    category: category,
    salesPrice: salesPrice,
    image: imageLinks,
    id:modifiedProductName,
    plot_embedding_hf:await generateEmbedding(vText),
    vendorId:vendorId,
    qr:await generateQRCode()
  });

  await newProduct.save();

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: newProduct,
  });
}
   
    
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/", async (req, res) => {
  const {vendorId,role} = req.query

  try {
    let query = {};

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;


    const { sortBy, sortOrder } = req.query;
    let sortOption = {};
    if (sortBy && sortOrder) {
      sortOption[sortBy] = sortOrder === "asc" ? 1 : -1;
    }


    const { search } = req.query;
    if (search) {
      const searchFields = [
        "brand",
        "branchNumber",
        "category",
        "product",
        "countryOfOrigin",
      ];
      const searchConditions = searchFields.map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
      query.$or = searchConditions;
    }


    const { brand, category, countryOfOrigin } = req.query;
    if (brand) query.brand = brand;
    if (category) query.category = category;
    if (countryOfOrigin) query.countryOfOrigin = countryOfOrigin;


    const totalCount = await productDetailsModel.countDocuments(query);
    if(role===undefined){
      res.json({
        success: false,
        message: "Role is missing",
      });
     }
  

     if(role){
    if((vendorId==="all" && role==="Medorna Office")||role==="IGO Office" || role==="Amazon Office"){
      let products = await productDetailsModel
      .find({...query})
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ products, totalCount:products.length });
     }

     if((role==="Medorna Office" && vendorId!=="all") || role==="Us Warehouse" ){
      let products = await productDetailsModel
      .find({ ...query, vendorId: vendorId })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
      res.json({ products, totalCount:products.length });
    }
   }

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.delete("/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const result = await productDetailsModel.findByIdAndDelete(productId);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
    } else {
      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    // const product = await productDetailsModel.findOne({ qr: { $elemMatch: { $eq: productId } } });

    const product = await productDetailsModel.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
    } else {
      res.json({
        product,
      });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.patch("/:id", async (req, res) => {
  const qrId = req.params.id;
  const { role, vendorId } = req.body;
 
  try {

    const product = await productDetailsModel.findOne({ "qr._id": qrId },  {"plot_embedding_hf": 0 });
  
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }


    const qrIndex = product.qr.findIndex(qr => qr._id.toString() === qrId);
    const matchingTrackIndex = product.qr[qrIndex].tracking.findIndex(
      (track) => track.productAt === role
    );

    if (matchingTrackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "No matching tracking entry found",
      });
    }

    const matchingTrack = product.qr[qrIndex].tracking[matchingTrackIndex];

    if (matchingTrack.complete) {
      const singleTrack = await productDetailsModel.findOne(
        { "qr._id": qrId },
        { "qr.$": 1 } 
      );
      return res.json({
        success: false,
        message: "Already updated",
        product:product,
        track:singleTrack.qr[0].tracking
      });
    }

    const currentDate = new Date().toISOString().slice(0, 10);
    const currentTime = new Date().toLocaleTimeString();


    matchingTrack.complete = true;
    matchingTrack.date = currentDate;
    matchingTrack.time = currentTime;

    if (role === "IGO Office") {
      const amazonOfficeIndex = product.qr[qrIndex].tracking.findIndex(
        (track) => track.productAt === "Amazon Office"
      );
      if (amazonOfficeIndex !== -1) {
        const amazonOfficeTrack = product.qr[qrIndex].tracking[amazonOfficeIndex];
        amazonOfficeTrack.complete = true;
        amazonOfficeTrack.date = currentDate;
        amazonOfficeTrack.time = currentTime;
      }
    }

    for (let i = matchingTrackIndex - 1; i >= 0; i--) {
      const track = product.qr[qrIndex].tracking[i];
      if (!track.complete) {
        track.complete = true;
        track.date = currentDate;
        track.time = currentTime;
      } else {

        break;
      }
    }


    await product.save();
    const singleTrack = await productDetailsModel.findOne(
      { "qr._id": qrId }, // Query to find the document with the matching QR ID
      { "qr.$": 1 } // Projection to return only the matched element from the qr array
    );
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: product,
      track:singleTrack.qr[0].tracking
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.patch("/edit/:id", async (req, res) => {
  const productId = req.params.id;
  const updatedProductDetails = req.body;

  const generateUniqueProductName = async (productName, count = 1) => {
    // Split the product name into name and count (if it already has a count)
    const nameParts = productName.split('-');
    const lastPart = nameParts[nameParts.length - 1];
    const existingCount = isNaN(parseInt(lastPart)) ? null : parseInt(lastPart);
  
    // If the product name already has a count, use that count
    // Otherwise, use the provided count (default is 1)
    const currentCount = existingCount !== null ? existingCount : count;
  
    // Get the name by removing the last part if it's a count
    const name = existingCount !== null ? nameParts.slice(0, -1).join('-') : productName;
  
    const existingProduct = await productDetailsModel.findOne({ product: productName }).sort({ createdDate: -1 });
  
    if (existingProduct) {
      // Increment the count and generate a new product name
      const newCount = currentCount + 1;
      const newProductName = `${name}-${newCount}`;
      // Recursively check again with the new product name
      return generateUniqueProductName(newProductName, newCount);
    } else {
      return productName;
    }
  };

  const uniqueProductName = await generateUniqueProductName(updatedProductDetails.product);
  const modifiedProductName = uniqueProductName.replace(/\s+/g, '-').toLowerCase();

  if (Object.keys(updatedProductDetails).length === 0) {
    return res.status(400).json({
      ststus: false,
      message: "At least one field is required to edit the data",
    });
  }

  try {
    const updatedProduct = await productDetailsModel.findByIdAndUpdate(
      productId,
      { ...updatedProductDetails, product: uniqueProductName, id: modifiedProductName },
      { new: true }
    );
    res.json({ ststus: true, message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




router.get("/unique/one", async (req, res) => {
  const { vendorId, role } = req.query
  try {

if(role==="Medorna Office" || role==="Us Warehouse" ){
  const uniqueProduct = await productSetModel.find({vendorId: vendorId})
  res.json({success:true, message: "Success", uniqueProduct });
}



  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});














module.exports = router;
