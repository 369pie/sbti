'use client';

import { useState, useTransition } from 'react';

type ProfileShareButtonProps = {
  title: string;
  url: string;
};

export function ProfileShareButton({ title, url }: ProfileShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const text = `${title}\n${url}`;

      try {
        if (navigator.share) {
          await navigator.share({ title, text: '来看看这位创作者的人格宇宙。', url });
        } else {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        }
      } catch {
        // User cancelled or share API is unavailable.
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="px-4 py-2.5 rounded-xl border border-border-subtle bg-bg-secondary hover:bg-bg-tertiary text-sm text-text-secondary transition-colors disabled:opacity-50"
    >
      {copied ? '主页链接已复制' : '分享主页'}
    </button>
  );
}