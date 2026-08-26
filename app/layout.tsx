import './styles.css';

export const metadata = {
  title: 'XHS GPT Cloud',
  description: '小红书搜索 + ChatGPT MCP 云端连接器',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
