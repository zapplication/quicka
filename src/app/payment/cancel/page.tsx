export default function PaymentCancel() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>❌</div>
        <h1 style={{ fontSize: '36px', marginBottom: '16px', fontWeight: 'bold' }}>
          Payment Cancelled
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px', maxWidth: '400px' }}>
          Your payment was cancelled. No charges were made to your account.
        </p>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)', 
          padding: '24px', 
          borderRadius: '12px',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <p style={{ fontSize: '14px' }}>Need help? <a href="mailto:support@quicka.website" style={{ color: 'white', textDecoration: 'underline' }}>Contact us</a></p>
        </div>
        <a 
          href="/dashboard" 
          style={{ 
            display: 'inline-block',
            marginTop: '32px',
            padding: '14px 32px',
            background: 'white',
            color: '#ef4444',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}
        >
          Try Again
        </a>
      </div>
    </div>
  );
}