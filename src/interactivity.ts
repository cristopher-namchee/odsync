import type { Context } from 'hono';

import type { Env, MultiSelectActionPayload } from './types';

export default async function (c: Context<{ Bindings: Env }>) {
  const text = await c.req.text();
  const reqParams = new URLSearchParams(text);

  const rawPayload = reqParams.get('payload');
  if (!rawPayload) {
    return c.notFound();
  }

  const { actions } = JSON.parse(rawPayload) as MultiSelectActionPayload;

  const values = actions[0].selected_options.map((opt) => opt.value);

  const baseUrl = new URL(c.env.SCRIPT_URL);
  const params = new URLSearchParams();

  for (const value of values) {
    params.append('days', value);
  }

  params.append('user', c.env.EMPLOYEE_ID);
  baseUrl.search = params.toString();

  // TODO: Do something on failure
  c.executionCtx.waitUntil(fetch(baseUrl));

  return c.json({
    text: '✅ WFO sheet successfully synchronized!',
    emoji: true,
  });
}
