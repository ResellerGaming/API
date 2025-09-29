const axios = require('axios');

function randomEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let name = '';
  for (let i = 0; i < 10; i++) name += chars[Math.floor(Math.random() * chars.length)];
  return name + '@ponta.my.id';
}

async function askBlackbox(prompt) {
  const email = randomEmail();
  const id   = Math.random().toString(36).substring(2, 10);

  const { data } = await axios.post('https://www.blackbox.ai/api/chat', {
    messages: [{ role: 'user', content: prompt, id: 'Qej300R' }],
    id: 'IcYsGt5',
    previewToken: null,
    userId: null,
    codeModelMode: true,
    trendingAgentMode: {},
    isMicMode: false,
    userSystemPrompt: null,
    maxTokens: 1024,
    playgroundTopP: null,
    playgroundTemperature: null,
    isChromeExt: false,
    githubToken: '',
    clickedAnswer2: false,
    clickedAnswer3: false,
    clickedForceWebSearch: false,
    visitFromDelta: false,
    isMemoryEnabled: false,
    mobileClient: false,
    userSelectedModel: null,
    userSelectedAgent: 'VscodeAgent',
    validated: 'a38f5889-8fef-46d4-8ede-bf4668b6a9bb',
    imageGenerationMode: false,
    imageGenMode: 'autoMode',
    webSearchModePrompt: false,
    deepSearchMode: false,
    domains: null,
    vscodeClient: false,
    codeInterpreterMode: false,
    customProfile: { name: '', occupation: '', traits: [], additionalInfo: '', enableNewChats: false },
    webSearchModeOption: { autoMode: true, webMode: false, offlineMode: false },
    session: { user: { email, id }, expires: '9999-09-09T03:55:47.271Z', isNewUser: false },
    isPremium: true,
    subscriptionCache: { status: 'DEVELOPER', expiryTimestamp: null, lastChecked: Date.now(), isTrialSubscription: false },
    beastMode: false,
    reasoningMode: false,
    designerMode: false,
    workspaceId: '',
    asyncMode: false,
    integrations: {},
    isTaskPersistent: false,
    selectedElement: null
  }, {
    headers: {
      authority: 'www.blackbox.ai',
      accept: '*/*',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      origin: 'https://www.blackbox.ai',
      referer: 'https://www.blackbox.ai/',
      'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
    }
  });

  return data.response || data.message || data;
}

module.exports = {
  name: "Blackbox AI",
  desc: "Chat Blackbox AI Versi 1",
  category: "Artificial Intelligence",
  path: "/ai/blackbox?text=",
  async run(req, res) {
    const { text } = req.query;
    if (!text) return res.json({ status: false, error: 'Parameter text diperlukan' });

    try {
      const reply = await askBlackbox(text);
      res.json({ status: true, reply });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};
