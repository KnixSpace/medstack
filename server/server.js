import { app } from "./app.js";
import { connectDB } from "./db/database.js";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("🧠 Server started fantastically!");
    });
  })
  .catch((error) => {
    console.log("Error in starting server", error.message);
  });
