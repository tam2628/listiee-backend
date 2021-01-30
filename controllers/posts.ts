require("dotenv").config();
import express from "express";
import aws from 'aws-sdk';
import multer from "multer";
import multers3 from "multer-s3";
import { authorization } from "./../middlewares";
import fetch from "node-fetch";
import { Post, User } from "../models";
import { v4 as uuidV4 } from "uuid";
import cors from 'cors';

const router = express.Router();

// router.use(authorization);

aws.config.update({
    accessKeyId: process.env.AMZ_ACCESS_KEY,
    secretAccessKey: process.env.AMZ_SECRET_KEY,
});

const s3 = new aws.S3();

const storage = multers3({
    s3: s3,
    bucket: "smaib",
    contentType: multers3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => cb(null, Date.now().toString()),
    acl: "public-read"
});

const upload = multer({ storage: storage });

router.post(
    "/create",
    ...[
        authorization,
        cors({
        origin: process.env.FRONTEND || "http://localhost:3000",
        credentials: true,
        }),
        upload.any()
    ],
    async (req, res) => {
    const {postText, latitude, longitude} = req.body;
    const pictureURL = ((req.files as unknown as File[])[0] as any).location;

    const psCallURL = `http://api.positionstack.com/v1/reverse?access_key=${process.env.PS_KEY}&query=${latitude},${longitude}&output=json`;

    let country:string;
    try{
        const resp = await fetch(psCallURL);
        const data = await resp.json();
        country = (data as any).data[0].country;
        const postData = {
            id: uuidV4(),
            postText,
            picture: pictureURL,
            latitude,
            longitude,
            userId: res.locals.userId,
            country,
        }

        await Post.create(postData);
        const users = await User.findAll({
            where: {
                id: postData.userId
            }
        });
        return res.status(201).send(JSON.stringify({
            ...postData,
            User: users[0]
        }));
    }catch(err:any){
        console.log(err);
        return res.sendStatus(400);
    }
});

router.get("/all", async (req, res) => {
    const posts = await Post.findAll({
        limit: 20,
        include: [User]
    });

    res.send(posts);
});

export default router;