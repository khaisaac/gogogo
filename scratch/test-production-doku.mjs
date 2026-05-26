import crypto from 'crypto';

const clientId = 'BRN-0277-1777255041013';
const secretKey = 'SK-dFgSKlFHoFNHcWO6s491';
const baseUrl = 'https://api.doku.com';
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
  const requestId = crypto.randomUUID();
  const requestTimestamp = new Date().toISOString();
  
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
      name: 'Test Production',
      email: 'test@example.com',
    },
    override_configuration: {
      finish_payment_return_url: 'https://trekkingmountrinjani.com/booking-ticket/success',
    },
  };

  const bodyString = JSON.stringify(requestBody);
  const signature = generateSignature({
    clientId,
    secretKey,
    requestId,
    requestTimestamp,
    requestTarget,
    body: bodyString,
  });

  console.log('Sending request to production DOKU...');
  try {
    const res = await fetch(`${baseUrl}${requestTarget}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': clientId,
        'Request-Id': requestId,
        'Request-Timestamp': requestTimestamp,
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

test();
