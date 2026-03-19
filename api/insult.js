export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { name, savage, style } = req.body || {};

    const inputName = (name || "").toLowerCase();

    // 🧠 Detect if user is already talking about Brad
    const isBrad =
      inputName.includes("brad") ||
      inputName.includes("bark") ||
      inputName.includes("barken") ||
      inputName.includes("barkens");

    let prompt = "";

    if (isBrad) {
      // 😈 DIRECT BRAD INSULT MODE
      prompt = `
Generate a ${savage ? "very aggressive, swear-heavy" : "funny"} insult directly targeting someone named Brad.

You MUST mention Brad by name.

${style ? `Style: ${style}.` : ""}

${savage ? "Use lots of vulgar swearing." : ""}

Keep it around 25 words, no more then 50.
`;
    } else {
      // 😂 NORMAL MODE (ignore user → insult Brad instead)
      prompt = `
Generate a ${savage ? "aggressive, swear-heavy" : "funny"} insult.

Start by dismissing ${name || "the person"} and say Brad is way worse.

Then insult Brad instead. You MUST mention Brad.

${style ? `Style: ${style}.` : ""}

${savage ? "Use casual swearing." : ""}

Keep it under 25 words.
`;
    }

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

    let insult = "";

    if (data.output_text) {
      insult = data.output_text;
    } else if (data.output && Array.isArray(data.output)) {
      insult = data.output
        .map(o => (o.content || []).map(c => c.text || "").join(""))
        .join("");
    }

    // 💀 Fallback system (also respects Brad logic)
    if (!insult || insult.trim() === "" || data.error) {
      let fallback;

      if (isBrad) {
        fallback = savage
          ? [
              "Brad, you're a complete mess with extra confidence for no reason.",
              "Brad, even your own ideas try to escape you.",
              "Brad, you're running on zero logic and full attitude."
            ]
          : [
              "Brad, you're not even trying at this point.",
              "Brad, you somehow make simple things confusing.",
              "Brad, you're the reason instructions exist."
            ];
      } else {
        fallback = savage
          ? [
              `${name || "You"}? Nah, Brad is way worse—dude is a disaster.`,
              `Forget ${name || "you"}, Brad is the real problem here.`,
              `${name || "You"} aren’t great, but Brad is on another level.`
            ]
          : [
              `${name || "You"} aren’t the issue—Brad is way worse.`,
              `Honestly ${name || "you"} are fine compared to Brad.`,
              `Let’s ignore ${name || "you"}—Brad is the real problem.`
            ];
      }

      insult = fallback[Math.floor(Math.random() * fallback.length)];
    }

    res.status(200).json({ insult });

  } catch (err) {
    console.error(err);

    res.status(200).json({
      insult: "Brad is still somehow the problem here."
    });
  }
}
