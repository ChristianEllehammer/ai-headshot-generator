
import { db } from '../db';
import { headshotRequestsTable } from '../db/schema';
import { type UpdateHeadshotRequestInput, type HeadshotRequest } from '../schema';
import { eq } from 'drizzle-orm';

export const updateHeadshotRequest = async (input: UpdateHeadshotRequestInput): Promise<HeadshotRequest> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof headshotRequestsTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    if (input.generated_image_url !== undefined) {
      updateData.generated_image_url = input.generated_image_url;
    }

    if (input.error_message !== undefined) {
      updateData.error_message = input.error_message;
    }

    // Update the headshot request
    const result = await db.update(headshotRequestsTable)
      .set(updateData)
      .where(eq(headshotRequestsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Headshot request with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Headshot request update failed:', error);
    throw error;
  }
};
