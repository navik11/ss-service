import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {

    static async hash(password) {
        const salt = randomBytes(8).toString('hex');
        const buffer = await scryptAsync(password, salt, 64);
        return `${buffer.toString('hex')}.${salt}`;
    }

    static async compare(password, hashedPassword) {
        const [hashed, salt] = hashedPassword.split('.');
        const buffer = await scryptAsync(password, salt, 64);
        return hashed === buffer.toString('hex');
    }
}