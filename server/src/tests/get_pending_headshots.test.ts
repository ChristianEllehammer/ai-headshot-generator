
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, headshotRequestsTable } from '../db/schema';
import { getPendingHeadshots } from '../handlers/get_pending_headshots';

describe('getPendingHeadshots', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no pending headshots exist', async () => {
    const result = await getPendingHeadshots();
    expect(result).toEqual([]);
  });

  it('should return only pending headshots', async () => {
    // Create a test user first
    const user = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();

    // Create headshots with different statuses
    await db.insert(headshotRequestsTable)
      .values([
        {
          user_id: user[0].id,
          original_image_url: 'https://example.com/image1.jpg',
          background_style: 'office',
          attire: 'business_casual',
          expression: 'professional',
          status: 'pending'
        },
        {
          user_id: user[0].id,
          original_image_url: 'https://example.com/image2.jpg',
          background_style: 'studio',
          attire: 'formal',
          expression: 'serious',
          status: 'processing'
        },
        {
          user_id: user[0].id,
          original_image_url: 'https://example.com/image3.jpg',
          background_style: 'plain',
          attire: 'casual',
          expression: 'smiling',
          status: 'pending'
        },
        {
          user_id: user[0].id,
          original_image_url: 'https://example.com/image4.jpg',
          background_style: 'outdoor',
          attire: 'smart_casual',
          expression: 'confident',
          status: 'completed'
        }
      ])
      .execute();

    const result = await getPendingHeadshots();

    // Should return only the 2 pending headshots
    expect(result).toHaveLength(2);
    
    // All returned headshots should have 'pending' status
    result.forEach(headshot => {
      expect(headshot.status).toBe('pending');
      expect(headshot.user_id).toBe(user[0].id);
      expect(headshot.id).toBeDefined();
      expect(headshot.created_at).toBeInstanceOf(Date);
      expect(headshot.updated_at).toBeInstanceOf(Date);
    });

    // Verify specific headshots are returned
    const originalUrls = result.map(h => h.original_image_url);
    expect(originalUrls).toContain('https://example.com/image1.jpg');
    expect(originalUrls).toContain('https://example.com/image3.jpg');
  });

  it('should return multiple pending headshots from different users', async () => {
    // Create two test users
    const users = await db.insert(usersTable)
      .values([
        { email: 'user1@example.com', name: 'User One' },
        { email: 'user2@example.com', name: 'User Two' }
      ])
      .returning()
      .execute();

    // Create pending headshots for both users
    await db.insert(headshotRequestsTable)
      .values([
        {
          user_id: users[0].id,
          original_image_url: 'https://example.com/user1-image.jpg',
          background_style: 'office',
          attire: 'business_casual',
          expression: 'professional',
          status: 'pending'
        },
        {
          user_id: users[1].id,
          original_image_url: 'https://example.com/user2-image.jpg',
          background_style: 'studio',
          attire: 'formal',
          expression: 'serious',
          status: 'pending'
        }
      ])
      .execute();

    const result = await getPendingHeadshots();

    expect(result).toHaveLength(2);
    
    const userIds = result.map(h => h.user_id);
    expect(userIds).toContain(users[0].id);
    expect(userIds).toContain(users[1].id);
    
    result.forEach(headshot => {
      expect(headshot.status).toBe('pending');
    });
  });
});
