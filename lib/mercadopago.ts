import fetch from 'node-fetch';

export async function getAccessToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', process.env.MERCADOPAGO_CLIENT_ID!);
  params.append('client_secret', process.env.MERCADOPAGO_CLIENT_SECRET!);

  const res = await fetch('https://api.mercadopago.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`Error al obtener access token: ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}
