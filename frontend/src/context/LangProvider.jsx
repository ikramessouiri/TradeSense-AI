import { useEffect, useState } from 'react'
import { LangContext } from './LangContext'

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'fr')

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', dir)
  }, [lang])

  const setLang = (l) => {
    const v = String(l || 'fr').toLowerCase()
    localStorage.setItem('lang', v)
    setLangState(v)
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}
