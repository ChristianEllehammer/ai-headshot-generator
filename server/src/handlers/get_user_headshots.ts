
import { db } from '../db';
import { headshotRequestsTable, usersTable } from '../db/schema';
import { type GetUserHeadshotsInput, type HeadshotWithUser } from '../schema';
import { eq } from 'drizzle-orm';

export const getUserHeadshots = async (input: GetUserHeadshotsInput): Promise<HeadshotWithUser[]> => {
  try {
    const results = await db.select()
      .from(headshotRequestsTable)
      .innerJoin(usersTable, eq(headshotRequestsTable.user_id, usersTable.id))
      .where(eq(headshotRequestsTable.user_id, input.user_id))
      .execute();

    return results.map(result => ({
      id: result.headshot_requests.id,
      user_id: result.headshot_requests.user_id,
      original_image_url: result.headshot_requests.original_image_url,
      background_style: result.headshot_requests.background_style,
      attire: result.headshot_requests.attire,
      expression: result.headshot_requests.expression,
      status: result.headshot_requests.status,
      generated_image_url: result.headshot_requests.generated_image_url,
      error_message: result.headshot_requests.error_message,
      created_at: result.headshot_requests.created_at,
      updated_at: result.headshot_requests.updated_at,
      user: {
        id: result.users.id,
        email: result.users.email,
        name: result.users.name,
        created_at: result.users.created_at,
        updated_at: result.users.updated_at
      }
    }));
  } catch (error) {
    console.error('Get user headshots failed:', error);
    throw error;
  }
};
