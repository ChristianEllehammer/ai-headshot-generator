
import { type GetHeadshotByIdInput, type HeadshotWithUser } from '../schema';

export declare function getHeadshotById(input: GetHeadshotByIdInput): Promise<HeadshotWithUser | null>;
