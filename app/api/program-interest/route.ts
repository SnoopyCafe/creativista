import {sendEmail} from '../../../lib/email';

export const runtime = 'nodejs';

const recipient = 'admin@creativistapods.com';
const interests = new Set(['Intro parent reading workshop', '4-week reading academy', 'Homeschool community']);

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

  if (data.website) return Response.json({ok: true});

  const name = text(data.name, 120).replace(/[\r\n]+/g, ' ');
  const email = text(data.email, 254);
  const interest = text(data.interest, 80);
  const message = text(data.message, 2000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !interests.has(interest)) {
    return Response.json({error: 'Please complete the required fields.'}, {status: 400});
  }

  const body = [
    'New program interest form',
    '',
    `Parent or caregiver: ${name}`,
    `Email: ${email}`,
    `Interest: ${interest}`,
    '',
    'Message:',
    message || '(none)',
  ].join('\n');

  const sent = await sendEmail(recipient, `${interest} interest form`, body);
  if (!sent) return Response.json({error: 'We could not send your interest form. Please email admin@creativistapods.com directly.'}, {status: 503});
  return Response.json({ok: true});
}
