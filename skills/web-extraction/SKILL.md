---
description: Best practices for extracting structured data from web pages using Haunt API
disable-model-invocation: false
---

# Web Extraction with Haunt API

You have access to Haunt MCP extraction tools. Use them to extract structured data from permitted public URLs.

## When to use Haunt extraction

- User asks to scrape or extract data from a specific public URL
- User needs structured information from a web page: product details, article content, contact info, pricing, metadata, lead lists, research snippets
- User wants to compare public data across multiple URLs
- User asks "what does this page say about X?"

## How to write effective extraction prompts

Be specific about what you want. The tool accepts natural language; describe the output shape and fields.

Good prompts:
- "Extract the product name, price, availability, and all variant options from this product page"
- "Get the article title, author, publication date, and full body text"
- "Extract all email addresses and phone numbers from this contact page"
- "Get the company name, CEO, employee count, and funding stage from this About page"

Bad prompts:
- "Get everything" (too vague; you'll get an unstructured dump)
- "Extract data" (what data? be specific)

## Authentication

For live extraction, use a Haunt API key. If the user has not provided one, direct them to https://hauntapi.com/#signup.

Free key: 1,000 credits/month, no card.

## Handling failures

- If extraction returns partial data, try rephrasing the prompt with more specific field names
- Some sites block automated access. Haunt does not promise universal extraction, CAPTCHA solving, login-wall access, paywall access, restricted-page access, or bot-challenge circumvention. Blocked pages should return explicit failure signals rather than guessed data
- Always check the returned data for completeness before presenting it to the user

## Usage monitoring

Use the usage-checking tool with the user's API key to check remaining credits.
