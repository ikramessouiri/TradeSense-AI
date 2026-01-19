import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LangContext } from '../context/LangContext'
import { translations } from '../i18n/translations'

export default function MasterClass() {
  const { lang } = useContext(LangContext)
  const t = translations[lang] || translations.fr
  const navigate = useNavigate()
  const titles = [
    'Module 1 : Introduction',
    'Module 2 : Analyse',
    'Module 3 : Gestion du Risque',
    'Module 4 : Tendances',
    'Module 5 : Supports & Résistances',
    'Module 6 : Figures Chartistes',
    'Module 7 : Indicateurs de Momentum',
    'Module 8 : Stratégies de Breakout',
    'Module 9 : Stratégies de Rebond',
    'Module 10 : Volatilité',
    'Module 11 : Psychologie',
    'Module 12 : Money Management',
    'Module 13 : Backtesting',
    'Module 14 : Journaling',
    'Module 15 : Optimisation',
    'Module 16 : Scalping',
    'Module 17 : Day Trading',
    'Module 18 : Swing Trading',
    'Module 19 : Analyse Multi-timeframes',
    'Module 20 : Plan de Trading',
  ]
  const courses = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: titles[i] || `Module ${i + 1} : Leçon ${i + 1}`,
    videoId: '95Z_z9nS-O8',
  }))
  const [currentModule, setCurrentModule] = useState(courses[0])
  return (
    <div
      className="relative min-h-screen bg-[url('https://images.unsplash.com/photo-1642790551116-18e150f248e3?q=80&w=1920')] bg-cover bg-center bg-fixed"
      style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: lang === 'ar' ? 'right' : 'left' }}
    >
      <div className="absolute inset-0 bg-black/70 z-0"></div>
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{currentModule.title}</h1>
          <button onClick={() => navigate('/dashboard')} className="rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-500">
            {t.back_to_dashboard}
          </button>
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="aspect-video rounded-xl overflow-hidden ring-1 ring-white/10 bg-slate-800">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${currentModule.videoId}`}
                title={currentModule.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <p className="mt-6 text-slate-300">
              {currentModule.id === 1 ? t.masterclass_module1_desc : t.masterclass_course_desc}
            </p>
          </div>
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-slate-800 ring-1 ring-white/10 p-6">
              <div className="text-lg font-semibold text-white">{t.masterclass_program_title}</div>
              <div className="mt-4 h-[500px] overflow-y-auto">
                {courses.map((m) => {
                  const active = m.id === currentModule.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => setCurrentModule(m)}
                      className={`mb-2 w-full text-left rounded-md px-3 py-2 ring-1 ring-white/10 transition ${
                        active ? 'bg-sky-600 text-white' : 'bg-slate-700/30 text-slate-200 hover:bg-slate-700/50'
                      }`}
                    >
                      {m.title}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
