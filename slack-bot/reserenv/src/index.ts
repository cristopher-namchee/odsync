import { Hono } from 'hono';

import reservation from './commands/reservation';
import unreserve from './commands/unreserve';

import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

app.post('/commands/reserve', async (c) => {
  const { text, user_id } = await c.req.parseBody();
  if (!text || !user_id) {
    return c.notFound();
  }

  return c.text('OK');
});

app.post('/commands/unreserve', unreserve);
app.post('/commands/reservation', reservation);

export default app;
