const fs = require('fs');

function fix(content) {
  let r = content;

  // French accented characters - garbled form uses Latin-1 codepoints in Unicode string
  r = r.split('\xC3\xA9').join('\xE9');   // Ã© → é
  r = r.split('\xC3\xA8').join('\xE8');   // Ã¨ → è
  r = r.split('\xC3\xA0').join('\xE0');   // Ã  → à
  r = r.split('\xC3\xA7').join('\xE7');   // Ã§ → ç
  r = r.split('\xC3\xA2').join('\xE2');   // Ã¢ → â
  r = r.split('\xC3\xAE').join('\xEE');   // Ã® → î
  r = r.split('\xC3\xB4').join('\xF4');   // Ã´ → ô
  r = r.split('\xC3\xBB').join('\xFB');   // Ã» → û
  r = r.split('\xC3\xAB').join('\xEB');   // Ã« → ë
  r = r.split('\xC3\xAA').join('\xEA');   // Ãª → ê
  r = r.split('\xC3\xAF').join('\xEF');   // Ã¯ → ï
  r = r.split('\xC3\xB9').join('\xF9');   // Ã¹ → ù
  r = r.split('\xC3\x89').join('\xC9');   // Ã‰ → É
  r = r.split('\xC3\x80').join('\xC0');   // Ã€ → À
  r = r.split('\xC3\x87').join('\xC7');   // Ã‡ → Ç
  r = r.split('\xC2\xB7').join('\xB7');   // Â· → ·
  r = r.split('\xC2\xA9').join('\xA9');   // Â© → ©
  r = r.split('\xC2\xAE').join('\xAE');   // Â® → ®
  r = r.split('\xC2\xBB').join('\xBB');   // Â» → »
  r = r.split('\xC2\xAB').join('\xAB');   // Â« → «

  // Punctuation and symbols
  // ellipsis U+2026 (E2 80 A6) garbled → â€¦ (C3 A2 = â, C2 80 = <pad>, C2 A6 = ¦... not right)
  // Actually the garbling of â€¦ is different - let me handle by exact text
  r = r.split('\xE2\x80\xA6').join('…'); // direct fix for ellipsis if raw bytes remain
  r = r.split('\xE2\x80\x93').join('–'); // en dash
  r = r.split('\xE2\x80\x94').join('—'); // em dash
  r = r.split('\xE2\x86\x92').join('→'); // →
  r = r.split('\xE2\x98\x85').join('★'); // ★

  // Fix stray // in className
  r = r.replace(/bg-blue-50 \/\//g, 'bg-blue-50');
  r = r.replace(/border-blue-600 bg-blue-50 \/\//g, 'border-blue-600 bg-blue-50');

  // Fix badge-indigo → badge-blue
  r = r.split('badge-indigo').join('badge-blue');

  return r;
}

const files = process.argv.slice(2);
files.forEach(f => {
  const before = fs.readFileSync(f, 'utf8');
  const after = fix(before);
  if (before !== after) {
    fs.writeFileSync(f, after, 'utf8');
    console.log('Fixed: ' + f);
  } else {
    console.log('Clean: ' + f);
  }
});
