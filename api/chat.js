export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Cek jika pertanyaan mengandung kata sensitif (contoh: presiden)
  let externalInfo = "";
  if (/presiden|menteri|indonesia|siapa/.test(prompt.toLowerCase())) {
    try {
      const query = "Presiden_Indonesia";
      const wikiRes = await fetch(`https://id.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${query}&exintro=1&explaintext=1&origin=*`);
      const wikiData = await wikiRes.json();
      const page = Object.values(wikiData.query.pages)[0];
      externalInfo = page.extract || "";
    } catch (err) {
      console.error("Wikipedia fetch error:", err);
    }
  }

  // Ambil waktu real-time
  const now = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  model: "openai/gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content:
        `Kamu adalah KodeAI Bot yang sopan dan cerdas.\n` +
        `Tanggal sekarang adalah ${now}.\n` +
        (externalInfo ? `Berikut info terkini dari Wikipedia:\n${externalInfo}\n` : "") +
        `Jika pengguna bilang 'gajadi' atau 'lupakan', cukup jawab dengan santai dan ramah.`,
    },
    {
      role: "user",
      content: prompt,
    },
  ],
}),


    const result = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: result.error || 'Unknown error' });
    }

    res.status(200).json({ result: result.choices[0].message.content });
  } catch (err) {
    console.error("OpenRouter Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
