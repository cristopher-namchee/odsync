import { Hono } from 'hono';

import handleRegister from './commands/register';
import handleUnregister from './commands/unregister';

import handleInteractivity from './interactivity';

import handleScheduledTask from './schedule';

import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

app.post('/commands/register', handleRegister);
app.post('/commands/unregister', handleUnregister);

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
