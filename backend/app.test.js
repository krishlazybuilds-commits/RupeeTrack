const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const testDbFile = path.join(__dirname, 'db.test.json')
process.env.DB_FILE = testDbFile

try {
  fs.unlinkSync(testDbFile)
} catch {}

const request = require('supertest')
const { createApp } = require('./app')

const app = createApp()

test.after(() => {
  try {
    fs.unlinkSync(testDbFile)
  } catch {}
})

test('GET /api/health returns ok', async () => {
  const response = await request(app).get('/api/health').expect(200)

  assert.equal(response.body.success, true)
  assert.equal(response.body.data.status, 'ok')
})

test('GET /api/meta returns supported categories', async () => {
  const response = await request(app).get('/api/meta').expect(200)

  assert.equal(response.body.success, true)
  assert.ok(Array.isArray(response.body.data.categories.income))
  assert.ok(response.body.data.categories.expense.includes('Food'))
})

test('GET /api/transactions supports filters and limit', async () => {
  const response = await request(app)
    .get('/api/transactions')
    .query({ type: 'expense', month: '2026-05', limit: 3 })
    .expect(200)

  assert.equal(response.body.success, true)
  assert.equal(response.body.data.length, 3)
  assert.equal(response.body.meta.total >= 3, true)
  assert.ok(response.body.data.every((item) => item.type === 'expense'))
})

test('POST /api/transactions validates type/category combinations', async () => {
  const response = await request(app)
    .post('/api/transactions')
    .send({
      type: 'income',
      amount: 1500,
      category: 'Food',
      description: 'Bad category pairing',
      date: '2026-05-06',
    })
    .expect(422)

  assert.equal(response.body.success, false)
  assert.ok(response.body.details.some((message) => message.includes('not a valid income category')))
})

test('POST /api/transactions creates a new transaction', async () => {
  const response = await request(app)
    .post('/api/transactions')
    .send({
      type: 'expense',
      amount: 1234,
      category: 'Food',
      description: 'Dinner',
      date: '2026-05-07',
    })
    .expect(201)

  assert.equal(response.body.success, true)
  assert.equal(response.body.data.amount, 1234)
  assert.equal(response.body.data.category, 'Food')
  assert.equal(response.body.data.description, 'DINNER')
})

test('POST /api/transactions rejects future dates', async () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const futureDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`

  const response = await request(app)
    .post('/api/transactions')
    .send({
      type: 'expense',
      amount: 99,
      category: 'Food',
      description: 'Future',
      date: futureDate,
    })
    .expect(422)

  assert.equal(response.body.success, false)
  assert.ok(response.body.details.includes('date cannot be in the future'))
})

test('PUT /api/budgets/:category updates a budget', async () => {
  const response = await request(app)
    .put('/api/budgets/Food')
    .send({ amount: 4500 })
    .expect(200)

  assert.equal(response.body.success, true)
  assert.equal(response.body.data.category, 'Food')
  assert.equal(response.body.data.amount, 4500)
})

test('DELETE /api/budgets/:category deletes a budget', async () => {
  await request(app)
    .put('/api/budgets/Travel')
    .send({ amount: 5000 })
    .expect(200)

  const response = await request(app)
    .delete('/api/budgets/Travel')
    .expect(200)

  assert.equal(response.body.success, true)
  assert.equal(response.body.data.category, 'Travel')

  const budgets = await request(app).get('/api/budgets').expect(200)
  assert.equal(budgets.body.data.some((budget) => budget.category === 'Travel'), false)
})
