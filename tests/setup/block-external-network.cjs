const nativeFetch = globalThis.fetch;
const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);

if (nativeFetch) {
  globalThis.fetch = (input, init) => {
    const rawUrl = typeof input === "string" || input instanceof URL
      ? String(input)
      : input.url;
    const url = new URL(rawUrl, "http://127.0.0.1:3100");

    if ((url.protocol === "http:" || url.protocol === "https:") &&
        !localHosts.has(url.hostname)) {
      return Promise.reject(
        new Error(`External network access is disabled in browser tests: ${url.origin}`),
      );
    }

    return nativeFetch(input, init);
  };
}
