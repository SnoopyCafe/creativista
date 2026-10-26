import {sendEmail} from '../../../lib/email';

export const runtime = 'nodejs';

const recipient = 'admin@creativistapods.com';
const schedules = new Set(['Monday & Wednesday · 12:00–12:45 PM Eastern', 'Tuesday & Thursday · 1:00–1:45 PM Eastern', 'Either schedule']);

function text(value: unknown, limit: number) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({error: 'This form must be submitted from our website.'}, {status: 403});
  }

  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return Response.json({error: 'Invalid form submission.'}, {status: 415});
  }

  let data: Record<string, unknown>;
  try {
    const body = await request.text();
    if (body.length > 5000) throw new Error('Form too large');
    data = JSON.parse(body);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid form');
  } catch {
    return Response.json({error: 'Please check the form and try again.'}, {status: 400});
  }

  // Hidden field catches automated submissions without sending email.
  if (data.website) return Response.json({ok: true});

  const name = text(data.name, 120).replace(/[\r\n]+/g, ' ');
  const email = text(data.email, 254);
  const schedule = text(data.schedule, 100);
  const message = text(data.message, 2000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !schedules.has(schedule) || data.tuitionAcknowledged !== true) {
    return Response.json({error: 'Please complete the required fields and acknowledge tuition.'}, {status: 400});
  }

  const body = [
    'New Reading Groups interest form',
    '',
    `Parent or caregiver: ${name}`,
    `Email: ${email}`,
    `Preferred class schedule: ${schedule}`,
    'Tuition acknowledged: $799 per student for the 8-week program; no payment due with this form.',
    '',
    'Message:',
    message || '(none)',
  ].join('\n');

  const sent = await sendEmail(recipient, 'Reading Groups interest form', body);
  if (!sent) return Response.json({error: 'We could not send your inquiry. Please email admin@creativistapods.com directly.'}, {status: 503});
  return Response.json({ok: true});
}
