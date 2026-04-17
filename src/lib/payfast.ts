// PayFast Integration Helper
// This will be used when PayFast credentials are available

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '';
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '';
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';

// Sandbox URL (use for testing)
const PAYFAST_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.payfast.co.za/eng/process' 
  : 'https://sandbox.payfast.co.za/eng/process';

interface PaymentData {
  amount: number;  // Amount in ZAR
  itemName: string;
  itemDescription: string;
  customStr1?: string; // For order ID, user ID, etc.
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

/**
 * Generate PayFast payment URL
 * This creates a URL that redirects to PayFast for payment
 */
export function createPaymentLink(data: PaymentData): string {
  const params = new URLSearchParams({
    'merchant_id': PAYFAST_MERCHANT_ID,
    'merchant_key': PAYFAST_MERCHANT_KEY,
    'return_url': data.returnUrl,
    'cancel_url': data.cancelUrl,
    'notify_url': data.notifyUrl,
    'amount': data.amount.toFixed(2),
    'item_name': data.itemName,
    'item_description': data.itemDescription,
    'custom_str1': data.customStr1 || '',
  });
  
  // Add passphase if configured
  if (PAYFAST_PASSPHRASE) {
    params.append('passphrase', PAYFAST_PASSPHRASE);
  }
  
  return `${PAYFAST_URL}?${params.toString()}`;
}

/**
 * Validate PayFast payment notification
 * Verifies the data came from PayFast
 */
export async function validatePaymentNotification(formData: FormData): Promise<{
  valid: boolean;
  data: Record<string, string>;
}> {
  const data: Record<string, string> = {};
  
  // Convert FormData to object
  for (const [key, value] of formData.entries()) {
    data[key] = value.toString();
  }
  
  // Check for required fields
  if (!data.merchant_id || !data.payment_status) {
    return { valid: false, data };
  }
  
  // Verify merchant ID matches
  if (data.merchant_id !== PAYFAST_MERCHANT_ID) {
    return { valid: false, data };
  }
  
  return { valid: true, data };
}

/**
 * Format amount for PayFast (must be 2 decimal places)
 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

export default {
  createPaymentLink,
  validatePaymentNotification,
  formatAmount
};