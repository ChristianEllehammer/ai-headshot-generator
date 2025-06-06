
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

const testInput: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user', async () => {
    const result = await createUser(testInput);

    expect(result.email).toEqual('test@example.com');
    expect(result.name).toEqual('Test User');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].name).toEqual('Test User');
    expect(users[0].created_at).toBeInstanceOf(Date);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for duplicate email', async () => {
    await createUser(testInput);

    await expect(createUser(testInput)).rejects.toThrow(/duplicate key value/i);
  });

  it('should handle user creation with different valid inputs', async () => {
    const secondInput: CreateUserInput = {
      email: 'another@example.com',
      name: 'Another User'
    };

    const firstUser = await createUser(testInput);
    const secondUser = await createUser(secondInput);

    expect(firstUser.id).not.toEqual(secondUser.id);
    expect(firstUser.email).toEqual('test@example.com');
    expect(secondUser.email).toEqual('another@example.com');
    expect(firstUser.name).toEqual('Test User');
    expect(secondUser.name).toEqual('Another User');
  });
});
