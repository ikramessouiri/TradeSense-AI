import { useState, useEffect, useRef } from 'react'

export default function AIChat({ isOpen = false, onClose }) {
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Bonjour, comment puis-je vous aider ?' },
  ])
  const [input, setInput] = useState('')
  const boxRef = useRef(null)

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight
    }
  }, [messages, isOpen])

  if (!isOpen) return null

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setMessages((m) => [...m, { from: 'user', text }])
    setInput('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const j = await res.json().catch(() => ({}))
      const reply = j?.reply || "Je suis TradeSense AI, j'analyse actuellement les graphiques pour vous..."
      setMessages((m) => [...m, { from: 'ai', text: reply }])
    } catch {
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            from: 'ai',
            text: "Je suis TradeSense AI, j'analyse actuellement les graphiques pour vous...",
          },
        ])
      }, 1000)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-xl bg-slate-900 ring-1 ring-white/10 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="text-sm font-medium text-white">Assistance IA</div>
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-white"
        >
          ×
        </button>
      </div>
      <div ref={boxRef} className="px-4 py-3 h-60 overflow-y-auto space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm ${
              m.from === 'ai'
                ? 'text-slate-200'
                : 'text-white text-right'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
          className="flex-1 rounded-md bg-slate-800 text-white px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-sky-600"
          placeholder="Écrivez votre message…"
        />
        <button
          onClick={send}
          className="rounded-md bg-sky-600 px-3 py-2 text-white hover:bg-sky-500"
        >
          Envoyer
        </button>
      </div>
    </div>
  )
}
