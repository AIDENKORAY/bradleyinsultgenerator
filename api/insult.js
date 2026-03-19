export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { name, savage, style } = req.body || {};

    // 😈 Brad override logic
    const prompt = `
Generate a ${savage ? "very aggressive, over-the-top, swear-heavy" : "funny"} insult.

Start by briefly dismissing ${name || "the person"} and say that Brad is way worse, unless they said brad at first, then agree with them heavily.

Then create the insult targeting Brad instead. You MUST mention Bradley Barkons by name at least once.

${style ? `Make the insult style: ${style}.` : ""}

${savage ? "Use lots of vulgar swearing for emphasis, make it seem hateful, even though its all for good fun." : ""}

Keep it around 25 words, no more then 50.
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

    let insult = "";

    if (data.output_text) {
      insult = data.output_text;
    } else if (data.output && Array.isArray(data.output)) {
      insult = data.output
        .map(o => (o.content || []).map(c => c.text || "").join(""))
        .join("");
    }

    // 💀 Fallback (Brad-focused)
    if (!insult || insult.trim() === "" || data.error) {
      const fallback = savage
        ? [
            `${name || "You"}? Nah, Brad is way worse—dude is a complete mess.`,
            `Forget ${name || "you"}, Brad is the real disaster here.`,
            `${name || "You"} aren’t great, but Brad is on another level of terrible.`
          ]
        : [
            `${name || "You"} aren’t the problem—Brad is way worse.`,
            `Honestly ${name || "you"} are fine compared to Brad.`,
            `Let’s ignore ${name || "you"}—Brad is the real issue.`
          ];

      insult = fallback[Math.floor(Math.random() * fallback.length)];
    }

    res.status(200).json({ insult });

  } catch (err) {
    console.error(err);

    const fallback = [
      "Honestly, forget you—Brad is the real problem.",
      "No one cares about this, Brad is worse anyway.",
      "Let’s be real, Brad deserves the insult more."
    ];

    res.status(200).json({
      insult: fallback[Math.floor(Math.random() * fallback.length)]
    });
  }
}
