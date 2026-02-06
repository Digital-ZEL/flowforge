'use client';

import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import type { AnalysisResult, Bottleneck, ComparisonMetric, OptimizationOption } from '@/lib/types';

interface ExportButtonProps {
  targetRef?: React.RefObject<HTMLElement | null>;
  filename?: string;
  process?: AnalysisResult;
}

export default function ExportButton({ targetRef, filename = 'flowforge-process', process }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const getElement = (): HTMLElement | null => {
    if (targetRef?.current) return targetRef.current;
    return document.querySelector('.react-flow') as HTMLElement;
  };

  const toPngFilter = (node: HTMLElement): boolean => {
    const classList = node.classList;
    if (!classList) return true;
    return !classList.contains('react-flow__controls') && !classList.contains('react-flow__minimap');
  };

  const exportPNG = async () => {
    const el = getElement();
    if (!el) return;

    setExporting(true);
    try {
      const dataUrl = await toPng(el, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        filter: (node) => toPngFilter(node as HTMLElement),
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async () => {
    const el = getElement();
    if (!el) return;

    setExporting(true);
    try {
      const dataUrl = await toPng(el, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        filter: (node) => toPngFilter(node as HTMLElement),
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      // Landscape orientation for better flowchart display
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let y = margin;

      // ---- Company Header ----
      if (companyName.trim()) {
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(79, 70, 229); // brand-600
        pdf.text(companyName.trim(), margin, y + 6);
        y += 12;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 6;
      }

      // ---- Title ----
      if (process) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59); // slate-800
        pdf.text(process.title, margin, y + 5);
        y += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139); // slate-500
        pdf.text(`Industry: ${process.industry} · Created: ${new Date(process.createdAt).toLocaleDateString()}`, margin, y + 3);
        y += 8;
      }

      // ---- Flowchart Image ----
      const maxImgWidth = pageWidth - margin * 2;
      const maxImgHeight = process ? pageHeight - y - 50 : pageHeight - margin * 2 - 20;
      const imgRatio = img.width / img.height;
      let imgW = maxImgWidth;
      let imgH = imgW / imgRatio;
      if (imgH > maxImgHeight) {
        imgH = maxImgHeight;
        imgW = imgH * imgRatio;
      }

      pdf.addImage(dataUrl, 'PNG', margin, y, imgW, imgH);
      y += imgH + 6;

      // ---- Bottleneck Analysis ----
      if (process && process.currentState.bottlenecks.length > 0) {
        // Check if we need a new page
        if (y > pageHeight - 40) {
          pdf.addPage();
          y = margin;
        }

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(185, 28, 28); // red-700
        pdf.text('Bottlenecks Identified', margin, y + 4);
        y += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        process.currentState.bottlenecks.forEach((b: Bottleneck) => {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = margin;
          }
          const lines = pdf.splitTextToSize(`• ${b.reason}`, maxImgWidth);
          pdf.text(lines, margin, y + 3);
          y += lines.length * 4 + 2;
        });
        y += 4;
      }

      // ---- Comparison Table ----
      if (process && process.comparison && process.comparison.length > 0) {
        if (y > pageHeight - 60) {
          pdf.addPage();
          y = margin;
        }

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        pdf.text('Comparison: Current vs Optimized', margin, y + 4);
        y += 10;

        // Table header
        const cols = ['Metric', 'Current', ...process.options.map((o: OptimizationOption) => o.name)];
        const colWidth = (pageWidth - margin * 2) / cols.length;

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(241, 245, 249); // slate-100
        pdf.rect(margin, y, pageWidth - margin * 2, 7, 'F');
        cols.forEach((col: string, i: number) => {
          pdf.setTextColor(71, 85, 105); // slate-600
          pdf.text(col.substring(0, 20), margin + i * colWidth + 2, y + 5);
        });
        y += 8;

        // Table rows
        pdf.setFont('helvetica', 'normal');
        process.comparison.forEach((row: ComparisonMetric) => {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = margin;
          }

          const optionKeys = process.options.map((_: OptimizationOption, i: number) => `option${i + 1}`);
          const values = [row.metric, row.current, ...optionKeys.map((k: string) => row[k] || '—')];
          values.forEach((val: string, i: number) => {
            pdf.setTextColor(i === 0 ? 30 : 71, i === 0 ? 41 : 85, i === 0 ? 59 : 105);
            pdf.text(String(val).substring(0, 25), margin + i * colWidth + 2, y + 4);
          });
          pdf.setDrawColor(226, 232, 240);
          pdf.line(margin, y + 6, pageWidth - margin, y + 6);
          y += 7;
        });
      }

      // ---- Footer ----
      const footerY = pageHeight - 8;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.text(`Prepared by FlowForge · ${new Date().toLocaleDateString()}`, margin, footerY);
      pdf.text('flowforge.ai', pageWidth - margin - 20, footerY);

      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
      setShowPdfModal(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={exportPNG}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          PNG
        </button>
        <button
          onClick={() => setShowPdfModal(true)}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          PDF
        </button>
        {exporting && <span className="text-xs text-slate-500 animate-pulse">Exporting...</span>}
      </div>

      {/* PDF Export Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-[400px] max-w-[calc(100vw-2rem)]">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              PDF Export Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Company Name <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name for the header"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p>✓ Landscape orientation for best flowchart display</p>
                <p>✓ Includes bottleneck analysis & comparison table</p>
                <p>✓ &ldquo;Prepared by FlowForge&rdquo; footer with date</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={exportPDF}
                disabled={exporting}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Export PDF'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
