// Vercel serverless endpoint: cache public Telegram proxy feeds at the edge.
const SOURCES = [
  {
    name: "0xRadikal · Resilient",
    url: "https://raw.githubusercontent.com/0xRadikal/Free-Telegram-Proxy/main/resilient/tme.txt"
  },
  {
    name: "iwizard7 · Stable",
    url: "https://raw.githubusercontent.com/iwizard7/MTProxy_list/data/stable.txt"
  }
];

function parseProxy(raw) {
  try {
    const input = new URL(raw.trim());
    let params;
    if (input.protocol === "tg:" && input.hostname === "proxy") {
      params = new URLSearchParams(input.search);
    } else if (
      ["https:", "http:"].includes(input.protocol) &&
      ["t.me", "telegram.me", "telegram.dog"].includes(input.hostname) &&
      input.pathname === "/proxy"
    ) {
      params = input.searchParams;
    } else {
      return null;
    }

    const server = params.get("server");
    const port = params.get("port");
    const secret = params.get("secret");
    if (
      !server || !port || !secret ||
      !/^\\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535 ||
      !/^[a-zA-Z0-9_-]+$/.test(secret) ||
      server.length > 253
    ) return null;

    const telegram = new URL("https://t.me/proxy");
    telegram.searchParams.set("server", server);
    telegram.searchParams.set("port", port);
    telegram.searchParams.set("secret", secret);
    return { server, port, href: telegram.toString(), key: server + ":" + port };
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
  res.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  for (const source of SOURCES) {
    try {
      const upstream = await fetch(source.url, {
        headers: { "User-Agent": "LaythAziz-Profile-ProxyDirectory/1.0" },
        signal: AbortSignal.timeout(3500)
      });
      if (!upstream.ok) continue;
      const body = await upstream.text();
      const unique = new Map();
      for (const line of body.split(/\\r?\\n/)) {
        const proxy = parseProxy(line);
        if (proxy && !unique.has(proxy.key)) unique.set(proxy.key, proxy);
        if (unique.size >= 8) break;
      }
      if (!unique.size) continue;

      return res.status(200).json({
        source: source.name,
        updatedAt: new Date().toISOString(),
        proxies: [...unique.values()]
      });
    } catch {
      // Try the next independent public source.
    }
  }

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
  return res.status(503).json({ error: "Proxy list temporarily unavailable" });
};
