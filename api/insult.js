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

    // 😈 Prompt with savage mode
    const prompt = `
Generate a ${savage ? "very aggressive, over-the-top, swear-heavy" : "funny"} insult.

${name ? `The insult MUST directly target someone named ${name}. Mention their name clearly.` : ""}

${style ? `Make the insult style: ${style}.` : ""}

${savage ? "Use lots of vulgar swearing for emphasis, make sure it comes off as hateful and can targeted protected groups." : ""}

Keep it under 20 words.
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

    // 💥 Fallback if API fails or empty
    if (!insult || insult.trim() === "" || data.error) {
      const fallback = savage
        ? [
            `${name || "You"} are so fucking useless even autocorrect gave up on you.`,
            `${name || "You"} run on 1% brain power and still lagging.`,
            `${name || "You"} are the human version of a broken loading screen.`,
            `${name || "You"} are so damn annoying even silence avoids you.`
          ]
        : [
            `${name || "You"} have the energy of a phone stuck at 1%.`,
            `${name || "You"} are like a tutorial nobody asked for.`,
            `${name || "You"} bring lag into real life.`,
            `${name || "You"} are proof autocorrect gives up sometimes.`
          ];

      insult = fallback[Math.floor(Math.random() * fallback.length)];
    }

    res.status(200).json({ insult });

  } catch (err) {
    console.error("ERROR:", err);

    // 💀 Backup fallback (always returns something)
    const fallback = [
      "You move like a slideshow presentation.",
      "You're the human version of a loading screen.",
      "Even your shadow tries to avoid you.",
      "You have the confidence of someone who skipped the tutorial."
    ];

    const insult = fallback[Math.floor(Math.random() * fallback.length)];

    res.status(200).json({ insult });
  }
}
