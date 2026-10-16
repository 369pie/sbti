# P0 Web Push 环境变量

生成（本地一次）：

```bash
npx web-push generate-vapid-keys
```

写入 Vercel（Preview + Production）与本地 `.env.local`（勿提交私钥）：

| 变量 | 说明 |
|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | 浏览器订阅用（可公开） |
| `VAPID_PRIVATE_KEY` | 服务端签名（密钥） |
| `VAPID_SUBJECT` | 如 `mailto:hello@wtfti.com` |
| `PUSH_CRON_SECRET` | 可选；未设则回退 `CRON_SECRET` / letter cron secrets |

本地已写入 `.env.local` 的一套仅供预览；上线前请重新生成并只放在 Vercel Dashboard。
