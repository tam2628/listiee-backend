"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authorization = (req, res, next) => {
    const authorization_header = req.headers['authorization'];
    if (authorization_header === undefined) {
        return res.sendStatus(401);
    }
    const authorization_token = authorization_header.split(' ')[1];
    console.log(authorization_token);
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(authorization_token, "shhh");
        console.log(payload);
        res.locals.userId = payload.userId;
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(401);
    }
    next();
};
exports.authorization = authorization;
