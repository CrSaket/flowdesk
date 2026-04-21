/**
 * POST /api/notify/email
 * Sends a notification email to the user.
 *
 * Requires env vars (add to .env.local):
 *   EMAIL_HOST      — SMTP host (e.g. smtp.gmail.com)
 *   EMAIL_PORT      — SMTP port (e.g. 587)
 *   EMAIL_USER      — SMTP username / sender address
 *   EMAIL_PASS      — SMTP password or app password
 *   EMAIL_FROM      — "From" display name + address, e.g. "FlowDesk <noreply@yourdomain.com>"
 *
 * Without those vars the endpoint falls back to logging (dev mode).
 */

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface EmailPayload {
  to: string
  subject: string
  title: string
  description: string
  href?: string
  severity?: string
}

function buildHtml(payload: EmailPayload): string {
  const { title, description, href, severity = 'info' } = payload
  const accentColor = severity === 'urgent' ? '#FF6B6B' : severity === 'warning' ? '#FFC85C' : severity === 'success' ? '#00E5A0' : '#4F46FF'
  const link = href ? `https://flowdesk.app${href}` : 'https://flowdesk.app/dashboard'
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#08080f;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08080f;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#141128;border-radius:16px;border:1px solid #252248;overflow:hidden;">
        <!-- Header -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid #252248;background:#0D0B1E;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${accentColor};margin-right:8px;vertical-align:middle;"></span>
                <span style="font-size:18px;font-weight:800;color:#EAEAF5;letter-spacing:-0.03em;vertical-align:middle;">FlowDesk</span>
              </td>
              <td align="right">
                <span style="font-size:11px;color:#5C5E78;background:#080614;border:1px solid #252248;padding:4px 10px;border-radius:6px;">AI Alert</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Alert bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,${accentColor},${accentColor}80);"></td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#EAEAF5;line-height:1.3;">${title}</h2>
          <p style="margin:0 0 24px;font-size:14px;color:#9698B0;line-height:1.7;">${description}</p>
          <a href="${link}" style="display:inline-block;padding:12px 24px;background:${accentColor};color:#fff;text-decoration:none;font-size:14px;font-weight:700;border-radius:8px;">
            View in FlowDesk →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #252248;background:#0D0B1E;">
          <p style="margin:0;font-size:11px;color:#5C5E78;">You received this because you enabled email alerts in FlowDesk. <a href="${link}/settings" style="color:#6E67FF;text-decoration:none;">Manage preferences</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const body: EmailPayload = await req.json()
    const { to, subject, title, description, href, severity } = body

    if (!to || !subject || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const {
      EMAIL_HOST,
      EMAIL_PORT,
      EMAIL_USER,
      EMAIL_PASS,
      EMAIL_FROM,
    } = process.env

    // Dev fallback — no SMTP configured
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
      console.log('[FlowDesk Email] SMTP not configured. Would have sent:')
      console.log(`  To: ${to}`)
      console.log(`  Subject: ${subject}`)
      console.log(`  Title: ${title}`)
      console.log('  Add EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM to .env.local to enable real emails.')
      return NextResponse.json({ ok: true, dev: true, message: 'Email logged (SMTP not configured)' })
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT ?? '587', 10),
      secure: parseInt(EMAIL_PORT ?? '587', 10) === 465,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    })

    await transporter.sendMail({
      from: EMAIL_FROM ?? `FlowDesk <${EMAIL_USER}>`,
      to,
      subject,
      html: buildHtml({ to, subject, title, description, href, severity }),
      text: `${title}\n\n${description}\n\nView in FlowDesk: https://flowdesk.app${href ?? '/dashboard'}`,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[FlowDesk Email] Send failed:', err)
    return NextResponse.json({ error: err.message ?? 'Email send failed' }, { status: 500 })
  }
}
