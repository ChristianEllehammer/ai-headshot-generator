
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { getUserByEmail } from '../handlers/get_user_by_email';

describe('getUserByEmail', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return user when email exists', async () => {
    // Create test user
    const testUser = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();

    const result = await getUserByEmail('test@example.com');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testUser[0].id);
    expect(result!.email).toEqual('test@example.com');
    expect(result!.name).toEqual('Test User');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when email does not exist', async () => {
    const result = await getUserByEmail('nonexistent@example.com');

    expect(result).toBeNull();
  });

  it('should be case sensitive for email lookup', async () => {
    // Create test user with lowercase email
    await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .execute();

    const result = await getUserByEmail('TEST@EXAMPLE.COM');

    expect(result).toBeNull();
  });

  it('should handle multiple users with different emails', async () => {
    // Create multiple test users
    await db.insert(usersTable)
      .values([
        { email: 'user1@example.com', name: 'User One' },
        { email: 'user2@example.com', name: 'User Two' },
        { email: 'user3@example.com', name: 'User Three' }
      ])
      .execute();

    const result = await getUserByEmail('user2@example.com');

    expect(result).not.toBeNull();
    expect(result!.email).toEqual('user2@example.com');
    expect(result!.name).toEqual('User Two');
  });
});
