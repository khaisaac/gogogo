import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID || '';
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY || '';
const DOKU_API_URL = process.env.DOKU_API_URL || 'https://api-sandbox.doku.com';

function generateDokuSignature(clientId: string, requestId: string, requestTimestamp: string, requestTarget: string, digest: string, secretKey: string) {
  const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(componentSignature);
  return `HMACSHA256=${hmac.digest('base64')}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoice, reason } = body;

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice number is required' }, { status: 400 });
    }

    // 1. Fetch the payment record
    const { data: paymentRecord, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice', invoice)
      .single();

    if (fetchError || !paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    if (paymentRecord.status !== 'success' && paymentRecord.status !== 'paid_dp') {
      return NextResponse.json({ error: 'Cannot refund a payment that is not successful' }, { status: 400 });
    }

    if (paymentRecord.refund_status === 'refund_success' || paymentRecord.refund_status === 'refund_pending') {
      return NextResponse.json({ error: 'Refund already processed or is pending' }, { status: 400 });
    }

    // 2. Mark as refund_pending in database before hitting API
    await supabase
      .from('payments')
      .update({ refund_status: 'refund_pending' })
      .eq('invoice', invoice);

    // 3. Call DOKU Refund API
    // The exact endpoint for refund depends on the payment method used in DOKU
    // This is a generic representation. For example, for Credit Card it might be different.
    // Ensure you adjust the payload according to DOKU's specific documentation for the used channel.
    const dokuRefundPayload = {
      refund: {
        amount: paymentRecord.amount_idr,
        invoice_number: invoice,
        reason: reason || 'Customer requested refund',
        refund_id: `REF-${invoice}-${Date.now()}` // Unique refund ID
      }
    };

    const requestBodyString = JSON.stringify(dokuRefundPayload);
    const digestHash = crypto.createHash('sha256').update(requestBodyString).digest('base64');
    const digest = `SHA256=${digestHash}`;
    
    const requestId = crypto.randomUUID();
    const requestTimestamp = new Date().toISOString().substring(0, 19) + "Z";
    // Target might vary, e.g. /credit-card/v1/refund
    const requestTarget = '/orders/v1/refund'; 

    const signature = generateDokuSignature(DOKU_CLIENT_ID, requestId, requestTimestamp, requestTarget, digest, DOKU_SECRET_KEY);

    let refundSuccess = false;
    let dokuResponse;

    try {
      dokuResponse = await axios.post(`${DOKU_API_URL}${requestTarget}`, dokuRefundPayload, {
        headers: {
          'Client-Id': DOKU_CLIENT_ID,
          'Request-Id': requestId,
          'Request-Timestamp': requestTimestamp,
          'Signature': signature,
          'Content-Type': 'application/json'
        }
      });
      // Assuming 200 OK means request accepted
      refundSuccess = true;
    } catch (apiError: any) {
      console.error('DOKU Refund API Error:', apiError.response?.data || apiError.message);
      refundSuccess = false;
    }

    // 4. Update Database with final refund status
    const finalRefundStatus = refundSuccess ? 'refund_success' : 'refund_failed';
    const { error: updateError } = await supabase
      .from('payments')
      .update({ refund_status: finalRefundStatus })
      .eq('invoice', invoice);

    if (updateError) {
      console.error('Failed to update refund status in DB:', updateError);
    }

    if (!refundSuccess) {
      return NextResponse.json({ error: 'Refund request to DOKU failed' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Refund processed successfully',
      refundId: dokuRefundPayload.refund.refund_id
    });

  } catch (error: any) {
    console.error('Refund API Error:', error);
    return NextResponse.json({ error: 'Internal server error processing refund' }, { status: 500 });
  }
}
