import type { Context } from 'hono';

import type { Env } from '../types';

export default async function (c: Context<{ Bindings: Env }>) {
  const { text, user_id } = await c.req.parseBody();
  if (typeof user_id !== 'string' || typeof text !== 'string') {
    return c.notFound();
  }

  const employeeId = text.trim();
  const registeredId = await c.env.USER_MAP.get(user_id);

  if (registeredId) {
  }
}
