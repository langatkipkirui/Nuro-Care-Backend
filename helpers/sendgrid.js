const sgMail = require('@sendgrid/mail');

function sendVerificationEmail(email, code) {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API);
    const template =
      '<!DOCTYPE html><html><body style="margin:0; padding:0; background: #f4f8fb; font-family: Arial, Helvetica, sans-serif;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:12px;"><table width="100%" style="max-width:600px; background: #ffffff; border-radius:6px;"><tr><td style="padding:14px; text-align:center; color: #2563eb; border-bottom:1px solid #e5eef5;"><strong style="color: #2563eb; font-size:16px;">Nuro Homecare</strong></td></tr> <tr><td style="padding:16px; text-align:center;"><p style="margin:0 0 8px; font-size:14px; color: #2b3e50;">Verify your Nuro home care account with this code:</p> <div style="margin:10px 0;"> <span style="display:inline-block; padding:10px 22px; font-size:26px; letter-spacing:4px; font-weight:600; color: #2563eb; background: #eaf3fb; border-radius:5px;">{{CODE}}</span></div> <p style="margin:8px 0 0; font-size:13px; color: #6b7280;">This code will expire in <strong>1 hour</strong>.</p><p style="margin:8px 0 0; font-size:12px; color: #9ca3af;">If you did not request this verification, please ignore this email.</p>  <p style="margin:24px 0 0; color:#2b3e50; font-size:14px;">Kind regards,<br /><strong>Nuro Homecare Team</strong></p></td></tr> </table></td></tr><tr><td style="padding: 20px; background:#f4f8fb; text-align:center;"><p style="margin:0; font-size:12px; color:#6b7280;">Need help? Contact us at info@nurohomecare.com</p><p style="margin:8px 0 0; font-size:12px; color:#9ca3af;">Nairobi, Kenya</p></td></tr></table ></body ></html >';
    const html = template.replace(/{{CODE}}/g, code);
    const msg = {
      to: email,
      from: {
        name: 'Nuro Home Care',
        email: process.env.SENDGRID_EMAIL,
      },
      subject: 'Nuro Home Care verification code',
      text: `Nuro Homecare
To continue securely with your Nuro Homecare request, use the verification code below:
Verification Code: ${code}
This code will expire in 10 minutes.
If you did not request this, please ignore this email.
Nuro Homecare
From Scrubs to Smiles`,
      html,
    };
    sgMail.send(msg);
  } catch (error) {
    console.log(error);
  }
}

module.exports = { sendVerificationEmail };
