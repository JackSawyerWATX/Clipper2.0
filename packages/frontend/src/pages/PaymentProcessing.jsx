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
    <div className="page" style={{ 
      background: '#ffffff',
      fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', sans-serif"
    }}>
      <div style={{
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '3px solid #000080'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', color: '#000080', textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>
          Payment Processing
        </h1>
        <p style={{ margin: 0, color: '#000', fontSize: '1rem', fontWeight: 'normal' }}>
          Secure credit card payment processing via Stripe
        </p>
      </div>

      {paymentStatus && (
        <div style={{ 
          padding: '1rem',
          marginBottom: '2rem',
          background: paymentStatus.success ? '#d4edda' : '#f8d7da',
          color: paymentStatus.success ? '#155724' : '#721c24',
          border: '3px solid',
          borderColor: paymentStatus.success ? '#c3e6cb #006000 #006000 #c3e6cb' : '#f5c6cb #600000 #600000 #f5c6cb',
          boxShadow: '3px 3px 0 rgba(0,0,0,0.2)'
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
            <h2 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#000',
              padding: '0.5rem',
              background: '#c0c0c0',
              border: '2px solid',
              borderColor: '#ebebeb #000000 #000000 #ebebeb',
              textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
            }}>
              Payment Information
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
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
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                  fontSize: '0.875rem',
                  fontFamily: "'MS Sans Serif', sans-serif"
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
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
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                  fontSize: '0.875rem',
                  fontFamily: "'MS Sans Serif', sans-serif"
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
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
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                  fontSize: '0.875rem',
                  fontFamily: "'MS Sans Serif', sans-serif"
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
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
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                  fontSize: '0.875rem',
                  fontFamily: "'MS Sans Serif', sans-serif"
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
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
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  Exp. Month
                </label>
                <select 
                  name="expiryMonth"
                  value={paymentData.expiryMonth}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: '100%',
                    padding: '0.5rem',
                    border: '2px solid',
                    borderColor: '#808080 #ebebeb #ebebeb #808080',
                    fontSize: '0.875rem',
                    fontFamily: "'MS Sans Serif', sans-serif",
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  Exp. Year
                </label>
                <select 
                  name="expiryYear"
                  value={paymentData.expiryYear}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: '100%',
                    padding: '0.5rem',
                    border: '2px solid',
                    borderColor: '#808080 #ebebeb #ebebeb #808080',
                    fontSize: '0.875rem',
                    fontFamily: "'MS Sans Serif', sans-serif",
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
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
                    padding: '0.5rem',
                    border: '2px solid',
                    borderColor: '#808080 #ebebeb #ebebeb #808080',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div>
            <h2 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#000',
              padding: '0.5rem',
              background: '#c0c0c0',
              border: '2px solid',
              borderColor: '#ebebeb #000000 #000000 #ebebeb',
              textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
            }}>
              Billing Address
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
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
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                  fontSize: '0.875rem',
                  fontFamily: "'MS Sans Serif', sans-serif"
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
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
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                  fontSize: '0.875rem',
                  fontFamily: "'MS Sans Serif', sans-serif"
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
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
                    padding: '0.5rem',
                    border: '2px solid',
                    borderColor: '#808080 #ebebeb #ebebeb #808080',
                    fontSize: '0.875rem',
                    fontFamily: "'MS Sans Serif', sans-serif"
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
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
                    padding: '0.5rem',
                    border: '2px solid',
                    borderColor: '#808080 #ebebeb #ebebeb #808080',
                    fontSize: '0.875rem',
                    fontFamily: "'MS Sans Serif', sans-serif"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                Country
              </label>
              <select 
                name="country"
                value={paymentData.country}
                onChange={handleInputChange}
                required
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                  fontSize: '0.875rem',
                  fontFamily: "'MS Sans Serif', sans-serif",
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
              padding: '1.2rem',
              background: 'linear-gradient(to bottom, #008080 0%, #006060 100%)',
              color: '#ffffff',
              border: '3px solid',
              borderColor: '#ebebeb #000000 #000000 #ebebeb',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'normal', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
                Payment Summary
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.75rem', fontWeight: 'bold', textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
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
                background: processing ? '#808080' : '#c0c0c0',
                color: '#000',
                border: '3px solid',
                borderColor: processing ? '#808080 #c0c0c0 #c0c0c0 #808080' : '#ebebeb #000000 #000000 #ebebeb',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                fontFamily: "'MS Sans Serif', sans-serif",
                textShadow: processing ? 'none' : '1px 1px 0 rgba(255,255,255,0.8)',
                boxShadow: processing ? 'none' : '3px 3px 0 rgba(0,0,0,0.2)'
              }}
              onMouseDown={(e) => !processing && (e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000')}
              onMouseUp={(e) => !processing && (e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb')}
            >
              {processing ? 'Processing Payment...' : '💳 Process Payment'}
            </button>
          </div>
        </div>
      </form>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#ffffe0',
        border: '2px solid',
        borderColor: '#000000 #ebebeb #ebebeb #000000',
        boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
        color: '#000'
      }}>
        <strong style={{ fontWeight: 'bold', color: '#000080' }}>🔒 Secure Payment:</strong> This page will integrate with Stripe for secure payment processing. 
        Stripe API keys and proper integration will be configured later.
      </div>
    </div>
  )
}

export default PaymentProcessing
