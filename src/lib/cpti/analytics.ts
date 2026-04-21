import { enqueueProductEvent } from '@/lib/analytics/product-events';

type CptiEvent =
  | 'cpti_pair_code_created'
  | 'cpti_pair_code_copied'
  | 'cpti_pair_code_shared'
  | 'cpti_match_started'
  | 'cpti_match_completed'
  | 'cpti_profile_saved'
  | 'cpti_leaderboard_viewed'
  | 'cpti_collection_viewed'
  | 'cpti_join_page_opened'
  // Sprint 1 (2026-04-19) — viral funnel instrumentation
  | 'cpti_pair_panel_viewed'
  | 'cpti_pair_link_generated'
  | 'cpti_pair_code_auto_generated'
  | 'cpti_pair_poster_downloaded'
  | 'cpti_gallery_missing_clicked'
  | 'cpti_gallery_milestone_reached'
  | 'cpti_relationship_seo_landed'
  | 'cpti_theory_viewed'
  // Sprint 2 (2026-04-19) — scenario long-tail SEO
  | 'cpti_scenario_landed'
  // Sprint 2 polish (2026-04-19) — gallery progress poster
  | 'cpti_gallery_progress_shared'
  // Sprint 2 polish (2026-04-19) — E7 lite prediction widget
  | 'cpti_prediction_viewed'
  | 'cpti_prediction_clicked'
  // ── v2.0 (2026-04-21) — Codex / His POV / Cosign / Subtle / Pricing ──
  | 'cpti_codex_viewed'              // /cpti/me/codex/ 档案夹打开
  | 'cpti_codex_record_added'        // 一段关系归档（result page mount）
  | 'cpti_codex_record_renamed'      // 用户给关系起昵称/备注
  | 'cpti_codex_record_deleted'      // 删除一段
  | 'cpti_codex_milestone_reached'   // 5 / 12 / 25 段
  | 'cpti_his_pov_viewed'            // 男性反向报告页打开
  | 'cpti_his_pov_cta_clicked'       // 反向报告底部 CTA → 测自己
  | 'cpti_subtle_share_toggled'      // 暗讽友好分享卡切换
  | 'cpti_pricing_viewed'            // /cpti/pricing/ 打开
  | 'cpti_pricing_sku_clicked'       // 阶梯页某档点击
  | 'cpti_codex_pass_viewed'         // 年卡 CTA 曝光
  | 'cpti_codex_pass_clicked'        // 年卡 CTA 点击
  | 'cpti_codex_pass_purchased'      // 年卡支付成功
  | 'cpti_cosign_invited'            // 邀请对方双签
  | 'cpti_cosign_completed'          // 双方解锁
  | 'cpti_squad_created'             // Squad 组建（v2.0 W4 占位）
  | 'cpti_squad_joined'              // Squad 加入
  | 'cpti_squad_purchased'           // Squad pack 支付
  | 'cpti_squad_paywall_view'        // Squad 付费墙曝光
  | 'cpti_squad_share_link_copied'   // Squad 组合链接复制
  | 'cpti_seasonal_skin_applied'     // 季节皮肤应用到分享卡
  | 'cpti_invite_loopback_queued'    // 收件方打开邀请结果，已回写给发送方
  | 'cpti_invite_loopback_viewed';   // 发送方在 Codex 看见回流通知

export function trackCptiEvent(event: CptiEvent, properties?: Record<string, unknown>) {
  // Try Vercel Analytics first (client-side only)
  void import('@vercel/analytics').then(({ track }) => {
    track(
      event,
      properties as Record<string, string | number | boolean | null | undefined> | undefined,
    );
  }).catch(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[analytics] ${event}`, properties);
    }
  });
  try {
    enqueueProductEvent('cpti', event, {
      slug: typeof properties?.personality === 'string' ? properties.personality : undefined,
      tier: typeof properties?.tier === 'string' ? properties.tier : undefined,
      step: classifyCptiStep(event),
      ok: typeof properties?.ok === 'boolean' ? properties.ok : undefined,
      value: typeof properties?.collected === 'number'
        ? properties.collected
        : typeof properties?.milestone === 'number'
        ? properties.milestone
        : undefined,
      props: {
        method: typeof properties?.method === 'string' ? properties.method : undefined,
        target: typeof properties?.target === 'string' ? properties.target : undefined,
        rarity: typeof properties?.rarity === 'string' ? properties.rarity : undefined,
        relationship: typeof properties?.relationship === 'string' ? properties.relationship : undefined,
      },
    });
  } catch {
    // never block UX for analytics
  }
}

function classifyCptiStep(event: string): string | undefined {
  if (event.includes('pair_panel_viewed')) return 'pair_view';
  if (event.includes('pair_link_generated') || event.includes('pair_code_auto_generated')) return 'pair_generate';
  if (event.includes('pair_code_copied') || event.includes('pair_poster_downloaded')) return 'pair_share';
  if (event.includes('match_started')) return 'match_entry';
  if (event.includes('match_completed')) return 'match_finish';
  if (event.includes('profile_saved')) return 'profile_saved';
  if (event.includes('gallery_progress_shared')) return 'progress_share';
  if (event.includes('gallery_milestone_reached')) return 'milestone';
  if (event.includes('gallery_missing_clicked')) return 'gallery_explore';
  if (event.includes('relationship_seo_landed') || event.includes('scenario_landed')) return 'seo_landing';
  if (event.includes('prediction_viewed')) return 'prediction_view';
  if (event.includes('prediction_clicked')) return 'prediction_click';
  // v2.0
  if (event.includes('codex_viewed')) return 'codex_view';
  if (event.includes('codex_record_added')) return 'codex_record_add';
  if (event.includes('codex_record_renamed')) return 'codex_record_rename';
  if (event.includes('codex_record_deleted')) return 'codex_record_delete';
  if (event.includes('codex_milestone_reached')) return 'codex_milestone';
  if (event.includes('his_pov_viewed')) return 'his_pov_view';
  if (event.includes('his_pov_cta_clicked')) return 'his_pov_cta';
  if (event.includes('subtle_share_toggled')) return 'subtle_share';
  if (event.includes('pricing_viewed')) return 'pricing_view';
  if (event.includes('pricing_sku_clicked')) return 'pricing_click';
  if (event.includes('codex_pass_viewed')) return 'codex_pass_view';
  if (event.includes('codex_pass_clicked')) return 'codex_pass_click';
  if (event.includes('codex_pass_purchased')) return 'codex_pass_purchase';
  if (event.includes('cosign_invited')) return 'cosign_invite';
  if (event.includes('cosign_completed')) return 'cosign_complete';
  if (event.includes('squad_created')) return 'squad_create';
  if (event.includes('squad_joined')) return 'squad_join';
  if (event.includes('squad_purchased')) return 'squad_purchase';
  if (event.includes('squad_paywall_view')) return 'squad_paywall';
  if (event.includes('squad_share_link_copied')) return 'squad_share';
  if (event.includes('seasonal_skin_applied')) return 'seasonal_skin';
  if (event.includes('invite_loopback_queued')) return 'invite_loopback_queue';
  if (event.includes('invite_loopback_viewed')) return 'invite_loopback_view';
  if (event.includes('theory_viewed')) return 'theory_view';
  if (event.includes('leaderboard_viewed')) return 'leaderboard_view';
  if (event.includes('collection_viewed')) return 'collection_view';
  if (event.includes('join_page_opened')) return 'join_view';
  return undefined;
}

// TODO: Implement server-side analytics (Vercel Analytics is client-side only)
export function trackCptiServerEvent(event: CptiEvent, properties?: Record<string, unknown>) {
  console.log(`[analytics:server] ${event}`, properties);
}
