"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Printer } from "lucide-react";
import { openPDFPrintDialog, downloadPDF } from "@/lib/pdfGenerator";
import type { WorkoutHistoryItem } from "@/lib/types";

interface WorkoutExportProps {
  history: WorkoutHistoryItem[];
}

export function WorkoutExport({ history }: WorkoutExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handlePrintReport = async () => {
    setIsExporting(true);
    try {
      openPDFPrintDialog(history);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadHTML = async () => {
    setIsExporting(true);
    try {
      downloadPDF(history, "gym-workout-report");
    } catch (error) {
      console.error("Failed to download report:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex items-center justify-between border-primary/20 bg-primary/5 p-4 lg:p-6"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="font-black uppercase tracking-tight">Xuất báo cáo tập luyện</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo báo cáo chuyên nghiệp từ {history.length} buổi tập của bạn
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrintReport}
          disabled={isExporting}
          className="glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:text-primary disabled:opacity-50"
        >
          <Printer size={18} />
          <span className="hidden sm:inline">In PDF</span>
        </button>
        <button
          onClick={handleDownloadHTML}
          disabled={isExporting}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-background shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Tải xuống</span>
        </button>
      </div>
    </motion.div>
  );
}
