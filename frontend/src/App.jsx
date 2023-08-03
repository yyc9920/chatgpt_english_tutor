import { useState } from "react";
import "./App.css";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";

function App() {
  const [message, setMessage] = useState("");
  const [voice, setVoice] = useState("");
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const synth = speechSynthesis;
  let voices = synth.getVoices();
  console.log(voices);

  recognition.onresult = (event) => {
    const interimTranscripts = [];
    const finalTranscripts = [];

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscripts.push(transcript);
    setMessage(`${finalTranscripts.join(" ")}`);
      } else {
        interimTranscripts.push(transcript);
        setMessage(`${interimTranscripts.join(" ")}`);
      }
    }
  };

  recognition.onerror = (event) => {
    console.error("Error occurred in speech recognition:", event.error);
    // You can handle errors here
  };

  recognition.onend = () => {
    console.log("Speech recognition ended");
    // You can handle the end of recognition here
  };

  const handleVoiceChange = (event) => {
    setAge(event.target.value);
  };

  const startListening = async () => {
    recognition.start();
  }

  const stopListening = async () => {
    recognition.stop();
  }

  const chat = async (e, message) => {
    e.preventDefault();

    if (!message) return;
    setIsTyping(true);
    scrollTo(0, 1e10);

    let msgs = chats;
    msgs.push({ role: "user", content: message });
    setChats(msgs);

    setMessage("");

    fetch("http://localhost:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chats,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        msgs.push(data.output);
        setChats(msgs);
        const utterance = new SpeechSynthesisUtterance(msgs[1].content);
        utterance.lang = "en";
        utterance.voice = voices[144];
        synth.speak(utterance);
        setIsTyping(false);
        scrollTo(0, 1e10);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <main>
      <h1>Chat GPT English Tutor</h1>

      <FormControl sx={{ m: 1, minWidth: 80 }}>
        <InputLabel id="demo-simple-select-autowidth-label">Voice</InputLabel>
        <Select
          labelId="demo-simple-select-autowidth-label"
          id="demo-simple-select-autowidth"
          value={voice}
          onChange={handleVoiceChange}
          autoWidth
          label="Voice"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Twenty</MenuItem>
          <MenuItem value={21}>Twenty one</MenuItem>
          <MenuItem value={22}>Twenty one and a half</MenuItem>
        </Select>
      </FormControl>

      <section>
        {chats && chats.length
          ? chats.map((chat, index) => (
              <p key={index} className={chat.role === "user" ? "user_msg" : ""}>
                <span>
                  <b>{chat.role.toUpperCase()}</b>
                </span>
                <span>:</span>
                <span>{chat.content}</span>
              </p>
            ))
          : ""}
      </section>

      <div className={isTyping ? "" : "hide"}>
        <p>
          <i>{isTyping ? "Typing" : ""}</i>
        </p>
      </div>

      <form action="" onSubmit={(e) => chat(e, message)}>
        <input
          type="text"
          name="message"
          value={message}
          placeholder="Type a message here and hit Enter..."
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
      <button onClick={startListening}>Start Listening</button>
      <button onClick={stopListening}>Stop Listening</button>
    </main>
  );
}

export default App;
