// Category names come from the API in English (name) and French (name_fr).
// Arabic names are kept here, keyed by the English name.
const CAT_AR = {
  Electronics: 'الإلكترونيات', Clothing: 'الملابس', 'Home & Garden': 'المنزل والحديقة', Sports: 'الرياضة',
  Books: 'الكتب', Beauty: 'الجمال', Toys: 'الألعاب', 'Food & Drinks': 'الأطعمة والمشروبات',
  Smartphones: 'الهواتف الذكية', Laptops: 'الحواسيب المحمولة', Accessories: 'الإكسسوارات',
  Men: 'رجال', Women: 'نساء', Kids: 'أطفال', Furniture: 'الأثاث', Kitchen: 'المطبخ',
  Fitness: 'اللياقة البدنية', Outdoor: 'الهواء الطلق', Fiction: 'روايات', 'Non-Fiction': 'كتب واقعية',
  Skincare: 'العناية بالبشرة', Perfumes: 'العطور',
}

/** Display name of a category in the current UI language. */
export function categoryName(cat, lang = 'en') {
  if (!cat) return ''
  if (lang.startsWith('fr')) return cat.name_fr || cat.name || ''
  if (lang.startsWith('ar')) return CAT_AR[cat.name] || cat.name_fr || cat.name || ''
  return cat.name || cat.name_fr || ''
}
