
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, headshotRequestsTable } from '../db/schema';
import { type UpdateHeadshotRequestInput, type CreateUserInput } from '../schema';
import { updateHeadshotRequest } from '../handlers/update_headshot_request';
import { eq } from 'drizzle-orm';

// Test data
const testUser: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User'
};

const testHeadshotRequest = {
  user_id: 1,
  original_image_url: 'https://example.com/original.jpg',
  background_style: 'office' as const,
  attire: 'business_casual' as const,
  expression: 'professional' as const,
  status: 'pending' as const
};

describe('updateHeadshotRequest', () => {
  let userId: number;
  let headshotRequestId: number;

  beforeEach(async () => {
    await createDB();

    // Create test user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    userId = userResult[0].id;

    // Create test headshot request
    const headshotResult = await db.insert(headshotRequestsTable)
      .values({
        ...testHeadshotRequest,
        user_id: userId
      })
      .returning()
      .execute();

    headshotRequestId = headshotResult[0].id;
  });

  afterEach(resetDB);

  it('should update headshot request status', async () => {
    const updateInput: UpdateHeadshotRequestInput = {
      id: headshotRequestId,
      status: 'processing'
    };

    const result = await updateHeadshotRequest(updateInput);

    expect(result.id).toEqual(headshotRequestId);
    expect(result.status).toEqual('processing');
    expect(result.user_id).toEqual(userId);
    expect(result.original_image_url).toEqual(testHeadshotRequest.original_image_url);
    expect(result.background_style).toEqual(testHeadshotRequest.background_style);
    expect(result.attire).toEqual(testHeadshotRequest.attire);
    expect(result.expression).toEqual(testHeadshotRequest.expression);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update generated image URL', async () => {
    const updateInput: UpdateHeadshotRequestInput = {
      id: headshotRequestId,
      status: 'completed',
      generated_image_url: 'https://example.com/generated.jpg'
    };

    const result = await updateHeadshotRequest(updateInput);

    expect(result.status).toEqual('completed');
    expect(result.generated_image_url).toEqual('https://example.com/generated.jpg');
    expect(result.error_message).toBeNull();
  });

  it('should update error message on failure', async () => {
    const updateInput: UpdateHeadshotRequestInput = {
      id: headshotRequestId,
      status: 'failed',
      error_message: 'Image processing failed'
    };

    const result = await updateHeadshotRequest(updateInput);

    expect(result.status).toEqual('failed');
    expect(result.error_message).toEqual('Image processing failed');
    expect(result.generated_image_url).toBeNull();
  });

  it('should update multiple fields at once', async () => {
    const updateInput: UpdateHeadshotRequestInput = {
      id: headshotRequestId,
      status: 'completed',
      generated_image_url: 'https://example.com/final.jpg',
      error_message: null
    };

    const result = await updateHeadshotRequest(updateInput);

    expect(result.status).toEqual('completed');
    expect(result.generated_image_url).toEqual('https://example.com/final.jpg');
    expect(result.error_message).toBeNull();
  });

  it('should save changes to database', async () => {
    const updateInput: UpdateHeadshotRequestInput = {
      id: headshotRequestId,
      status: 'completed',
      generated_image_url: 'https://example.com/saved.jpg'
    };

    await updateHeadshotRequest(updateInput);

    // Verify changes were saved
    const savedRequest = await db.select()
      .from(headshotRequestsTable)
      .where(eq(headshotRequestsTable.id, headshotRequestId))
      .execute();

    expect(savedRequest).toHaveLength(1);
    expect(savedRequest[0].status).toEqual('completed');
    expect(savedRequest[0].generated_image_url).toEqual('https://example.com/saved.jpg');
    expect(savedRequest[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent headshot request', async () => {
    const updateInput: UpdateHeadshotRequestInput = {
      id: 99999,
      status: 'completed'
    };

    await expect(updateHeadshotRequest(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should update only updated_at when no other fields provided', async () => {
    const originalRequest = await db.select()
      .from(headshotRequestsTable)
      .where(eq(headshotRequestsTable.id, headshotRequestId))
      .execute();

    const updateInput: UpdateHeadshotRequestInput = {
      id: headshotRequestId
    };

    const result = await updateHeadshotRequest(updateInput);

    expect(result.status).toEqual(originalRequest[0].status);
    expect(result.generated_image_url).toEqual(originalRequest[0].generated_image_url);
    expect(result.error_message).toEqual(originalRequest[0].error_message);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalRequest[0].updated_at.getTime());
  });
});
