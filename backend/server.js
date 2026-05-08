const { createApp } = require('./app')
const { PORT, APP_NAME } = require('./config')

const app = createApp()

const server = app.listen(PORT, () => {
  console.log(`\n🚀 ${APP_NAME} → http://localhost:${PORT}`)
  console.log(`   Health check  → http://localhost:${PORT}/api/health\n`)
})

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    console.log(`\n⚠ Port ${PORT} is already in use.`)
    console.log(`  If RupeeTrack API is already running, this is okay and you can keep using it.`)
    console.log(`  Otherwise stop the process using port ${PORT} or set a different PORT.\n`)
    process.exit(0)
  }

  console.error(error)
  process.exit(1)
})
