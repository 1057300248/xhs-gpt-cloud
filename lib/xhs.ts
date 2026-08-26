export type Sort = 'general' | 'time_descending' | 'popularity_descending';
export type NoteType = 'all' | 'normal' | 'video';

const XHS_BASE = 'https://edith.xiaohongshu.com';
const XHS_WEB = 'https://www.xiaohongshu.com';

const headers = (cookie: string) => ({
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  Origin: XHS_WEB,
  Referer: `${XHS_WEB}/`,
  'Content-Type': 'application/json',
  Cookie: cookie,
});

function searchId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i += 1) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function toNum(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  if (value.includes('万')) return Math.round(parseFloat(value) * 10000) || 0;
  return parseInt(value.replace(/,/g, ''), 10) || 0;
}

export async function searchXhs(
  keyword: string,
  opts: { sort?: Sort; noteType?: NoteType; page?: number; pageSize?: number } = {},
) {
  const cookie = process.env.XHS_COOKIE;
  if (!cookie) throw new Error('XHS_COOKIE is not configured on the server.');

  const sortMap: Record<Sort, number> = {
    general: 0,
    time_descending: 1,
    popularity_descending: 2,
  };
  const typeMap: Record<NoteType, number> = { all: 0, normal: 1, video: 2 };

  const body = {
    keyword,
    page: opts.page ?? 1,
    page_size: Math.min(opts.pageSize ?? 20, 50),
    sort: sortMap[opts.sort ?? 'general'],
    note_type: typeMap[opts.noteType ?? 'all'],
    search_id: searchId(),
  };

  const res = await fetch(`${XHS_BASE}/api/sns/web/v1/search/notes`, {
    method: 'POST',
    headers: headers(cookie),
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(
      `XHS request failed: ${res.status} ${res.statusText}. Cookie may be expired or the request may be rate-limited.`,
    );
  }

  const json: any = await res.json();
  if (!json?.data?.items) {
    throw new Error(`XHS returned no search items (code: ${json?.code ?? 'unknown'}).`);
  }

  const notes = json.data.items
    .filter((x: any) => x?.note_card)
    .map((item: any) => {
      const c = item.note_card;
      const u = c.user ?? {};
      const i = c.interact_info ?? {};
      const id = c.note_id ?? item.id ?? '';
      return {
        id,
        title: c.display_title ?? c.title ?? '',
        description: c.desc ?? '',
        type: c.type === 'video' ? 'video' : 'normal',
        author: {
          id: u.user_id ?? u.userid ?? '',
          nickname: u.nickname ?? u.nick_name ?? '',
          avatar: u.avatar ?? '',
        },
        likes: toNum(i.liked_count),
        collects: toNum(i.collected_count),
        comments: toNum(i.comment_count),
        shares: toNum(i.share_count),
        cover: c.cover?.url_default ?? c.cover?.url_pre ?? '',
        images: (c.image_list ?? []).map((img: any) => img.url_default ?? img.url ?? ''),
        tags: (c.tag_list ?? []).map((tag: any) => tag.name ?? '').filter(Boolean),
        createdAt: c.time ? new Date(c.time * 1000).toISOString() : '',
        url: id ? `${XHS_WEB}/explore/${id}` : '',
      };
    });

  return {
    keyword,
    notes,
    hasMore: Boolean(json.data.has_more),
    cursor: json.data.cursor ?? '',
  };
}
