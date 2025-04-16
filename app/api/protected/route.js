import jwt from 'jsonwebtoken';
import { getCookie } from 'cookies-next';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  const token = getCookie('token', { req: request });

  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded user:', decoded);

    return new Response(
      JSON.stringify({ data: 'Protected data here' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
