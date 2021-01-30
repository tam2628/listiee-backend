"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const middlewares_1 = require("./../middlewares");
const node_fetch_1 = __importDefault(require("node-fetch"));
const models_1 = require("../models");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
// router.use(authorization);
aws_sdk_1.default.config.update({
    accessKeyId: process.env.AMZ_ACCESS_KEY,
    secretAccessKey: process.env.AMZ_SECRET_KEY,
});
const s3 = new aws_sdk_1.default.S3();
const storage = multer_s3_1.default({
    s3: s3,
    bucket: "smaib",
    contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => cb(null, Date.now().toString()),
    acl: "public-read"
});
const upload = multer_1.default({ storage: storage });
router.post("/create", ...[middlewares_1.authorization, upload.any()], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postText, latitude, longitude } = req.body;
    const pictureURL = req.files[0].location;
    const psCallURL = `http://api.positionstack.com/v1/reverse?access_key=${process.env.PS_KEY}&query=${latitude},${longitude}&output=json`;
    let country;
    try {
        const resp = yield node_fetch_1.default(psCallURL);
        const data = yield resp.json();
        country = data.data[0].country;
        const postData = {
            id: uuid_1.v4(),
            postText,
            picture: pictureURL,
            latitude,
            longitude,
            userId: res.locals.userId,
            country,
        };
        yield models_1.Post.create(postData);
        const users = yield models_1.User.findAll({
            where: {
                id: postData.userId
            }
        });
        return res.status(201).send(JSON.stringify(Object.assign(Object.assign({}, postData), { User: users[0] })));
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(400);
    }
}));
router.get("/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield models_1.Post.findAll({
        limit: 20,
        include: [models_1.User]
    });
    res.send(posts);
}));
exports.default = router;
