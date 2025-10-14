import { Hono } from 'hono';

import handleInteractivity from './interactivity';

import handleScheduledTask from './schedule';

import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

app.post('/interactivity', handleInteractivity);

export default {
  fetch: app.fetch,
  scheduled: async (
    _: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) => {
    ctx.waitUntil(handleScheduledTask(env));
  },
};
