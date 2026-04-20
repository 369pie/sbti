'use client';

/**
 * Galaxy 埋点统一入口
 *
 * 落到 product_events 表（module = 'galaxy'），供 ops dashboard 聚合。
 * 所有事件命名以 `galaxy_` 前缀开头，便于 SQL 过滤。
 */

import {
  enqueueProductEvent,
  type ProductEventInput,
} from '@/lib/analytics/product-events';

export type GalaxyEventName =
  | 'galaxy_ritual_start'       // 仪式 BigBang 进入
  | 'galaxy_ritual_finish'      // 主测 + soul 全部答完
  | 'galaxy_s_axis_start'       // 点击"召唤我的异能者"
  | 'galaxy_s_axis_skip'        // 点击"暂不召唤"
  | 'galaxy_s_axis_complete'    // 12 题打分完成
  | 'galaxy_result_create'      // 结果落地生成 resultId
  | 'galaxy_result_view'        // 结果页曝光
  | 'galaxy_share_card_open'    // 打开大分享卡
  | 'galaxy_share_card_download'// 大分享卡下载/保存
  | 'galaxy_shadow_unlock_cta'  // 结果页点"召唤异能者" CTA（旧进入口）
  | 'galaxy_retest_click'       // 月相复测入口点击
  | 'galaxy_deep_view'          // 深度档案页曝光（付费门）
  | 'galaxy_deep_cta_click'     // 结果页点击"解锁深档"按钮
  | 'galaxy_echo_copy'          // 现世化身 · 同好暗号一键复制（XHS 评论队旗）
  | 'galaxy_xhs_compose_copy';  // 现世化身 · 一键复制整段贴 XHS（咒语+暗号+话题串）

export function trackGalaxyEvent(
  eventName: GalaxyEventName,
  input: ProductEventInput = {},
): void {
  enqueueProductEvent('galaxy', eventName, input);
}
