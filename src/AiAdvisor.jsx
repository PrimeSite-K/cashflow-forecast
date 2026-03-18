import { useState, useRef, useEffect } from 'react'
import { streamAiResponse, loadAiConfig, saveAiConfig } from './ai'

const SUGGESTED_QUESTIONS = [
  "Can I afford a $500/month car payment?",
  "When will my balance drop below the warning threshold?",
  "How can I improve my monthly surplus?",
  "What's my biggest financial risk in the next 3 months?",
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs mr-2 mt-0.5 shrink-0">
          AI
        </div>
      )}
      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'bg-blue-600 text-white rounded-tr-sm'
          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
      }`}>
        {msg.content}
        {msg.streaming && <span className="inline-block w-1.5 h-4 bg-blue-400 ml-1 animate-pulse rounded-sm" />}
      </div>
    </div>
  )
}

function AiSettings({ onClose }) {
  const cfg = loadAiConfig()
  const [apiKey, setApiKey] = useState(cfg.apiKey)
  const [endpoint, setEndpoint] = useState(cfg.endpoint)
  const [model, setModel] = useState(cfg.model)

  const presets = [
    { label: 'Claude Haiku (快速)', endpoint: 'https://breakout.wenwen-ai.com/v1/chat/completions', model: 'claude-haiku-4-5-20251001' },
    { label: 'Claude Sonnet', endpoint: 'https://breakout.wenwen-ai.com/v1/chat/completions', model: 'claude-sonnet-4-6' },
    { label: 'Claude Opus', endpoint: 'https://breakout.wenwen-ai.com/v1/chat/completions', model: 'claude-opus-4-6' },
    { label: 'OpenAI GPT-4o mini', endpoint: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">AI Settings</h3>

        <div className="mb-4">
          <label className="text-xs text-gray-500 font-medium block mb-1">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <button key={p.label} onClick={() => { setEndpoint(p.endpoint); setModel(p.model) }}
                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">API Key</label>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Endpoint</label>
            <input type="text" value={endpoint} onChange={e => setEndpoint(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Model</label>
            <input type="text" value={model} onChange={e => setModel(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={() => { saveAiConfig({ apiKey, endpoint, model }); onClose() }}
            className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-sm font-medium hover:bg-blue-700">
            Save
          </button>
          <button onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-2 text-sm font-medium hover:bg-gray-200">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AiAdvisor({ financialContext }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI financial advisor. I can see your cash flow data — ask me anything about your finances, like whether you can afford a big purchase, or when you might run into trouble. 💬",
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const userText = text || input.trim()
    if (!userText || loading) return

    setInput('')
    setError('')

    const history = messages.map(m => ({ role: m.role, content: m.content }))
    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    // Add streaming placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    try {
      const config = loadAiConfig()
      let fullText = ''

      for await (const chunk of streamAiResponse(userText, history, financialContext, config)) {
        fullText += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: fullText, streaming: true }
          return updated
        })
      }

      // Finalize
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: fullText, streaming: false }
        return updated
      })
    } catch (err) {
      setMessages(prev => prev.slice(0, -1)) // remove placeholder
      setError(err.message)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const cfg = loadAiConfig()
  const hasKey = !!cfg.apiKey

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">AI</div>
          <div>
            <p className="text-sm font-semibold text-gray-900">AI Financial Advisor</p>
            <p className="text-xs text-gray-400">Powered by your real cash flow data</p>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100">
          ⚙️ Settings
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto px-4 py-4 bg-gray-50">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {error && (
          <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-2">
            ⚠️ {error}
            {!hasKey && (
              <button onClick={() => setShowSettings(true)} className="ml-2 underline font-medium">
                Set API Key
              </button>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-gray-100 bg-white">
          {SUGGESTED_QUESTIONS.map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasKey ? "Ask about your finances..." : "Set your API key to start chatting..."}
          disabled={loading}
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 disabled:bg-gray-50"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {loading ? '...' : '↑'}
        </button>
      </div>

      {showSettings && <AiSettings onClose={() => setShowSettings(false)} />}
    </div>
  )
}
