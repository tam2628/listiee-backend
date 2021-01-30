import express from "express";
import cors from "cors"
import bodyParser from "body-parser";
import userController from "./controllers/users";
import postController from "./controllers/posts";
import cookieParser from "cookie-parser";
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors({
    origin: process.env.FRONTEND || "http://localhost:3000",
    credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(cookieParser());

app.get("/", (req, res) => {
    res.send(JSON.stringify({
        msg: "Hello World!!! ⚡",
    }))
});

app.use("/user", userController);
app.use("/post", postController);

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT} ⚡`);
});