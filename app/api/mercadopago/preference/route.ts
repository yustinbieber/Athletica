import type { NextApiRequest, NextApiResponse } from 'next';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const accessToken = await getAccessToken();

    const mp = new MercadoPago({
      accessToken,
    });

    const { nombreSocio, monto } = req.body;

    if (!nombreSocio || !monto) {
      return res.status(400).json({ error: 'Faltan datos' });
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


    res.status(200).json({ init_point: response.body.init_point });
  } catch (error) {
    console.error('Error creando preferencia:', error);
    res.status(500).json({ error: 'Error creando preferencia' });
  }
}
