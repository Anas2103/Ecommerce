/* Maps French DB category names → English display names.
   Arabic comes from cat.name_ar returned by the API. */

export const CAT_EN = {
  'Électronique':    'Electronics',
  'Vêtements':       'Clothing',
  'Maison & Jardin': 'Home & Garden',
  'Sports':          'Sports',
  'Livres':          'Books',
  'Beauté':          'Beauty',
  'Jouets':          'Toys',
  'Alimentation':    'Food & Grocery',
  'Smartphones':     'Smartphones',
  'Ordinateurs':     'Computers',
  'Informatique':    'Computing',
  'Téléphonie':      'Mobile Phones',
  'Mobilier':        'Furniture',
  'Accessoires':     'Accessories',
  'Femme':           "Women's Fashion",
  'Homme':           "Men's Fashion",
  'Enfants':         'Kids',
  'Décoration':      'Home Decor',
  'Cuisine':         'Kitchen',
  'Jardinage':       'Gardening',
  'Électroménager':  'Home Appliances',
  'Auto-Moto':       'Auto & Moto',
  'Santé':           'Health',
  'Parfums':         'Fragrances',
  'Chaussures':      'Shoes',
  'Sacs':            'Bags',
  'Montres':         'Watches',
  'Bijoux':          'Jewellery',
}

export function getCatLabel(cat, lang) {
  if (lang?.startsWith('ar') && cat.name_ar) return cat.name_ar
  const base = cat.name_fr || cat.name || ''
  if (lang?.startsWith('en')) return CAT_EN[base] || base
  return base
}
