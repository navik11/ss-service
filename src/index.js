import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config({path: "./.env"});

const port = process.env.PORT || 3200;

const start = async () => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}!!!`);
  });
};

start();