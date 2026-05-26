import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const clientId = process.env.DOKU_CLIENT_ID;
const secretKey = process.env.DOKU_SECRET_KEY;
const baseUrl = process.env.DOKU_BASE_URL || 'https://api.doku.com';
const requestTarget = '/checkout/v1/payment';

function generateSignature({ clientId, secretKey, requestId, requestTimestamp, requestTarget, body }) {
  const digest = crypto.createHash('sha256').update(body).digest('base64');
  const componentSignature = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${requestTimestamp}`,
    `Request-Target:${requestTarget}`,
    `Digest:${digest}`,
  ].join('\n');
  const signature = crypto.createHmac('sha256', secretKey).update(componentSignature).digest('base64');
  return `HMACSHA256=${signature}`;
}

async function test() {
  console.log('Active Credentials in .env.local:');
  console.log('Client ID Prefix:', clientId ? clientId.slice(0, 8) : 'NOT_SET');
  console.log('Secret Key Prefix:', secretKey ? secretKey.slice(0, 5) : 'NOT_SET');
  console.log('Base URL:', baseUrl);

  if (!clientId || !secretKey) {
    console.error('Error: Credentials not set in .env.local');
    return;
  }

  const requestId = crypto.randomUUID();
  
  // Test both with and without milliseconds
  const timestampWithMs = new Date().toISOString();
  const timestampWithoutMs = new Date().toISOString().slice(0, 19) + 'Z';

  const requestBody = {
    order: {
      amount: 150000,
      invoice_number: `TST-${Date.now()}`,
      currency: 'IDR',
      callback_url: 'https://trekkingmountrinjani.com/api/doku/webhook',
      auto_redirect: true,
    },
    payment: {
      payment_due_date: 60,
    },
    customer: {
      name: 'Test Live Doku',
      email: 'test@example.com',
    },
    override_configuration: {
      finish_payment_return_url: 'https://trekkingmountrinjani.com/booking-ticket/success',
    },
  };

  const bodyString = JSON.stringify(requestBody);

  for (const timestamp of [timestampWithMs, timestampWithoutMs]) {
    const signature = generateSignature({
      clientId,
      secretKey,
      requestId,
      requestTimestamp: timestamp,
      requestTarget,
      body: bodyString,
    });

    console.log(`\nTesting with timestamp: ${timestamp}`);
    try {
      const res = await fetch(`${baseUrl}${requestTarget}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Id': clientId,
          'Request-Id': requestId,
          'Request-Timestamp': timestamp,
          Signature: signature,
        },
        body: bodyString,
      });
      const text = await res.text();
      console.log(`Status: ${res.status}`);
      console.log(`Response: ${text}`);
    } catch (err) {
      console.error('Error:', err);
    }
  }
}

test();
