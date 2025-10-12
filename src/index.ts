import { Hono } from 'hono';
import { formatDate, getNextWeek } from './date';
import type { Env } from './env';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post('/slack/callback', (ctx) => {
  return ctx.json({ foo: 'bar' });
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

  const response = await fetch('https://slack.com/api/chat.postMessage', {
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
