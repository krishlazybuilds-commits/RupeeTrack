// Shared category constants — single source of truth for frontend
// Backend has its own copy in backend/constants.js

export const CATEGORIES = {
  income:  ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'],
  expense: ['Rent', 'Groceries', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Travel', 'Other'],
}

export const ALL_CATEGORIES = [...CATEGORIES.income, ...CATEGORIES.expense]

export const EXPENSE_CATEGORIES = CATEGORIES.expense
export const INCOME_CATEGORIES  = CATEGORIES.income
