import {
  TbArrowRight,
  TbWorld,
  TbMessageCircle,
  TbShield,
  TbSearch,
  TbBook,
  TbFileText,
  TbCode,
} from "react-icons/tb";
import { Button } from "~/components/ui/button";
import "./tailwind.css";
import { Link } from "@chakra-ui/react";

export function meta() {
  return [
    {
      title: "CrawlChat",
      description: "Chat with Any Website using AI",
    },
  ];
}

export default function Index() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              CrawlChat
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => scrollToSection("use-cases")}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Use Cases
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Pricing
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-purple-100 rounded-full text-sm font-medium text-purple-900 mb-8">
            Connect documentations to MCP!
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Make your content LLM ready!
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Don't fall behind by just providing the content to your customers.
            Make it easily accessible to them by making your content or
            documents LLM ready.
          </p>
          <form className="max-w-xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="url"
                placeholder="Enter your website URL"
                className="flex-1 flex min-h-14 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                type="submit"
                className="bg-purple-600 text-white hover:bg-purple-700 h-14 px-8 text-lg font-medium"
              >
                Try it
                <TbArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden bg-gray-900 shadow-xl">
            <video
              className="w-full h-full object-cover"
              poster="/demo-poster.png"
              src="https://slickwid-public.s3.us-east-1.amazonaws.com/CrawlChat+Demo.mp4"
              controls
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-gray-900">
            How CrawlChat Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300">
              <TbWorld className="h-12 w-12 text-purple-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-900">
                1. Crawl & Process
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Input your website URL and let CrawlChat crawl the content. We
                convert pages to markdown, create embeddings, and store them in
                a vector database.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300">
              <TbMessageCircle className="h-12 w-12 text-purple-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-900">
                2. Start Chatting
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Begin conversations about the website content. Our efficient
                context management handles large amounts of data seamlessly.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300">
              <TbSearch className="h-12 w-12 text-purple-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-900">
                3. MCP
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tools like Cursor often hallucinate if proper context is not
                provided. CrawlChat lets you easily connect such tools using
                MPC.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900 dark:text-gray-900">
            Perfect for Every Use Case
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            From developers to researchers, CrawlChat adapts to your specific
            needs with powerful, context-aware conversations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <TbBook className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-900">
                Documentation Search
              </h3>
              <p className="text-gray-600">
                Search and understand library/framework documentation
                effortlessly. Get contextual answers to your implementation
                questions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <TbFileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-900">
                Content Research
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Analyze content across multiple pages and get comprehensive
                insights for your research needs.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <TbCode className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-900">
                Development
              </h3>
              <p className="text-gray-600">
                Just connect MCP with your editor like Cursor or Windsurf and
                code without switch windows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900 dark:text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Choose the plan that works best for your needs. No hidden fees or
            surprises.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-purple-200 transition-colors">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-900">
                  Free
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Perfect for getting started
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-900">
                  $0
                </span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-600">
                  <TbShield className="h-5 w-5 text-purple-600 mr-3" />
                  100 site scrapes per month
                </li>
                <li className="flex items-center text-gray-600">
                  <TbShield className="h-5 w-5 text-purple-600 mr-3" />
                  500,000 tokens included
                </li>
                <li className="flex items-center text-gray-600">
                  <TbShield className="h-5 w-5 text-purple-600 mr-3" />
                  Bring your own LLM key
                </li>
                <li className="flex items-center text-gray-600 opacity-50">
                  <TbShield className="h-5 w-5 text-purple-600 mr-3" />
                  API access not included
                </li>
              </ul>

              <Button
                className="w-full bg-white hover:bg-gray-100 text-gray-900 border border-gray-200"
                asChild
              >
                <Link href="/login">
                  Get Started Free
                  <TbArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-purple-50 p-8 rounded-2xl border-2 border-purple-200 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-900">
                  Pro
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  For power users and teams
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-900">
                  $19
                </span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-600">
                  <TbShield className="h-5 w-5 text-purple-600 mr-3" />
                  4,000 site scrapes per month
                </li>
                <li className="flex items-center text-gray-600">
                  <TbShield className="h-5 w-5 text-purple-600 mr-3" />
                  1,000,000 tokens included
                </li>
                <li className="flex items-center text-gray-600">
                  <TbShield className="h-5 w-5 text-purple-600 mr-3" />
                  Bring your own LLM key
                </li>
                <li className="flex items-center text-gray-600">
                  <TbShield className="h-5 w-5 text-purple-600 mr-3" />
                  Full API access
                </li>
              </ul>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled
              >
                Coming soon!
                <TbArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-gray-900">
              Ready to Chat with Websites?
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Join users who are already having meaningful conversations with
              web content using CrawlChat.
            </p>
            <Button
              asChild
              className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-6 rounded-full text-lg"
            >
              <Link href="/login">
                Start Free Trial
                <TbArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-100">
        <div className="container mx-auto text-center text-gray-600">
          <p>&copy; 2025 CrawlChat. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
