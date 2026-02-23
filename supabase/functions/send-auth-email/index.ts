// supabase/functions/send-auth-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  // CORS for local testing if needed
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const { record } = await req.json();
    const userEmail = record.email;

    if (!userEmail) {
      return new Response(JSON.stringify({ error: "Missing email" }), { status: 400 });
    }

    // 1. Generate Email Confirmation Link manually via Supabase Admin API
    // This allows us to control the redirect and bypass the default email sending completely.
    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: userEmail,
      options: {
        redirectTo: "https://www.prohori.app/auth/confirmed", // Redirect to success page
      },
    });

    if (linkError) {
      console.error("Error generating link:", linkError);
      return new Response(JSON.stringify({ error: linkError.message }), { status: 500 });
    }

    const action_link = data.properties.action_link;

    // 2. Send Email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "Prohori Security <noreply@joruri.prohori.app>",
      to: [userEmail],
      subject: "Confirm your Prohori account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827; text-align: center;">Welcome to Prohori!</h2>
          <p style="color: #4b5563; text-align: center;">Please confirm your email address to activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${action_link}" style="display:inline-block; background-color: #00D4A0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Confirm Email</a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">Or verify using this link: <a href="${action_link}" style="color: #00D4A0;">${action_link}</a></p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(JSON.stringify({ error: emailError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
