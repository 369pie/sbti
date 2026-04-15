# WTFTI 品牌迁移记录

更新时间：2026-04-14

## 迁移结论

- 平台主品牌：WTFTI
- 主域名：wtfti.com
- 线上 canonical / 分享 origin：`https://www.wtfti.com`
- 旧域名：`sbtinb.com` / `www.sbtinb.com` 仅保留跳转职责
- `SBTI` 定位：WTFTI 平台内的经典基线宇宙 / 核心测试名，不再作为整站总品牌

## 本轮统一规则

- 所有站级品牌文案统一使用 `WTFTI`
- 所有用户可见域名、分享图域名、运营文档链接统一使用 `wtfti.com`
- `SBTI` 仅保留在以下场景：
  - 经典宇宙名称与结果页文案
  - 已有 SEO 关键词和经典测试说明文章
  - 不影响用户感知的内部命名，如仓库目录、历史命名空间、旧 storage key
- `sbtinb.com` 仅允许出现在跳转配置、历史兼容说明或迁移记录中

## 2026-04-14 已完成更新

- 首页 metadata、FAQ schema 与站级 social image 统一到 WTFTI 品牌
- about、guide、types、contact、privacy、terms 等站级页面完成品牌切换
- CP / Daily / Drunk / Squad 等玩法页标题尾缀统一为 WTFTI
- result 页与各主题页 breadcrumb 根节点统一为 WTFTI
- Flower / Love / Work / XPTI / SoulTI 中可见的首页或经典版入口文案已去除整站级 `SBTI` 叫法
- 以下文档中的旧域名已替换为 `wtfti.com`：
  - `docs/wtfti-product-roadmap.md`
  - `docs/xiaohongshu-universe-posts.md`
  - `docs/share-card-redesign-proposal.md`
  - `docs/herti-competitive-strategy.md`

## 当前有意保留的旧痕迹

- `vercel.json` 中的 `sbtinb.com` / `www.sbtinb.com` host 规则：用于将旧域名永久跳转到新域名
- 代码里的部分 `sbti` 内部命名：例如仓库目录、局部变量、sessionStorage key、历史 slug
- 经典测试相关内容中的 `SBTI`：用于表达核心宇宙本身，而不是平台品牌

## 后续建议

- 若继续推进 Phase 0，可逐步把各宇宙结果分享卡文件名、导出标题和分享文案中的平台层 `SBTI` 替换为 WTFTI
- 若未来保留 `SBTI` 作为经典宇宙品牌，建议文案统一写法为“经典 SBTI”或“WTFTI 经典人格测试”