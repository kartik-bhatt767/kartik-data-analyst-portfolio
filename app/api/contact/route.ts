import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; message?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Please send valid form data.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length > 100) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  }
  if (!emailPattern.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!message || message.length > 5000) {
    return NextResponse.json({ error: 'Please enter a message under 5,000 characters.' }, { status: 400 });
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_APP_PASSWORD;
  const contactEmail = process.env.CONTACT_TO_EMAIL || 'kartikbhatt23100@gmail.com';

  if (!smtpUser || !smtpPassword) {
    return NextResponse.json({ error: 'Contact delivery is not configured yet.' }, { status: 503 });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPassword },
    });

    await transporter.sendMail({
      from: `Kartik Bhatt Portfolio <${smtpUser}>`,
      to: contactEmail,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'The message could not be sent. Please try again later.' }, { status: 500 });
  }
}
