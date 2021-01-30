"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const users_1 = __importDefault(require("./controllers/users"));
const posts_1 = __importDefault(require("./controllers/posts"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("dotenv").config();
const app = express_1.default();
const PORT = 9000;
app.use(cors_1.default({
    origin: process.env.FRONTEND || "http://localhost:3000",
    credentials: true,
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
app.use(cookie_parser_1.default());
app.get("/", (req, res) => {
    res.send(JSON.stringify({
        msg: "Hello World!!! ⚡",
    }));
});
app.use("/user", users_1.default);
app.use("/post", posts_1.default);
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT} ⚡`);
});
