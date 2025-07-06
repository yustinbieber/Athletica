// app/api/mercadopago/preference/route.ts

import { NextResponse } from 'next/server';
import MercadoPago from 'mercadopago';

async function getAccessToken() {
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

export async function POST(req: Request) {
  try {
    const accessToken = await getAccessToken();
    const mp = new MercadoPago({ accessToken });

    const body = await req.json();
    const { nombreSocio, monto } = body;

    if (!nombreSocio || !monto) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const preference = {
      items: [
        {
          title: `Pago socio: ${nombreSocio}`,
          quantity: 1,
          unit_price: Number(monto),
        },
      ],
      back_urls: {
        success: 'https://tuapp.com/pago-exitoso',
        failure: 'https://tuapp.com/pago-fallido',
        pending: 'https://tuapp.com/pago-pendiente',
      },
      auto_return: 'approved',
    };

    // @ts-ignore
    const response = await mp.preferences.create(preference);

    return NextResponse.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error('Error creando preferencia:', error);
    return NextResponse.json({ error: 'Error creando preferencia' }, { status: 500 });
  }
}
