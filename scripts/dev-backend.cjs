const { spawn } = require('node:child_process')

const PORT = Number(process.env.PORT || 3001)
const HEALTH_URL = `http://127.0.0.1:${PORT}/api/health`

async function checkExistingBackend() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1200)

  try {
    const response = await fetch(HEALTH_URL, { signal: controller.signal })
    const json = await response.json()
    return response.ok && json?.success === true && json?.data?.status === 'ok'
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

function keepAlive() {
  console.log(`[backend] Reusing existing RupeeTrack API on http://localhost:${PORT}`)
  console.log(`[backend] Health check: ${HEALTH_URL}`)
  setInterval(() => {}, 1 << 30)
}

function startBackendProcess() {
  const isWindows = process.platform === 'win32'

  if (isWindows) {
    return spawn('npm --prefix backend run dev', {
      stdio: 'inherit',
      shell: true,
    })
  }

  return spawn('npm', ['--prefix', 'backend', 'run', 'dev'], {
    stdio: 'inherit',
    shell: false,
  })
}

async function main() {
  const existing = await checkExistingBackend()

  if (existing) {
    keepAlive()
    return
  }

  const child = startBackendProcess()

  child.on('exit', async (code) => {
    if (code === 0) {
      const nowExisting = await checkExistingBackend()
      if (nowExisting) {
        console.log(`[backend] Existing RupeeTrack API detected on http://localhost:${PORT}`)
        keepAlive()
        return
      }
    }

    process.exit(code ?? 0)
  })

  child.on('error', (error) => {
    console.error('[backend] Failed to start backend process:', error)
    process.exit(1)
  })

  const shutdown = () => {
    if (!child.killed) {
      try {
        child.kill('SIGINT')
      } catch {
        child.kill()
      }
    }
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((error) => {
  console.error('[backend] Startup error:', error)
  process.exit(1)
})
