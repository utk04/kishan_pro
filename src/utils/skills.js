// src/utils/skills.js
export function parseSkillSet(text) {
  if (!text) return [];
  // normalize: lowercase, replace non word characters with space, split, remove empties
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\.\+#\-]/gi, " ") // keep dots and + - # etc if present in tokens
        .split(/\s+/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

/**
 * returns { common: [...], score: number }
 * score = number of common skills
 */
export function skillOverlap(aSkillsText, bSkillsText) {
  const a = parseSkillSet(aSkillsText);
  const b = parseSkillSet(bSkillsText);
  const setB = new Set(b);
  const common = a.filter((s) => setB.has(s));
  return { common, score: common.length, aCount: a.length, bCount: b.length };
}
