-- Audit 2026-10-20 decision 4: one ¥19/月 membership (her_profiles.is_member).
-- Fold Mysti 「暮光通行证」 (mysti_subscriptions, device-scoped) into it.
--
-- Honors any still-active pass holder whose device is bound to a user:
-- copies the pass expiry onto her_profiles (never shortens an existing expiry).
-- Unbound devices keep access at runtime via findActiveSubscriptionByDevice
-- (see src/lib/her/membership.ts resolveMembership).
--
-- Idempotent. NOT run on prod by the PR author — apply manually after review.
-- As of 2026-10-20 23:30 (Asia/Shanghai) prod has 0 active monthly-pass rows.

begin;

insert into public.her_profiles (user_id, is_member, member_expires_at, completeness_pct, updated_at)
select b.user_id, true, max(s.expires_at), 10, now()
from public.mysti_subscriptions s
join public.device_user_bindings b on b.device_id = s.device_id
where s.status = 'active' and s.expires_at > now()
group by b.user_id
on conflict (user_id) do update
set is_member = true,
    member_expires_at = greatest(coalesce(public.her_profiles.member_expires_at, excluded.member_expires_at), excluded.member_expires_at),
    updated_at = now();

commit;
