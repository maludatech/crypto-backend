import express from "express";
import dotenv from "dotenv";
import { connectToDb } from "./utils/database.js";

dotenv.config();

const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3500;

connectToDb();

app.listen(PORT, (req, res) => {
  console.log(`listening on port ${PORT}`);
});
