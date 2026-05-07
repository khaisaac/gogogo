import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// DOKU Credentials
const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID || '';
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY || '';
const DOKU_BASE_URL = process.env.DOKU_BASE_URL || 'https://api.doku.com';

// Function to get Exchange Rate (USD to IDR)
async function getExchangeRate() {
  try {
    const apiKey = '2da821bd32ec2043354c3fde';
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
    const rate = response.data.conversion_rates.IDR;
    // Add margin of 200 IDR
    return rate + 200;
  } catch (error) {
    console.error('Error fetching exchange rate, using default.', error);
    // Fallback rate if API fails
    return 15500 + 200; 
  }
}

// Function to generate DOKU Signature
function generateDokuSignature(clientId: string, requestId: string, requestTimestamp: string, requestTarget: string, digest: string, secretKey: string) {
  const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(componentSignature);
  return `HMACSHA256=${hmac.digest('base64')}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, amountUSD, customerName, customerEmail, paymentType, parentInvoice } = body;

    if (!orderId || !amountUSD || !customerName || !customerEmail || !paymentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['full', 'dp', 'pelunasan'].includes(paymentType)) {
      return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });
    }

    // 1. Calculate Amount in IDR
    const exchangeRate = await getExchangeRate();
    let finalAmountUSD = parseFloat(amountUSD);

    // If DP, calculate 30%
    if (paymentType === 'dp') {
      finalAmountUSD = finalAmountUSD * 0.3;
    } else if (paymentType === 'pelunasan') {
      finalAmountUSD = finalAmountUSD * 0.7; // The remaining 70%
    }
    
    // Round IDR to avoid decimal issues with payment gateway
    const amountIDR = Math.round(finalAmountUSD * exchangeRate);

    const invoiceNumber = `INV-${orderId}-${Date.now()}`;
    
    // 2. Save payment intent to database
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        invoice: invoiceNumber,
        parent_invoice: parentInvoice || null, // Useful for linking 'pelunasan' to original 'dp' invoice or order
        amount_usd: finalAmountUSD,
        amount_idr: amountIDR,
        payment_type: paymentType,
        status: 'pending'
      });

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Failed to save payment record' }, { status: 500 });
    }

    // 3. Prepare DOKU Request
    const dokuPayload = {
      order: {
        invoice_number: invoiceNumber,
        amount: amountIDR
      },
      payment: {
        payment_due_date: 60 // minutes
      },
      customer: {
        id: customerEmail,
        name: customerName,
        email: customerEmail
      }
    };

    const requestBodyString = JSON.stringify(dokuPayload);
    const digestHash = crypto.createHash('sha256').update(requestBodyString).digest('base64');
    const digest = `SHA256=${digestHash}`;
    
    const requestId = crypto.randomUUID();
    const requestTimestamp = new Date().toISOString().substring(0, 19) + "Z"; // YYYY-MM-DDTHH:MM:SSZ
    const requestTarget = '/checkout/v1/payment';

    const signature = generateDokuSignature(DOKU_CLIENT_ID, requestId, requestTimestamp, requestTarget, digest, DOKU_SECRET_KEY);

    // 4. Call DOKU Checkout API
    const dokuResponse = await axios.post(`${DOKU_BASE_URL}${requestTarget}`, dokuPayload, {
      headers: {
        'Client-Id': DOKU_CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': requestTimestamp,
        'Signature': signature,
        'Content-Type': 'application/json'
      }
    });

    return NextResponse.json({
      success: true,
      invoice: invoiceNumber,
      paymentUrl: dokuResponse.data.response.payment.url, // DOKU checkout URL
      amountIDR,
      amountUSD: finalAmountUSD,
      paymentType
    });

  } catch (error: any) {
    console.error('Checkout API Error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: 'Failed to process checkout',
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
}
