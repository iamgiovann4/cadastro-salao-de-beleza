import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

interface IPayload{
    sub: string;
}

class AuthMiddleware{
    auth(request: Request, response: Response, next: NextFunction){
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return response.status(401).json({
                code: 'token.missing',
                message: 'Token missing',
            });
        }
        //Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imdpb3Zhbm5hQGdtYWlsLmNvbSIsImlhdCI6MTY4NTUwNTUyNiwiZXhwIjoxNjg1NTA2NDI2LCJzdWIiOiJmZmE5YWFjOC00MmExLTQ2MGUtYmE0NS1mNzk5YjdmNjUyYTMifQ.7yCfJx0XisgqN1nVJqjL3XWijeUuXyNLF-9VW1w0nck

        // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imdpb3Zhbm5hQGdtYWlsLmNvbSIsImlhdCI6MTY4NTY3NjM2OCwiZXhwIjoxNjg1Njc3MjY4LCJzdWIiOiJmZmE5YWFjOC00MmExLTQ2MGUtYmE0NS1mNzk5YjdmNjUyYTMifQ.3o3QOLd6-eAra7X9ARK3zYonOK9kqHmgyTuVMalriqQ
        const [, token] = authHeader.split(' ');
        let secretKey: string | undefined = process.env.ACCESS_KEY_TOKEN
        if (!secretKey) {
            throw new Error('There is no token key');
        }
        try {
            const {sub} = verify(token, secretKey) as IPayload;
            request.user_id = sub;
            return next();
        } catch (error) {
            return response.status(401).json({
                code: 'token.expired',
                message: 'Token expired.',
            });
        }
    }
}

export { AuthMiddleware };