import { Hono } from 'hono';
import type { Bindings } from './types';
import { generateEnvironmentTables } from './utils';

const ENVIRONMENTS = ['dev', 'dev2', 'dev3'];

const app = new Hono<{ Bindings: Bindings }>();

app.post('/commands/reserve', async (c) => {
  const { text, user_id } = await c.req.parseBody();
  if (!text || !user_id) {
    return c.notFound();
  }

  return c.text('OK');
});

app.post('/commands/unreserve', async (c) => {
  const { text, user_id } = await c.req.parseBody();
  if (!text || !user_id) {
    return c.notFound();
  }

  return c.text('OK');
});

app.post('commands/reservation', async (c) => {
  const { text } = await c.req.parseBody();

  let environment = '';
  if (typeof text === 'string') {
    const params = text.split(/\s+/);
    environment = params[0];
  }

  if (!environment) {
    const blockBody = await generateEnvironmentTables(ENVIRONMENTS, c.env.KV);

    await fetch(c.env.SLACK_WEBHOOK_URL, {
      body: JSON.stringify({
        block: blockBody,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    });
  }

  if (!ENVIRONMENTS.includes(environment)) {
    await fetch(c.env.SLACK_WEBHOOK_URL, {
      body: JSON.stringify({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: "The specified 'dev' environment doesn't exist!",
            },
          },
        ],
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return c.text('OK');
  }

  return c.text('OK');
});

export default app;
