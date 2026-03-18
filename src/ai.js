// AI advisor — OpenAI-compatible API wrapper
// Supports OpenAI, DeepSeek, or any compatible endpoint

const DEFAULT_ENDPOINT = 'https://breakout.wenwen-ai.com/v1/chat/completions'
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'
const DEFAULT_API_KEY = 'sk-Kk7acaTOkX6nKLvBBY2zrJbqqZBuD4xOACjDw4advf9jA9gR'

const STORAGE_KEYS = {
  apiKey: 'cf_ai_api_key',
  endpoint: 'cf_ai_endpoint',
  model: 'cf_ai_model',
}

export function loadAiConfig() {
  return {
    apiKey: localStorage.getItem(STORAGE_KEYS.apiKey) || DEFAULT_API_KEY,
    endpoint: localStorage.getItem(STORAGE_KEYS.endpoint) || DEFAULT_ENDPOINT,
    model: localStorage.getItem(STORAGE_KEYS.model) || DEFAULT_MODEL,
  }
}

export function saveAiConfig({ apiKey, endpoint, model }) {
  localStorage.setItem(STORAGE_KEYS.apiKey, apiKey)
  localStorage.setItem(STORAGE_KEYS.endpoint, endpoint || DEFAULT_ENDPOINT)
  localStorage.setItem(STORAGE_KEYS.model, model || DEFAULT_MODEL)
}

/**
 * Build a system prompt that gives the AI full context of the user's finances
 */
function buildSystemPrompt(financialContext) {
  const { initialBalance, entries, dailyData, warnings, threshold } = financialContext

  const monthlyIncome = entries
    .filter(e => e.type === 'income' && e.frequency === 'monthly')
    .reduce((s, e) => s + e.amount, 0)
  const monthlyExpense = entries
    .filter(e => e.type === 'expense' && e.frequency === 'monthly')
    .reduce((s, e) => s + e.amount, 0)

  // Next 3 months balance snapshots
  const snapshots = [30, 60, 90].map(d => {
    const point = dailyData[d]
    return point ? `  +${d}d: $${point.balance.toLocaleString()}` : null
  }).filter(Boolean).join('\n')

  const entryList = entries.map(e =>
    `  - ${e.name}: $${e.amount} (${e.type}, ${e.frequency})`
  ).join('\n')

  const warningCount = warnings.length
  const firstWarning = warnings[0]?.date || 'none'

  return `You are a friendly, sharp personal finance advisor embedded in a cash flow forecasting app.
You have full access to the user's financial data. Be concise, specific, and actionable.
Always reference actual numbers from their data. Never give generic advice.

## User's Financial Snapshot
- Current balance: $${initialBalance.toLocaleString()}
- Monthly income: $${monthlyIncome.toLocaleString()}
- Monthly expenses: $${monthlyExpense.toLocaleString()}
- Monthly surplus: $${(monthlyIncome - monthlyExpense).toLocaleString()}
- Warning threshold: $${threshold.toLocaleString()}
- Warning days in next 6 months: ${warningCount} (first: ${firstWarning})

## Balance Forecast
${snapshots}

## All Income & Expense Entries
${entryList || '  (none)'}

Answer in the same language the user writes in. Be direct and helpful.`
}

/**
 * Send a message to the AI with full financial context
 * @param {string} userMessage
 * @param {Array} history - [{role, content}]
 * @param {object} financialContext
 * @param {object} config - {apiKey, endpoint, model}
 * @returns {AsyncGenerator<string>} streaming text chunks
 */
export async function* streamAiResponse(userMessage, history, financialContext, config) {
  const { apiKey, endpoint, model } = config

  if (!apiKey) throw new Error('API key not set. Please configure it in Settings.')

  const messages = [
    { role: 'system', content: buildSystemPrompt(financialContext) },
    ...history,
    { role: 'user', content: userMessage },
  ]

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, stream: true }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

    for (const line of lines) {
      const data = line.slice(6)
      if (data === '[DONE]') return
      try {
        const json = JSON.parse(data)
        const text = json.choices?.[0]?.delta?.content
        if (text) yield text
      } catch {
        // skip malformed chunks
      }
    }
  }
}
