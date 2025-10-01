export async function generateEnvironmentTables(
  environments: string[],
  kv: KVNamespace,
) {
  const reserver = await Promise.all(
    environments.map(async (env) => {
      const user = await kv.get(env);
      if (!user) {
        return {
          type: 'rich_text',
          elements: [
            {
              type: 'rich_text_section',
              elements: [
                {
                  type: 'text',
                  text: '-',
                },
              ],
            },
          ],
        };
      }

      const meta = JSON.parse(user);

      return {
        type: 'rich_text',
        elements: [
          {
            type: 'rich_text_section',
            elements: [
              {
                type: 'text',
                text: `<@U${meta.id}>`,
              },
            ],
          },
        ],
      };
    }),
  );

  const reservedSince = await Promise.all(
    environments.map(async (env) => {
      const user = await kv.get(env);
      if (!user) {
        return {
          type: 'rich_text',
          elements: [
            {
              type: 'rich_text_section',
              elements: [
                {
                  type: 'text',
                  text: '-',
                },
              ],
            },
          ],
        };
      }

      const meta = JSON.parse(user);

      return {
        type: 'rich_text',
        elements: [
          {
            type: 'rich_text_section',
            elements: [
              {
                type: 'text',
                text: new Date(meta.since).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
              },
            ],
          },
        ],
      };
    }),
  );

  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Below are the list of available GLChat development environments.',
        },
      },
      {
        type: 'table',
        rows: [
          [
            {
              type: 'rich_text',
              elements: [],
            },
            ...environments.map((env) => ({
              type: 'rich_text',
              elements: [
                {
                  type: 'rich_text_section',
                  elements: [
                    {
                      type: 'text',
                      text: env,
                      style: {
                        bold: true,
                      },
                    },
                  ],
                },
              ],
            })),
          ],
          [
            {
              type: 'rich_text',
              elements: [
                {
                  type: 'rich_text_section',
                  elements: [
                    {
                      type: 'text',
                      text: 'Reserved By',
                      style: {
                        bold: true,
                      },
                    },
                  ],
                },
              ],
            },
            ...reserver,
          ],
          [
            {
              type: 'rich_text',
              elements: [
                {
                  type: 'rich_text_section',
                  elements: [
                    {
                      type: 'text',
                      text: 'Reserved Since',
                      style: {
                        bold: true,
                      },
                    },
                  ],
                },
              ],
            },
            ...reservedSince,
          ],
        ],
      },
    ],
  };
}
