import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY || '';

// Function to verify DOKU Signature
function verifySignature(headers: Headers, rawBody: string, secretKey: string): boolean {
  const clientId = headers.get('client-id') || '';
  const requestId = headers.get('request-id') || '';
  const requestTimestamp = headers.get('request-timestamp') || '';
  const requestTarget = headers.get('request-target') || '/api/doku/webhook'; // your webhook endpoint path
  const signatureHeader = headers.get('signature') || '';

  const digestHash = crypto.createHash('sha256').update(rawBody).digest('base64');
  const digest = `SHA256=${digestHash}`;
  
  const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(componentSignature);
  const calculatedSignature = `HMACSHA256=${hmac.digest('base64')}`;

  return signatureHeader === calculatedSignature;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;

    // Verify Signature (Important for security)
    if (!verifySignature(headers, rawBody, DOKU_SECRET_KEY)) {
      console.error('Invalid DOKU Webhook Signature');
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const transactionStatus = payload.transaction?.status;
    const invoiceNumber = payload.order?.invoice_number;

    if (!invoiceNumber) {
      return NextResponse.json({ error: 'No invoice number found' }, { status: 400 });
    }

    // Determine the status to update
    let newStatus = 'pending';
    if (transactionStatus === 'SUCCESS') {
      newStatus = 'success';
    } else if (transactionStatus === 'FAILED') {
      newStatus = 'failed';
    } else {
      // Ignored other statuses for now
      return NextResponse.json({ message: 'Status ignored' }, { status: 200 });
    }

    // 1. Get the current payment record
    const { data: paymentRecord, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice', invoiceNumber)
      .single();

    if (fetchError || !paymentRecord) {
      console.error('Payment not found:', fetchError);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // 2. Adjust status based on payment type (DP vs Full/Pelunasan)
    let finalStatusToSave = newStatus;
    if (newStatus === 'success' && paymentRecord.payment_type === 'dp') {
      finalStatusToSave = 'paid_dp';
    }

    // 3. Update the payment status in database
    const { error: updateError } = await supabase
      .from('payments')
      .update({ status: finalStatusToSave })
      .eq('invoice', invoiceNumber);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    // Logic for successful DP
    if (finalStatusToSave === 'paid_dp') {
      // Create second invoice for the remaining 70% automatically? 
      // Usually, we just update the status, and the user comes back later to pay 'pelunasan'.
      // But if we want to create the record now:
      console.log(`DP paid for ${invoiceNumber}. You can create the 'pelunasan' invoice record here if needed.`);
      /*
      await supabase.from('payments').insert({
        invoice: `INV-PELUNASAN-${Date.now()}`,
        parent_invoice: invoiceNumber,
        amount_usd: paymentRecord.amount_usd / 0.3 * 0.7, // Reverse calculate remaining 70%
        amount_idr: Math.round(paymentRecord.amount_idr / 0.3 * 0.7),
        payment_type: 'pelunasan',
        status: 'pending'
      });
      */
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
