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
const express_1 = __importDefault(require("express"));
const models_1 = require("../models");
const router = express_1.default.Router();
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const SECRET = process.env.SECRET || "shhh";
const generateToken = (obj, secret, exp) => {
    //if no expiry is given then the expiry is 1 hour
    const newObj = Object.assign(Object.assign({}, obj), { exp: exp === undefined ? Math.floor(Date.now() / 1000) + (60 * 60) : exp });
    return jsonwebtoken_1.default.sign(newObj, secret);
};
;
// Route to handle the user sign up
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName } = req.body;
    // check if the fields are empty
    if (email.length === 0 && password.length === 0)
        return res.status(400).send(JSON.stringify({
            msg: "Please fill all the fields.",
        }));
    //: check if the email is correctly formed or not
    const users = yield models_1.User.findAll({
        where: { email }
    });
    if (users.length !== 0) {
        return res.sendStatus(409);
    }
    //put the data into the database and return an access token and an http only refresh token cookie
    const hashed_password = crypto_1.default.createHash('sha256').update(password).digest('hex');
    let user = {
        id: uuid_1.v4(),
        email,
        password: hashed_password,
        firstName,
        lastName
    };
    try {
        yield models_1.User.create(user);
    }
    catch (err) {
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
    res.status(201).send(JSON.stringify(Object.assign({ accessToken }, userData)));
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const users = yield models_1.User.findAll({
        where: {
            email: email
        }
    });
    if (users.length === 0) {
        return res.sendStatus(404);
    }
    const user = users[0];
    let payload = {
        userId: user.id,
    };
    const hashed_password = crypto_1.default.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashed_password) {
        return res.status(400).send(JSON.stringify({
            msg: "Please check your username and password."
        }));
    }
    const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
    };
    const accessToken = generateToken(payload, SECRET);
    const refreshTokenExp = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30); // one month duration
    const refreshToken = generateToken(payload, SECRET, refreshTokenExp);
    res.cookie("rftc", refreshToken, { httpOnly: true, sameSite: 'none' });
    res.status(200).send(JSON.stringify(Object.assign({ accessToken }, userData)));
}));
router.get('/refresh', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies["rftc"];
    if (refreshToken === undefined) {
        return res.sendStatus(400);
    }
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(refreshToken, SECRET);
    }
    catch (err) {
        console.log(err);
        res.cookie(SECRET, {}, { maxAge: Math.floor(Date.now() / 1000) - 1000 });
        return res.sendStatus(400);
    }
    console.log(payload);
    const users = yield models_1.User.findAll({
        where: {
            id: payload.userId
        }
    });
    const accessToken = generateToken(payload, SECRET);
    const user = users[0];
    const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
    };
    res.status(200).send(JSON.stringify(Object.assign({ accessToken }, userData)));
}));
router.post("/logout", (req, res) => {
    res.cookie("rftc", {}, {
        httpOnly: true,
        maxAge: Date.now() - 100,
    });
    res.send();
});
exports.default = router;
