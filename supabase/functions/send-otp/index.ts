import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getTwilioConfig() {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID")?.trim();
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")?.trim();
  const phoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER")?.trim();

  console.log("Twilio config check:", {
    hasSid: !!sid,
    sidLength: sid?.length,
    sidPrefix: sid?.slice(0, 2),
    hasAuthToken: !!authToken,
    authTokenLength: authToken?.length,
    hasPhoneNumber: !!phoneNumber,
    phonePrefix: phoneNumber?.slice(0, 1),
    phoneLength: phoneNumber?.length,
  });

  if (!sid || !authToken || !phoneNumber) {
    throw new Error("Twilio configuration is incomplete. Add the Account SID, Auth Token, and sender phone number in project secrets.");
  }

  if (!/^AC[a-zA-Z0-9]{32}$/.test(sid)) {
    throw new Error("Twilio Account SID is invalid. It must start with AC and be 34 characters long.");
  }

  if (!/^[a-zA-Z0-9]{32}$/.test(authToken)) {
    throw new Error("Twilio Auth Token is invalid. It must be 32 characters long.");
  }

  if (!/^\+[1-9]\d{6,14}$/.test(phoneNumber)) {
    throw new Error("Twilio phone number is invalid. It must use E.164 format like +12025551234.");
  }

  return { sid, authToken, phoneNumber };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone || !/^\+[1-9]\d{6,14}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number. Use E.164 format (e.g. +1234567890)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { sid, authToken, phoneNumber } = getTwilioConfig();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("phone", phone)
      .gte("created_at", tenMinutesAgo);

    if (count && count >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many OTP requests. Please wait before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("otp_codes").insert({
      phone,
      code,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to store OTP");
    }

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phone,
        From: phoneNumber,
        Body: `Your ToxiSense verification code is: ${code}. It expires in 5 minutes.`,
      }),
    });

    const smsData = await response.json();

    if (!response.ok) {
      console.error("Twilio error:", JSON.stringify(smsData));
      throw new Error(`SMS delivery failed: ${smsData.message || "Unknown error"}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("send-otp error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
