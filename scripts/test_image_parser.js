const fs = require('fs');

const page4 = JSON.parse(fs.readFileSync('scripts/page4_products.json', 'utf8'));

page4.slice(0, 5).forEach((item, idx) => {
  const p = item._source;
  let imgObj = {};
  try {
    imgObj = typeof p.product_image === 'string' ? JSON.parse(p.product_image) : p.product_image;
  } catch {}

  const firstImg = imgObj['0'] || (imgObj.colors && Object.values(imgObj.colors)[0]?.['0']);
  let finalImg = '';
  if (firstImg) {
    const base = firstImg.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    finalImg = `https://images.priceoye.pk/${base}-500x500.webp`;
  }
  console.log(`${idx + 1}. ${p.product_title}`);
  console.log('   Raw img:', firstImg);
  console.log('   Final img:', finalImg);
  console.log('   Category:', p.product_category_name, '-> slug:', p.product_category_slug);
  console.log('   Price:', p.lowest_price || p.expected_price, 'Retail:', p.retail_price || p.expected_price);
});
