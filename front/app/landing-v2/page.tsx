import type { PropsWithChildren } from "react";
import "../tailwind.css";

function Container({ children }: PropsWithChildren) {
  return (
    <div className="flex justify-center">
      <div className="max-w-[1000px] w-full p-4">{children}</div>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo.png" alt="CrawlChat" width={38} height={38} />
      <span className="text-2xl font-bold font-radio-grotesk text-brand">
        CrawlChat
      </span>
    </div>
  );
}

function NavLink({ children, href }: PropsWithChildren<{ href: string }>) {
  return (
    <a href="#" className="font-medium hover:underline">
      {children}
    </a>
  );
}

function LoginButton() {
  return (
    <a className="font-medium border text-brand border-brand rounded-xl px-6 py-1">
      Login
    </a>
  );
}

function Scrape() {
  return (
    <div>
      <div className="flex items-center gap-2 justify-center max-w-[400px] mx-auto mb-8">
        <div className="border border-outline rounded-2xl p-1 shadow-lg flex items-center gap-2 pl-6 text-xl w-full bg-white">
          <input
            type="text"
            className="w-full bg-transparent outline-none"
            placeholder="https://example.com"
          />
          <button className="bg-brand text-white px-6 py-4 rounded-2xl flex-shrink-0 font-medium">
            Try it
          </button>
        </div>
      </div>

      <p className="text-center text-sm opacity-40">
        Fetches 25 pages and makes it LLM ready!
      </p>
    </div>
  );
}

function DemoWindow() {
  return (
    <div className="max-w-[900px] w-full mx-auto border border-outline shadow-md bg-ash mt-8 px-4 py-3 rounded-2xl">
      <div>
        <div className="flex items-center gap-1 mb-3">
          <div className="w-[10px] h-[10px] bg-red-500 rounded-full" />
          <div className="w-[10px] h-[10px] bg-yellow-500 rounded-full" />
          <div className="w-[10px] h-[10px] bg-green-500 rounded-full" />
        </div>
      </div>
      <div className="bg-white rounded-lg h-[600px]"></div>
    </div>
  );
}

function StatsItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex gap-4 py-6 px-6 items-center border-b border-outline last:border-b-0">
      <div className="flex-1 text-6xl font-bold font-radio-grotesk">
        {value}
      </div>
      <div className="flex-1 flex justify-end">{label}</div>
    </div>
  );
}

function Stats() {
  return (
    <div className="flex gap-8 w-full mt-8 items-center">
      <div className="flex-1 flex flex-col gap-10">
        <div className="text-xl font-medium px-6 py-3 shadow-md rounded-2xl bg-white w-fit flex items-center gap-4 -rotate-[4deg]">
          <div className="w-3 h-3 bg-green-500 rounded-full outline-2 outline-green-300 outline" />
          Answering questions continuously
        </div>
        <h3 className="text-5xl font-radio-grotesk font-bold leading-[1.2]">
          Answering <br />
          <span className="text-brand">questions</span> <br />
          continuously
        </h3>
      </div>

      <div className="flex-1 shadow-md bg-white rounded-2xl">
        <StatsItem label="Today" value={272} />
        <StatsItem label="In the last week" value={2220} />
        <StatsItem label="In the last month" value={7223} />
      </div>
    </div>
  );
}

function UsedBy() {
  return (
    <div className="flex flex-col gap-8">
      <h3 className="text-center text-xl font-medium opacity-50">
        Already used by awesome companies!
      </h3>

      <div className="flex justify-center items-center gap-16">
        <img
          src="/used-by/remotion.png"
          alt="Remotion"
          className="max-h-[38px]"
        />

        <div className="flex items-center gap-2">
          <img
            src="/used-by/konvajs.png"
            alt="Konva"
            className="max-h-[38px]"
          />
          <div className="font-medium text-xl">Konvajs</div>
        </div>
      </div>
    </div>
  );
}

export default function LandingV2() {
  return (
    <div className="bg-ash font-aeonik">
      <div className="aspect-[1440/960] w-full bg-[url('/clouds.png')] bg-contain bg-no-repeat absolute top-0 left-0">
        <div className="w-full h-full bg-gradient-to-b from-[rgba(246,246,245,0)] to-ash"></div>
      </div>

      <div className="relative">
        <Container>
          <div className="flex items-center justify-between gap-2 py-6">
            <Logo />

            <div className="flex items-center gap-8">
              <NavLink href="#">How it works</NavLink>
              <NavLink href="#">Features</NavLink>
              <NavLink href="#">Pricing</NavLink>

              <LoginButton />
            </div>
          </div>
        </Container>

        <Container>
          <div className="py-8">
            <h1 className="font-radio-grotesk text-[80px] leading-[96px] font-bold text-center">
              Deliver your <br />
              <span className="text-brand bg-brand-subtle px-4 py-2px relative">
                documentation
                <img
                  src="/new-landing/docs-h1.png"
                  alt="Docs"
                  className="absolute left-[-80px] top-[-50px] w-[120px] h-[120px]"
                />
              </span>{" "}
              with{" "}
              <span className="text-brand bg-brand-subtle px-4 py-2">AI</span>
            </h1>

            <h2 className="text-center text-xl font-medium max-w-[800px] mx-auto py-8 opacity-60">
              Add your existing documentation as knowledge base and deliver it
              through multiple channels for your community. Get visibility how
              your community consumes it and make your documentation better!
            </h2>

            <Scrape />

            <DemoWindow />
          </div>
        </Container>

        <Container>
          <UsedBy />
        </Container>

        <Container>
          <Stats />
        </Container>
      </div>
    </div>
  );
}
