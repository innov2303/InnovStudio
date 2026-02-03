import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendVerificationEmail(to: string, firstName: string, verificationToken: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const verificationUrl = `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
    
    const { error } = await client.emails.send({
      from: fromEmail || 'Innov Studio <noreply@resend.dev>',
      to: [to],
      subject: 'Vérifiez votre adresse email - Innov Studio',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">Innov Studio</h1>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Bienvenue, ${firstName} !</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Merci de vous être inscrit sur Innov Studio. Pour accéder à votre espace client, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
                  Vérifier mon email
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="color: #6366f1; font-size: 14px; word-break: break-all; margin: 8px 0 0 0;">
                ${verificationUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Si vous n'avez pas créé de compte sur Innov Studio, vous pouvez ignorer cet email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}
