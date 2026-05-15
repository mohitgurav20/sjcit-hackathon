/**
 * Weakness Hunter Data Model
 * 
 * Simulates data that would come from Supabase user profiles.
 * Tracks recurring logical mistakes with code traces for LogicReplay.
 */

import { supabase } from "./supabase";

export type WeaknessSeverity = "critical" | "moderate" | "minor";

export interface CodeStep {
  line: number;
  code: string;
  isError: boolean;
  explanation: string;
}

export interface Weakness {
  id: string;
  title: string;
  category: string;
  severity: WeaknessSeverity;
  occurrences: number;
  lastSeen: string;
  description: string;
  codeSteps: CodeStep[];
  fix: string;
}

export const SEVERITY_CONFIG: Record<WeaknessSeverity, { color: string; bg: string; label: string }> = {
  critical: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", label: "Critical" },
  moderate: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", label: "Moderate" },
  minor: { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", label: "Minor" },
};

export const STUDENT_WEAKNESSES: Weakness[] = [
  {
    id: "w1",
    title: "Off-by-one error in two-pointer",
    category: "Two Pointers",
    severity: "critical",
    occurrences: 7,
    lastSeen: "2 hours ago",
    description: "You consistently use `left < right` instead of `left <= right`, missing the case where both pointers converge on the target element.",
    codeSteps: [
      { line: 1, code: "function twoSum(arr, target) {", isError: false, explanation: "Function signature is correct." },
      { line: 2, code: "  let left = 0, right = arr.length - 1;", isError: false, explanation: "Pointers initialized correctly." },
      { line: 3, code: "  while (left < right) {  // ❌ BUG HERE", isError: true, explanation: "Should be `left <= right`. When left === right, you skip checking the last remaining element." },
      { line: 4, code: "    const sum = arr[left] + arr[right];", isError: false, explanation: "Sum calculation is fine." },
      { line: 5, code: "    if (sum === target) return [left, right];", isError: false, explanation: "Return is correct." },
      { line: 6, code: "    if (sum < target) left++;", isError: false, explanation: "Left pointer moves correctly." },
      { line: 7, code: "    else right--;", isError: false, explanation: "Right pointer moves correctly." },
      { line: 8, code: "  }", isError: false, explanation: "" },
      { line: 9, code: "  return [-1, -1];", isError: false, explanation: "Fallback is fine, but you reach it prematurely due to the off-by-one." },
    ],
    fix: "Change `while (left < right)` to `while (left <= right)` to ensure you check the element when both pointers meet.",
  },
  {
    id: "w2",
    title: "Wrong recursion base case",
    category: "Recursion",
    severity: "critical",
    occurrences: 5,
    lastSeen: "Yesterday",
    description: "You forget to handle the `n === 0` case in recursive functions, causing infinite recursion and stack overflow.",
    codeSteps: [
      { line: 1, code: "function factorial(n) {", isError: false, explanation: "Function signature is correct." },
      { line: 2, code: "  if (n === 1) return 1;  // ❌ BUG HERE", isError: true, explanation: "Only checks n===1. What happens when n===0? It recurses forever: factorial(0) → factorial(-1) → ..." },
      { line: 3, code: "  return n * factorial(n - 1);", isError: false, explanation: "Recursive call is correct, but without the right base case it never terminates for n=0." },
      { line: 4, code: "}", isError: false, explanation: "" },
    ],
    fix: "Change `if (n === 1)` to `if (n <= 1)` or add an explicit `if (n === 0) return 1` check before.",
  },
  {
    id: "w3",
    title: "Missing edge case in binary search",
    category: "Binary Search",
    severity: "moderate",
    occurrences: 4,
    lastSeen: "2 days ago",
    description: "You don't handle the empty array case before starting binary search, leading to undefined behavior on `arr[mid]`.",
    codeSteps: [
      { line: 1, code: "function binarySearch(arr, target) {", isError: false, explanation: "Function entry." },
      { line: 2, code: "  let left = 0, right = arr.length - 1;", isError: true, explanation: "When arr is empty, right = -1. The while loop won't execute, but you should explicitly return early for clarity and safety." },
      { line: 3, code: "  while (left <= right) {", isError: false, explanation: "Loop condition is fine." },
      { line: 4, code: "    const mid = Math.floor((left + right) / 2);", isError: false, explanation: "Mid calculation works." },
      { line: 5, code: "    if (arr[mid] === target) return mid;", isError: false, explanation: "Found case is correct." },
      { line: 6, code: "    if (arr[mid] < target) left = mid + 1;", isError: false, explanation: "Search right half." },
      { line: 7, code: "    else right = mid - 1;", isError: false, explanation: "Search left half." },
      { line: 8, code: "  }", isError: false, explanation: "" },
      { line: 9, code: "  return -1;", isError: false, explanation: "Not found." },
    ],
    fix: "Add `if (arr.length === 0) return -1;` as the first line of the function. Always validate inputs before processing.",
  },
  {
    id: "w4",
    title: "Forgetting to update hash map in sliding window",
    category: "Sliding Window",
    severity: "moderate",
    occurrences: 3,
    lastSeen: "3 days ago",
    description: "When shrinking the window, you move the left pointer but forget to remove the element from your frequency map, causing stale data.",
    codeSteps: [
      { line: 1, code: "function maxSubarray(arr, k) {", isError: false, explanation: "Function for sliding window of size k." },
      { line: 2, code: "  const freq = {};", isError: false, explanation: "Frequency map initialized." },
      { line: 3, code: "  for (let i = 0; i < arr.length; i++) {", isError: false, explanation: "Iterating through array." },
      { line: 4, code: "    freq[arr[i]] = (freq[arr[i]] || 0) + 1;", isError: false, explanation: "Adding element to map — correct." },
      { line: 5, code: "    if (i >= k) {", isError: false, explanation: "Time to shrink window." },
      { line: 6, code: "      left++;  // ❌ BUG HERE", isError: true, explanation: "You move the pointer but never do `freq[arr[i-k]]--`. The frequency map still counts the removed element!" },
      { line: 7, code: "    }", isError: false, explanation: "" },
      { line: 8, code: "  }", isError: false, explanation: "" },
    ],
    fix: "Before or after moving the left pointer, always update the map: `freq[arr[i - k]]--; if (freq[arr[i - k]] === 0) delete freq[arr[i - k]];`",
  },
  {
    id: "w5",
    title: "Stack not emptied after processing",
    category: "Stack",
    severity: "minor",
    occurrences: 2,
    lastSeen: "5 days ago",
    description: "After the main loop in monotonic stack problems, you forget to process remaining elements still in the stack.",
    codeSteps: [
      { line: 1, code: "function nextGreater(arr) {", isError: false, explanation: "Monotonic stack approach." },
      { line: 2, code: "  const stack = [], result = Array(arr.length).fill(-1);", isError: false, explanation: "Initialization." },
      { line: 3, code: "  for (let i = 0; i < arr.length; i++) {", isError: false, explanation: "Main loop." },
      { line: 4, code: "    while (stack.length && arr[i] > arr[stack[stack.length-1]]) {", isError: false, explanation: "Pop smaller elements." },
      { line: 5, code: "      result[stack.pop()] = arr[i];", isError: false, explanation: "Assign next greater." },
      { line: 6, code: "    }", isError: false, explanation: "" },
      { line: 7, code: "    stack.push(i);", isError: false, explanation: "Push current index." },
      { line: 8, code: "  }", isError: false, explanation: "" },
      { line: 9, code: "  return result;  // ❌ MISSING STEP", isError: true, explanation: "Elements remaining in the stack have no next greater element. They default to -1 which is fine here, but in other variants you might need to process them explicitly." },
    ],
    fix: "After the loop, add: `while (stack.length) { result[stack.pop()] = -1; }` — this makes the intent explicit and prevents bugs in variants of this pattern.",
  },
];

export async function getStudentWeaknesses(): Promise<Weakness[]> {
  try {
    const { data, error } = await supabase
      .from("weaknesses")
      .select("*")
      // Hardcoded dummy user for demonstration
      .eq("user_id", "00000000-0000-0000-0000-000000000000");

    console.log("🔥 REAL Weaknesses from Supabase:", data);

    if (error) {
      console.error("Supabase error fetching weaknesses:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      severity: row.severity,
      occurrences: row.occurrences,
      lastSeen: row.last_seen,
      description: row.description,
      codeSteps: (() => {
        let parsed = row.code_steps;
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch (e) {}
        }
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch (e) {}
        }
        return Array.isArray(parsed) ? parsed : [];
      })(),
      fix: row.fix,
    }));
  } catch (err) {
    console.error("Error fetching weaknesses from Supabase:", err);
    return [];
  }
}

export async function getWeaknessSummary() {
  const weaknesses = await getStudentWeaknesses();
  const critical = weaknesses.filter((w) => w.severity === "critical").length;
  const moderate = weaknesses.filter((w) => w.severity === "moderate").length;
  const minor = weaknesses.filter((w) => w.severity === "minor").length;
  const totalOccurrences = weaknesses.reduce((sum, w) => sum + w.occurrences, 0);
  return { critical, moderate, minor, total: weaknesses.length, totalOccurrences, weaknesses };
}
