const isDev = process.env.NODE_ENV !== 'production';
const FROM = process.env.FROM_EMAIL || 'noreply@vidyut.in';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
async function sendEmail(opts) {
    if (isDev) {
        console.log('\n📧 [EMAIL — DEV MODE — not actually sent]');
        console.log(`  To:      ${opts.to}`);
        console.log(`  Subject: ${opts.subject}`);
        console.log(`  Body:    ${opts.html.replace(/<[^>]*>/g, '').trim().slice(0, 200)}...`);
        console.log();
        return;
    }
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('RESEND_API_KEY not set — email not sent');
        return;
    }
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: FROM,
            to: opts.to,
            subject: opts.subject,
            html: opts.html,
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Resend error: ${err}`);
    }
}
export async function sendVerificationEmail(email, token) {
    const link = `${FRONTEND_URL}/verify-email?token=${token}`;
    await sendEmail({
        to: email,
        subject: 'Verify your Vidyut account',
        html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1a1a2e">Welcome to Vidyut 🎓</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="color:#666;font-size:13px;margin-top:24px">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
        <p style="color:#999;font-size:12px">Or copy this link: ${link}</p>
      </div>
    `,
    });
}
export async function sendPasswordResetEmail(email, token) {
    const link = `${FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
        to: email,
        subject: 'Reset your Vidyut password',
        html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1a1a2e">Reset your password</h2>
        <p>We received a request to reset your Vidyut password.</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="color:#666;font-size:13px;margin-top:24px">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
        <p style="color:#999;font-size:12px">Or copy this link: ${link}</p>
      </div>
    `,
    });
}
//# sourceMappingURL=email.js.map