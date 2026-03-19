export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: "Generate a funny, creative, non-hateful insult under 20 words."
      })
    });

    const data = await response.json();

    // 👇 LOG EVERYTHING (we NEED this)
    console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));

    let insult = "";

    // ✅ Try multiple formats safely
    if (data.output_text) {
      insult = data.output_text;
    } else if (data.output && Array.isArray(data.output)) {
      insult = data.output
        .map(o => (o.content || []).map(c => c.text || "").join(""))
        .join("");
    }

    // fallback
    if (!insult || insult.trim() === "") {
      insult = "AI had a brain freeze 😭";
    }

    res.status(200).json({ insult });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ insult: "Error generating insult." });
  }
}
