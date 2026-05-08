const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
]

function parseAllowedOrigins(value) {
  if (!value) return DEFAULT_ALLOWED_ORIGINS
  if (value.trim() === '*') return '*'

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

module.exports = {
  PORT: Number(process.env.PORT || 3001),
  ALLOWED_ORIGINS: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
  APP_NAME: 'RupeeTrack API',
}
