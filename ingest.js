require('dotenv').config();
// Change this line to import the default class properly
const FirecrawlApp = require('@mendable/firecrawl-js').default;
const fs = require('fs');

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

async function syncKnowledge() {
  console.log("Crawling website...");
  
  try {
    // FIX: Changed 'crawlUrl' to 'crawl'
    const crawlResponse = await app.crawl('https://voltus.tr/', {
      limit: 20,
      scrapeOptions: { 
        formats: ['markdown'] 
      }
    });

    if (true) { //crawlResponse.success) {
      // The data is inside crawlResponse.data
      const knowledgeBase = crawlResponse.data
        .map(page => `--- SOURCE: ${page.metadata.sourceURL} ---\n${page.markdown}`)
        .join('\n\n');

      fs.writeFileSync('business_knowledge.txt', knowledgeBase);
      console.log("✅ Knowledge Base updated successfully!");
    } else {
      console.error("❌ Crawl failed:", crawlResponse);
    }
  } catch (err) {
    console.error("❌ An error occurred:", err.message);
  }
}

syncKnowledge();