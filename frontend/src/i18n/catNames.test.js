import { describe, expect, it } from 'vitest'
import { categoryName } from './catNames'

describe('categoryName', () => {
  const cat = { name: 'Electronics', name_fr: 'Électronique' }
  it('uses the English, French or Arabic name for the current language', () => {
    expect(categoryName(cat, 'en')).toBe('Electronics')
    expect(categoryName(cat, 'fr')).toBe('Électronique')
    expect(categoryName(cat, 'ar')).toBe('الإلكترونيات')
  })
  it('falls back gracefully', () => {
    expect(categoryName({ name: 'Unknown' }, 'ar')).toBe('Unknown')
    expect(categoryName(null, 'en')).toBe('')
  })
})
