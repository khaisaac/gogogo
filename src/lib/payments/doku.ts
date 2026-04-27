import crypto from 'crypto'

function getDokuConfig() {
  return {
    clientId: process.env.DOKU_CLIENT_ID!,
    secretKey: process.env.DOKU_SECRET_KEY!,
    baseUrl: process.env.DOKU_BASE_URL || (
      process.env.NODE_ENV === 'production'
        ? 'https://api.doku.com'
        : 'https://api-sandbox.doku.com'
    ),
  }
}

/**
 * Generate DOKU Signature for API requests.
 * Signature = HMAC-SHA256(clientId + ":" + requestId + ":" + requestTimestamp + ":" + requestTarget + ":" + digest, secretKey)
 */
export function generateSignature({
  clientId,
  secretKey,
  requestId,
  requestTimestamp,
  requestTarget,
  body,
}: {
  clientId: string
  secretKey: string
  requestId: string
  requestTimestamp: string
  requestTarget: string
  body: string
}) {
  // Generate digest from body
  const digest = crypto
    .createHash('sha256')
    .update(body)
    .digest('base64')

  // Build component signature — each line separated by newline
  const componentSignature = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${requestTimestamp}`,
    `Request-Target:${requestTarget}`,
    `Digest:${digest}`,
  ].join('\n')

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(componentSignature)
    .digest('base64')

  return `HMACSHA256=${signature}`
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return crypto.randomUUID()
}

/**
 * Get current ISO timestamp for DOKU
 */
export function getTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Create a DOKU Checkout payment page.
 * Returns a URL where the customer can complete the payment.
 */
export async function createDokuPayment({
  invoiceNumber,
  amount,
  customerName,
  customerEmail,
  callbackUrl,
  redirectUrl,
}: {
  invoiceNumber: string
  amount: number // amount in USD
  customerName: string
  customerEmail: string
  callbackUrl: string
  redirectUrl: string
}) {
  const requestTarget = '/checkout/v1/payment'
  const requestId = generateRequestId()
  const requestTimestamp = getTimestamp()

  // DOKU only supports IDR — convert USD to IDR
  // Use env variable for exchange rate, default to 16500
  const usdToIdrRate = Number(process.env.USD_TO_IDR_RATE) || 16500
  const amountInIdr = Math.round(amount * usdToIdrRate)

  const requestBody = {
    order: {
      amount: amountInIdr,
      invoice_number: invoiceNumber,
      currency: 'IDR',
      callback_url: callbackUrl,
      // Auto redirect after payment
      auto_redirect: true,
    },
    payment: {
      payment_due_date: 60, // 60 minutes to pay
    },
    customer: {
      name: customerName,
      email: customerEmail,
    },
    override_configuration: {
      finish_payment_return_url: redirectUrl,
    },
  }

  const { clientId, secretKey, baseUrl } = getDokuConfig()

  const bodyString = JSON.stringify(requestBody)

  const signature = generateSignature({
    clientId,
    secretKey,
    requestId,
    requestTimestamp,
    requestTarget,
    body: bodyString,
  })

  console.log('DOKU request body:', bodyString)
  console.log('DOKU amount conversion:', { usdAmount: amount, idrRate: usdToIdrRate, idrAmount: amountInIdr })
  console.log('DOKU config:', { clientId, baseUrl, requestTarget })

  const response = await fetch(`${baseUrl}${requestTarget}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': clientId,
      'Request-Id': requestId,
      'Request-Timestamp': requestTimestamp,
      Signature: signature,
    },
    body: bodyString,
  })

  const responseText = await response.text()
  console.log(`DOKU raw response [${response.status}]:`, responseText)

  let data: any
  try {
    data = JSON.parse(responseText)
  } catch {
    console.error('DOKU response is not valid JSON:', responseText)
    data = { error: responseText }
  }

  if (!response.ok) {
    console.error(`DOKU API error [${response.status}]:`, JSON.stringify(data, null, 2))
    console.error('DOKU request details:', {
      url: `${baseUrl}${requestTarget}`,
      clientId,
      requestId,
      requestTimestamp,
      amountInIdr,
      invoiceNumber,
    })
  }

  return data
}

/**
 * Verify DOKU notification signature.
 * Used in webhook handler to ensure the notification is authentic.
 */
export function verifyDokuNotification({
  requestId,
  requestTimestamp,
  requestTarget,
  body,
  receivedSignature,
}: {
  requestId: string
  requestTimestamp: string
  requestTarget: string
  body: string
  receivedSignature: string
}): boolean {
  const { clientId, secretKey } = getDokuConfig()
  const expectedSignature = generateSignature({
    clientId,
    secretKey,
    requestId,
    requestTimestamp,
    requestTarget,
    body,
  })

  return expectedSignature === receivedSignature
}

export { getDokuConfig }
