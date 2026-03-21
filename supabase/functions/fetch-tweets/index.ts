import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, maxResults = 10 } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required (keyword or #hashtag)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const TWITTER_BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN");
    if (!TWITTER_BEARER_TOKEN) {
      throw new Error("TWITTER_BEARER_TOKEN is not configured");
    }

    // Use Twitter API v2 recent search
    const params = new URLSearchParams({
      query: `${query} -is:retweet lang:en`,
      max_results: String(Math.min(Math.max(maxResults, 10), 100)),
      "tweet.fields": "created_at,author_id,text,lang",
      expansions: "author_id",
      "user.fields": "username,name",
    });

    const url = `https://api.x.com/2/tweets/search/recent?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Twitter API error:", response.status, errBody);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Twitter rate limit reached. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: `Twitter API error (${response.status})` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    // Build user lookup map
    const users: Record<string, string> = {};
    if (data.includes?.users) {
      for (const u of data.includes.users) {
        users[u.id] = u.username;
      }
    }

    // Map tweets to simplified structure
    const tweets = (data.data || []).map((tweet: any) => ({
      id: tweet.id,
      text: tweet.text,
      user: users[tweet.author_id] || "unknown",
      createdAt: tweet.created_at,
      lang: tweet.lang,
    }));

    return new Response(JSON.stringify({ tweets, resultCount: tweets.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-tweets error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
