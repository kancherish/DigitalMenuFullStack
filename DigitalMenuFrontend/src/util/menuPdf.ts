import { jsPDF } from 'jspdf';
import type { Category, Item, RestaurantConfig } from '../types';

function pdfText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/₹/g, 'Rs. ')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatMoney(currency: string | undefined, amount: number): string {
  const symbol = pdfText(currency) || 'Rs.';
  return `${symbol}${amount}`;
}

export function downloadMenuPdf(config: RestaurantConfig, categories: Category[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addWrapped = (
    text: string,
    x: number,
    maxWidth: number,
    lineHeight: number,
    opts?: { font?: 'normal' | 'bold' | 'italic'; size?: number; color?: [number, number, number] },
  ) => {
    const t = pdfText(text);
    if (!t) return;
    doc.setFont('helvetica', opts?.font ?? 'normal');
    doc.setFontSize(opts?.size ?? 10);
    doc.setTextColor(...(opts?.color ?? [30, 30, 30]));
    const lines = doc.splitTextToSize(t, maxWidth);
    ensureSpace(lines.length * lineHeight);
    doc.text(lines, x, y);
    y += lines.length * lineHeight;
  };

  addWrapped(config.name || 'Menu', margin, contentWidth, 28, {
    font: 'bold',
    size: 22,
    color: [15, 15, 15],
  });
  if (config.tagline) {
    addWrapped(config.tagline, margin, contentWidth, 14, {
      font: 'normal',
      size: 11,
      color: [90, 90, 90],
    });
  }
  y += 4;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  if (!categories.length) {
    addWrapped('No categories available.', margin, contentWidth, 14, {
      color: [110, 110, 110],
    });
  }

  const renderItem = (item: Item) => {
    const name = pdfText(item.name) || 'Unnamed item';
    const available = item.available !== false;
    const hasVariants = Array.isArray(item.variants) && item.variants.length > 0;
    const price = !hasVariants && item.price != null ? formatMoney(config.currencySymbol, item.price) : '';
    const desc = pdfText(item.description);

    const nameWidth = price ? contentWidth - 100 : contentWidth;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const nameLines = doc.splitTextToSize(name, nameWidth);
    let needed = nameLines.length * 14 + 6;
    if (!available) needed += 12;
    if (desc) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      needed += doc.splitTextToSize(desc, contentWidth - 10).length * 13;
    }
    if (hasVariants) {
      needed += item.variants.length * 14 + 2;
    }
    ensureSpace(Math.min(needed, pageHeight - margin * 2));

    const topY = y;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(nameLines, margin, topY);
    if (price) {
      const pw = doc.getTextWidth(price);
      doc.text(price, pageWidth - margin - pw, topY);
    }
    y += nameLines.length * 14;

    if (!available) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(140, 60, 60);
      doc.text('(Unavailable)', margin, y);
      y += 12;
    }

    if (desc) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const descLines = doc.splitTextToSize(desc, contentWidth - 10);
      doc.text(descLines, margin, y);
      y += descLines.length * 13;
    }

    if (hasVariants) {
      y += 2;
      item.variants.forEach((v) => {
        const vName = pdfText(v.name) || 'Option';
        const vPrice = formatMoney(config.currencySymbol, v.price);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const vWidth = contentWidth - 110;
        const vLines = doc.splitTextToSize(`- ${vName}`, vWidth);
        ensureSpace(vLines.length * 13 + 2);
        doc.setTextColor(50, 50, 50);
        doc.text(vLines, margin + 10, y);
        const vpw = doc.getTextWidth(vPrice);
        doc.text(vPrice, pageWidth - margin - vpw, y);
        y += vLines.length * 13;
      });
    }

    y += 8;
  };

  categories.forEach((cat) => {
    const items = cat.items ?? [];
    ensureSpace(40);
    y += 4;
    addWrapped(pdfText(cat.name) || 'Category', margin, contentWidth, 20, {
      font: 'bold',
      size: 15,
      color: [10, 10, 10],
    });
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    if (items.length === 0) {
      addWrapped('No items in this category.', margin, contentWidth, 13, {
        font: 'italic',
        size: 10,
        color: [120, 120, 120],
      });
      y += 6;
      return;
    }

    items.forEach(renderItem);
    y += 4;
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(`${i} / ${totalPages}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
  }

  const safeName = (pdfText(config.name) || 'menu').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
  doc.save(`${safeName || 'menu'}.pdf`);
}
