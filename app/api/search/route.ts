import { NextRequest } from 'next/server';
import { searchXhs, type NoteType, type Sort } from '@/lib/xhs';

export const runtime = 'nodejs';

const SORTS = new Set<Sort>(['general', 'time_descending', 'popularity_descending']);
const TYPES = new Set<NoteType>(['all', 'normal', 'video']);

export async function GET(req: NextRequest) {
  const expected = process.env.APP_API_KEY;
  if (expected && req.headers.get('authorization') !== `Bearer ${expected}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) return Response.json({ error: 'Missing q' }, { status: 400 });

  const requestedSort = req.nextUrl.searchParams.get('sort') as Sort | null;
  const requestedType = req.nextUrl.searchParams.get('type') as NoteType | null;
  const page = Math.max(1, Math.min(20, Number(req.nextUrl.searchParams.get('page') || 1) || 1));

  const sort: Sort = requestedSort && SORTS.has(requestedSort) ? requestedSort : 'general';
  const noteType: NoteType = requestedType && TYPES.has(requestedType) ? requestedType : 'all';

  try {
    const data = await searchXhs(q, { sort, noteType, page });
    return Response.json(data);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 502 },
    );
  }
}
