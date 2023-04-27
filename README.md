# AI Chatbot Gatsby Plugin

This plugin allows you to add an AI chatbot to your Gatsby site. It uses your markdown files and code from GitHub repositories
to train the AI.

It is built with the following:

- [Gatsby](https://www.gatsbyjs.org/)
- [OpenAI](https://openai.com/)
- [Langchain](https://github.com/hwchase17/langchainjs)

## Installation

1. Clone this repository 
2. Run `yarn install` inside the top-level directory
3. Run `yarn link` inside the top-level directory to create a local link to the plugin. 

## Adding the plugin to your Gatsby site

1. Run `yarn link gatsby-plugin-docs-chatbot` inside your Gatsby site to link the plugin to your site.
2. Add the plugin to your `gatsby-config.js` file inside the `plugins` array:

```javascript
{
  resolve: 'gatsby-plugin-docs-chatbot',
  options: {
    docsPath: '', // Path to your local markdown files
    githubRepos: [
      {
        owner: '', // Owner of the repository
        name: '', // Name of the repository
      },
    ],
  },
},
```

3. Add your `OPENAI_API_KEY` to your `.env.development` file:

```
OPENAI_API_KEY=YOUR_API_KEY
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details.