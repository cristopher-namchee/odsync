import { Env, Hono, ExecutionContext } from 'hono';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post('/slack/webhook', async (c) => {
  
});

export default {
  fetch: app.fetch,
  scheduled: (_controller: ScheduledController, _env: Env, ctx: ExecutionContext) => {
    const sendReminderMessage = async () => {

    };

    ctx.waitUntil(sendReminderMessage());
  }
}
