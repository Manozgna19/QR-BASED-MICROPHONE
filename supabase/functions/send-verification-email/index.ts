
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  name: string;
  email: string;
  attendeeId: string;
  verificationLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, attendeeId, verificationLink }: VerificationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Event Registration <onboarding@resend.dev>",
      to: [email],
      subject: "Verify Your Event Registration",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to the Event, ${name}!</h2>
          <p>Thank you for registering. Your unique attendee ID is:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <strong style="font-size: 18px; font-family: monospace;">${attendeeId}</strong>
          </div>
          <p>Click the link below to verify your registration:</p>
          <a href="${verificationLink}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">
            Verify Registration
          </a>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            ${verificationLink}
          </p>
          <p style="color: #666; font-size: 12px;">
            If you didn't register for this event, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
