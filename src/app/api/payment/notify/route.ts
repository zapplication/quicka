import { NextRequest, NextResponse } from 'next/server';

// PayFast payment notification handler
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract payment data
    const paymentStatus = formData.get('payment_status');
    const amountGross = formData.get('amount_gross');
    const itemName = formData.get('item_name');
    const merchantId = formData.get('merchant_id');
    const token = formData.get('token');
    
    console.log('PayFast Payment Notification:', {
      status: paymentStatus,
      amount: amountGross,
      item: itemName
    });
    
    // Verify this is from PayFast (check merchant_id matches)
    const expectedMerchantId = process.env.PAYFAST_MERCHANT_ID;
    
    if (merchantId !== expectedMerchantId) {
      console.error('Invalid merchant ID:', merchantId);
      return NextResponse.json({ error: 'Invalid merchant' }, { status: 400 });
    }
    
    // Handle different payment statuses
    if (paymentStatus === 'COMPLETE') {
      // Payment successful - mark order as paid
      // TODO: Update database with payment confirmation
      console.log('Payment successful for:', itemName, 'R' + amountGross);
      
      return NextResponse.json({ status: 'ok' });
    } else if (paymentStatus === 'FAILED') {
      // Payment failed
      console.log('Payment failed for:', itemName);
      
      return NextResponse.json({ status: 'failed' });
    }
    
    return NextResponse.json({ status: 'unknown' });
  } catch (error) {
    console.error('PayFast notification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Handle GET for verification
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'PayFast notification endpoint ready'
  });
}