# Link Grabber Agent

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)

## Description

This AI Agent automatically discovers and extracts all linked pages within the same domain from any given starting URL. It navigates to the specified web page and identifies all internal links, providing a comprehensive list of pages connected to the initial site. Simply input a starting URL to receive a complete inventory of linked pages within the same domain.

## Features

- **Automated Link Discovery**: Identifies all internal links on a target website
- **Domain-Specific Crawling**: Focuses only on links within the same domain
- **Full URL Extraction**: Returns complete URLs for easy navigation
- **Clean Results**: Returns structured data ready for further processing
- **Resource Management**: Automatically frees browser resources after task completion

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/link-grabber-agent.git
cd link-grabber-agent

# Install dependencies
pip install -r requirements.txt

# Install necessary browser automation components
npm install @playwright/mcp@latest
```

## Usage

### Running the Agent

```bash
python -m link_grabber
```

This will start the agent on port 8002 by default.

### API Reference

#### Input Data Model

```python
class LinkGrabRequest(Model):
    start_page: str         # The starting URL for link discovery
```

#### Output Data Model

```python
class LinkGrabResponse(Model):
    linked_pages: list[str] # List of all internal links discovered
```

### Example Request

```json
{
  "start_page": "https://example.com"
}
```

### Example Response

```json
{
  "linked_pages": [
    "https://example.com/about",
    "https://example.com/products",
    "https://example.com/contact",
    "https://example.com/blog",
    "https://example.com/services"
  ]
}
```

## Configuration

You can customize the agent by modifying the initialization parameters:

- `name`: Agent name (default: "link_grabber")
- `seed`: Seed for agent identity generation (default: "link_grabber_seed")
- `port_number`: Port for the REST API (default: 8002)

## Dependencies

- Python 3.8+
- uAgents framework
- MCP (Multi-modal Cognitive Protocol)
- Playwright for browser automation

## Use Cases

- **Website Mapping**: Create comprehensive site maps
- **Content Auditing**: Discover all pages for content reviews
- **SEO Analysis**: Identify internal linking structures
- **Dead Link Detection**: Find and validate all internal links
- **Website Migration**: Catalog all pages before migration
