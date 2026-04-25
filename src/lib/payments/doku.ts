import crypto from 'crypto'

const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID!
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY!

// Use sandbox for development, production for live
const DOKU_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.doku.com'
  : 'https://api-sandbox.doku.com'

/**
 * Generate DOKU Signature for API requests.
 * Signature = HMAC-SHA256(clientId + ":" + requestId + ":" + requestTimestamp + ":" + requestTarget + ":" + digest, secretKey)
 */
export function generateSignature({
  requestId,
  requestTimestamp,
  requestTarget,
  body,
}: {
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

  // Build component signature
  const componentSignature = `Client-Id:${DOKU_CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`

  const signature = crypto
    .createHmac('sha256', DOKU_SECRET_KEY)
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
  amount: number
  customerName: string
  customerEmail: string
  callbackUrl: string
  redirectUrl: string
}) {
  const requestTarget = '/checkout/v1/payment'
  const requestId = generateRequestId()
  const requestTimestamp = getTimestamp()

  const requestBody = {
    order: {
      amount,
      invoice_number: invoiceNumber,
      currency: 'USD',
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

  const bodyString = JSON.stringify(requestBody)

  const signature = generateSignature({
    requestId,
    requestTimestamp,
    requestTarget,
    body: bodyString,
  })

  const response = await fetch(`${DOKU_BASE_URL}${requestTarget}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': DOKU_CLIENT_ID,
      'Request-Id': requestId,
      'Request-Timestamp': requestTimestamp,
      Signature: signature,
    },
    body: bodyString,
  })

  const data = await response.json()
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
  const expectedSignature = generateSignature({
    requestId,
    requestTimestamp,
    requestTarget,
    body,
  })

  return expectedSignature === receivedSignature
}

export { DOKU_BASE_URL }
