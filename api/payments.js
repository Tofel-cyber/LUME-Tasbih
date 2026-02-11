// ===== Pi Network Payment Verification API =====
// This API should be called from your Pi App to verify payments

const axios = require('axios');

// IMPORTANT: Store this in Vercel Environment Variables
const PI_API_KEY = process.env.PI_API_KEY || 'your_pi_api_key_here';
const PI_API_URL = 'https://api.minepi.com';

// In-memory storage (use database in production)
const payments = new Map();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'approve':
        return await approvePayment(req, res);
      case 'complete':
        return await completePayment(req, res);
      case 'verify':
        return await verifyPayment(req, res);
      case 'status':
        return await getPaymentStatus(req, res);
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          validActions: ['approve', 'complete', 'verify', 'status']
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// ===== Approve Payment =====
async function approvePayment(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId, userId } = req.body;

  if (!paymentId || !userId) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['paymentId', 'userId']
    });
  }

  try {
    // Verify payment with Pi Network API
    const response = await axios.get(
      `${PI_API_URL}/v2/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Key ${PI_API_KEY}`
        }
      }
    );

    const payment = response.data;

    // Validate payment
    if (payment.status.developer_approved) {
      return res.status(400).json({ 
        error: 'Payment already approved' 
      });
    }

    if (payment.status.cancelled) {
      return res.status(400).json({ 
        error: 'Payment was cancelled' 
      });
    }

    // Additional validation
    if (payment.amount !== 0.001) {
      return res.status(400).json({ 
        error: 'Invalid payment amount',
        expected: 0.001,
        received: payment.amount
      });
    }

    // Approve the payment
    const approveResponse = await axios.post(
      `${PI_API_URL}/v2/payments/${paymentId}/approve`,
      {},
      {
        headers: {
          'Authorization': `Key ${PI_API_KEY}`
        }
      }
    );

    // Store payment info
    payments.set(paymentId, {
      userId,
      status: 'approved',
      timestamp: Date.now(),
      data: payment
    });

    return res.status(200).json({
      success: true,
      paymentId,
      status: 'approved',
      payment: approveResponse.data
    });

  } catch (error) {
    console.error('Approval error:', error.response?.data || error);
    return res.status(500).json({
      error: 'Failed to approve payment',
      details: error.response?.data || error.message
    });
  }
}

// ===== Complete Payment =====
async function completePayment(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['paymentId', 'txid']
    });
  }

  try {
    // Verify the transaction on blockchain
    const response = await axios.get(
      `${PI_API_URL}/v2/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Key ${PI_API_KEY}`
        }
      }
    );

    const payment = response.data;

    // Validate transaction
    if (!payment.transaction || payment.transaction.txid !== txid) {
      return res.status(400).json({ 
        error: 'Transaction ID mismatch' 
      });
    }

    if (!payment.transaction.verified) {
      return res.status(400).json({ 
        error: 'Transaction not verified on blockchain' 
      });
    }

    // Complete the payment
    const completeResponse = await axios.post(
      `${PI_API_URL}/v2/payments/${paymentId}/complete`,
      { txid },
      {
        headers: {
          'Authorization': `Key ${PI_API_KEY}`
        }
      }
    );

    // Update payment status
    const stored = payments.get(paymentId);
    if (stored) {
      stored.status = 'completed';
      stored.txid = txid;
      stored.completedAt = Date.now();
      payments.set(paymentId, stored);
    }

    // Here you would:
    // 1. Update user's premium status in database
    // 2. Send confirmation email
    // 3. Log the transaction
    // 4. Update analytics

    return res.status(200).json({
      success: true,
      paymentId,
      txid,
      status: 'completed',
      payment: completeResponse.data
    });

  } catch (error) {
    console.error('Completion error:', error.response?.data || error);
    return res.status(500).json({
      error: 'Failed to complete payment',
      details: error.response?.data || error.message
    });
  }
}

// ===== Verify Payment Status =====
async function verifyPayment(req, res) {
  const { paymentId } = req.query;

  if (!paymentId) {
    return res.status(400).json({ 
      error: 'Missing paymentId parameter' 
    });
  }

  try {
    const response = await axios.get(
      `${PI_API_URL}/v2/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Key ${PI_API_KEY}`
        }
      }
    );

    return res.status(200).json({
      success: true,
      payment: response.data
    });

  } catch (error) {
    console.error('Verification error:', error.response?.data || error);
    return res.status(500).json({
      error: 'Failed to verify payment',
      details: error.response?.data || error.message
    });
  }
}

// ===== Get Payment Status (from local storage) =====
async function getPaymentStatus(req, res) {
  const { paymentId } = req.query;

  if (!paymentId) {
    return res.status(400).json({ 
      error: 'Missing paymentId parameter' 
    });
  }

  const payment = payments.get(paymentId);

  if (!payment) {
    return res.status(404).json({ 
      error: 'Payment not found in local storage',
      note: 'Payment may exist on Pi Network but not processed by this server yet'
    });
  }

  return res.status(200).json({
    success: true,
    payment
  });
}