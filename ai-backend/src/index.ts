export interface Env {
  OPENAI_API_KEY: string;
  COINGECKO_API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname, searchParams } = new URL(request.url);

    // CORS, чтобы мобильное приложение могло стучаться
    const cors: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type, authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    // Healthcheck
    if (pathname === "/") {
      return new Response("✅ Worker is running", { status: 200, headers: cors });
    }

    // --- CoinGecko proxy: GET /api/market/price?id=bitcoin&vs=usd
    if (pathname === "/api/market/price") {
      const id = searchParams.get("id") ?? "bitcoin";
      const vs = searchParams.get("vs") ?? "usd";

      const r = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=${encodeURIComponent(vs)}`
      );
      const text = await r.text();
      return new Response(text, { status: r.status, headers: cors });
    }

    // --- OpenAI proxy: POST /api/ask { messages: [...] }
    if (pathname === "/api/ask") {
      let body: any = {};
      try {
        body = await request.json();
      } catch { /* ignore */ }

      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.4,
          messages: Array.isArray(body?.messages)
            ? body.messages
            : [{ role: "user", content: "Hello!" }],
        }),
      });

      const text = await r.text();
      return new Response(text, { status: r.status, headers: cors });
    }

    return new Response("Not found", { status: 404, headers: cors });
  },
};
