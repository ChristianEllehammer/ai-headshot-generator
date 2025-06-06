
import { type User } from '../schema';

export declare function getUserByEmail(email: string): Promise<User | null>;
