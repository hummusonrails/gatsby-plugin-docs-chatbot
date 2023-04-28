import React, { useState, useEffect } from 'react';
import './Chatbot.css';
import { RetrievalQAChain, loadQARefineChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'; // Import the OpenAIEmbeddings class
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [chain, setChain] = useState(null);

  useEffect(() => {
    const loadChain = async () => {
      // Load vector store data and model data from your files or server.
      const vectorStoreData = await fetch('/chatbot-vectorstore.json').then((res) => res.json());
      const modelData = await fetch('/chatbot-model.json').then((res) => res.json());
      const openAIEmbeddings = new OpenAIEmbeddings({ ...modelData, openAIApiKey: process.env.OPENAI_API_KEY });

      // Create an instance of MemoryVectorStore.
      const vectorStore = new MemoryVectorStore({ data: vectorStoreData.data, embeddings: openAIEmbeddings });

      // Create an instance of RetrievalQAChain.
      const combineDocumentsChain = loadQARefineChain(openAIEmbeddings);
      const chainInstance = new RetrievalQAChain({
        combineDocumentsChain,
        retriever: vectorStore.asRetriever(),
      });

      setChain(chainInstance);
    };
    loadChain();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!input) return;
  
    setMessages([...messages, { type: 'user', text: input }]);
    setInput('');
  
    // Check if the chain object is defined and has a call method
    if (chain && typeof chain.call === 'function') {
      const response = await chain.call({ query: input });
      setMessages([...messages, { type: 'user', text: input }, { type: 'bot', text: response.text }]);
    } else {
      console.log('Chain object is not defined or does not have a call method:', chain);
      console.log(chain.constructor.name);
    }
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