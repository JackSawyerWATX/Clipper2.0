import React, { useState } from 'react'

function PaymentProcessing() {
  const [paymentData, setPaymentData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    amount: '',
    orderId: '',
    email: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  })

  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '')
    const chunks = cleaned.match(/.{1,4}/g)
    return chunks ? chunks.join(' ') : cleaned
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value.replace(/\D/g, ''))
    setPaymentData(prev => ({
      ...prev,
      cardNumber: formatted
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setPaymentStatus(null)

    // Simulate payment processing
    // In production, this would integrate with Stripe API
    setTimeout(() => {
      setProcessing(false)
      setPaymentStatus({
        success: true,
        message: 'Payment processed successfully!',
        transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      })
      
      // Clear form on success
      setPaymentData({
        cardholderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        amount: '',
        orderId: '',
        email: '',
        billingAddress: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      })
    }, 2000)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i)

  return (
    <div className="page">
      <h1>Payment Processing</h1>
      <p style={{ color: '#6c757d', marginBottom: '2rem' }}>Secure credit card payment processing via Stripe</p>

      {paymentStatus && (
        <div style={{ 
          padding: '1rem',
          marginBottom: '2rem',
          borderRadius: '8px',
          background: paymentStatus.success ? '#d4edda' : '#f8d7da',
          color: paymentStatus.success ? '#155724' : '#721c24',
          border: `1px solid ${paymentStatus.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <strong>{paymentStatus.success ? '✓' : '✗'} {paymentStatus.message}</strong>
          {paymentStatus.transactionId && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Transaction ID: {paymentStatus.transactionId}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Payment Information */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '2px solid #dee2e6', paddingBottom: '0.5rem' }}>
              Payment Information
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Order ID / Reference
              </label>
              <input 
                type="text"
                name="orderId"
                value={paymentData.orderId}
                onChange={handleInputChange}
                placeholder="ORD-001"
                required
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Amount (USD)
              </label>
              <input 
                type="number"
                name="amount"
                value={paymentData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Email Address
              </label>
              <input 
                type="email"
                name="email"
                value={paymentData.email}
                onChange={handleInputChange}
                placeholder="customer@example.com"
                required
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Cardholder Name
              </label>
              <input 
                type="text"
                name="cardholderName"
                value={paymentData.cardholderName}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Card Number
              </label>
              <input 
                type="text"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4242 4242 4242 4242"
                maxLength="19"
                required
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Exp. Month
                </label>
                <select 
                  name="expiryMonth"
                  value={paymentData.expiryMonth}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Exp. Year
                </label>
                <select 
                  name="expiryYear"
                  value={paymentData.expiryYear}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">YYYY</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  CVV
                </label>
                <input 
                  type="text"
                  name="cvv"
                  value={paymentData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="4"
                  required
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '2px solid #dee2e6', paddingBottom: '0.5rem' }}>
              Billing Address
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Street Address
              </label>
              <input 
                type="text"
                name="billingAddress"
                value={paymentData.billingAddress}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                required
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                City
              </label>
              <input 
                type="text"
                name="city"
                value={paymentData.city}
                onChange={handleInputChange}
                placeholder="New York"
                required
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  State
                </label>
                <input 
                  type="text"
                  name="state"
                  value={paymentData.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                  required
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  ZIP Code
                </label>
                <input 
                  type="text"
                  name="zipCode"
                  value={paymentData.zipCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                  required
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Country
              </label>
              <select 
                name="country"
                value={paymentData.country}
                onChange={handleInputChange}
                required
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <option value="USA">United States</option>
                <option value="CAN">Canada</option>
                <option value="GBR">United Kingdom</option>
                <option value="AUS">Australia</option>
              </select>
            </div>

            <div style={{ 
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                Payment Summary
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>${paymentData.amount || '0.00'}</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={processing}
              style={{ 
                width: '100%',
                padding: '1rem',
                background: processing ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              {processing ? 'Processing Payment...' : 'Process Payment'}
            </button>
          </div>
        </div>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#d1ecf1', borderRadius: '4px', color: '#0c5460' }}>
        <strong>🔒 Secure Payment:</strong> This page will integrate with Stripe for secure payment processing. 
        Stripe API keys and proper integration will be configured later.
      </div>
    </div>
  )
}

export default PaymentProcessing
