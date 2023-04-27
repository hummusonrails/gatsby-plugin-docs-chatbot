import React, { useState, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [chain, setChain] = useState(null);

  useEffect(() => {
    const loadChain = async () => {
      const savedChain = await fetch('/chatbot-chain.json').then((response) => response.json());
      setChain(savedChain);
    };
    loadChain();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!input || !chain) return;

    setMessages([...messages, { type: 'user', text: input }]);
    setInput('');

    const response = await chain.call({ query: input });
    setMessages([...messages, { type: 'user', text: input }, { type: 'bot', text: response.output_text }]);
  };

  return (
    <div className="chatbot">
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chatbot-message ${message.type}`}>
            {message.text}
          </div>
        ))}
      </div>
      <form className="chatbot-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask a question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;
