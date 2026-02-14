import { test } from "node:test";
import assert from "node:assert";
import { MarkdownSplitter } from "../scrape/markdown-splitter";

test("splitMarkdown returns simple markdown", async () => {
  const markdown = `Hello how are you?`;
  const splitter = new MarkdownSplitter();
  const chunks = await splitter.split(markdown);
  assert.strictEqual(chunks.length, 1);
  assert.strictEqual(chunks[0], markdown);
});

test("splitMarkdown splits simple markdown", async () => {
  const markdown = `Hello how are you?`;
  const splitter = new MarkdownSplitter({ size: 10 });
  const chunks = await splitter.split(markdown);
  assert.strictEqual(chunks.length, 2);
  assert.strictEqual(chunks[0], markdown.slice(0, 10));
  assert.strictEqual(chunks[1], markdown.slice(10));
});

test("splitMarkdown splits multiple lines", async () => {
  const markdown = `Hello how are you?
Just!
This is a test`;
  const splitter = new MarkdownSplitter({ size: 10 });
  const chunks = await splitter.split(markdown);
  assert.strictEqual(chunks.length, 5);
  assert.strictEqual(chunks[0], "Hello how ");
  assert.strictEqual(chunks[1], "are you?");
  assert.strictEqual(chunks[2], "Just!");
  assert.strictEqual(chunks[3], "This is a ");
  assert.strictEqual(chunks[4], "test");
});

const simpleHeadingMarkdown = `# Heading 1
## Heading 1.1
A line about heading 1.1 and a long line that should be split into multiple chunks
## Heading 1.2
A line about heading 1.2 and a long line that should be split into multiple chunks`;

test("splitMarkdown large size", async () => {
  const splitter = new MarkdownSplitter({ size: 2000 });
  const chunks = await splitter.split(simpleHeadingMarkdown);
  assert.strictEqual(chunks.length, 1);
});

test("splitMarkdown heading carry forward varied size", async () => {
  const splitter = new MarkdownSplitter({ size: 200 });
  const chunks = await splitter.split(simpleHeadingMarkdown);
  assert.strictEqual(chunks.length, 2);
  const lastChunk = chunks[chunks.length - 1];
  assert.strict(lastChunk.startsWith("# Heading 1"));
  assert.strict(!lastChunk.includes("## Heading 1.1"));
  assert.strict(lastChunk.includes("## Heading 1.2"));
});

test("splitMarkdown with context", async () => {
  const splitter = new MarkdownSplitter({ size: 100, context: "Test" });
  const chunks = await splitter.split(simpleHeadingMarkdown);
  for (const chunk of chunks) {
    assert.strict(chunk.startsWith("Context: Test"));
  }
  for (const chunk of chunks) {
    assert.strict(chunk.length <= 100);
  }
});

const simpleTableMarkdown = `| Header 1 | Header 2 |
|----------|----------|
| Data 1   | Data 2   |
| Data 3   | Data 4   |
| Data 5   | Data 6   |
| Data 7   | Data 8   |
| Data 9   | Data 10   |
| Data 11   | Data 12   |
| Data 13   | Data 14   |
| Data 15   | Data 16   |
| Data 17   | Data 18   |
| Data 19   | Data 20   |
| Data 21   | Data 22   |
| Data 23   | Data 24   |`;

test("splitMarkdown with table", async () => {
  const splitter = new MarkdownSplitter({ size: 200 });
  const chunks = await splitter.split(simpleTableMarkdown);
  assert.strictEqual(chunks.length, 3);
  const headers = "| Header 1 | Header 2 |\n|----------|----------|";
  for (let i = 1; i < chunks.length; i++) {
    assert.strict(chunks[i].startsWith(headers));
  }
});

test("splitMarkdown with table and following text", async () => {
  const text = "I am Pramod";
  const splitter = new MarkdownSplitter({ size: 200 });
  const chunks = await splitter.split(`${simpleTableMarkdown}\n\n${text}`);
  assert.strict(chunks.pop()?.endsWith("I am Pramod"));
});

test("splitMarkdown with headers and table", async () => {
  const markdown = `# Heading 1
This is a text
| Name | Country |
| ---- | ------- |
| Pramod | India |
| John | USA |
| Jane | Canada |
| Jim | Australia |
| Jill | New Zealand |
| Jack | South Africa |
| Jill | New Zealand |`;

  const splitter = new MarkdownSplitter({ size: 150 });
  const chunks = await splitter.split(markdown);
  assert.strictEqual(chunks.length, 2);
  assert.strict(chunks[0].startsWith("# Heading 1"));
  assert.strict(chunks[1].startsWith("# Heading 1"));
  assert.strict(chunks[0].includes("| Name | Country |"));
  assert.strict(chunks[1].includes("| Name | Country |"));

  const splitter2 = new MarkdownSplitter({ size: 190 });
  const chunks2 = await splitter2.split(markdown);
  assert.strictEqual(chunks2.length, 2);
  assert.strictEqual(
    chunks2[1],
    "# Heading 1\n| Name | Country |\n| ---- | ------- |\n| Jill | New Zealand |"
  );
});
