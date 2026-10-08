import { uploadOnCloudflare } from "../services/cloudflare.service.js";

const uploadImages = async (files) => {
    if (!files || !files.length) return [];
    
    const uploadPromises = files.map(file => 
        uploadOnCloudflare(file.path, file.originalname)
    );
    
    const results = await Promise.all(uploadPromises);
    // Filter out any failed uploads
    return results.filter(result => result !== null);
};

export default uploadImages;
