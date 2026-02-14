import { test } from "node:test";
import assert from "node:assert";
import { splitMarkdown, getChunkSize } from "../scrape/markdown-splitter";

test("getChunkSize returns the correct size", () => {
  const chunk = ["Hello", "how", "are", "you?"];
  assert.strictEqual(getChunkSize(chunk), 18);
});

test("splitMarkdown returns simple markdown", async () => {
  const markdown = `Hello how are you?`;
  const chunks = await splitMarkdown(markdown);
  assert.strictEqual(chunks.length, 1);
  assert.strictEqual(chunks[0], markdown);
});

test("splitMarkdown splits simple markdown", async () => {
  const markdown = `Hello how are you?`;
  const chunks = await splitMarkdown(markdown, { size: 10 });
  assert.strictEqual(chunks.length, 2);
  assert.strictEqual(chunks[0], markdown.slice(0, 10));
  assert.strictEqual(chunks[1], markdown.slice(10));
});

test("splitMarkdown splits multiple lines", async () => {
  const markdown = `Hello how are you?
Just!
This is a test`;
  const chunks = await splitMarkdown(markdown, { size: 10 });
  assert.strictEqual(chunks.length, 5);
  assert.strictEqual(chunks[0], "Hello how ");
  assert.strictEqual(chunks[1], "are you?");
  assert.strictEqual(chunks[2], "Just!");
  assert.strictEqual(chunks[3], "This is a ");
  assert.strictEqual(chunks[4], "test");
});

const simpleHeadingMarkdown = `# Heading 1
## Heading 1.1
A line about heading 1.1
## Heading 1.2
A line about heading 1.2`;

test("splitMarkdown large size", async () => {
  const chunks = await splitMarkdown(simpleHeadingMarkdown, { size: 2000 });
  assert.strictEqual(chunks.length, 1);
});

test("splitMarkdown heading carry forward varied size", async () => {
  for (let i = 1; i <= 10; i++) {
    const chunks = await splitMarkdown(simpleHeadingMarkdown, { size: i });
    for (const chunk of chunks) {
      assert.strict(chunk.length <= i);
    }
  }
});

test("splitMarkdown with context", async () => {
  const chunks = await splitMarkdown(simpleHeadingMarkdown, {
    size: 50,
    context: "Test context",
  });
  console.log(chunks);
  for (const chunk of chunks) {
    assert.strict(chunk.startsWith("Context: Test context"));
  }
});
