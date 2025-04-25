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

export default function LandingV2() {
  return (
    <div className="bg-[#F6F6F5] min-h-screen font-aeonik">
      <div className="aspect-[1440/960] w-full bg-[url('/clouds.png')] bg-contain bg-no-repeat">
        <div className="w-full h-full bg-gradient-to-b from-[rgba(246,246,245,0)] to-[#F6F6F5]">
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
            <div className="py-16">
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
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
}
