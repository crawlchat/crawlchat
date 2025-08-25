import Markdown from "react-markdown";

export default function Test() {
  return (
    <div className="prose">
      <Markdown>
        {`## Hello

Hello there here are some links:
- [Google](https://google.com)
- [Bing](https://bing.com)
- [DuckDuckGo](https://duckduckgo.com)

And here is some code:
\`\`\`json
{
  "name": "John",
  "age": 30
}
\`\`\`

By default, Tailwind removes all of the default browser styling from paragraphs, headings, lists and more. This ends up being really useful for building application UIs because you spend less time undoing user-agent styles, but when you really are just trying to style some content that came from a rich-text editor in a CMS or a markdown file, it can be surprising and unintuitive.

- One
- Two
          `}
      </Markdown>
    </div>
  );
}
