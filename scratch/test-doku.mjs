import crypto from 'crypto';

// Manually load env credentials from .env.local
const CLIENT_ID = "BRN-0234-1717559853351";
const SECRET_KEY = "SK-8uCZzDIeitu8P5Fg07Or";
const BASE_URL = "https://api-sandbox.doku.com"; // Testing Sandbox URL!

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

async function testDoku() {
  const requestTarget = '/checkout/v1/payment';
  const requestId = crypto.randomUUID();
  const requestTimestamp = new Date().toISOString();
  
  const requestBody = {
    order: {
      amount: 520000, 
      invoice_number: `TST-${Date.now()}`,
      currency: 'IDR',
      callback_url: 'https://trekkingmountrinjani.com/api/doku/webhook',
      auto_redirect: true,
    },
    payment: {
      payment_due_date: 60,
    },
    customer: {
      name: "Test Customer",
      email: "test@example.com",
    },
    override_configuration: {
      finish_payment_return_url: 'https://trekkingmountrinjani.com/booking-ticket/success',
    },
  };

  const bodyString = JSON.stringify(requestBody);
  const signature = generateSignature({
    clientId: CLIENT_ID,
    secretKey: SECRET_KEY,
    requestId,
    requestTimestamp,
    requestTarget,
    body: bodyString
  });

  console.log("SENDING REQUEST TO DOKU SANDBOX...");
  console.log("URL:", `${BASE_URL}${requestTarget}`);

  try {
    const response = await fetch(`${BASE_URL}${requestTarget}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': requestTimestamp,
        Signature: signature,
      },
      body: bodyString,
    });

    console.log("STATUS CODE:", response.status);
    const responseText = await response.text();
    console.log("RAW RESPONSE:", responseText);
  } catch (error) {
    console.error("FETCH ERROR:", error);
  }
}

testDoku();
