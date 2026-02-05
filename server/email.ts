import { Resend } from 'resend';

let connectionSettings: any;

// Détection du mode auto-hébergé
function isSelfHosted(): boolean {
  return !process.env.REPLIT_CONNECTORS_HOSTNAME;
}

async function getCredentials() {
  // Mode auto-hébergé : utiliser les variables d'environnement
  if (isSelfHosted()) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Innov Studio <noreply@innov-studio.fr>';
    
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured for self-hosted mode');
    }
    
    return { apiKey, fromEmail };
  }
  
  // Mode Replit : utiliser le connecteur
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

// Obtenir l'URL de base pour les liens dans les emails
function getBaseUrl(): string {
  if (isSelfHosted()) {
    return process.env.APP_URL || 'https://innov-studio.fr';
  }
  return process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000';
}

export async function sendVerificationEmail(to: string, firstName: string, verificationToken: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const verificationUrl = `${getBaseUrl()}/verify-email?token=${verificationToken}`;
    
    const { error } = await client.emails.send({
      from: fromEmail || 'Innov Studio <noreply@innov-studio.fr>',
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

export async function sendPasswordResetEmail(to: string, firstName: string, resetToken: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const resetUrl = `${getBaseUrl()}/reset-password?token=${resetToken}`;
    
    const { error } = await client.emails.send({
      from: fromEmail || 'Innov Studio <noreply@innov-studio.fr>',
      to: [to],
      subject: 'Réinitialisation de votre mot de passe - Innov Studio',
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
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Réinitialisation du mot de passe</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Bonjour ${firstName}, vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
                  Réinitialiser mon mot de passe
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                Ce lien est valable pendant 1 heure. Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="color: #6366f1; font-size: 14px; word-break: break-all; margin: 8px 0 0 0;">
                ${resetUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe ne sera pas modifié.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

export async function sendPasswordChangeEmail(to: string, firstName: string, resetToken: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const resetUrl = `${getBaseUrl()}/reset-password?token=${resetToken}`;
    
    const { error } = await client.emails.send({
      from: fromEmail || 'Innov Studio <noreply@innov-studio.fr>',
      to: [to],
      subject: 'Modification de votre mot de passe - Innov Studio',
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
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Modification du mot de passe</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Bonjour ${firstName}, vous avez demandé à modifier votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
                  Modifier mon mot de passe
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                Ce lien est valable pendant 1 heure.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Si vous n'avez pas demandé cette modification, ignorez cet email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending password change email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending password change email:', error);
    return false;
  }
}

export async function sendEmailChangeConfirmation(to: string, firstName: string, newEmail: string, confirmToken: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const confirmUrl = `${getBaseUrl()}/confirm-email-change?token=${confirmToken}`;
    
    const { error } = await client.emails.send({
      from: fromEmail || 'Innov Studio <noreply@innov-studio.fr>',
      to: [to],
      subject: 'Confirmez le changement d\'email - Innov Studio',
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
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Changement d'adresse email</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Bonjour ${firstName}, vous avez demandé à changer votre adresse email vers :
              </p>
              <p style="color: #6366f1; font-size: 18px; font-weight: 600; text-align: center; margin: 0 0 24px 0;">
                ${newEmail}
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
                  Confirmer le changement
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                Ce lien est valable pendant 1 heure.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Si vous n'avez pas demandé ce changement, ignorez cet email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email change confirmation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email change confirmation:', error);
    return false;
  }
}

export async function sendContactEmail(senderName: string, senderEmail: string, senderPhone: string, subject: string, message: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    // Email to admin with the contact form message
    const adminEmail = "contact@innov-studio.fr";
    
    const { error } = await client.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: senderEmail,
      subject: `[Contact] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px; border-radius: 16px;">
            <div style="background: white; padding: 32px; border-radius: 12px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #0ea5e9; font-size: 24px; font-weight: 300; margin: 0;">Innov Studio</h1>
              </div>
              <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 8px 0; text-align: center;">
                Nouveau message de contact
              </h2>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0;"><strong>De:</strong> ${senderName}</p>
                <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${senderEmail}" style="color: #0ea5e9;">${senderEmail}</a></p>
                ${senderPhone ? `<p style="margin: 0 0 8px 0;"><strong>Téléphone:</strong> <a href="tel:${senderPhone}" style="color: #0ea5e9;">${senderPhone}</a></p>` : ''}
                <p style="margin: 0;"><strong>Sujet:</strong> ${subject}</p>
              </div>
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px;">
                <p style="margin: 0 0 8px 0;"><strong>Message:</strong></p>
                <p style="margin: 0; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Vous pouvez répondre directement à cet email pour contacter ${senderName}.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending contact email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending contact email:', error);
    return false;
  }
}
