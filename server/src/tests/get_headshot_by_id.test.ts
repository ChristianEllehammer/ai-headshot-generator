
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, headshotRequestsTable } from '../db/schema';
import { type GetHeadshotByIdInput } from '../schema';
import { getHeadshotById } from '../handlers/get_headshot_by_id';

describe('getHeadshotById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return headshot with user data when found', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();

    const user = userResult[0];

    // Create test headshot request
    const headshotResult = await db.insert(headshotRequestsTable)
      .values({
        user_id: user.id,
        original_image_url: 'https://example.com/original.jpg',
        background_style: 'office',
        attire: 'business_casual',
        expression: 'professional',
        status: 'completed',
        generated_image_url: 'https://example.com/generated.jpg'
      })
      .returning()
      .execute();

    const headshot = headshotResult[0];

    const input: GetHeadshotByIdInput = {
      id: headshot.id
    };

    const result = await getHeadshotById(input);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(headshot.id);
    expect(result!.user_id).toEqual(user.id);
    expect(result!.original_image_url).toEqual('https://example.com/original.jpg');
    expect(result!.background_style).toEqual('office');
    expect(result!.attire).toEqual('business_casual');
    expect(result!.expression).toEqual('professional');
    expect(result!.status).toEqual('completed');
    expect(result!.generated_image_url).toEqual('https://example.com/generated.jpg');
    expect(result!.error_message).toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);

    // Verify user data is included
    expect(result!.user).toBeDefined();
    expect(result!.user.id).toEqual(user.id);
    expect(result!.user.email).toEqual('test@example.com');
    expect(result!.user.name).toEqual('Test User');
    expect(result!.user.created_at).toBeInstanceOf(Date);
    expect(result!.user.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when headshot not found', async () => {
    const input: GetHeadshotByIdInput = {
      id: 999999
    };

    const result = await getHeadshotById(input);

    expect(result).toBeNull();
  });

  it('should handle headshot with null optional fields', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test2@example.com',
        name: 'Test User 2'
      })
      .returning()
      .execute();

    const user = userResult[0];

    // Create test headshot request with null optional fields
    const headshotResult = await db.insert(headshotRequestsTable)
      .values({
        user_id: user.id,
        original_image_url: 'https://example.com/original2.jpg',
        background_style: 'plain',
        attire: 'casual',
        expression: 'smiling',
        status: 'pending',
        generated_image_url: null,
        error_message: null
      })
      .returning()
      .execute();

    const headshot = headshotResult[0];

    const input: GetHeadshotByIdInput = {
      id: headshot.id
    };

    const result = await getHeadshotById(input);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(headshot.id);
    expect(result!.status).toEqual('pending');
    expect(result!.generated_image_url).toBeNull();
    expect(result!.error_message).toBeNull();
    expect(result!.user).toBeDefined();
    expect(result!.user.email).toEqual('test2@example.com');
  });
});
