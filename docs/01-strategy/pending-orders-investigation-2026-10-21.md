# 48 笔 pending mysti_orders 调查（2026-10-21，只读）

## 数据（prod，只读查询）
- 订单共 78：paid 9（¥98.2）/ failed 21 / pending 48。pending 全部 `provider_order_id`、`notify_payload` 为空 → 用户从未在虎皮椒完成支付，也没有回调；不是回调丢失。
- 渠道：pending 48 中 **wechat 44**、alipay 4。paid 9 中 wechat 8。
- 时间：pending 集中在 2026-04-20 那周（33 笔）；近 30 天 0 笔新 pending（近期几乎无下单）。
- 设备：pending 涉及 32 台设备；21 台只点了 1 次就放弃；**10 台重复下单 2 次以上仍未付**（23 笔），其中仅 1 台最终付成功 → 有明显“想付但付不了”的信号。
- 按 SKU：couple-report 15、couple-half 12、monthly-pass 7、wtfcard-collector 7、gift-card 2、deep-pantheon 2、deep-mirror 2、share-plus 1。另 failed：monthly-pass 13 笔集中在 04-18/19 上线首两天（上线期故障）。

## 流程走查（代码）
1. 前端 PremiumPaywall 默认 `paymentType='wechat'`，POST /api/mysti/payment/create 后 `window.location.href = data.url`。
2. `createXunhupayOrder`：UA 命中 mobile 正则时给微信渠道加 `type=WAP`（H5 支付）。**微信内置浏览器（MicroMessenger）的 UA 也含 Mobile，同样走 WAP**。微信 H5 支付在微信内置浏览器里不被允许（需 JSAPI/公众号支付），用户会看到报错或空白收银台 → 返回重试 → 产生多笔 pending。这与“wechat 占 92%、10 台设备重复下单”高度吻合。（UA 未落库，无法逐单证实。）
3. 没有支付中间页：跳走前不提示“请在浏览器打开 / 改用支付宝”，也没有二维码兜底。
4. 回跳 /mysti/payment/return 只在用户回到页面时 verify；无定时对账，pending 永不关闭（只影响统计，不影响用户）。

## 建议（未在本 PR 实施）
- 检测 MicroMessenger：在微信内引导“右上角 ··· 在浏览器打开”，或默认切支付宝/展示 `url_qrcode` 长按识别。
- create 时把 UA 类型（wechat-inapp / ios / android / desktop）写入 attach_json 便于归因。
- 加一个每日 cron：>24h 的 pending 调 reconcile 后标记 expired。
- 后续若接 JSAPI 需公众号资质。
