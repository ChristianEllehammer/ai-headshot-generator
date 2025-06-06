
import { db } from '../db';
import { headshotRequestsTable } from '../db/schema';
import { type CreateHeadshotRequestInput, type HeadshotRequest } from '../schema';

export const createHeadshotRequest = async (input: CreateHeadshotRequestInput): Promise<HeadshotRequest> => {
  try {
    // Insert headshot request record
    const result = await db.insert(headshotRequestsTable)
      .values({
        user_id: input.user_id,
        original_image_url: input.original_image_url,
        background_style: input.background_style,
        attire: input.attire,
        expression: input.expression,
        status: 'pending' // Default status
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Headshot request creation failed:', error);
    throw error;
  }
};
