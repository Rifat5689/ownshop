import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Store from "./store.model.js";

const createStore = asyncHandler(async (req, res) => {
    const { name, slug } = req.body;
    
    if (!name || !slug) {
        throw new ApiError(400, "Store name and slug are required");
    }
    
    const existingStore = await Store.findOne({ slug });
    if (existingStore) {
        throw new ApiError(409, "Store with this slug already exists");
    }
    
    const store = await Store.create({ name, slug });
    
    return res.status(201).json(
        new ApiResponse(201, store, "Store created successfully")
    );
});

const getStores = asyncHandler(async (req, res) => {
    const stores = await Store.find();
    return res.status(200).json(
        new ApiResponse(200, stores, "Stores fetched successfully")
    );
});

export { createStore, getStores };
