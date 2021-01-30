import jwt from 'jsonwebtoken';
import express from 'express';

const authorization = (req:express.Request, res:express.Response, next:any) => {
    const authorization_header = req.headers['authorization'];

    if(authorization_header === undefined){
        return res.sendStatus(401);
    }
    const authorization_token = (authorization_header as string).split(' ')[1];
    console.log(authorization_token);
    let payload;
    try{
        payload = jwt.verify(authorization_token, "shhh");
        console.log(payload);
        res.locals.userId = (payload as any).userId;
    }catch(err:any){
        console.log(err);
        return res.sendStatus(401);
    }
    next();
}

export {
    authorization
};