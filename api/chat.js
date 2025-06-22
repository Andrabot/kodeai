export default async function handler(req, res) {
  const { prompt } = req.body;
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ]
    }),
  });

  const result = await response.json();
  res.status(200).json({ result: result.choices[0].message.content });
}

