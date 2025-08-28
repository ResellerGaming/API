const morseCode = {
  "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".",
  "F": "..-.", "G": "--.", "H": "....", "I": "..", "J": ".---",
  "K": "-.-", "L": ".-..", "M": "--", "N": "-.", "O": "---",
  "P": ".--.", "Q": "--.-", "R": ".-.", "S": "...", "T": "-",
  "U": "..-", "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--",
  "Z": "--..",
  "0": "-----","1": ".----","2": "..---","3": "...--","4": "....-",
  "5": ".....","6": "-....","7": "--...","8": "---..","9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...",
  ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.",
  "-": "-....-", "_": "..--.-", "\"": ".-..-.", "$": "...-..-",
  "@": ".--.-.", " ": "/"
};
const reverseMorse = Object.fromEntries(Object.entries(morseCode).map(([k,v]) => [v,k]));

module.exports = [
  {
    name: "TextToMorse",
    desc: "Convert teks ke Morse",
    category: "Tools",
    path: "/tools/texttomorse?text=",

    async run(req, res) {
      const { text } = req.query;
      if (!text) return res.json({ status: false, error: "Masukkan teks. Contoh: ?text=halo" });

      const upper = text.toUpperCase();
      const morse = upper.split("").map(ch => morseCode[ch] || "").join(" ").trim();

      res.json({ status: true, input: text, output: morse });
    }
  },
  {
    name: "MorseToText",
    desc: "Convert Morse ke teks",
    category: "Tools",
    path: "/tools/morsetotext?kode=",

    async run(req, res) {
      const { kode } = req.query;
      if (!kode) return res.json({ status: false, error: "Masukkan kode Morse. Contoh: ?kode=.... .- .-.. ---" });

      const words = kode.trim().split(" ");
      const text = words.map(code => reverseMorse[code] || "").join("");

      res.json({ status: true, input: kode, output: text });
    }
  }
];
