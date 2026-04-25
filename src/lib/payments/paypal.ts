const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!

// Use sandbox for development, production for live
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

/**
 * Get an access token from PayPal using client credentials.
 */
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(`PayPal auth error: ${JSON.stringify(data)}`)
  }

  return data.access_token
}

/**
 * Create a PayPal order using the Orders API v2.
 */
export async function createPayPalOrder({
  amount,
  currency = 'USD',
  description,
  invoiceId,
  returnUrl,
  cancelUrl,
}: {
  amount: number
  currency?: string
  description: string
  invoiceId: string
  returnUrl: string
  cancelUrl: string
}) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: invoiceId,
          description,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          invoice_id: invoiceId,
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            brand_name: 'Trekking Mount Rinjani',
            locale: 'en-US',
            landing_page: 'LOGIN',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
      },
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(`PayPal order creation error: ${JSON.stringify(data)}`)
  }

  return data
}

/**
 * Capture a PayPal order after approval.
 */
export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken()

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(`PayPal capture error: ${JSON.stringify(data)}`)
  }

  return data
}

/**
 * Verify a PayPal webhook signature.
 */
export async function verifyPayPalWebhook({
  webhookId,
  headers,
  body,
}: {
  webhookId: string
  headers: Record<string, string>
  body: string
}): Promise<boolean> {
  const accessToken = await getAccessToken()

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    }
  )

  const data = await response.json()
  return data.verification_status === 'SUCCESS'
}

export { PAYPAL_BASE_URL, PAYPAL_CLIENT_ID }
