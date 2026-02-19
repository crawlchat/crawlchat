---
sidebar_position: 6
---

# marker

## Overview

The `marker` service is a Python-based service that converts files into markdown format. It uses Microsoft's MarkItDown library to process various document types and convert them to clean markdown for ingestion into the knowledge base.

### Architecture & Features

- **Framework**: FastAPI (Python)
- **Document Processing**: MarkItDown library for file conversion
- **File Types**: Supports PDF, DOCX, PPTX, and other common document formats
- **API Authentication**: API key-based authentication
- **Base64 Processing**: Accepts base64-encoded file content
- **Temporary Storage**: Secure temporary file handling
- **Port**: 3005 (container port 80)

### Dependencies

- None (standalone service)

## Environment Variables

| Variable  | Required | Description                                              | Example                   |
| --------- | -------- | -------------------------------------------------------- | ------------------------- |
| `API_KEY` | Yes      | A secret key other services to pass as an authentication | `a-secret-key-for-marker` |

## Running Locally

### Prerequisites

- Python 3.8+
- pip for package management

### Development Setup

1. **Navigate to the marker directory**:

   ```bash
   cd marker
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file with the API key:

   ```
   API_KEY=your-secret-api-key
   ```

4. **Start development server**:
   ```bash
   fastapi run main.py --port 3005
   ```

The service will start on `http://localhost:3005`.

### API Usage

The marker service provides a single endpoint:

**POST /mark**

- **Headers**: `x-api-key: your-api-key`
- **Body**: `{"base64": "base64-encoded-file-content"}`
- **Response**: `{"id": "uuid", "markdown": "converted-markdown", "title": "document-title"}`

### Available Scripts

- `fastapi run main.py --port 3005` - Start the FastAPI server
- Custom start script: `./start.sh` (runs the same command)
