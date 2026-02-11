// ===== Health Check Endpoint =====

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  return res.status(200).json({
    status: 'ok',
    service: 'LUME Tasbih API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      payments: '/api/payments?action=[approve|complete|verify|status]',
      health: '/api/health'
    },
    documentation: 'https://github.com/Tofel-cyber/lume-tasbih'
  });
};