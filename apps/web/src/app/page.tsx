import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, HeartHandshake, KeyRound, MessageCircle, ShieldCheck, Sprout } from "lucide-react";
import { FamilyStoryScene, StoryVignette } from "@/components/illustrations/family-story";
import { SiteHeader } from "@/components/site-header";

const button = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[14px] font-semibold transition-colors";
const moments = [
  { label: "1", title: "Parent sets the Key", body: "Choose a standing allowance and a clear limit for each investment.", role: "parent" as const },
  { label: "2", title: "Teen acts independently", body: "Inside the Key, they practice making their own financial decisions.", role: "teen" as const },
  { label: "3", title: "Ask at the boundary", body: "Above the limit, CRESCO refuses the action and creates one precise request.", role: "request" as const },
  { label: "4", title: "Approve exactly once", body: "The parent can say yes to this one action without changing the standing Key.", role: "approved" as const },
];
const benefits = [
  { icon: KeyRound, title: "Flexible Keys", body: "Clear, family-set limits", tone: "bg-green-soft text-green-strong" },
  { icon: MessageCircle, title: "Real conversations", body: "Ask only when it matters", tone: "bg-yellow-soft text-orange-text" },
  { icon: Sprout, title: "Build independence", body: "Learn through real choices", tone: "bg-lavender-soft text-lavender" },
  { icon: BookOpen, title: "Learn together", body: "See decisions and receipts", tone: "bg-blue-soft text-blue-strong" },
];

export default function WelcomePage() {
  return (
    <main id="main" className="cresco-editorial-backdrop min-h-dvh">
      <div className="mx-auto w-full max-w-[1390px] px-5 pb-12 pt-5 md:px-9 lg:px-12">
        <SiteHeader current="/" />
        <section aria-labelledby="welcome-title" className="mt-9 grid gap-7 lg:mt-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div className="relative z-10 py-5">
            <p className="cresco-section-kicker inline-flex items-center gap-2"><span aria-hidden className="size-2 rounded-full bg-green"/> CRESCO · Real independence</p>
            <h1 id="welcome-title" className="mt-6 max-w-[12ch] font-display text-[clamp(56px,6.3vw,96px)] font-normal leading-[0.93] tracking-[-0.035em] text-navy-strong">
              Grow independence. <em className="text-green-strong">Keep the boundary.</em>
            </h1>
            <div aria-hidden className="cresco-rule-accent mt-4 w-40 rotate-[-1deg]" />
            <p className="mt-6 max-w-[43ch] text-[16px] leading-[1.65] text-ink-2 md:text-[18px]">
              Give your teen room to make financial decisions inside limits you set. They act on their own inside the Key and ask once when they reach its edge.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/start" className={`${button} bg-green-strong text-white hover:bg-green`}>Get started <ArrowRight aria-hidden className="size-4"/></Link>
              <Link href="/how-it-works" className={`${button} border border-green/40 bg-surface text-navy-strong hover:bg-green-soft`}>See how it works</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[12px] font-semibold text-ink-2">
              <span className="inline-flex items-center gap-2"><Sprout aria-hidden className="size-5 text-green"/> Independence</span>
              <span className="inline-flex items-center gap-2"><HeartHandshake aria-hidden className="size-5 text-orange-text"/> More trust</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck aria-hidden className="size-5 text-green"/> Clear rules</span>
            </div>
          </div>
          <div className="cresco-story-stage relative min-h-[360px] sm:min-h-[465px] lg:min-h-[530px]">
            <FamilyStoryScene className="absolute inset-0 h-full w-full object-cover" />
            <div className="cresco-demo-card absolute left-3 top-4 w-[160px] p-3 sm:left-6 sm:top-7 sm:w-[202px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-strong">Parent · Set a Key</p>
              <p className="mt-1 font-display text-[21px] leading-tight text-navy-strong">Choose a limit</p>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-green-soft p-2.5"><span className="text-[11px] text-navy">Per action</span><strong className="text-[12px] text-green-strong">$0.50</strong></div>
              <p className="mt-2 text-[10px] text-ink-3">Illustrative Devnet example</p>
            </div>
            <div className="cresco-demo-card absolute bottom-4 right-3 w-[190px] p-3 sm:bottom-7 sm:right-5 sm:w-[228px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-text">Teen · Ask once</p>
              <div className="mt-1 flex items-center justify-between gap-2"><span className="font-display text-[29px] text-navy-strong">$0.75</span><span className="rounded-full bg-yellow-soft px-2 py-1 text-[10px] font-semibold text-orange-text">Above limit</span></div>
              <p className="text-[11px] leading-snug text-ink-2">Approve this exact action without widening the Key.</p>
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-green-strong"><CheckCircle2 aria-hidden className="size-3.5"/> One-time permission</p>
            </div>
            <span className="cresco-story-note absolute right-5 top-4 hidden rotate-[5deg] text-[21px] sm:block">Room to grow, together.</span>
          </div>
        </section>

        <section aria-label="What CRESCO brings to family life" className="mt-7 grid gap-4 rounded-[26px] border border-line-soft bg-surface px-5 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-7">
          {benefits.map(({ icon: Icon, title, body, tone }) => (
            <div key={title} className="flex items-center gap-3">
              <span className={`grid size-11 shrink-0 place-items-center rounded-[15px] ${tone}`}><Icon aria-hidden className="size-5"/></span>
              <div><p className="text-[14px] font-semibold text-navy-strong">{title}</p><p className="text-[12px] text-ink-2">{body}</p></div>
            </div>
          ))}
        </section>

        <section aria-labelledby="flow-heading" className="mt-14 md:mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="cresco-section-kicker">How it works</p><h2 id="flow-heading" className="mt-2 font-display text-[clamp(42px,4.2vw,62px)] leading-none text-navy-strong">A simple flow for real life.</h2><p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-ink-2">A standing Key, room to explore, and one exact request when it matters.</p></div>
            <span className="cresco-story-note text-[24px]">More freedom. Stronger trust.</span>
          </div>
          <ol className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {moments.map((moment) => (
              <li key={moment.label} className="cresco-step-card flex flex-col">
                <div className="min-h-[155px] p-5"><span className="grid size-9 place-items-center rounded-full bg-green-soft font-display text-[24px] text-green-strong">{moment.label}</span><h3 className="mt-3 font-display text-[25px] leading-tight text-navy-strong">{moment.title}</h3><p className="mt-1 text-[13px] leading-relaxed text-ink-2">{moment.body}</p></div>
                <StoryVignette role={moment.role} className="mt-auto block w-full" />
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[12px] text-ink-3">Illustrative journey. Current executions use demo assets on Solana Devnet, not real money or a bank card.</p>
        </section>

        <section aria-labelledby="settings-heading" className="mt-14 md:mt-20">
          <p className="cresco-section-kicker">One CRESCO · Two settings</p>
          <h2 id="settings-heading" className="mt-2 font-display text-[clamp(40px,4.1vw,59px)] leading-tight text-navy-strong">A little more room to decide.</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section aria-labelledby="family-title" className="cresco-editorial-panel flex flex-col bg-[#f0f4e9] p-6 md:p-8">
              <p className="cresco-section-kicker">For families</p><h3 id="family-title" className="mt-3 font-display text-[37px] leading-none text-navy-strong">Freedom inside a family Key</h3>
              <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">Your teen explores investing with a family-set allowance. You choose the boundaries; they learn to act inside them.</p>
              <div className="mt-auto flex flex-wrap gap-3 pt-7"><Link href="/start" className={`${button} bg-green-strong text-white hover:bg-green`}>Enter Family <ArrowRight aria-hidden className="size-4"/></Link><Link href="/parent/sign-in" className={`${button} border border-green/30 bg-white text-navy-strong hover:bg-green-soft`}>Parent sign-in</Link></div>
              <p className="mt-4 text-[12px] text-ink-2">Or try the <Link href="/worlds-fair/desk?case=family" className="font-semibold text-green-strong underline underline-offset-4">Live family mandate on Solana</Link>.</p>
            </section>
            <section aria-labelledby="capital-title" className="cresco-editorial-panel flex flex-col bg-[#eaf1f2] p-6 md:p-8">
              <p className="cresco-section-kicker">For principals and agents</p><h3 id="capital-title" className="mt-3 font-display text-[37px] leading-none text-navy-strong">Authority for strategies and agents</h3>
              <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">Let an operator or AI agent act inside a clear mandate, and grant one exact exception without allowing it to widen its authority.</p>
              <div className="mt-auto pt-7"><Link href="/worlds-fair/desk?case=capital" className={`${button} bg-navy-strong text-white hover:bg-navy`}>Enter Delegated capital <ArrowRight aria-hidden className="size-4"/></Link></div>
              <p className="mt-4 text-[12px] text-ink-2">Operator integration is available through the CRESCO API and MCP.</p>
            </section>
          </div>
        </section>
        <footer className="mt-12 flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-[12px] text-ink-2"><span>Solana Devnet · demo tokens only · no real funds or custody</span><Link href="/worlds-fair" className="font-semibold text-blue hover:underline">Inspect technical evidence →</Link></footer>
      </div>
    </main>
  );
}
