import type { WorkoutHistoryItem } from "@/lib/types";

// Simple PDF generation using HTML to Canvas approach
// This is a lightweight alternative to heavy PDF libraries

interface PDFGeneratorOptions {
  title?: string;
  fontSize?: number;
}

export const generateWorkoutPDF = (
  history: WorkoutHistoryItem[],
  options: PDFGeneratorOptions = {}
) => {
  const { title = "Gym Management - Workout Report", fontSize = 12 } = options;

  // Create HTML content
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
          color: #333;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #0ea5e9;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 28px;
          margin: 0;
          color: #0ea5e9;
        }
        .header p {
          margin: 5px 0;
          font-size: ${fontSize}px;
          color: #666;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
          background: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-item h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
        }
        .summary-item .value {
          font-size: 24px;
          font-weight: bold;
          color: #0ea5e9;
        }
        .workout {
          margin-bottom: 20px;
          border-left: 4px solid #0ea5e9;
          padding-left: 15px;
        }
        .workout-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .workout-title {
          font-size: 16px;
          font-weight: bold;
          color: #000;
        }
        .workout-date {
          font-size: ${fontSize}px;
          color: #666;
        }
        .workout-details {
          font-size: ${fontSize - 1}px;
          color: #666;
          margin-bottom: 8px;
        }
        .exercise {
          margin-left: 15px;
          margin-bottom: 10px;
          padding: 8px;
          background: #f9fafb;
          border-radius: 4px;
        }
        .exercise-name {
          font-weight: bold;
          color: #000;
          margin-bottom: 4px;
        }
        .set-info {
          font-size: ${fontSize - 2}px;
          color: #666;
        }
        .page-break {
          page-break-after: always;
        }
        @media print {
          body {
            margin: 0;
            padding: 10mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleDateString("vi-VN")}</p>
        <p>Total Workouts: ${history.length}</p>
      </div>
  `;

  // Add summary section
  const totalVolume = history.reduce((sum, h) => sum + (h.totalVolume || 0), 0);
  const totalSets = history.reduce((sum, h) => sum + (h.completedSets || 0), 0);
  const totalDuration = history.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);

  html += `
    <div class="summary">
      <div class="summary-item">
        <h3>Total Volume</h3>
        <div class="value">${(totalVolume / 1000).toFixed(1)}k kg</div>
      </div>
      <div class="summary-item">
        <h3>Total Sets</h3>
        <div class="value">${totalSets}</div>
      </div>
      <div class="summary-item">
        <h3>Total Duration</h3>
        <div class="value">${Math.round(totalDuration / 60)}h</div>
      </div>
    </div>
  `;

  // Add workout details
  history.slice(0, 50).forEach((workout, index) => {
    const date = workout.startTime
      ? new Date(workout.startTime).toLocaleDateString("vi-VN", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "Unknown";

    html += `
      <div class="workout">
        <div class="workout-header">
          <span class="workout-title">${index + 1}. ${workout.planName || "Workout"}</span>
          <span class="workout-date">${date}</span>
        </div>
        <div class="workout-details">
          📊 ${workout.completedSets || 0} sets • 🏋️ ${(workout.totalVolume || 0) / 1000}k kg • ⏱️ ${workout.durationMinutes || 0} min • ${workout.exerciseCount || 0} bài tập
        </div>
      </div>
    `;

    if ((index + 1) % 10 === 0 && index < history.length - 1) {
      html += `<div class="page-break"></div>`;
    }
  });

  html += `
    </body>
    </html>
  `;

  return html;
};

export const downloadPDF = (history: WorkoutHistoryItem[], filename = "workout-report") => {
  const htmlContent = generateWorkoutPDF(history);

  // Create a blob and download
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().getTime()}.html`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Alternative: For PDF output, users can print the HTML page
export const openPDFPrintDialog = (history: WorkoutHistoryItem[]) => {
  const htmlContent = generateWorkoutPDF(history);
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
