const UPSTREAM = "http://vega.ender.co.in:5048";

const ALLOWED_PATHS = new Set([
  "/api/health",
  "/api/kits",
  "/api/tiers",
  "/api/players",
  "/api/leaderboard",
  "/api/results",
  "/api/stats",
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve the existing static website for non-API requests.
    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    const origin = request.headers.get("Origin");

    const corsHeaders = {
      "Access-Control-Allow-Origin": url.origin,
      "Vary": "Origin",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    };

    // Reject requests from a different browser origin.
    if (origin && origin !== url.origin) {
      return Response.json(
        { error: "Origin not allowed" },
        { status: 403, headers: corsHeaders }
      );
    }

    // Handle browser preflight requests.
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Only allow GET requests to the API.
    if (request.method !== "GET") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers: corsHeaders }
      );
    }

    // Allow only the approved API endpoints.
    if (!ALLOWED_PATHS.has(url.pathname)) {
      return Response.json(
        { error: "Endpoint not allowed" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Fail safely if the Cloudflare secret is missing.
    if (!env.BTT_API_KEY) {
      return Response.json(
        { error: "API authentication is not configured" },
        { status: 500, headers: corsHeaders }
      );
    }

    try {
      const upstreamUrl = new URL(url.pathname + url.search, UPSTREAM);

      const upstream = await fetch(upstreamUrl.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-BTT-API-Key": env.BTT_API_KEY,
        },
        signal: AbortSignal.timeout(10000),
      });

      const body = await upstream.text();

      return new Response(body, {
        status: upstream.status,
        headers: {
          ...corsHeaders,
          "Cache-Control": "no-store",
        },
      });
    } catch {
      return Response.json(
        { error: "BTT API is temporarily unavailable" },
        { status: 502, headers: corsHeaders }
      );
    }
  },
};