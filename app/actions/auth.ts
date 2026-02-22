'use server';

const AUTHORIZED_EMAILS = (process.env.ADMIN_AUTHORIZED_EMAILS || '').split(',').map(e => e.trim());

export async function checkIsAdmin(email: string) {
  return AUTHORIZED_EMAILS.includes(email);
}
