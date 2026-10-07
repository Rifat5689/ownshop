import { Router } from "express";
import { createStore, getStores } from "./store.controller.js";

const storeRoutes = Router();

storeRoutes.route("/")
    .post(createStore)
    .get(getStores);

export { storeRoutes };
