const { writeFile, appendFile } = require("fs/promises");
const { DeepgramClient } = require("@deepgram/sdk");
const fetch = require("cross-fetch");
const { join } = require("path");

const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });

const agent = async () => {
  let audioBuffer = Buffer.alloc(0);
  let i = 0;
  const url = "https://dpgr.am/spacewalk.wav";
  const connection = await deepgram.agent.v1.connect();

  connection.on("message", async (data) => {
    if (data.type === "Welcome") {
      console.log("Welcome to the Deepgram Voice Agent!");

      connection.sendSettings({
        type: "Settings",
        audio: {
          input: {
            encoding: "linear16",
            sample_rate: 24000,
          },
          output: {
            encoding: "linear16",
            sample_rate: 16000,
            container: "wav",
          },
        },
        agent: {
          language: "en",
          listen: {
            provider: {
              type: "deepgram",
              model: "nova-3",
            },
          },
          think: {
            provider: {
              type: "open_ai",
              model: "gpt-4o-mini",
            },
            prompt: "You are a friendly AI assistant.",
          },
          speak: {
            provider: {
              type: "deepgram",
              model: "aura-2-thalia-en",
            },
          },
          greeting: "Hello! How can I help you today?",
        },
      });

      console.log("Deepgram agent configured!");

      setInterval(() => {
        console.log("Keep alive!");
        connection.sendKeepAlive({ type: "KeepAlive" });
      }, 5000);

      fetch(url)
        .then((r) => r.body)
        .then((res) => {
          res.on("readable", () => {
            console.log("Sending audio chunk");
            connection.sendMedia(res.read());
          });
        });
    } else if (data.type === "ConversationText") {
      await appendFile(
        join(__dirname, `chatlog.txt`),
        JSON.stringify(data) + "\n",
      );
    } else if (data.type === "UserStartedSpeaking") {
      if (audioBuffer.length) {
        console.log("Interrupting agent.");
        audioBuffer = Buffer.alloc(0);
      }
    } else if (data.type === "Metadata") {
      console.dir(data, { depth: null });
    } else if (Buffer.isBuffer(data)) {
      console.log("Audio chunk received");
      // Concatenate the audio chunks into a single buffer
      audioBuffer = Buffer.concat([audioBuffer, data]);
    } else if (data.type === "AgentAudioDone") {
      console.log("Agent audio done");
      await writeFile(join(__dirname, `output-${i}.wav`), audioBuffer);
      audioBuffer = Buffer.alloc(0);
      i++;
    } else {
      console.dir(data, { depth: null });
    }
  });

  connection.on("open", () => {
    console.log("Connection opened");
  });

  connection.on("close", () => {
    console.log("Connection closed");
    process.exit(0);
  });

  connection.on("error", (err) => {
    console.error("Error!");
    console.error(JSON.stringify(err, null, 2));
    console.error(err.message);
  });

  connection.connect();
  await connection.waitForOpen();
};

void agent();
