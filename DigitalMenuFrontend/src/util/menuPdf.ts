import type { Category, Item, RestaurantConfig } from '../types';
import type { MenuFont } from './fonts';
import { registerPdfFonts } from './pdfFonts';

type RGB = [number, number, number];

const WHITE: RGB = [255, 255, 255];
const INK: RGB = [31, 41, 55];
const ASCII_ONLY = /[^\x20-\x7E]/g;
const UNSUPPORTED = /[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2022\u2026\u20B9\u20AC\u00A3\u00A5\u00B0\u2212]/g;

const BADGE_STYLES: Record<string, { label: string; bg: RGB; fg: RGB }> = {
  veg: { label: 'VEG', bg: [220, 252, 231], fg: [22, 101, 52] },
  'non-veg': { label: 'NON-VEG', bg: [254, 226, 226], fg: [153, 27, 27] },
  'chef-special': { label: 'CHEF SPECIAL', bg: [254, 243, 199], fg: [146, 64, 14] },
  spicy: { label: 'SPICY', bg: [254, 226, 226], fg: [153, 27, 27] },
  bestseller: { label: 'BESTSELLER', bg: [204, 251, 241], fg: [15, 118, 110] },
};

function pdfText(value: string | null | undefined, embedded: boolean): string {
  if (!value) return '';
  return String(value)
    .replace(embedded ? UNSUPPORTED : ASCII_ONLY, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hexToRgb(value: string | null | undefined, fallback: RGB): RGB {
  if (!value) return fallback;
  const hex = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return [
      parseInt(hex[0] + hex[0], 16),
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16),
    ];
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  return fallback;
}

function mix(a: RGB, b: RGB, amount: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * amount),
    Math.round(a[1] + (b[1] - a[1]) * amount),
    Math.round(a[2] + (b[2] - a[2]) * amount),
  ];
}

function luminance(color: RGB): number {
  const [r, g, b] = color.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastText(color: RGB): RGB {
  return luminance(color) > 0.45 ? INK : WHITE;
}

function readableInk(value: string | null | undefined): RGB {
  const color = hexToRgb(value, INK);
  return luminance(color) < 0.42 ? color : INK;
}

function formatMoney(currency: string | undefined, amount: number, embedded: boolean): string {
  let symbol = pdfText(currency, embedded);
  if (!embedded) {
    symbol = symbol.replace(/₹/g, 'Rs.').replace(/€/g, 'EUR ').replace(/£/g, 'GBP ').replace(/¥/g, 'JPY ');
  }
  symbol = symbol.trim() || (embedded ? '₹' : 'Rs.');
  return `${symbol}${symbol.endsWith('.') ? ' ' : ''}${amount}`;
}

export async function downloadMenuPdf(config: RestaurantConfig, categories: Category[]): Promise<void> {
  const headingFont = config.headingFont as MenuFont | undefined;
  const bodyFont = config.bodyFont as MenuFont | undefined;
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const fonts = await registerPdfFonts(doc, [headingFont, bodyFont]);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const contentBottom = pageHeight - 48;

  const primary = hexToRgb(config.primaryColor, [30, 41, 59]);
  const accent = hexToRgb(config.accentColor, [14, 165, 233]);
  const onPrimary = contrastText(primary);
  const mutedOnPrimary = mix(onPrimary, primary, 0.32);
  const ink = readableInk(config.BodyTextColor);
  const muted = mix(ink, WHITE, 0.42);
  const faint = mix(ink, WHITE, 0.8);
  const softAccent = mix(accent, WHITE, 0.88);

  const heading = () => fonts.resolve(headingFont);
  const body = () => fonts.resolve(bodyFont);
  const restaurantName = pdfText(config.name, fonts.embedded) || 'Menu';

  const setStyle = (font: string, style: 'normal' | 'bold', size: number, color: RGB) => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const drawRunningHeader = () => {
    setStyle(heading(), 'bold', 9, muted);
    doc.text(restaurantName, margin, 24);
    setStyle(body(), 'bold', 8, muted);
    doc.text('MENU', pageWidth - margin, 24, { align: 'right' });
    doc.setDrawColor(...faint);
    doc.setLineWidth(0.6);
    doc.line(margin, 32, pageWidth - margin, 32);
  };

  let y = margin;

  const nextPage = () => {
    doc.addPage();
    drawRunningHeader();
    y = 58;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > contentBottom) nextPage();
  };

  const addWrapped = (
    text: string,
    x: number,
    maxWidth: number,
    lineHeight: number,
    opts: { font?: string; style?: 'normal' | 'bold'; size?: number; color?: RGB } = {},
  ) => {
    const value = pdfText(text, fonts.embedded);
    if (!value) return;
    setStyle(opts.font ?? body(), opts.style ?? 'normal', opts.size ?? 10, opts.color ?? ink);
    const lines = doc.splitTextToSize(value, maxWidth);
    ensureSpace(lines.length * lineHeight);
    doc.text(lines, x, y + lineHeight - 3);
    y += lines.length * lineHeight;
  };

  const drawChip = (label: string, x: number, top: number, bg: RGB, fg: RGB): number => {
    setStyle(body(), 'bold', 7.4, fg);
    const width = doc.getTextWidth(label) + 14;
    if (x + width > pageWidth - margin) return x;
    doc.setFillColor(...bg);
    doc.roundedRect(x, top, width, 15, 7.5, 7.5, 'F');
    doc.text(label, x + 7, top + 10.5);
    return x + width;
  };

  const headerHeight = pdfText(config.tagline, fonts.embedded) ? 108 : 84;
  doc.setFillColor(...primary);
  doc.roundedRect(margin, y, contentWidth, headerHeight, 12, 12, 'F');
  doc.setFillColor(...accent);
  doc.rect(margin + 18, y + 22, 4, headerHeight - 44, 'F');

  let headerY = y + 39;
  setStyle(heading(), 'bold', 21, onPrimary);
  const titleLines = doc.splitTextToSize(restaurantName, contentWidth - 62).slice(0, 2);
  doc.text(titleLines, margin + 32, headerY);
  headerY += titleLines.length * 25;
  const tagline = pdfText(config.tagline, fonts.embedded);
  if (tagline) {
    setStyle(body(), 'normal', 10.5, mutedOnPrimary);
    const taglineLines = doc.splitTextToSize(tagline, contentWidth - 62).slice(0, 2);
    doc.text(taglineLines, margin + 32, headerY + 2);
  }
  y += headerHeight + 20;

  doc.setFillColor(...accent);
  doc.roundedRect(margin, y - 8, 46, 3, 1.5, 1.5, 'F');
  y += 10;

  const renderItem = (item: Item) => {
    const available = item.available !== false;
    const hasVariants = Array.isArray(item.variants) && item.variants.length > 0;
    const itemName = pdfText(item.name, fonts.embedded) || 'Unnamed item';
    const description = pdfText(item.description, fonts.embedded);
    const priceLabel = !hasVariants && item.price != null ? formatMoney(config.currencySymbol, item.price, fonts.embedded) : '';
    const badges = (item.badges ?? []).map((badge) => BADGE_STYLES[badge]).filter(Boolean);

    setStyle(body(), 'bold', 11.5, ink);
    const priceWidth = priceLabel ? doc.getTextWidth(priceLabel) + 16 : 0;
    const nameLines = doc.splitTextToSize(itemName, contentWidth - priceWidth - 4);
    const descriptionLines = description ? doc.splitTextToSize(description, contentWidth - 8) : [];
    const variantHeights = hasVariants
      ? item.variants.map((variant) => {
          setStyle(body(), 'bold', 9.8, accent);
          const variantPrice = formatMoney(config.currencySymbol, variant.price, fonts.embedded);
          return Math.max(20, doc.splitTextToSize(pdfText(variant.name, fonts.embedded) || 'Option', contentWidth - doc.getTextWidth(variantPrice) - 34).length * 12 + 10);
        })
      : [];
    const chipRow = badges.length > 0 || !available ? 20 : 0;
    const needed =
      chipRow +
      nameLines.length * 15 +
      (descriptionLines.length ? descriptionLines.length * 13 + 4 : 0) +
      variantHeights.reduce((sum, height) => sum + height + 5, 0) +
      16;
    ensureSpace(Math.min(needed, contentBottom - margin));

    if (chipRow) {
      let chipX = margin;
      if (!available) chipX = drawChip('SOLD OUT', chipX, y, [254, 226, 226], [153, 27, 27]) + 5;
      badges.forEach((badge) => {
        chipX = drawChip(badge.label, chipX, y, badge.bg, badge.fg) + 5;
      });
      y += chipRow;
    }

    setStyle(body(), 'bold', 11.5, ink);
    doc.text(nameLines, margin, y + 10);
    if (priceLabel) {
      setStyle(body(), 'bold', 11.5, accent);
      doc.text(priceLabel, pageWidth - margin, y + 10, { align: 'right' });
    }
    y += nameLines.length * 15 + 2;

    if (descriptionLines.length) {
      setStyle(body(), 'normal', 9.6, muted);
      doc.text(descriptionLines, margin, y + 8);
      y += descriptionLines.length * 13 + 4;
    }

    if (hasVariants) {
      item.variants.forEach((variant, index) => {
        const variantName = pdfText(variant.name, fonts.embedded) || 'Option';
        const variantPrice = formatMoney(config.currencySymbol, variant.price, fonts.embedded);
        setStyle(body(), 'bold', 9.8, accent);
        const nameWidth = contentWidth - doc.getTextWidth(variantPrice) - 34;
        setStyle(body(), 'normal', 9.6, ink);
        const lines = doc.splitTextToSize(variantName, nameWidth);
        const height = variantHeights[index];
        ensureSpace(height + 5);
        doc.setFillColor(...softAccent);
        doc.roundedRect(margin, y, contentWidth, height, 5, 5, 'F');
        doc.text(lines, margin + 10, y + Math.min(14, height / 2 + 4));
        setStyle(body(), 'bold', 9.8, accent);
        doc.text(variantPrice, pageWidth - margin - 10, y + Math.min(14, height / 2 + 4), { align: 'right' });
        y += height + 5;
      });
    }

    doc.setDrawColor(...faint);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 4, pageWidth - margin, y + 4);
    y += 14;
  };

  categories.forEach((category) => {
    const items = category.items ?? [];
    ensureSpace(58);
    y += 6;
    doc.setFillColor(...accent);
    doc.roundedRect(margin, y + 1, 5, 15, 2.5, 2.5, 'F');
    setStyle(heading(), 'bold', 14, primary);
    doc.text(pdfText(category.name, fonts.embedded) || 'Category', margin + 15, y + 13);
    if (items.length) {
      setStyle(body(), 'normal', 9, muted);
      doc.text(`${items.length}`, pageWidth - margin, y + 13, { align: 'right' });
    }
    y += 21;
    doc.setDrawColor(...softAccent);
    doc.setLineWidth(1.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    if (!items.length) {
      addWrapped('No items in this category.', margin, contentWidth, 14, {
        style: 'normal',
        size: 9.6,
        color: muted,
      });
      y += 8;
      return;
    }
    items.forEach(renderItem);
    y += 6;
  });

  if (!categories.length) {
    addWrapped('No categories available.', margin, contentWidth, 14, { size: 10, color: muted });
  }

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    doc.setDrawColor(...faint);
    doc.setLineWidth(0.6);
    doc.line(margin, pageHeight - 34, pageWidth - margin, pageHeight - 34);
    setStyle(body(), 'normal', 8, muted);
    doc.text(restaurantName, margin, pageHeight - 18);
    doc.text(`${page} / ${totalPages}`, pageWidth - margin, pageHeight - 18, { align: 'right' });
  }

  const safeName = restaurantName.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
  doc.save(`${safeName || 'menu'}.pdf`);
}
