const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'],
  expense: ['Rent', 'Groceries', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Travel', 'Other'],
}

const CATEGORY_SET = new Set([...CATEGORIES.income, ...CATEGORIES.expense])

module.exports = {
  CATEGORIES,
  CATEGORY_SET,
}
