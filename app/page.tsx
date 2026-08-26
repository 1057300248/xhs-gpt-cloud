'use client';

import { useState } from 'react';

export default function Home() {
  const [q, setQ] = useState('琶洲酒店');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  async function run() {
    setLoading(true);
    setData(null);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&sort=popularity_descending`);
      setData(await r.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="eyebrow">XHS × GPT CLOUD</div>
        <h1>小红书搜索，直接接入 ChatGPT</h1>
        <p>云端搜索接口 + Remote MCP。网页可以直接搜，ChatGPT 也可以调用 <code>xhs_search</code>。</p>
      </section>

      <section className="panel">
        <div className="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            placeholder="输入关键词"
          />
          <button onClick={run} disabled={loading}>{loading ? '搜索中…' : '搜索小红书'}</button>
        </div>

        <div className="meta">
          <span>MCP Endpoint</span><code>/api/mcp</code>
          <span>Provider</span><code>Cookie / HTTP</code>
        </div>

        {data?.error && <div className="error">{data.error}</div>}
        {data?.notes && (
          <div className="grid">
            {data.notes.map((n: any) => (
              <article key={n.id}>
                <div className="title">{n.title || '无标题'}</div>
                <div className="author">{n.author?.nickname || '未知作者'}</div>
                <div className="stats">
                  <span>赞 {n.likes}</span><span>藏 {n.collects}</span><span>评 {n.comments}</span>
                </div>
                {n.url && <a href={n.url} target="_blank" rel="noreferrer">打开笔记 ↗</a>}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="how">
        <h2>接入 ChatGPT</h2>
        <p>部署后把 <code>https://你的域名/api/mcp</code> 添加为 ChatGPT 自定义 App / MCP 端点，然后扫描工具。</p>
        <p className="warn">注意：Cookie 只放在 Vercel 环境变量中，不要写入 GitHub。</p>
      </section>
    </main>
  );
}
