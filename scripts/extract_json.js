const fs = require('fs');

const html = fs.readFileSync('scripts/page4.html', 'utf8');

const match = html.match(/let\s+paginationInstance\s*=\s*(\{[\s\S]*?\});/);
if (match) {
  try {
    const data = JSON.parse(match[1]);
    console.log('Current page:', data.current_page);
    console.log('Total products on page 4:', data.data ? data.data.length : 'none');
    if (data.data && data.data.length > 0) {
      console.log('Sample item:', JSON.stringify(data.data[0], null, 2));
      fs.writeFileSync('scripts/page4_products.json', JSON.stringify(data.data, null, 2));
    }
  } catch (err) {
    console.error('JSON parse error:', err.message);
  }
} else {
  console.log('No paginationInstance match');
}
