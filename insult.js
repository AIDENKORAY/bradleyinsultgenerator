export default async function handler(req, res) {
  // ✅ Allow requests from anywhere (or restrict later)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: "Generate a funny, creative, non-hateful insult. Keep it under 20 words."
      })
    });

    const data = await response.json();
    const insult = data.output?.[0]?.content?.[0]?.text || "Something broke 😭";

    res.status(200).json({ insult });

  } catch (err) {
    res.status(500).json({ insult: "Error generating insult." });
  }
}
