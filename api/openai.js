const axios = require('axios');

async function chatai(question, { system_prompt = null, model = 'grok-3-mini' } = {}) {
    const allowedModels = [
        'gpt-4.1-nano', 'gpt-4.1-mini', 'gpt-4.1', 'o4-mini',
        'deepseek-r1', 'deepseek-v3', 'claude-3.7', 'gemini-2.0',
        'grok-3-mini', 'qwen-qwq-32b', 'gpt-4o', 'o3',
        'gpt-4o-mini', 'llama-3.3'
    ];

    if (!question) throw new Error('Question is required');
    if (!allowedModels.includes(model)) throw new Error(`Available models: ${allowedModels.join(', ')}`);

    const response = await axios.post('https://api.appzone.tech/v1/chat/completions', {
        messages: [
            ...(system_prompt ? [{
                role: 'system',
                content: [{ type: 'text', text: system_prompt }]
            }] : []),
            {
                role: 'user',
                content: [{ type: 'text', text: question }]
            }
        ],
        model: model,
        isSubscribed: true
    }, {
        headers: {
            authorization: 'Bearer az-chatai-key',
            'content-type': 'application/json',
            'user-agent': 'okhttp/4.9.2',
            'x-app-version': '3.0',
            'x-requested-with': 'XMLHttpRequest',
            'x-user-id': '$RCAnonymousID:84947a7a4141450385bfd07a66c3b5c4'
        }
    });

    let fullText = '';
    const lines = response.data.split('\n\n').map(line => line.substring(6));
    for (const line of lines) {
        if (line === '[DONE]') continue;
        try {
            const d = JSON.parse(line);
            fullText += d.choices[0].delta.content || '';
        } catch (e) {}
    }

    const thinkMatch = fullText.match(/<think>([\s\S]*?)<\/think>/);
    return {
        think: thinkMatch ? thinkMatch[1].trim() : '',
        response: fullText.replace(/<think>[\s\S]*?<\/think>/, '').trim()
    };
}

module.exports = [
{
    name: "Grok",
    desc: "Ai grok models",
    category: "Openai",
    path: "/ai/grok?question=",
    async run(req, res) {
        const { question, model, prompt } = req.query;

        if (!question) {
            return res.json({ status: false, error: "Parameter 'question' is required" });
        }

        try {
            const result = await chatai(question, {
                model: model || 'grok-3-mini',
                system_prompt: prompt || null
            });

            res.status(200).json({
                status: true,
                result: result.response
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    }
},

{
    name: "Chat GPT",
    desc: "Ai chat gpt models",
    category: "Openai",
    path: "/ai/chatgpt?question=",
    async run(req, res) {
        const { question, model, prompt } = req.query;

        if (!question) {
            return res.json({ status: false, error: "Parameter 'question' is required" });
        }

        try {
            const result = await chatai(question, {
                model: model || 'gpt-4.1-nano',
                system_prompt: prompt || null
            });

            res.status(200).json({
                status: true,
                result: result.response
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    }
}, 

{
    name: "Gemini",
    desc: "Ai gemini models",
    category: "Openai",
    path: "/ai/gemini?question=",
    async run(req, res) {
        const { question } = req.query;

        if (!question) {
            return res.json({ status: false, error: "Parameter 'question' is required" });
        }

        try {
            const result = await chatai(question, {
                model: 'gemini-2.0',
                system_prompt: null
            });

            res.status(200).json({
                status: true,
                result: result.response
            });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    }
}
]