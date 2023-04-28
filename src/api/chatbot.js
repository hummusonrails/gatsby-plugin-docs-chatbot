const { RetrievalQAChain, loadQARefineChain } = require('langchain/chains');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');

// Load vectorStore and model data from your files.
const vectorStoreData = require('./chatbot-vectorstore.json');
const vectorStore = new MemoryVectorStore(vectorStoreData.data);

const modelData = require('./chatbot-model.json');
const combineDocumentsChain = loadQARefineChain(modelData);

const chainInstance = new RetrievalQAChain({
  combineDocumentsChain,
  retriever: vectorStore.asRetriever(),
});

exports.handler = async function(event, context) {
  try {
    const { query } = JSON.parse(event.body);
    const response = await chainInstance.call({ query });
    console.log(response)
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
