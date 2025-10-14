import { Hono } from 'hono';

import { formatDate, getNextWeek } from './date';
import type { Env } from './env';
import type { MultiSelectActionPayload } from './types';

const app = new Hono<{ Bindings: Env }>();

app.post('/slack/callback', async (c) => {
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

  const response = await fetch(baseUrl);

  if (!response.ok) {
    return c.notFound();
  }

  return c.json({
    channel: c.env.SLACK_USER,
    text: '✅ WFO sheet successfully synchronized!',
    emoji: true,
  });
});

async function sendForm(env: Env) {
  const referenceDate = new Date();
  const nextWeek = getNextWeek(referenceDate);

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📅 WFO Day Synchronizer',
        emoji: true,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Please select WFO days for next week',
      },
      accessory: {
        type: 'multi_static_select',
        placeholder: {
          type: 'plain_text',
          text: 'Select days',
        },
        options: [
          ...[...Array(5).keys()].map((inc) => {
            const targetDate = new Date(nextWeek);
            targetDate.setDate(targetDate.getDate() + inc);

            return {
              text: {
                type: 'plain_text',
                text: formatDate(targetDate),
              },
              value: `${targetDate.getFullYear()}-${targetDate.getMonth() + 1}-${targetDate.getDate()}`,
            };
          }),
        ],
        action_id: 'foo',
      },
    },
  ];

  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: env.SLACK_USER,
      blocks,
    }),
  });
}

export default {
  fetch: app.fetch,
  scheduled: async (
    _: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) => {
    ctx.waitUntil(sendForm(env));
  },
};
