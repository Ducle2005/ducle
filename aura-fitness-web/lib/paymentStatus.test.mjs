import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { checkPaymentStatus } from "./paymentStatus.ts";

const originalFetch = globalThis.fetch;
const originalStorage = globalThis.localStorage;

afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.localStorage = originalStorage;
});

function storeToken(token) {
  let currentToken = token;
  globalThis.localStorage = {
    getItem: () => currentToken,
    removeItem: () => { currentToken = null; },
  };
  return () => currentToken;
}

test("polling reads the current token and accepts only a confirmed premium response", async () => {
  const token = storeToken("first");
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push([url, options.headers.Authorization]);
    return { ok: true, json: async () => ({ isPremium: calls.length === 2 }) };
  };

  assert.equal(await checkPaymentStatus("https://example.com/api"), false);
  assert.equal(await checkPaymentStatus("https://example.com/api"), true);
  assert.deepEqual(calls, [
    ["https://example.com/api/payment/check-status", "Bearer first"],
    ["https://example.com/api/payment/check-status", "Bearer first"],
  ]);
  assert.equal(token(), "first");
});

test("401 and network failures do not clear the session", async () => {
  const token = storeToken("valid");
  globalThis.fetch = async () => ({ ok: false, status: 401 });
  await assert.rejects(checkPaymentStatus("https://example.com/api"));
  assert.equal(token(), "valid");

  globalThis.fetch = async () => { throw new Error("offline"); };
  await assert.rejects(checkPaymentStatus("https://example.com/api"));
  assert.equal(token(), "valid");
});

test("missing token does not send a payment request", async () => {
  storeToken(null);
  globalThis.fetch = () => { throw new Error("unexpected request"); };
  await assert.rejects(checkPaymentStatus("https://example.com/api"), /đăng nhập/);
});
