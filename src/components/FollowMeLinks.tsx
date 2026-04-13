import NextImage from 'next/image';
import { withBasePath } from '@/lib/site';

const SOCIAL_LINKS = [
  {
    key: 'xiaohongshu',
    label: '小红书',
    href: 'https://www.xiaohongshu.com/user/profile/6761e6040000000018014ab4',
    icon: '/images/social/xiaohongshu.svg',
    bg: 'rgba(255, 36, 66, 0.12)',
  },
  {
    key: 'douyin',
    label: '抖音',
    href: 'https://www.douyin.com/user/MS4wLjABAAAAtsrKQ9rw2FSwJZozySt8QVlx-CpL2FnQqX0WyxwlwLyXDMkYXwqKNYnzjVENHc8L?from_tab_name=main',
    icon: '/images/social/douyin.svg',
    bg: 'rgba(0, 0, 0, 0.08)',
  },
  {
    key: 'x',
    label: 'X',
    href: 'https://x.com/369pie',
    icon: '/images/social/x.svg',
    bg: 'rgba(0, 0, 0, 0.08)',
  },
] as const;

function SocialLinkPill({ dense = false }: { dense?: boolean }) {
  return SOCIAL_LINKS.map((item) => (
    <a
      key={item.key}
      href={item.href}
      target="_blank"
      rel="noopener noreferrer me nofollow"
      className={`inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated text-text-secondary hover:text-text-primary hover:shadow-sm transition-all ${dense ? 'px-3 py-1.5 text-sm' : 'px-3.5 py-2 text-sm'}`}
      aria-label={`前往 ${item.label} 主页`}
    >
      <span
        className="inline-flex items-center justify-center rounded-full w-6 h-6"
        style={{ background: item.bg }}
      >
        <NextImage
          src={withBasePath(item.icon)}
          alt={item.label}
          width={14}
          height={14}
          className="w-3.5 h-3.5"
        />
      </span>
      <span>{item.label}</span>
    </a>
  ));
}

export function FollowMeInline() {
  return (
    <div className="mb-4">
      <p className="text-xs uppercase tracking-wider opacity-70 mb-2">关注我</p>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
        <SocialLinkPill dense />
      </div>
    </div>
  );
}

export function FollowMeCard() {
  return (
    <section className="py-10 px-6 border-t border-border-subtle">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-border-subtle bg-bg-elevated p-6 sm:p-8 shadow-sm text-center">
          <p className="section-label block mb-3">Follow</p>
          <h2 className="section-headline text-xl sm:text-2xl mb-2">关注我，解锁更多人格内容</h2>
          <p className="text-sm sm:text-base text-text-secondary mb-5">
            题库更新、结果解读、用户投稿和宇宙新玩法，会先在社媒发布。
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <SocialLinkPill />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FollowMeFloating() {
  return (
    <div className="hidden md:block fixed right-4 bottom-5 z-40 animate-fade-up-delay-2">
      <div className="rounded-2xl border border-border-subtle bg-bg-elevated/95 backdrop-blur px-3 py-3 shadow-lg">
        <p className="text-[11px] font-mono tracking-widest uppercase text-text-muted mb-2">关注我</p>
        <div className="flex items-center gap-2">
          {SOCIAL_LINKS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer me nofollow"
              aria-label={`前往 ${item.label} 主页`}
              className="w-8 h-8 rounded-full border border-border-subtle bg-bg-secondary/80 hover:bg-bg-secondary transition-colors inline-flex items-center justify-center"
              title={item.label}
            >
              <NextImage
                src={withBasePath(item.icon)}
                alt={item.label}
                width={14}
                height={14}
                className="w-3.5 h-3.5"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
