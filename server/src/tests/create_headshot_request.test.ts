
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, headshotRequestsTable } from '../db/schema';
import { type CreateHeadshotRequestInput } from '../schema';
import { createHeadshotRequest } from '../handlers/create_headshot_request';
import { eq } from 'drizzle-orm';

// Create test user first
const createTestUser = async () => {
  const result = await db.insert(usersTable)
    .values({
      email: 'test@example.com',
      name: 'Test User'
    })
    .returning()
    .execute();
  return result[0];
};

describe('createHeadshotRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a headshot request', async () => {
    // Create prerequisite user
    const user = await createTestUser();

    const testInput: CreateHeadshotRequestInput = {
      user_id: user.id,
      original_image_url: 'https://example.com/image.jpg',
      background_style: 'office',
      attire: 'business_casual',
      expression: 'professional'
    };

    const result = await createHeadshotRequest(testInput);

    // Basic field validation
    expect(result.user_id).toEqual(user.id);
    expect(result.original_image_url).toEqual('https://example.com/image.jpg');
    expect(result.background_style).toEqual('office');
    expect(result.attire).toEqual('business_casual');
    expect(result.expression).toEqual('professional');
    expect(result.status).toEqual('pending');
    expect(result.generated_image_url).toBeNull();
    expect(result.error_message).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save headshot request to database', async () => {
    // Create prerequisite user
    const user = await createTestUser();

    const testInput: CreateHeadshotRequestInput = {
      user_id: user.id,
      original_image_url: 'https://example.com/photo.png',
      background_style: 'studio',
      attire: 'formal',
      expression: 'serious'
    };

    const result = await createHeadshotRequest(testInput);

    // Query database to verify
    const requests = await db.select()
      .from(headshotRequestsTable)
      .where(eq(headshotRequestsTable.id, result.id))
      .execute();

    expect(requests).toHaveLength(1);
    expect(requests[0].user_id).toEqual(user.id);
    expect(requests[0].original_image_url).toEqual('https://example.com/photo.png');
    expect(requests[0].background_style).toEqual('studio');
    expect(requests[0].attire).toEqual('formal');
    expect(requests[0].expression).toEqual('serious');
    expect(requests[0].status).toEqual('pending');
    expect(requests[0].created_at).toBeInstanceOf(Date);
    expect(requests[0].updated_at).toBeInstanceOf(Date);
  });

  it('should fail when user does not exist', async () => {
    const testInput: CreateHeadshotRequestInput = {
      user_id: 999, // Non-existent user ID
      original_image_url: 'https://example.com/image.jpg',
      background_style: 'plain',
      attire: 'casual',
      expression: 'friendly'
    };

    await expect(createHeadshotRequest(testInput))
      .rejects.toThrow(/violates foreign key constraint/i);
  });
});
