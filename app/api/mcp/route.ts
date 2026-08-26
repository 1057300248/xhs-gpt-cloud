import { z } from 'zod';
import { createMcpHandler } from 'mcp-handler';
import { searchXhs } from '@/lib/xhs';

export const runtime = 'nodejs';

const handler = createMcpHandler((server) => {
  server.registerTool(
    'xhs_search',
    {
      title: 'Search Xiaohongshu',
      description: 'Search Xiaohongshu notes by keyword for research and analysis.',
      inputSchema: z.object({
        keyword: z.string().min(1).describe('Search keyword, e.g. 琶洲酒店'),
        sort: z
          .enum(['general', 'time_descending', 'popularity_descending'])
          .optional(),
        noteType: z.enum(['all', 'normal', 'video']).optional(),
        page: z.number().int().min(1).max(20).optional(),
      }),
    },
    async ({ keyword, sort, noteType, page }) => {
      try {
        const result = await searchXhs(keyword, { sort, noteType, page });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result) }],
        };
      } catch (e) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: e instanceof Error ? e.message : String(e),
            },
          ],
        };
      }
    },
  );

  server.registerTool(
    'xhs_status',
    {
      title: 'Xiaohongshu connector status',
      description: 'Check whether the Xiaohongshu cloud connector is configured.',
      inputSchema: z.object({}),
    },
    async () => ({
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            configured: Boolean(process.env.XHS_COOKIE),
            provider: 'xhs-web-http-cookie',
          }),
        },
      ],
    }),
  );
});

export { handler as GET, handler as POST };
