import { compare, hash } from "bcrypt";
import { ICreate, IUpdate } from "../interfaces/UsersInterfaces";
import { UsersRepository } from "../repositories/UserRepository";
import { v4 as uuid } from "uuid";
import { s3 } from "../config/aws";
import { sign } from "jsonwebtoken";

class UsersServices{
    private usersRepository: UsersRepository

    constructor(){
        this.usersRepository = new UsersRepository()
    }
    async create( { name, email, password } : ICreate){
        const findUser = await this.usersRepository.findUserByEmail(email)

        if (findUser) {
            throw new Error('User exists')
        }

        const hashPassword = await hash(password, 10)

        const create = await this.usersRepository.create({
            name, 
            email, 
            password: hashPassword,
        });
        return create;
    }
    async update({ name, oldPassword, newPassword, avatar_url }: IUpdate ){
        const uploadImage = avatar_url?.buffer;
        const uploadS3 = await s3 
        .upload({
            Bucket: 'semana-heroi1',
            Key: `${uuid()}-${avatar_url?.originalname}`,
            // ACL: 'public-read',
            Body: uploadImage,
        })
        .promise();
        console.log('url imagem =>', uploadS3.Location);
    }
    async auth(email: string, password: string){
        const findUser = await this.usersRepository.findUserByEmail(email);
        if (!findUser) {
            throw new Error('User or password invalid.');
        }
        const passwordMatch = compare(password, findUser.password);
        if (!passwordMatch) {
            throw new Error('User or password invalid.');
        }

        let secretKey: string | undefined = process.env.ACCESS_KEY_TOKEN
        if (!secretKey) {
            throw new Error('There is no token key');
        }

        const token = sign({email}, secretKey, {
            subject: findUser.id,
            expiresIn: 60 * 15,
        });
        return {
            token,
            user: {
                name: findUser.name,
                email: findUser.email,
            },
        }
    }
}

export { UsersServices };