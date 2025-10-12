import { Hono } from 'hono';

import { formatDate, getNextWeek } from './date';
import type { Env } from './env';
import type { MultiSelectActionPayload } from './types';

const app = new Hono<{ Bindings: Env }>();

app.post('/slack/callback', async (ctx) => {
  const { actions } = (await ctx.req.json()) as MultiSelectActionPayload;

  const values = actions[0].selected_options.map((opt) => opt.value);

  const baseUrl = new URL(ctx.env.SCRIPT_URL);
  const params = new URLSearchParams();

  for (const value of values) {
    params.append('days', value);
  }

  params.append('user', ctx.env.EMPLOYEE_ID);

  const response = await fetch(ctx.env.SCRIPT_URL, {
    method: 'GET',
  });
});

async function aaa(env: Env) {
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
              value: inc.toString(),
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
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) => {
    await aaa(env);
  },
};
