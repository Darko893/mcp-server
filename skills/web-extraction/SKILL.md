---
description: Best practices for extracting structured data from web pages using Haunt API
disable-model-invocation: false
---

# Web Extraction with Haunt API

You have access to the `web_extract` and `get_usage` tools via the Haunt MCP server. Use them to extract structured data from permitted public URLs.

## When to use web_extract

- User asks to scrape or extract data from a specific URL
- User needs structured information from a web page (product details, article content, contact info, etc.)
- User wants to compare data across multiple URLs
- User asks "what does this page say about X?"

## How to write effective extraction prompts

Be specific about what you want. The tool accepts natural language, describe the data shape and fields.

Good prompts:
- "Extract the product name, price, availability, and all variant options from this product page"
- "Get the article title, author, publication date, and full body text"
- "Extract all email addresses and phone numbers from this contact page"
- "Get the company name, CEO, employee count, and funding stage from this About page"

Bad prompts:
- "Get everything" (too vague, you'll get an unstructured dump)
- "Extract data" (what data? be specific)

## Authentication

Every call requires an `api_key` parameter. If the user hasn't provided one, direct them to https://hauntapi.com/#signup to get a free API key (100 requests/month on the free tier).

## Handling failures

- If extraction returns partial data, try rephrasing the prompt with more specific field names
- Some sites block automated access. Haunt does not promise Cloudflare/CAPTCHA/login-wall/paywall bypass or anti-bot circumvention; blocked pages should return explicit failure signals rather than guessed data
- Always check the returned data for completeness before presenting it to the user

## Usage monitoring

Use `get_usage` (with the user's `api_key`) to check remaining credits. Free tier includes 100 requests/month.
