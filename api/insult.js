export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
        model: "gpt-4.1-mini", // ✅ more stable
        input: "Generate a funny, creative, non-hateful insult under 20 words."
      })
    });

    const data = await response.json();

    console.log(data); // 👈 helps debug in Vercel logs

    const insult =
      data.output?.[0]?.content?.[0]?.text ||
      "AI had a brain freeze 😭";

    res.status(200).json({ insult });

  } catch (err) {
    console.error(err);
    res.status(500).json({ insult: "Error generating insult." });
  }
}
