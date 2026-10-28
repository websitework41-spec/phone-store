import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Smartphone } from '@/types';

const dataFilePath = path.join(process.cwd(), 'data', 'smartphones.json');

// Helper to read current smartphones
function getSmartphonesFromDisk(): Smartphone[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf-8');
      return JSON.parse(fileData) as Smartphone[];
    }
  } catch (err) {
    console.error('Error reading smartphones.json:', err);
  }
  return [];
}

// Helper to write smartphones to disk
function saveSmartphonesToDisk(phones: Smartphone[]): boolean {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(phones, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to smartphones.json:', err);
    return false;
  }
}

// GET - Retrieve all products with optional filters
export async function GET(request: Request) {
  try {
    const phones = getSmartphonesFromDisk();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q')?.toLowerCase() || '';
    const brand = searchParams.get('brand') || '';
    const stockStatus = searchParams.get('status') || '';

    let filtered = phones;

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.brand.toLowerCase().includes(search) ||
          p.slug.toLowerCase().includes(search)
      );
    }

    if (brand && brand !== 'All Brands') {
      filtered = filtered.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
    }

    if (stockStatus === 'inStock') {
      filtered = filtered.filter((p) => p.inStock && (p.stockQty ?? 1) > 0);
    } else if (stockStatus === 'lowStock') {
      filtered = filtered.filter((p) => (p.stockQty ?? 0) > 0 && (p.stockQty ?? 0) <= 5);
    } else if (stockStatus === 'outOfStock') {
      filtered = filtered.filter((p) => !p.inStock || (p.stockQty ?? 0) === 0);
    }

    return NextResponse.json({
      success: true,
      totalCount: phones.length,
      filteredCount: filtered.length,
      products: filtered,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Add a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProduct: Smartphone = body.product;

    if (!newProduct || !newProduct.name || !newProduct.brand || !newProduct.basePricePKR) {
      return NextResponse.json(
        { success: false, error: 'Product name, brand, and base price are required.' },
        { status: 400 }
      );
    }

    const phones = getSmartphonesFromDisk();

    // Auto-generate ID & slug if missing
    let slug = newProduct.slug || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let id = newProduct.id || slug;

    // Ensure slug uniqueness
    let duplicateIndex = 1;
    let uniqueSlug = slug;
    while (phones.some((p) => p.slug === uniqueSlug)) {
      uniqueSlug = `${slug}-${duplicateIndex}`;
      duplicateIndex++;
    }
    newProduct.slug = uniqueSlug;
    newProduct.id = id;

    // Ensure colors and variants have basic fallbacks
    if (!newProduct.colors || newProduct.colors.length === 0) {
      newProduct.colors = [
        {
          name: 'Standard Black',
          hex: '#1e293b',
          image: 'https://images.priceoye.pk/samsung-galaxy-s22-ultra-pakistan-priceoye-w11tk-500x500.webp',
          inStock: true,
          stockQty: newProduct.stockQty || 10,
        },
      ];
    }

    if (!newProduct.variants || newProduct.variants.length === 0) {
      newProduct.variants = [
        {
          id: `${newProduct.slug}-default`,
          ram: '8GB',
          storage: '128GB',
          pricePKR: newProduct.basePricePKR,
          originalPricePKR: newProduct.originalPricePKR || newProduct.basePricePKR,
          inStock: true,
          stockQty: newProduct.stockQty || 10,
        },
      ];
    }

    // Initialize colorStockMap
    if (!newProduct.colorStockMap) {
      newProduct.colorStockMap = {};
      newProduct.colors.forEach((c) => {
        newProduct.colorStockMap![c.name] = {
          inStock: c.inStock !== false,
          stockQty: c.stockQty ?? 5,
        };
      });
    }

    // Default highlights & specs if missing
    if (!newProduct.keyHighlights) {
      newProduct.keyHighlights = {
        display: newProduct.specs?.screen || '6.7 inch FHD+ Display',
        processor: newProduct.specs?.processor || 'High-performance Octa-Core Processor',
        camera: newProduct.specs?.mainCamera || '50 MP High-Res Camera',
        battery: newProduct.specs?.battery || '5000 mAh All-day Battery',
        charging: newProduct.specs?.charging || 'Fast Charging Supported',
      };
    }

    // Prepend new product so it appears at top of catalog
    phones.unshift(newProduct);

    const saved = saveSmartphonesToDisk(phones);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to write product data to storage.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product added successfully!',
      product: newProduct,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add product' },
      { status: 500 }
    );
  }
}

// PUT - Update an entire product
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updatedProduct: Smartphone = body.product;

    if (!updatedProduct || (!updatedProduct.id && !updatedProduct.slug)) {
      return NextResponse.json(
        { success: false, error: 'Product ID or Slug is required for updating.' },
        { status: 400 }
      );
    }

    const phones = getSmartphonesFromDisk();
    const index = phones.findIndex(
      (p) => p.id === updatedProduct.id || p.slug === updatedProduct.slug
    );

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found in catalog.' },
        { status: 404 }
      );
    }

    // Update colorStockMap consistency
    if (updatedProduct.colors) {
      const colorMap = updatedProduct.colorStockMap || {};
      updatedProduct.colors.forEach((col) => {
        if (!colorMap[col.name]) {
          colorMap[col.name] = {
            inStock: col.inStock !== false,
            stockQty: col.stockQty ?? 5,
          };
        } else {
          colorMap[col.name].inStock = col.inStock !== false;
          colorMap[col.name].stockQty = col.stockQty ?? colorMap[col.name].stockQty;
        }
      });
      updatedProduct.colorStockMap = colorMap;
    }

    phones[index] = { ...phones[index], ...updatedProduct };

    const saved = saveSmartphonesToDisk(phones);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to write updated product to storage.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully!',
      product: phones[index],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a product
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id') || searchParams.get('slug');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id || body.slug;
      } catch {
        // body not provided
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID or Slug is required to delete.' },
        { status: 400 }
      );
    }

    const phones = getSmartphonesFromDisk();
    const initialLen = phones.length;
    const remaining = phones.filter((p) => p.id !== id && p.slug !== id);

    if (remaining.length === initialLen) {
      return NextResponse.json(
        { success: false, error: 'Product not found in catalog.' },
        { status: 404 }
      );
    }

    const saved = saveSmartphonesToDisk(remaining);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to write deletion to storage.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully!',
      deletedId: id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}

// PATCH - Fast Restock, Stock status toggle, Color/Variant stock update
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, restockQty, inStock, colorName, colorStockQty, colorInStock, variantId, variantStockQty, variantInStock } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required.' },
        { status: 400 }
      );
    }

    const phones = getSmartphonesFromDisk();
    const index = phones.findIndex((p) => p.id === id || p.slug === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    const product = phones[index];

    switch (action) {
      case 'restock': {
        const addQty = typeof restockQty === 'number' ? restockQty : 10;
        product.stockQty = Math.max(0, (product.stockQty || 0) + addQty);
        product.inStock = product.stockQty > 0;

        // Also restock variants & colors if empty
        if (product.variants && product.variants.length > 0) {
          product.variants = product.variants.map((v) => ({
            ...v,
            stockQty: Math.max(0, (v.stockQty || 0) + Math.ceil(addQty / product.variants.length)),
            inStock: true,
          }));
        }

        if (product.colors && product.colors.length > 0) {
          product.colors = product.colors.map((c) => ({
            ...c,
            stockQty: Math.max(0, (c.stockQty || 0) + Math.ceil(addQty / product.colors.length)),
            inStock: true,
          }));

          if (product.colorStockMap) {
            Object.keys(product.colorStockMap).forEach((colKey) => {
              product.colorStockMap![colKey].inStock = true;
              product.colorStockMap![colKey].stockQty = Math.max(
                1,
                (product.colorStockMap![colKey].stockQty || 0) + Math.ceil(addQty / product.colors.length)
              );
            });
          }
        }
        break;
      }

      case 'toggle_stock': {
        const targetState = typeof inStock === 'boolean' ? inStock : !product.inStock;
        product.inStock = targetState;
        if (!targetState) {
          product.stockQty = 0;
          if (product.variants) {
            product.variants = product.variants.map((v) => ({ ...v, inStock: false, stockQty: 0 }));
          }
          if (product.colors) {
            product.colors = product.colors.map((c) => ({ ...c, inStock: false, stockQty: 0 }));
          }
          if (product.colorStockMap) {
            Object.keys(product.colorStockMap).forEach((k) => {
              product.colorStockMap![k] = { inStock: false, stockQty: 0 };
            });
          }
        } else {
          if ((product.stockQty || 0) <= 0) product.stockQty = 10;
          if (product.variants) {
            product.variants = product.variants.map((v) => ({ ...v, inStock: true, stockQty: v.stockQty || 5 }));
          }
          if (product.colors) {
            product.colors = product.colors.map((c) => ({ ...c, inStock: true, stockQty: c.stockQty || 5 }));
          }
          if (product.colorStockMap) {
            Object.keys(product.colorStockMap).forEach((k) => {
              product.colorStockMap![k] = { inStock: true, stockQty: product.colorStockMap![k].stockQty || 5 };
            });
          }
        }
        break;
      }

      case 'update_color': {
        if (!colorName) {
          return NextResponse.json({ success: false, error: 'colorName is required' }, { status: 400 });
        }
        if (product.colors) {
          const col = product.colors.find((c) => c.name.toLowerCase() === colorName.toLowerCase());
          if (col) {
            if (typeof colorStockQty === 'number') col.stockQty = Math.max(0, colorStockQty);
            if (typeof colorInStock === 'boolean') col.inStock = colorInStock;
          }
        }
        if (!product.colorStockMap) product.colorStockMap = {};
        product.colorStockMap[colorName] = {
          inStock: typeof colorInStock === 'boolean' ? colorInStock : true,
          stockQty: typeof colorStockQty === 'number' ? Math.max(0, colorStockQty) : 5,
        };

        // Recalculate total product stock
        const totalColorStock = product.colors?.reduce((acc, c) => acc + (c.stockQty || 0), 0) ?? 0;
        product.stockQty = totalColorStock;
        product.inStock = totalColorStock > 0;
        break;
      }

      case 'update_variant': {
        if (!variantId) {
          return NextResponse.json({ success: false, error: 'variantId is required' }, { status: 400 });
        }
        if (product.variants) {
          const v = product.variants.find((item) => item.id === variantId);
          if (v) {
            if (typeof variantStockQty === 'number') v.stockQty = Math.max(0, variantStockQty);
            if (typeof variantInStock === 'boolean') v.inStock = variantInStock;
          }
        }
        const hasAnyInStock = product.variants?.some((v) => v.inStock && (v.stockQty ?? 1) > 0);
        product.inStock = hasAnyInStock ?? product.inStock;
        break;
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid PATCH action specified.' }, { status: 400 });
    }

    phones[index] = product;
    const saved = saveSmartphonesToDisk(phones);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to write update to storage.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully!',
      product,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update stock' },
      { status: 500 }
    );
  }
}
