const fetch = require("node-fetch")
const ai = {
    getRandom: () => {
        const gen = (length, charSet = {}) => {
            const l = "abcdefghijklmnopqrstuvwxyz" // lowercase
            const u = l.toUpperCase() // uppercase
            const s = "-_" // symbol
            const n = "0123456789" // number

            let cs = "" // character set
            const { lowerCase = false, upperCase = false, symbol = false, number = false } = charSet

            if (!lowerCase && !upperCase && !symbol && !number) {
                cs += l + u + s + n
            } else {
                if (lowerCase) cs += l
                if (upperCase) cs += u
                if (symbol) cs += s
                if (number) cs += n
            }

            const result = Array.from({ length }, (_ => cs[Math.floor(Math.random() * cs.length)])).join("") || null
            return result
        }

        const id = gen(16, { upperCase: true, lowerCase: true, number: true }) //TXulzbGqk0EDzPeT
        const chatId = `chat-${new Date().getTime()}-${gen(9, { lowerCase: true, number: true })}` //chat-1749292523602-k0tna5ef8
        const userId = `local-user-${new Date().getTime()}-${gen(9, { lowerCase: true, number: true })}` //local-user-1749292766705-b49yu10mm
        const antiBotId = `${gen(32)}-${gen(8, { number: true, lowerCase: true })}` //jUxRXb2xJbf8BVmIn2NGhncRQePiIiNE-8gvna4dd
        return { id, chatId, userId, antiBotId }
    },

    generate: async (messages, systemPrompt, model) => {

        const body = JSON.stringify(
            {
                messages,
                systemPrompt,
                model,
                "isAuthenticated": true,
                ...ai.getRandom()
            }
        )

        const headers = {
            "content-type": "application/json",
        }

        const response = await fetch("https://exomlapi.com/api/chat", {
            headers,
            body,
            "method": "post"
        })

        if (!response.ok) throw Error(`woops.. response is not ok! ${response.status} ${response.statusText}\n\n${await response.text()}`)

        const data = await response.text()
        
        // aku buruk dalam memparsing ini
        const anu = [...data.matchAll(/^0:"(.*?)"$/gm)].map(v => v[1]).join("").replaceAll("\\n","\n").replaceAll("\\\"","\"")
        if (!anu) throw Error(`gagal parsing pesan dari server, kemungkinan pesan kosong / error.\n\n${data}`)
        return anu

    }
}

module.exports = {
  name: "Deepseek",
  desc: "Ai deepseek models",
  category: "Openai",
  path: "/ai/deepseek?text=",

  async run(req, res) {
    const { text } = req.query;

    if (!text)
      return res.json({ status: false, error: "Text is required" });

const yourQuestion = text
const systemPrompt = "Sekarang kamu ada ai assisten model deepseek-r1"
const modelList = [
    "llama",
    "gemma",
    "qwen-3-235b",
    "gpt-4.1",
    "gpt-4o",
    "gpt-4o-mini",
    "llama-4-scout",
    "llama-4-maverick",
    "deepseek-r1",
    "qwq-32b"]
const model = "gpt-4.1"
const messages = [
    {
        "role": "user",
        "content": "halo",

    },
    {
        "role": "assistant",
        "content": "Halo! Ada yang bisa saya bantu?",

    },
    {
        "role": "user",
        "content": yourQuestion,

    }
]
    try {
      const result = await ai.generate(messages, systemPrompt, model)
      res.json({ status: true, result });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};