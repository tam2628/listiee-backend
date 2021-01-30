import express from "express";
import { User } from "../models";
const router = express.Router();
import { v4 as uuidV4 } from "uuid";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
require("dotenv").config();

const SECRET = process.env.SECRET || "shhh";

const generateToken = (obj:any, secret: string, exp?:number) : any => {
    //if no expiry is given then the expiry is 1 hour
    const newObj = {
        ...obj,
        exp: exp === undefined ? Math.floor(Date.now() / 1000) + (60 * 60) : exp,
    };

    return jwt.sign(newObj, secret);
};

interface UserRes {
    accessToken: string;
    id: string;
    email: string;
    FirstName: string;
    lastName: string;
};

// Route to handle the user sign up
router.post("/signup", async (req, res) => {
    const {email, password, firstName, lastName} = req.body;

    // check if the fields are empty
    if(email.length === 0 && password.length === 0)
        return res.status(400).send(JSON.stringify({
            msg: "Please fill all the fields.",
        }));

    //: check if the email is correctly formed or not
    const users = await User.findAll({
        where: {email}
    });

    if(users.length !== 0){
        return res.sendStatus(409);
    }
    //put the data into the database and return an access token and an http only refresh token cookie
    const hashed_password = crypto.createHash('sha256').update(password).digest('hex');
    let user = {
        id: uuidV4(),
        email,
        password: hashed_password,
        firstName,
        lastName
    };
    try{
        await User.create(user)
    }
    catch(err:any){
        console.log(err);
        return res.sendStatus(500);
    }

    const payload = { id: user.id };
    const accessToken = generateToken(payload, SECRET);

    const refreshTokenExp = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30); // one month duration
    const refreshToken = generateToken(payload, SECRET, refreshTokenExp);

    const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
    };
    res.cookie("rftc", refreshToken, { httpOnly: true, sameSite: 'none' });
    res.status(201).send(JSON.stringify({
        accessToken,
        ...userData
    }));
});

router.post('/login', async (req, res) => {
    const { email , password } = req.body;
    const users = await User.findAll({
        where: {
            email: email
        }
    });

    if(users.length === 0){
        return res.sendStatus(404);
    }

    const user = users[0];
    let payload = {
        userId: (user as any).id,
    };

    const hashed_password = crypto.createHash('sha256').update(password).digest('hex');

    if((user as any).password !== hashed_password){
        return res.status(400).send(JSON.stringify({
            msg: "Please check your username and password."
        }));
    }


    const userData = {
        id: (user as any).id,
        email: (user as any).email,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName
    };

    const accessToken = generateToken(payload, SECRET);
    const refreshTokenExp = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30); // one month duration
    const refreshToken = generateToken(payload, SECRET, refreshTokenExp);
    res.cookie("rftc", refreshToken, { httpOnly: true, sameSite: 'none' });
    res.status(200).send(JSON.stringify({
        accessToken,
        ...userData
    }));
});

router.get('/refresh', async (req, res) => {
    const refreshToken = req.cookies["rftc"];
    if(refreshToken === undefined){
        return res.sendStatus(400);
    }
    let payload;
    try {
        payload = jwt.verify(refreshToken, SECRET);
    } catch(err:any) {
        console.log(err);
        res.cookie(SECRET, {}, { maxAge: Math.floor(Date.now() / 1000) - 1000 });
        return res.sendStatus(400);
    }
    console.log(payload);
    const users = await User.findAll({
        where: {
            id: (payload as any).userId
        }
    });
    const accessToken = generateToken(payload, SECRET);

    const user = users[0] as any;
    const userData = {
        id: (user as any).id,
        email: (user as any).email,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName
    };
    res.status(200).send(JSON.stringify({
        accessToken,
        ...userData
    }));
});

router.post("/logout", (req, res) => {
    res.cookie("rftc", {}, {
        httpOnly: true,
        maxAge: Date.now() - 100,
    });
    res.send();
})

export default router;