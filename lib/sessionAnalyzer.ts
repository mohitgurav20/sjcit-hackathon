// MentorForge AI — Client-Side Session Analyzer
// Extracts insights from conversation transcripts using pattern matching.

export interface ChatMessage {
  id: string;
  message_text: string;
  is_user: boolean;
  created_at: string;
}

export interface Weakness {
  id: string;
  title: string;
  category: string;
  severity: string;
  occurrences: number;
  description: string;
}

export interface SessionAnalysis {
  summary: string;
  overallRating: "Excellent" | "Good" | "Needs Improvement";
  keyTakeaways: string[];
  strengths: { title: string; detail: string }[];
  weaknesses: { title: string; detail: string }[];
  improvements: string[];
  topicsCovered: string[];
  metrics: {
    totalMessages: number;
    userMessages: number;
    mentorMessages: number;
    durationMinutes: number;
    codeSubmissions: number;
    questionsAsked: number;
    techniquesUsed: string[];
  };
}

const TOPIC_PATTERNS: Record<string, RegExp[]> = {
  "Binary Search": [/binary\s*search/i, /bisect/i, /divide\s*and\s*conquer/i],
  "Two Pointers": [/two\s*pointer/i, /left.*right.*pointer/i, /sliding\s*window/i],
  "Linked Lists": [/linked\s*list/i, /node.*next/i],
  "Trees & BST": [/binary\s*tree/i, /bst/i, /inorder|preorder|postorder/i, /root.*child/i],
  "Dynamic Programming": [/dynamic\s*programming/i, /\bdp\b/i, /memoiz/i, /tabulation/i],
  "Recursion": [/recursion/i, /recursive/i, /base\s*case/i],
  "Sorting": [/merge\s*sort/i, /quick\s*sort/i, /bubble\s*sort/i, /sorting/i],
  "Graphs": [/graph/i, /bfs|dfs/i, /dijkstra/i, /breadth.*first/i, /depth.*first/i],
  "Hash Maps": [/hash\s*map/i, /hash\s*table/i, /dictionary/i, /set\b/i],
  "Stacks & Queues": [/\bstack\b/i, /\bqueue\b/i, /fifo|lifo/i, /pop|push/i],
  "Arrays": [/\barray\b/i, /subarray/i, /matrix/i, /grid/i],
  "Strings": [/palindrome/i, /anagram/i, /substring/i, /string/i],
  "System Design": [/system\s*design/i, /scalab/i, /microservice/i, /database/i, /architecture/i],
  "Time Complexity": [/time\s*complexity/i, /big\s*o/i, /O\(/i, /space\s*complexity/i],
};

const TECHNIQUE_PATTERNS: Record<string, RegExp[]> = {
  "Socratic Method": [/what\s*do\s*you\s*think/i, /how\s*would\s*you/i, /why\s*did\s*you/i, /can\s*you\s*explain/i],
  "Feynman Technique": [/simple\s*words/i, /explain.*like/i, /break\s*this\s*down/i, /simpler\s*terms/i, /without\s*jargon/i],
  "Rubber Duck": [/line\s*by\s*line/i, /out\s*loud/i, /walk\s*me\s*through/i, /read\s*your\s*code/i],
  "Analogy": [/think\s*of\s*it\s*like/i, /imagine/i, /analogy/i, /similar\s*to/i, /like\s*a/i],
  "What-If": [/what\s*if/i, /edge\s*case/i, /scale/i, /fails/i, /what\s*happens/i],
  "Error Analysis": [/analyze.*bug/i, /debug/i, /error/i, /trace/i, /wrong/i, /mistake/i],
};

const POSITIVE = [/exactly|perfect|excellent|great|well\s*done|correct|right|impressive|solid/i, /good\s*(thinking|approach|answer|work)/i];
const STRUGGLE = [/not\s*quite/i, /think\s*again/i, /careful/i, /try\s*again/i, /hint/i, /stuck/i, /almost/i];

function countCode(msgs: ChatMessage[]): number {
  return msgs.filter(m => m.is_user && (/```/.test(m.message_text) || /function\s*\w+\s*\(/.test(m.message_text) || /submitted.*code/i.test(m.message_text))).length;
}

export function analyzeSession(
  messages: ChatMessage[],
  durationMinutes: number,
  sessionMode: "mentor" | "interview",
  knownWeaknesses: Weakness[] = []
): SessionAnalysis {
  const allText = messages.map(m => m.message_text).join(" ");
  const mentorMsgs = messages.filter(m => !m.is_user);
  const userMsgs = messages.filter(m => m.is_user);
  const mentorText = mentorMsgs.map(m => m.message_text).join(" ");

  // Topics
  const topicsCovered: string[] = [];
  for (const [topic, patterns] of Object.entries(TOPIC_PATTERNS)) {
    if (patterns.some(p => p.test(allText))) topicsCovered.push(topic);
  }
  if (!topicsCovered.length) topicsCovered.push("General CS Concepts");

  // Techniques
  const techniquesUsed: string[] = [];
  for (const [tech, patterns] of Object.entries(TECHNIQUE_PATTERNS)) {
    if (patterns.some(p => p.test(mentorText))) techniquesUsed.push(tech);
  }
  if (!techniquesUsed.length) techniquesUsed.push("Socratic Method");

  // Counts
  let positiveCount = 0;
  let struggleCount = 0;
  for (const msg of mentorMsgs) {
    if (POSITIVE.some(p => p.test(msg.message_text))) positiveCount++;
    if (STRUGGLE.some(p => p.test(msg.message_text))) struggleCount++;
  }
  const codeSubs = countCode(messages);
  const userQs = userMsgs.filter(m => m.message_text.trim().endsWith("?")).length;

  // Strengths
  const strengths: { title: string; detail: string }[] = [];
  if (positiveCount >= 3) strengths.push({ title: "Strong Conceptual Understanding", detail: `Mentor acknowledged ${positiveCount} correct answers.` });
  else if (positiveCount >= 1) strengths.push({ title: "Growing Understanding", detail: "Demonstrated understanding of key concepts." });
  if (codeSubs > 0) strengths.push({ title: "Hands-On Coding", detail: `Submitted ${codeSubs} code solution${codeSubs > 1 ? "s" : ""}.` });
  if (userQs >= 2) strengths.push({ title: "Curious & Inquisitive", detail: `Asked ${userQs} clarifying questions.` });
  if (userMsgs.length > 0 && userMsgs.reduce((s, m) => s + m.message_text.length, 0) / userMsgs.length > 100) {
    strengths.push({ title: "Detailed Explanations", detail: "Thorough, well-articulated responses." });
  }
  if (durationMinutes >= 15) strengths.push({ title: "Session Persistence", detail: `Maintained focus for ${Math.round(durationMinutes)} min.` });
  if (!strengths.length) strengths.push({ title: "Initiative", detail: "Took the first step by starting a session." });

  // Weaknesses
  const weaknesses: { title: string; detail: string }[] = [];
  if (struggleCount >= 3) weaknesses.push({ title: "Conceptual Gaps", detail: `Corrected ${struggleCount} times. Review ${topicsCovered[0]}.` });
  else if (struggleCount >= 1) weaknesses.push({ title: "Minor Hesitation", detail: "Some moments of uncertainty — review mentor corrections." });
  if (codeSubs === 0 && durationMinutes > 5) weaknesses.push({ title: "No Code Practice", detail: "Submit code next time to reinforce learning." });
  if (userMsgs.length < mentorMsgs.length * 0.4) weaknesses.push({ title: "Low Engagement", detail: "Elaborate more on your thought process." });
  for (const w of knownWeaknesses) {
    if (topicsCovered.some(t => t.toLowerCase().includes(w.category.toLowerCase()) || w.category.toLowerCase().includes(t.toLowerCase()))) {
      weaknesses.push({ title: `Recurring: ${w.title}`, detail: `[${w.severity.toUpperCase()}] ${w.description} (${w.occurrences}x)` });
    }
  }
  if (!weaknesses.length) weaknesses.push({ title: "Keep Pushing", detail: "No weaknesses detected — try harder problems." });

  // Takeaways
  const keyTakeaways: string[] = [
    `Covered ${topicsCovered.length} topic${topicsCovered.length > 1 ? "s" : ""}: ${topicsCovered.join(", ")}.`,
    `Techniques used: ${techniquesUsed.join(", ")}.`,
  ];
  if (codeSubs > 0) keyTakeaways.push(`Practiced ${codeSubs} coding challenge${codeSubs > 1 ? "s" : ""}.`);
  if (positiveCount > 0) keyTakeaways.push(`Correct understanding shown ${positiveCount} time${positiveCount > 1 ? "s" : ""}.`);
  if (sessionMode === "interview") keyTakeaways.push("Mock Interview mode — real placement pressure.");

  // Improvements
  const improvements: string[] = [];
  if (codeSubs === 0) improvements.push("Write code during sessions using the floating editor.");
  if (topicsCovered.length === 1) improvements.push("Explore related topics next session.");
  if (struggleCount >= 2) improvements.push(`Review ${topicsCovered[0]} fundamentals.`);
  if (userQs < 2) improvements.push("Ask more clarifying questions.");
  improvements.push("Use Weakness Hunter to track recurring mistakes.");
  if (sessionMode === "mentor") improvements.push("Try Mock Interview mode next.");

  // Rating
  const score = positiveCount * 2 + codeSubs * 3 + userQs - struggleCount * 2;
  const overallRating: SessionAnalysis["overallRating"] = score >= 8 ? "Excellent" : score >= 3 ? "Good" : "Needs Improvement";

  const modeStr = sessionMode === "interview" ? "mock interview" : "mentoring";
  const summary = `${Math.round(durationMinutes)}-minute ${modeStr} session covering ${topicsCovered.slice(0, 3).join(", ")}. ${
    overallRating === "Excellent" ? "Outstanding performance with strong engagement." :
    overallRating === "Good" ? "Good session. Some areas for further practice." :
    "Session completed. Several areas for improvement identified."
  }`;

  return {
    summary, overallRating, keyTakeaways, strengths, weaknesses, improvements, topicsCovered,
    metrics: { totalMessages: messages.length, userMessages: userMsgs.length, mentorMessages: mentorMsgs.length, durationMinutes: Math.round(durationMinutes), codeSubmissions: codeSubs, questionsAsked: userQs, techniquesUsed },
  };
}
