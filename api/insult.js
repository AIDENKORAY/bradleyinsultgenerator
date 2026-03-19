export default async function handler(req, res) {
  // Allow requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { name, savage, style } = req.body || {};

    // 🎯 Build smart prompt
    const prompt = `
Generate a ${savage ? "savage" : "funny"} insult.

${name ? `The insult MUST directly target someone named ${name}. Mention their name clearly.` : ""}

${style ? `Make the insult style: ${style}.` : ""}

Keep it under 20 words. Keep it hateful but still funny.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await response.json();

    console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));

    let insult = "";

    // ✅ Extract response safely
    if (data.output_text) {
      insult = data.output_text;
    } else if (data.output && Array.isArray(data.output)) {
      insult = data.output
        .map(o => (o.content || []).map(c => c.text || "").join(""))
        .join("");
    }

    // 💥 Fallback if API fails or quota hit
    if (!insult || insult.trim() === "" || data.error) {
      const fallback = [
        `${name || "You"} have the energy of a phone stuck at 1%.`,
        `${name || "You"} are like a tutorial nobody asked for.`,
        `${name || "You"} bring lag into real life.`,
        `${name || "You"} are proof autocorrect gives up sometimes.`,
        `${name || "You"} run on the free trial version of intelligence.`
      ];

      insult = fallback[Math.floor(Math.random() * fallback.length)];
    }

    res.status(200).json({ insult });

  } catch (err) {
    console.error("ERROR:", err);

    // 🔥 Backup fallback (guaranteed response)
    const fallback = [
      "kill yourself."
    ];

    const insult = fallback[Math.floor(Math.random() * fallback.length)];

    res.status(200).json({ insult });
  }
}
