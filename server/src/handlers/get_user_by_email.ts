
import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type User } from '../schema';

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const results = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .execute();

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Get user by email failed:', error);
    throw error;
  }
};
