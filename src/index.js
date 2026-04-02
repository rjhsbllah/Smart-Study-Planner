import express from "express";
import routes from "./routes/landingpage.routes.js";
import appMiddlewares from "./middlewares/index.js";
const app = express();
const PORT = 5000;

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(appMiddlewares);
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
