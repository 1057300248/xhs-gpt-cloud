import { z } from 'zod';
import { createMcpHandler } from 'mcp-handler';
import { searchXhs } from '@/lib/xhs';

export const runtime = 'nodejs';

const handler = createMcpHandler(
  (server) => {
    server.tool(
      'xhs_search',
      'Search Xiaohongshu notes by keyword for research and analysis.',
      {
        keyword: z.string().min(1).describe('Search keyword, e.g. 琶洲酒店'),
        sort: z.enum(['general', 'time_descending', 'popularity_descending']).optional(),
        noteType: z.enum(['all', 'normal', 'video']).optional(),
        page: z.number().int().min(1).max(20).optional(),
      },
      async ({ keyword, sort, noteType, page }) => {
        try {
          const result = await searchXhs(keyword, { sort, noteType, page });
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        } catch (e) {
          return {
            isError: true,
            content: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }],
          };
        }
      },
    );

    server.tool(
      'xhs_status',
      'Check whether the Xiaohongshu cloud connector is configured.',
      {},
      async () => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              configured: Boolean(process.env.XHS_COOKIE),
              provider: 'xhs-web-http-cookie',
            }),
          },
        ],
      }),
    );
  },
  {},
  { basePath: '/api' },
);

export { handler as GET, handler as POST, handler as DELETE };
