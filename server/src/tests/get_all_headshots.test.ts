
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, headshotRequestsTable } from '../db/schema';
import { getAllHeadshots } from '../handlers/get_all_headshots';

describe('getAllHeadshots', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no headshots exist', async () => {
    const result = await getAllHeadshots();
    expect(result).toEqual([]);
  });

  it('should return all headshots with user data', async () => {
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
    await db.insert(headshotRequestsTable)
      .values({
        user_id: user.id,
        original_image_url: 'https://example.com/original.jpg',
        background_style: 'office',
        attire: 'business_casual',
        expression: 'professional',
        status: 'completed',
        generated_image_url: 'https://example.com/generated.jpg'
      })
      .execute();

    const result = await getAllHeadshots();

    expect(result).toHaveLength(1);
    
    const headshot = result[0];
    expect(headshot.id).toBeDefined();
    expect(headshot.user_id).toEqual(user.id);
    expect(headshot.original_image_url).toEqual('https://example.com/original.jpg');
    expect(headshot.background_style).toEqual('office');
    expect(headshot.attire).toEqual('business_casual');
    expect(headshot.expression).toEqual('professional');
    expect(headshot.status).toEqual('completed');
    expect(headshot.generated_image_url).toEqual('https://example.com/generated.jpg');
    expect(headshot.error_message).toBeNull();
    expect(headshot.created_at).toBeInstanceOf(Date);
    expect(headshot.updated_at).toBeInstanceOf(Date);

    // Check user data is included
    expect(headshot.user).toBeDefined();
    expect(headshot.user.id).toEqual(user.id);
    expect(headshot.user.email).toEqual('test@example.com');
    expect(headshot.user.name).toEqual('Test User');
    expect(headshot.user.created_at).toBeInstanceOf(Date);
    expect(headshot.user.updated_at).toBeInstanceOf(Date);
  });

  it('should return multiple headshots from different users', async () => {
    // Create first user and headshot
    const user1Result = await db.insert(usersTable)
      .values({
        email: 'user1@example.com',
        name: 'User One'
      })
      .returning()
      .execute();

    const user1 = user1Result[0];

    await db.insert(headshotRequestsTable)
      .values({
        user_id: user1.id,
        original_image_url: 'https://example.com/user1.jpg',
        background_style: 'plain',
        attire: 'casual',
        expression: 'smiling',
        status: 'pending'
      })
      .execute();

    // Create second user and headshot
    const user2Result = await db.insert(usersTable)
      .values({
        email: 'user2@example.com',
        name: 'User Two'
      })
      .returning()
      .execute();

    const user2 = user2Result[0];

    await db.insert(headshotRequestsTable)
      .values({
        user_id: user2.id,
        original_image_url: 'https://example.com/user2.jpg',
        background_style: 'studio',
        attire: 'formal',
        expression: 'serious',
        status: 'failed',
        error_message: 'Processing error'
      })
      .execute();

    const result = await getAllHeadshots();

    expect(result).toHaveLength(2);

    // Check that both headshots are returned with correct user data
    const headshotIds = result.map(h => h.user_id).sort();
    expect(headshotIds).toEqual([user1.id, user2.id].sort());

    const user1Headshot = result.find(h => h.user_id === user1.id);
    const user2Headshot = result.find(h => h.user_id === user2.id);

    expect(user1Headshot?.user.name).toEqual('User One');
    expect(user1Headshot?.background_style).toEqual('plain');
    expect(user1Headshot?.status).toEqual('pending');

    expect(user2Headshot?.user.name).toEqual('User Two');
    expect(user2Headshot?.background_style).toEqual('studio');
    expect(user2Headshot?.status).toEqual('failed');
    expect(user2Headshot?.error_message).toEqual('Processing error');
  });
});
