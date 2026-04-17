export default function PaymentSuccess() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ fontSize: '36px', marginBottom: '16px', fontWeight: 'bold' }}>
          Payment Successful!
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px', maxWidth: '400px' }}>
          Thank you for your payment! Your website is being generated and will be ready shortly.
        </p>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)', 
          padding: '24px', 
          borderRadius: '12px',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <p style={{ fontSize: '14px', marginBottom: '8px' }}>📧 Check your email for confirmation</p>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>We'll notify you when your site is live!</p>
        </div>
        <a 
          href="/dashboard" 
          style={{ 
            display: 'inline-block',
            marginTop: '32px',
            padding: '14px 32px',
            background: 'white',
            color: '#10b981',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}