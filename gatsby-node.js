const { OpenAI } = require('langchain/llms/openai');
const { RetrievalQAChain, loadQARefineChain } = require('langchain/chains');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { MarkdownTextSplitter } = require('langchain/text_splitter');
const axios = require('axios');
const fs = require('fs');

const model = new OpenAI({});
const textSplitter = new MarkdownTextSplitter();

exports.createPages = async ({ actions, graphql }, pluginOptions) => {
  const { createPage } = actions;
  const { docsPath, githubRepos } = pluginOptions;

  // Fetch data from markdown files
  const result = await graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            id
            frontmatter {
              title
            }
            rawMarkdownBody
          }
        }
      }
    }
  `);

  if (result.errors) {
    throw result.errors;
  }

  const docsData = result.data.allMarkdownRemark.edges.map(({ node }) => ({
    id: node.id,
    title: node.frontmatter.title,
    content: node.rawMarkdownBody,
  }));

  // Fetch data from GitHub repositories
  const githubDataPromises = githubRepos.map(async (repo) => {
    const response = await axios.get(`https://api.github.com/repos/${repo.owner}/${repo.name}/contents/`, {
      headers: { 'Accept': 'application/vnd.github+json' },
    });
    
    const filteredData = response.data
      .filter((file) => file.type === 'file' && (file.path.endsWith('.md') || file.path.endsWith('.rs')));
    
    return filteredData
      .map((file) => ({ id: file.sha, title: file.name, url: file.html_url }));
  });
  
  console.log('Waiting for all githubDataPromises to resolve');
  const githubData = await Promise.all(githubDataPromises);

  // Combine the data from markdown files and GitHub repositories
  const combinedData = [...docsData, ...githubData.flat()];

  // Convert combinedData to an array of text content
  const contentArray = combinedData
    .map((doc) => doc.content)
    .filter((content) => content !== undefined);
  
  const docs = [];

  for (const content of contentArray) {
    try {
      const splitDocs = await textSplitter.createDocuments([content]);
      docs.push(...splitDocs);
    } catch (error) {
      console.error("Error splitting content:", content);
      console.error("Error details:", error);
    }
  }
  
  // Create a vector store from the documents
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

  // Create a chain that uses a Refine chain and Memory vector store
  const chain = new RetrievalQAChain({
    combineDocumentsChain: loadQARefineChain(model),
    retriever: vectorStore.asRetriever(),
  });

  // Save the chain to a JSON file
  fs.writeFileSync('chatbot-chain.json', JSON.stringify(chain));
};
