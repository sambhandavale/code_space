import express from "express";
import { globalSearch } from "../../Controllers/Search/searchController";

const router = express.Router();

router.get("/", globalSearch);

export default router;
