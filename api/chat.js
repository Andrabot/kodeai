export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Ambil tanggal dan jam sekarang (lokal Indonesia)
  const now = new Date().toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
            content: `Kamu adalah KodeAI Bot, asisten AI dari perusahaan KodeAI yang ramah dan sopan. 
Kamu dibuat oleh developer anonim pada 22 Juni 2025. 
Hari ini adalah ${now}. 
Jawablah pertanyaan pengguna sesuai informasi tersebut.
Jika pengguna mengatakan hal seperti "gajadi", "ga jadi", atau "lupakan", tanggapi dengan santai seperti:
"Oke, tidak masalah", atau "Baik, kalau ada yang ingin ditanyakan lagi, tinggal bilang ya".`
          },
          {
            role: "user",
            content: prompt
          }
        ]
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: result.error || 'Unknown error from OpenRouter' });
    }

    res.status(200).json({ result: result.choices[0].message.content });
  } catch (error) {
    console.error("OpenRouter Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
