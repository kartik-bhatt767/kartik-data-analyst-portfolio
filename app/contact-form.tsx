'use client';

import { FormEvent, useState } from 'react';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [state, setState] = useState<FormState>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setMessage('');

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Unable to send your message.');
      form.reset();
      setState('sent');
      setMessage('Thanks — your message has been sent.');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Unable to send your message.');
    }
  }

  return (
    <form className="contact-form" id="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label><span>Your name</span><input name="name" type="text" autoComplete="name" required placeholder="Jane Doe" /></label>
        <label><span>Your email</span><input name="email" type="email" autoComplete="email" required placeholder="jane@example.com" /></label>
      </div>
      <label><span>Message</span><textarea name="message" rows={4} required placeholder="Tell me what you are working on..." /></label>
      <div className="form-actions">
        <button type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message'} <span aria-hidden="true">↗</span></button>
        {message && <p className={state === 'error' ? 'form-message form-error' : 'form-message'} role="status">{message}</p>}
      </div>
    </form>
  );
}
