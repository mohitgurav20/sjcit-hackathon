// MentorForge AI — Premium Session PDF Generator
// Dynamic imports to avoid Next.js SSR crashes

import type { SessionAnalysis, ChatMessage } from "./sessionAnalyzer";

type RGB = [number, number, number];

const C = {
  primary: [167, 146, 119] as RGB,
  dark: [92, 74, 58] as RGB,
  bg: [253, 249, 241] as RGB,
  white: [255, 255, 255] as RGB,
  text: [39, 39, 42] as RGB,
  muted: [113, 113, 122] as RGB,
  green: [16, 185, 129] as RGB,
  amber: [245, 158, 11] as RGB,
  red: [239, 68, 68] as RGB,
  lightGreen: [236, 253, 245] as RGB,
  lightAmber: [255, 251, 235] as RGB,
  lightRed: [254, 242, 242] as RGB,
  cream: [250, 247, 240] as RGB,
};

function fmtDate(d: Date) { return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
function fmtTime(d: Date) { return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }

export async function generateSessionPDF(
  analysis: SessionAnalysis,
  messages: ChatMessage[],
  studentName: string,
  targetRole: string,
  sessionMode: "mentor" | "interview",
  sessionDate: Date
) {
  console.log("[PDF] Starting generation...");

  // Dynamic imports — fixes Next.js SSR crash
  const jsPDFModule = await import("jspdf");
  const jsPDF = jsPDFModule.default;
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = autoTableModule.default;

  console.log("[PDF] Libraries loaded, creating document...");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let pg = 1;

  const setBg = () => { doc.setFillColor(...C.bg); doc.rect(0, 0, 210, 297, "F"); };
  const addFooter = () => {
    doc.setDrawColor(...C.primary); doc.setLineWidth(0.4); doc.line(20, 281, 190, 281);
    doc.setFontSize(7); doc.setTextColor(...C.muted);
    doc.text("MentorForge AI  |  Confidential Session Report", 20, 286);
    doc.text(`Page ${pg}`, 190, 286, { align: "right" });
  };
  const sectionTitle = (title: string, y: number) => {
    doc.setFontSize(13); doc.setTextColor(...C.dark); doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), 20, y);
    doc.setDrawColor(...C.primary); doc.setLineWidth(0.8); doc.line(20, y + 2, 75, y + 2);
    return y + 10;
  };
  const checkPage = (y: number, need: number) => {
    if (y + need > 270) { addFooter(); doc.addPage(); pg++; setBg(); return 25; }
    return y;
  };
  const drawTable = (startY: number, head: string[][], body: string[][], opts?: Record<string, unknown>) => {
    autoTable(doc, {
      startY,
      head,
      body,
      theme: "grid",
      headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 9, textColor: C.text },
      alternateRowStyles: { fillColor: C.cream },
      margin: { left: 20, right: 20 },
      ...opts,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (doc as any).lastAutoTable.finalY + 12;
  };

  // ═══════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ═══════════════════════════════════════════════════
  setBg();
  doc.setFillColor(...C.primary); doc.rect(0, 0, 210, 10, "F");
  doc.setFillColor(...C.dark); doc.rect(0, 10, 210, 2, "F");

  // Logo
  doc.setFillColor(...C.dark); doc.circle(105, 50, 16, "F");
  doc.setFontSize(20); doc.setTextColor(...C.white); doc.setFont("helvetica", "bold");
  doc.text("MF", 105, 54, { align: "center" });

  doc.setFontSize(36); doc.setTextColor(...C.dark); doc.text("MentorForge AI", 105, 82, { align: "center" });
  doc.setFontSize(13); doc.setTextColor(...C.primary); doc.setFont("helvetica", "normal");
  doc.text("Session Performance Report", 105, 93, { align: "center" });

  doc.setDrawColor(...C.primary); doc.setLineWidth(0.8); doc.line(55, 100, 155, 100);

  doc.setFontSize(11); doc.setTextColor(...C.text);
  doc.text(fmtDate(sessionDate), 105, 112, { align: "center" });
  doc.setFontSize(10); doc.setTextColor(...C.muted);
  doc.text(fmtTime(sessionDate), 105, 119, { align: "center" });

  // Student card
  doc.setFillColor(...C.white); doc.roundedRect(35, 132, 140, 50, 5, 5, "F");
  doc.setDrawColor(...C.primary); doc.setLineWidth(0.4); doc.roundedRect(35, 132, 140, 50, 5, 5, "S");
  doc.setFontSize(8); doc.setTextColor(...C.muted); doc.setFont("helvetica", "bold");
  doc.text("STUDENT PROFILE", 105, 144, { align: "center" });
  doc.setFontSize(20); doc.setTextColor(...C.text); doc.text(studentName || "Student", 105, 157, { align: "center" });
  doc.setFontSize(10); doc.setTextColor(...C.primary); doc.setFont("helvetica", "normal");
  doc.text(targetRole || "Software Engineer", 105, 166, { align: "center" });

  // Mode badge
  const modeLabel = sessionMode === "interview" ? "MOCK INTERVIEW" : "MENTOR SESSION";
  const badgeCol = sessionMode === "interview" ? C.red : C.green;
  doc.setFillColor(...badgeCol); doc.roundedRect(67, 195, 76, 11, 4, 4, "F");
  doc.setFontSize(9); doc.setTextColor(...C.white); doc.setFont("helvetica", "bold");
  doc.text(modeLabel, 105, 203, { align: "center" });

  // Rating
  const rc = analysis.overallRating === "Excellent" ? C.green : analysis.overallRating === "Good" ? C.amber : C.red;
  const rbg = analysis.overallRating === "Excellent" ? C.lightGreen : analysis.overallRating === "Good" ? C.lightAmber : C.lightRed;
  doc.setFillColor(...rbg); doc.roundedRect(55, 218, 100, 28, 5, 5, "F");
  doc.setDrawColor(...rc); doc.setLineWidth(0.5); doc.roundedRect(55, 218, 100, 28, 5, 5, "S");
  doc.setFontSize(20); doc.setTextColor(...rc); doc.setFont("helvetica", "bold");
  doc.text(analysis.overallRating.toUpperCase(), 105, 235, { align: "center" });
  doc.setFontSize(7); doc.setTextColor(...C.muted); doc.setFont("helvetica", "normal");
  doc.text("OVERALL PERFORMANCE RATING", 105, 242, { align: "center" });

  doc.setFontSize(8); doc.setTextColor(...C.muted); doc.setFont("helvetica", "italic");
  doc.text("\"The only way to learn programming is by programming.\"", 105, 265, { align: "center" });

  addFooter();

  // ═══════════════════════════════════════════════════
  // PAGE 2 — SUMMARY & METRICS
  // ═══════════════════════════════════════════════════
  doc.addPage(); pg++; setBg();
  let y = 25;
  y = sectionTitle("Executive Summary", y);

  doc.setFontSize(10); doc.setTextColor(...C.text); doc.setFont("helvetica", "normal");
  const sl = doc.splitTextToSize(analysis.summary, 170);
  doc.text(sl, 20, y); y += sl.length * 5 + 12;

  y = sectionTitle("Session Metrics", y);
  y = drawTable(y,
    [["Metric", "Value", "Metric", "Value"]],
    [
      ["Duration", `${analysis.metrics.durationMinutes} min`, "Total Messages", `${analysis.metrics.totalMessages}`],
      ["Your Messages", `${analysis.metrics.userMessages}`, "Mentor Messages", `${analysis.metrics.mentorMessages}`],
      ["Code Submissions", `${analysis.metrics.codeSubmissions}`, "Questions Asked", `${analysis.metrics.questionsAsked}`],
    ]
  );

  y = sectionTitle("Topics Covered", y);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(...C.text);
  if (analysis.topicsCovered.length > 0) {
    analysis.topicsCovered.forEach(t => { doc.text(`  •  ${t}`, 22, y); y += 6; });
  } else {
    doc.text("  •  General programming concepts", 22, y); y += 6;
  }
  y += 8;

  y = checkPage(y, 30);
  y = sectionTitle("Teaching Techniques", y);
  if (analysis.metrics.techniquesUsed.length > 0) {
    analysis.metrics.techniquesUsed.forEach(t => { doc.text(`  •  ${t}`, 22, y); y += 6; });
  } else {
    doc.text("  •  Socratic Method", 22, y); y += 6;
  }
  y += 8;

  // Engagement analysis
  y = checkPage(y, 50);
  y = sectionTitle("Engagement Analysis", y);
  const engageRatio = analysis.metrics.totalMessages > 0 ? Math.round((analysis.metrics.userMessages / analysis.metrics.totalMessages) * 100) : 0;
  y = drawTable(y,
    [["Indicator", "Result"]],
    [
      ["Participation Ratio", `${engageRatio}%`],
      ["Code Practice", analysis.metrics.codeSubmissions > 0 ? `${analysis.metrics.codeSubmissions} solution(s)` : "None this session"],
      ["Curiosity Index", analysis.metrics.questionsAsked >= 3 ? "High" : analysis.metrics.questionsAsked >= 1 ? "Moderate" : "Low"],
    ],
    { headStyles: { fillColor: C.dark, textColor: C.white, fontStyle: "bold", fontSize: 8 }, tableWidth: 120 }
  );
  addFooter();

  // ═══════════════════════════════════════════════════
  // PAGE 3 — KEY TAKEAWAYS + STRENGTHS + WEAKNESSES
  // ═══════════════════════════════════════════════════
  doc.addPage(); pg++; setBg();
  y = 25;
  y = sectionTitle("Key Takeaways", y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...C.text);
  analysis.keyTakeaways.forEach((item, i) => {
    y = checkPage(y, 14);
    doc.setFillColor(...C.white); doc.roundedRect(20, y - 5, 170, 10, 2, 2, "F");
    doc.setDrawColor(...C.primary); doc.setLineWidth(0.2); doc.roundedRect(20, y - 5, 170, 10, 2, 2, "S");
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C.primary); doc.setFontSize(8);
    doc.text(`${i + 1}`, 25, y + 1);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C.text); doc.setFontSize(9);
    doc.text(item.substring(0, 100), 32, y + 1);
    y += 14;
  });
  y += 5;

  // Strengths
  y = checkPage(y, 25);
  y = sectionTitle("Strengths Identified", y);
  analysis.strengths.forEach(s => {
    y = checkPage(y, 22);
    doc.setFillColor(...C.lightGreen); doc.roundedRect(20, y - 5, 170, 18, 3, 3, "F");
    doc.setDrawColor(...C.green); doc.setLineWidth(0.3); doc.roundedRect(20, y - 5, 170, 18, 3, 3, "S");
    doc.setFontSize(10); doc.setTextColor(...C.green); doc.setFont("helvetica", "bold");
    doc.text(`+ ${s.title}`, 25, y + 1);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C.text); doc.setFontSize(8);
    doc.text(doc.splitTextToSize(s.detail, 158), 27, y + 7);
    y += 22;
  });
  y += 5;

  // Weaknesses
  y = checkPage(y, 25);
  y = sectionTitle("Areas for Improvement", y);
  analysis.weaknesses.forEach(w => {
    y = checkPage(y, 22);
    doc.setFillColor(...C.lightAmber); doc.roundedRect(20, y - 5, 170, 18, 3, 3, "F");
    doc.setDrawColor(...C.amber); doc.setLineWidth(0.3); doc.roundedRect(20, y - 5, 170, 18, 3, 3, "S");
    doc.setFontSize(10); doc.setTextColor(...C.amber); doc.setFont("helvetica", "bold");
    doc.text(`! ${w.title}`, 25, y + 1);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C.text); doc.setFontSize(8);
    doc.text(doc.splitTextToSize(w.detail, 158), 27, y + 7);
    y += 22;
  });
  addFooter();

  // ═══════════════════════════════════════════════════
  // PAGE 4 — IMPROVEMENT ROADMAP
  // ═══════════════════════════════════════════════════
  doc.addPage(); pg++; setBg();
  y = 25;
  y = sectionTitle("Improvement Roadmap", y);

  analysis.improvements.forEach((item, i) => {
    y = checkPage(y, 16);
    doc.setFillColor(...C.primary); doc.circle(27, y - 1, 4, "F");
    doc.setFontSize(8); doc.setTextColor(...C.white); doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}`, 27, y + 0.5, { align: "center" });
    doc.setTextColor(...C.text); doc.setFontSize(10); doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(item, 150);
    doc.text(lines, 35, y);
    y += lines.length * 5 + 10;
  });

  // Recommended focus
  y += 5;
  y = checkPage(y, 55);
  y = sectionTitle("Recommended Focus Areas", y);
  doc.setFillColor(...C.white); doc.roundedRect(20, y - 5, 170, 42, 3, 3, "F");
  doc.setDrawColor(...C.primary); doc.setLineWidth(0.3); doc.roundedRect(20, y - 5, 170, 42, 3, 3, "S");

  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...C.text);
  const recs = [
    `Primary: ${analysis.topicsCovered[0] || "Data Structures"} — keep practicing.`,
    `Secondary: ${analysis.topicsCovered[1] || "Algorithms"} — expand breadth.`,
    `Mode: ${sessionMode === "mentor" ? "Try Mock Interview mode next" : "Review in Mentor mode"}.`,
    `Time Goal: Aim for 20+ min sessions for deeper learning.`,
  ];
  recs.forEach((r, i) => { doc.text(`${i + 1}. ${r}`, 25, y + 2 + i * 9); });
  addFooter();

  // ═══════════════════════════════════════════════════
  // PAGE 5+ — FULL TRANSCRIPT
  // ═══════════════════════════════════════════════════
  doc.addPage(); pg++; setBg();
  y = 25;
  y = sectionTitle("Full Conversation Transcript", y);

  if (messages.length > 0) {
    const rows = messages.map(m => {
      const t = m.created_at ? new Date(m.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--:--";
      const role = m.is_user ? "You" : "Mentor";
      const txt = m.message_text.length > 300 ? m.message_text.substring(0, 300) + "..." : m.message_text;
      return [t, role, txt];
    });
    autoTable(doc, {
      startY: y,
      head: [["Time", "Speaker", "Message"]],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 7, textColor: C.text, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 18, fontStyle: "bold" }, 2: { cellWidth: "auto" } },
      alternateRowStyles: { fillColor: C.cream },
      margin: { left: 15, right: 15 },
      didDrawPage: () => { setBg(); addFooter(); pg++; },
    });
  } else {
    doc.setFontSize(10); doc.setTextColor(...C.muted);
    doc.text("No messages were recorded for this session.", 20, y);
  }

  // Final closing page
  doc.addPage(); pg++; setBg();
  doc.setFillColor(...C.primary); doc.rect(0, 0, 210, 10, "F");
  doc.setFontSize(28); doc.setTextColor(...C.dark); doc.setFont("helvetica", "bold");
  doc.text("Keep Forging.", 105, 100, { align: "center" });
  doc.setFontSize(12); doc.setTextColor(...C.primary); doc.setFont("helvetica", "normal");
  doc.text("Every session makes you a stronger engineer.", 105, 115, { align: "center" });

  doc.setFillColor(...C.white); doc.roundedRect(45, 135, 120, 45, 5, 5, "F");
  doc.setDrawColor(...C.primary); doc.setLineWidth(0.3); doc.roundedRect(45, 135, 120, 45, 5, 5, "S");
  doc.setFontSize(9); doc.setTextColor(...C.muted); doc.setFont("helvetica", "bold");
  doc.text("SESSION RECAP", 105, 148, { align: "center" });
  doc.setFontSize(10); doc.setTextColor(...C.text); doc.setFont("helvetica", "normal");
  doc.text(`${analysis.metrics.durationMinutes} min  |  ${analysis.metrics.totalMessages} msgs  |  ${analysis.topicsCovered.length} topics`, 105, 160, { align: "center" });
  doc.text(`Rating: ${analysis.overallRating}`, 105, 170, { align: "center" });

  doc.setFontSize(8); doc.setTextColor(...C.muted); doc.setFont("helvetica", "italic");
  doc.text("Generated by MentorForge AI", 105, 250, { align: "center" });
  addFooter();

  // Save
  const fileName = `MentorForge_Session_${sessionDate.toISOString().split("T")[0]}.pdf`;
  console.log("[PDF] Saving as:", fileName);
  doc.save(fileName);
  console.log("[PDF] Done!");
}
