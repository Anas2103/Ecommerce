import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './fr'
import en from './en'
import ar from './ar'

const savedLang = localStorage.getItem('language') || 'en'

i18n.use(initReactI18next).init({
  resources: { fr, en, ar },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

const applyDir = (lang) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = lang
}

applyDir(savedLang)

i18n.on('languageChanged', applyDir)

export default i18n
