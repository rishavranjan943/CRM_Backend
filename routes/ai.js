import express from "express";
import axios from "axios";

const router = express.Router();

axios.defaults.timeout = 50000;

async function callGemini(prompt) {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }]
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
}


router.post("/campaign-suggest", async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal)
      return res.status(400).json({ ok: false, error: "goal required" });

    const prompt = `
Suggest 3 short personalized marketing SMS templates for this goal:
"${goal}"

Use {{name}} and {{total_spend}} placeholders if useful.
Do NOT include any [link] or URLs.
Return the result as ONLY a JSON array of strings (no explanations or markdown).
`;

    const aiResp = await callGemini(prompt);

    let cleaned = aiResp
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const suggestions = JSON.parse(cleaned);
      if (!Array.isArray(suggestions)) throw new Error("Not an array");
      res.json({ ok: true, suggestions });
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: "AI output could not be parsed",
        raw: cleaned
      });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});




router.post("/campaigns/summary", async (req, res) => {
  try {
    const { stats } = req.body; 
    console.log(stats)

    const prompt = `
Summarize this campaign performance for a marketing manager in one short sentence:
${JSON.stringify(stats)}
`;
    const aiResp = await callGemini(prompt);
    res.json({ ok: true, summary: aiResp });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


router.post("/segment-nl", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log(prompt)
    if (!prompt)
      return res.status(400).json({ ok: false, error: "prompt required" });

    const aiPrompt = `
Convert the following description into a JSON rule object.

Allowed fields: "total_spend", "visits", "days_inactive"
Allowed operators: ">", "<", "=", "!=", ">=", "<="

- Interpret "at least" or "more than or equal to" as ">="
- Interpret "more than" as ">"
- Interpret "less than" as "<"
- Groups can be nested using "op" and "children"
- Each "children" array can contain either condition objects or nested groups

Return ONLY valid JSON with no explanations, like this:

{
  "op": "OR",
  "children": [
    {
      "op": "AND",
      "children": [
        { "field": "total_spend", "cmp": ">", "value": 1000 },
        { "field": "visits", "cmp": ">", "value": 0 }
      ]
    },
    { "field": "total_spend", "cmp": ">", "value": 500 }
  ]
}

Description: "${prompt}"
`;

    const aiResp = await callGemini(aiPrompt);

    const match = aiResp.match(/\{[\s\S]*\}/);
    if (!match) {
      return res
        .status(500)
        .json({ ok: false, error: "No JSON found", raw: aiResp });
    }

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: "AI output could not be parsed",
        raw: aiResp,
      });
    }

    res.json({ ok: true, rules: parsed });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});




export default router;
