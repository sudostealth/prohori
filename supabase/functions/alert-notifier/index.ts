import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const twilioFromNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER'); // e.g., whatsapp:+14155238886

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
);

serve(async (req) => {
  try {
    const { type, record } = await req.json(); // Expected payload from DB webhook
    if (type !== 'INSERT' || !record) {
      return new Response('Not an insert event', { status: 400 });
    }

    const alert = record;
    
    // Only notify on High or Critical alerts
    if (alert.severity !== 'Critical' && alert.severity !== 'High') {
      return new Response('Severity too low for notification', { status: 200 });
    }

    // Fetch tenant contact preferences
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('email') // in a real app, query a notification_preferences table or role
      .limit(1);
    
    if (error || !profiles || profiles.length === 0) {
      throw new Error("No users found to notify");
    }

    const email = profiles[0].email;
    const alertMessage = `Prohori Security Alert: [${alert.severity}] ${alert.title} on agent ${alert.agent_name}`;

    // 1. Send Email via Resend
    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'alerts@prohori.com.bd', // Must be verified in Resend
          to: [email],
          subject: `Security Alert - ${alert.severity}`,
          html: `<p><strong>${alert.severity} Alert</strong></p><p>${alert.title}</p><p>${alert.description}</p>`
        })
      });
      if (!res.ok) console.error("Resend Error:", await res.text());
    }

    // 2. Send WhatsApp via Twilio
    if (twilioSid && twilioAuthToken) {
       // Twilio API requires Basic Auth (SID:AuthToken) and x-www-form-urlencoded
       const toPhone = 'whatsapp:+8801700000000'; // Target user's verified phone number
       const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
       
       const body = new URLSearchParams({
         'From': twilioFromNumber as string,
         'To': toPhone,
         'Body': alertMessage
       });

       const res = await fetch(twilioUrl, {
         method: 'POST',
         headers: {
           'Authorization': `Basic ${btoa(`${twilioSid}:${twilioAuthToken}`)}`,
           'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: body.toString()
       });
       
       if (!res.ok) console.error("Twilio Error:", await res.text());
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});
