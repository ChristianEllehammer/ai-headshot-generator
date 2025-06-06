
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, headshotRequestsTable } from '../db/schema';
import { type GetUserHeadshotsInput, type CreateUserInput, type CreateHeadshotRequestInput } from '../schema';
import { getUserHeadshots } from '../handlers/get_user_headshots';

// Test inputs
const testUser: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User'
};

const testHeadshotRequest: CreateHeadshotRequestInput = {
  user_id: 1, // Will be updated after user creation
  original_image_url: 'https://example.com/original.jpg',
  background_style: 'office',
  attire: 'business_casual',
  expression: 'professional'
};

describe('getUserHeadshots', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return headshots for a user', async () => {
    // Create user first
    const userResult = await db.insert(usersTable)
      .values({
        email: testUser.email,
        name: testUser.name
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create headshot request
    await db.insert(headshotRequestsTable)
      .values({
        ...testHeadshotRequest,
        user_id: userId
      })
      .execute();

    const input: GetUserHeadshotsInput = {
      user_id: userId
    };

    const result = await getUserHeadshots(input);

    expect(result).toHaveLength(1);
    
    const headshot = result[0];
    expect(headshot.user_id).toEqual(userId);
    expect(headshot.original_image_url).toEqual('https://example.com/original.jpg');
    expect(headshot.background_style).toEqual('office');
    expect(headshot.attire).toEqual('business_casual');
    expect(headshot.expression).toEqual('professional');
    expect(headshot.status).toEqual('pending');
    expect(headshot.generated_image_url).toBeNull();
    expect(headshot.error_message).toBeNull();
    expect(headshot.id).toBeDefined();
    expect(headshot.created_at).toBeInstanceOf(Date);
    expect(headshot.updated_at).toBeInstanceOf(Date);

    // Verify user data is included
    expect(headshot.user).toBeDefined();
    expect(headshot.user.id).toEqual(userId);
    expect(headshot.user.email).toEqual('test@example.com');
    expect(headshot.user.name).toEqual('Test User');
    expect(headshot.user.created_at).toBeInstanceOf(Date);
    expect(headshot.user.updated_at).toBeInstanceOf(Date);
  });

  it('should return multiple headshots for a user', async () => {
    // Create user first
    const userResult = await db.insert(usersTable)
      .values({
        email: testUser.email,
        name: testUser.name
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create multiple headshot requests
    await db.insert(headshotRequestsTable)
      .values([
        {
          ...testHeadshotRequest,
          user_id: userId,
          background_style: 'office'
        },
        {
          ...testHeadshotRequest,
          user_id: userId,
          background_style: 'studio',
          attire: 'formal'
        }
      ])
      .execute();

    const input: GetUserHeadshotsInput = {
      user_id: userId
    };

    const result = await getUserHeadshots(input);

    expect(result).toHaveLength(2);
    
    // Verify both headshots belong to the same user
    result.forEach(headshot => {
      expect(headshot.user_id).toEqual(userId);
      expect(headshot.user.id).toEqual(userId);
      expect(headshot.user.email).toEqual('test@example.com');
    });

    // Verify different background styles
    const backgroundStyles = result.map(h => h.background_style);
    expect(backgroundStyles).toContain('office');
    expect(backgroundStyles).toContain('studio');
  });

  it('should return empty array for user with no headshots', async () => {
    // Create user first
    const userResult = await db.insert(usersTable)
      .values({
        email: testUser.email,
        name: testUser.name
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    const input: GetUserHeadshotsInput = {
      user_id: userId
    };

    const result = await getUserHeadshots(input);

    expect(result).toHaveLength(0);
  });

  it('should return empty array for non-existent user', async () => {
    const input: GetUserHeadshotsInput = {
      user_id: 999 // Non-existent user ID
    };

    const result = await getUserHeadshots(input);

    expect(result).toHaveLength(0);
  });
});
