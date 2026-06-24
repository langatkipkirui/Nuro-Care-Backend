const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const verificationTemplate = (code) =>
  `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f8fb;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:12px;"><table width="100%" style="max-width:600px;background:#ffffff;border-radius:6px;"><tr><td style="padding:14px;text-align:center;color:#2563eb;border-bottom:1px solid #e5eef5;"><strong style="color:#2563eb;font-size:16px;">Nuro Home Care</strong></td></tr><tr><td style="padding:16px;text-align:center;"><p style="margin:0 0 8px;font-size:14px;color:#2b3e50;">Your verification code:</p><div style="margin:10px 0;"><span style="display:inline-block;padding:10px 22px;font-size:26px;letter-spacing:4px;font-weight:600;color:#2563eb;background:#eaf3fb;border-radius:5px;">${code}</span></div><p style="margin:8px 0 0;font-size:13px;color:#6b7280;">This code expires in <strong>1 hour</strong>.</p><p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">If you did not request this, please ignore this email.</p><p style="margin:24px 0 0;color:#2b3e50;font-size:14px;">Kind regards,<br /><strong>Nuro Home Care Team</strong></p></td></tr></table></td></tr><tr><td style="padding:20px;background:#f4f8fb;text-align:center;"><p style="margin:0;font-size:12px;color:#6b7280;">Need help? Contact us at info@nurohomecare.com</p></td></tr></table></body></html>`;

async function sendVerificationEmail(email, code, subject) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  try {
    const { data, error } = await resend.emails.send({
      from: `Nuro Home Care <${fromEmail}>`,
      to: email,
      subject: subject || 'Nuro Home Care verification code',
      html: verificationTemplate(code),
      text: `Your Nuro Home Care verification code is: ${code}\n\nThis code expires in 1 hour.\n\nIf you did not request this, please ignore this email.`,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Resend send failed:', error);
    return { success: false, error: error?.message };
  }
}

module.exports = { sendVerificationEmail };
