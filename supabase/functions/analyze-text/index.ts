import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, platform } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert multilingual content moderation AI trained to detect offensive and non-offensive comments in any language.

LANGUAGE DETECTION: You MUST accurately detect the language of the input text. Supported languages include but are not limited to:
- Telugu, Hindi, English, Tamil, Kannada, Marathi, Urdu, Arabic, Japanese, Spanish, French, German, Korean, Chinese, Bengali, Gujarati, Punjabi, Malayalam
- Code-mixed text (Hinglish, Telugu-English, Urdu-English, Spanglish, etc.)
- Social media language (slang, abbreviations, leetspeak, transliterated text)
- If the text mixes multiple languages, identify the PRIMARY language and note it as code-mixed

For the "language" field, return the detected language name (e.g., "Telugu", "Hindi", "English", "Hinglish (Code-Mixed)", "Japanese", "Tamil", "Social Media English", etc.). Be specific about code-mixed variants.

CLASSIFICATION RULES:
Label 0 (Non-Offensive): Polite, neutral, informative, constructive, positive, supportive, casual positive emojis (😀👍❤️🔥😊🙌), respectful disagreement
Label 1 (Offensive): Insults, abuse, mocking tone, personal attacks, degrading remarks, offensive slang, emoji-based abuse

EMOJI TOXICITY RULES:
- Mocking/insulting emojis: 🤡🤬💀😡😤👎🖕😒🤮💩🐍🗑️🙄 may indicate offensiveness
- Repeated aggressive emojis increase toxicity
- Emojis combined with negative text strengthen offensive intent
- Emojis alone can be offensive if clearly used to mock or insult
- Symbol-based cursing: @#$%&*!, f***, s***, etc.
- Kaomoji/text faces used aggressively: (╯°□°)╯︵ ┻━┻
- Zalgo text, leetspeak (1d10t, n00b), and other obfuscation

IMPORTANT RULES:
- Consider overall context, intent, and tone—not just keywords
- Understand code-mixed, transliterated, and script-mixed text (e.g., Telugu written in Latin script)
- Do NOT classify constructive criticism as offensive unless it includes insults or mocking
- Stay language-agnostic and culturally aware of regional slang and insults
- Detect regional slang insults in ALL supported languages (e.g., "bakwas", "gadha", "bewakoof", "దొంగ", "மடையன்", etc.)

For the politeRewrite field: rewrite the ENTIRE original message in the SAME language as the input, in a respectful, constructive way that preserves the original intent/meaning but removes all offensive elements. Replace offensive emojis with neutral/positive ones. Make it sound natural.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this ${platform || "general"} social media text:\n\n"${text}"` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_analysis",
              description: "Report the content analysis results",
              parameters: {
                type: "object",
                properties: {
                  isOffensive: { type: "boolean", description: "Whether the text contains offensive content (label 1=offensive, 0=non-offensive)" },
                  confidence: { type: "number", description: "Confidence score between 0 and 1" },
                  language: { type: "string", description: "Detected language of the input text (e.g., Telugu, Hindi, English, Hinglish (Code-Mixed), Japanese, Tamil, Social Media English, Arabic, etc.)" },
                  category: { type: "string", enum: ["hate", "abuse", "neutral", "sarcasm"] },
                  target: { type: "string", enum: ["individual", "group", "community", "none"] },
                  severity: { type: "string", enum: ["low", "medium", "high", "none"] },
                  emojiAnalysis: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        emoji: { type: "string" },
                        meaning: { type: "string" },
                        sentiment: { type: "string", enum: ["negative", "neutral", "positive"] },
                      },
                      required: ["emoji", "meaning", "sentiment"],
                    },
                  },
                  slangDetected: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        slang: { type: "string" },
                        meaning: { type: "string" },
                        isOffensive: { type: "boolean" },
                      },
                      required: ["slang", "meaning", "isOffensive"],
                    },
                  },
                  sarcasmDetected: { type: "boolean" },
                  sarcasmConfidence: { type: "number" },
                  sarcasmExplanation: { type: "string" },
                  offensiveWords: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        word: { type: "string" },
                        score: { type: "number", description: "Offensiveness score 0-1" },
                        isOffensive: { type: "boolean" },
                        type: { type: "string", enum: ["word", "emoji", "slang", "symbol"] },
                      },
                      required: ["word", "score", "isOffensive", "type"],
                    },
                  },
                  politeRewrite: { type: "string", description: "A polite, respectful rewrite of the entire message that preserves intent but removes offense. Strip offensive emojis." },
                  explanations: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of explanations about what was detected",
                  },
                },
                required: [
                  "isOffensive", "confidence", "language", "category", "target", "severity",
                  "emojiAnalysis", "slangDetected", "sarcasmDetected", "sarcasmConfidence",
                  "sarcasmExplanation", "offensiveWords", "politeRewrite", "explanations",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-text error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
