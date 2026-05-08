const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')

const dbFile = process.env.DB_FILE || path.join(__dirname, 'db.json')
const adapter = new FileSync(dbFile)
const db = low(adapter)

function now() {
  return new Date().toISOString()
}

// Default schema + seed data
db.defaults({
  transactions: [
    { id: 1, type: 'income', amount: 85000, category: 'Salary', description: 'Monthly salary', date: '2026-05-01', created_at: now() },
    { id: 2, type: 'expense', amount: 22000, category: 'Rent', description: 'House rent', date: '2026-05-02', created_at: now() },
    { id: 3, type: 'expense', amount: 4500, category: 'Groceries', description: 'Big Bazaar shopping', date: '2026-05-03', created_at: now() },
    { id: 4, type: 'income', amount: 12000, category: 'Freelance', description: 'Web design project', date: '2026-05-03', created_at: now() },
    { id: 5, type: 'expense', amount: 1200, category: 'Transport', description: 'Ola/Uber monthly', date: '2026-05-04', created_at: now() },
    { id: 6, type: 'expense', amount: 2800, category: 'Food', description: 'Swiggy & Zomato', date: '2026-05-04', created_at: now() },
    { id: 7, type: 'expense', amount: 999, category: 'Entertainment', description: 'Netflix subscription', date: '2026-05-05', created_at: now() },
    { id: 8, type: 'income', amount: 5000, category: 'Investment', description: 'Dividend received', date: '2026-05-05', created_at: now() },
    { id: 9, type: 'expense', amount: 3500, category: 'Shopping', description: 'Myntra clothes', date: '2026-05-06', created_at: now() },
    { id: 10, type: 'expense', amount: 800, category: 'Utilities', description: 'Electricity bill', date: '2026-05-06', created_at: now() },
  ],
  budgets: [
    { id: 1, category: 'Rent', amount: 25000 },
    { id: 2, category: 'Groceries', amount: 6000 },
    { id: 3, category: 'Food', amount: 4000 },
    { id: 4, category: 'Transport', amount: 2000 },
    { id: 5, category: 'Entertainment', amount: 1500 },
    { id: 6, category: 'Shopping', amount: 5000 },
    { id: 7, category: 'Utilities', amount: 1500 },
    { id: 8, category: 'Healthcare', amount: 2000 },
    { id: 9, category: 'Education', amount: 3000 },
    { id: 10, category: 'Travel', amount: 5000 },
  ],
}).write()

module.exports = db
