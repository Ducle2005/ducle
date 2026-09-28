import assert from "node:assert/strict";
import { test } from "node:test";
import { formatChatLines } from "./chatFormatting.ts";

test("chat formatting keeps untrusted HTML as text and parses emphasis", () => {
  assert.deepEqual(formatChatLines("**Hello** <img src=x onerror=bad()>"), [[
    { text: "Hello", bold: true },
    { text: " <img src=x onerror=bad()>", bold: false },
  ]]);
});

test("chat formatting preserves line breaks and normalizes bullets", () => {
  assert.deepEqual(formatChatLines("- one\n* **two**"), [
    [{ text: "• one", bold: false }],
    [{ text: "• ", bold: false }, { text: "two", bold: true }],
  ]);
});
