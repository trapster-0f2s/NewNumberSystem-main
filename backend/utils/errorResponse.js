function errorResponse(res, statusCode, message, error) {
  console.error(message, error.message || error);
  return res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: error.message || error })
  });
}

module.exports = errorResponse;
