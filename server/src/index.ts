
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  createUserInputSchema, 
  createHeadshotRequestInputSchema, 
  updateHeadshotRequestInputSchema,
  getUserHeadshotsInputSchema,
  getHeadshotByIdInputSchema
} from './schema';
import { createUser } from './handlers/create_user';
import { getUserByEmail } from './handlers/get_user_by_email';
import { createHeadshotRequest } from './handlers/create_headshot_request';
import { getHeadshotById } from './handlers/get_headshot_by_id';
import { getUserHeadshots } from './handlers/get_user_headshots';
import { updateHeadshotRequest } from './handlers/update_headshot_request';
import { getAllHeadshots } from './handlers/get_all_headshots';
import { getPendingHeadshots } from './handlers/get_pending_headshots';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),

  getUserByEmail: publicProcedure
    .input(z.string().email())
    .query(({ input }) => getUserByEmail(input)),

  // Headshot requests
  createHeadshotRequest: publicProcedure
    .input(createHeadshotRequestInputSchema)
    .mutation(({ input }) => createHeadshotRequest(input)),

  getHeadshotById: publicProcedure
    .input(getHeadshotByIdInputSchema)
    .query(({ input }) => getHeadshotById(input)),

  getUserHeadshots: publicProcedure
    .input(getUserHeadshotsInputSchema)
    .query(({ input }) => getUserHeadshots(input)),

  updateHeadshotRequest: publicProcedure
    .input(updateHeadshotRequestInputSchema)
    .mutation(({ input }) => updateHeadshotRequest(input)),

  getAllHeadshots: publicProcedure
    .query(() => getAllHeadshots()),

  getPendingHeadshots: publicProcedure
    .query(() => getPendingHeadshots()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
