
import { db } from '../db';
import { headshotRequestsTable } from '../db/schema';
import { type HeadshotRequest } from '../schema';
import { eq } from 'drizzle-orm';

export const getPendingHeadshots = async (): Promise<HeadshotRequest[]> => {
  try {
    const results = await db.select()
      .from(headshotRequestsTable)
      .where(eq(headshotRequestsTable.status, 'pending'))
      .execute();

    return results;
  } catch (error) {
    console.error('Get pending headshots failed:', error);
    throw error;
  }
};
