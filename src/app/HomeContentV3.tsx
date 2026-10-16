import Link from 'next/link';
import styles from './home-v3.module.css';
import { HomeTracker } from './HomeTracker';

// Homepage per docs/01-strategy/wtfti-her-refocus-2026-10.md §5.1, skin: journal.
// One primary CTA (90s test); everything else explains what she gets afterwards.

const PILLARS = [
  { href: '/start/', title: '测我', desc: '我是什么样的人，他到底怎么想', tags: ['人格测试', '我和他', '掌纹', '塔罗'], num: 'i', tape: '' },
  { href: '/mirror/', title: '美我', desc: '适合我的颜色、妆和风格', tags: ['色彩季型', '脸型妆容', 'AI 换一身'], num: 'ii', tape: 's-tape--peach' },
  { href: '/bottle/', title: '懂我', desc: '说出来就好受一点，有人会抱抱你', tags: ['树洞', '心情日记'], num: 'iii', tape: 's-tape--sage' },
];

export default function HomeContentV3() {
  return (
    <div className={`skin-journal ${styles.page}`}>
      <HomeTracker />
      <section className={styles.hero}>
        <div className={styles.collage} aria-hidden="true">
          <div className={`s-polaroid ${styles.p1}`}>
            <div className="s-tape s-tape--sage" />
            <div className={styles.shot}>
              <span className="s-eyebrow">冷夏型</span>
              <div className={styles.swatches}>
                <i style={{ background: '#8FA3BF' }} /><i style={{ background: '#C9A9C6' }} /><i style={{ background: '#E6E1EA' }} /><i style={{ background: '#7C8C99' }} />
              </div>
            </div>
            <span className="s-polaroid__caption">我的颜色</span>
          </div>
          <div className={`s-polaroid ${styles.p2}`}>
            <div className="s-tape" />
            <div className={styles.shot}>
              <span className="s-eyebrow">人格</span>
              <strong className={`s-title ${styles.shotTitle}`}>嘴硬甜心</strong>
            </div>
            <span className="s-polaroid__caption">我的人格</span>
          </div>
          <div className={`s-polaroid ${styles.p3}`}>
            <div className="s-tape s-tape--peach" />
            <div className={styles.shot}>
              <span className="s-eyebrow">今日</span>
              <strong className={`s-title ${styles.shotTitle}`}>宜说清楚</strong>
            </div>
            <span className="s-polaroid__caption">今天的签</span>
          </div>
          <div className={`s-hand ${styles.sticker}`}>90秒<br />测一下</div>
        </div>

        <p className="s-eyebrow">For her · 14 — 40</p>
        <h1 className={`s-title ${styles.h1}`}>
          懂你的<br /><em>女生私人顾问</em>
        </h1>
        <p className={styles.sub}>看清自己 · 变好看 · 有地方说心里话</p>
        <Link href="/start/" prefetch={false} className="s-btn" data-track="hero">90 秒，先测测你是谁</Link>
        <p className={styles.proof}>已经有 7 万+ 人来过这里</p>
      </section>

      <section className={styles.sec}>
        <p className="s-eyebrow">After the test</p>
        <h2 className={`s-title ${styles.h2}`}>测完，你会有一份自己的档案<br />和每天一张「今日卡」</h2>
        <div className={`s-card s-card--lined ${styles.today}`}>
          <div className="s-tape" />
          <div className={styles.todayHead}>
            <span className={`s-en ${styles.date}`}>TODAY · 今日卡</span>
            <span className={`s-en ${styles.tags}`}>样例</span>
          </div>
          <p className={`s-title ${styles.fortune}`}>今天适合把话说清楚，<br />别替别人想太多。</p>
          <div className={styles.row}>
            <span className={styles.k}>幸运色</span>
            <i className={styles.sw} style={{ background: '#8FA3BF' }} />
            <span className={styles.v}>雾霾蓝<small>冷夏的你穿它显白，避开亮橘</small></span>
          </div>
          <div className={styles.row}>
            <span className={styles.k}>妆容</span>
            <i className={styles.sw} style={{ background: '#B07A7A' }} />
            <span className={styles.v}>低饱和豆沙唇<small>鹅蛋脸，腮红扫在颧骨偏外</small></span>
          </div>
        </div>
        <p className={styles.note}><span className="s-hand">↑ 每天都不一样，越测越准</span></p>
      </section>

      <section className={styles.sec}>
        <p className="s-eyebrow">What&apos;s here</p>
        <h2 className={`s-title ${styles.h2}`}>三件事，都关于你</h2>
        <div className={styles.pillars}>
          {PILLARS.map((p) => (
            <Link key={p.href} href={p.href} prefetch={false} className={`s-card ${styles.pillar}`} data-track={`pillar:${p.title}`}>
              <div className={`s-tape ${p.tape}`} />
              <span className={`s-hand ${styles.num}`}>{p.num}</span>
              <h3 className={`s-title ${styles.h3}`}>{p.title}</h3>
              <p className={styles.desc}>{p.desc}</p>
              <div className={styles.chips}>
                {p.tags.map((t) => <span key={t}>{t}</span>)}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.sec}>
        <div className={`s-card ${styles.quote}`}>
          <div className="s-tape" />
          <p className="s-eyebrow">From the tree hole</p>
          <blockquote className="s-title">「今天被领导当众夸了，没人可以说，想在这里说一下。」</blockquote>
          <p className={styles.quoteMeta}>匿名 · 树洞里的一句话</p>
        </div>
      </section>

      <section className={styles.close}>
        <p className="s-hand">先认识自己，再说别的。</p>
        <Link href="/start/" prefetch={false} className="s-btn" data-track="close">开始 90 秒测试</Link>
        <p className={styles.fine}>免费 · 不用注册 · 结果仅供娱乐与自我探索</p>
      </section>
    </div>
  );
}
