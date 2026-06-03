# Environment Variables Setup Guide

This guide explains how to configure the required environment variables for the Summarify-Utube backend.

## Required Environment Variables

The backend requires the following environment variables:

1. **GROQ_API_KEY** - Your Groq API key
2. **NEO4J_URI** - Neo4j database connection URI
3. **NEO4J_USERNAME** - Neo4j username
4. **NEO4J_PASSWORD** - Neo4j password

## Setup Instructions

### Step 1: Create `.env` File

1. Navigate to the `backend` directory
2. Copy the `.env.example` file to create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   Or on Windows:
   ```powershell
   copy .env.example .env
   ```

### Step 2: Configure GROQ API Key

1. **Get a Groq API Key:**

   - Visit [Groq Console](https://console.groq.com/keys)
   - Sign up or log in to your account
   - Navigate to the API Keys section
   - Create a new API key or copy an existing one

2. **Add to `.env` file:**
   ```env
   GROQ_API_KEY=gsk_your_actual_api_key_here
   ```

### Step 3: Configure Neo4j Connection

You have two options for Neo4j:

#### Option A: Local Neo4j Installation

1. **Install Neo4j:**

   - Download from [Neo4j Downloads](https://neo4j.com/download/)
   - Install and start Neo4j Desktop or Neo4j Server
   - Default connection: `bolt://localhost:7687`

2. **Set Initial Password:**

   - When you first start Neo4j, you'll be prompted to set a password
   - Default username is `neo4j`

3. **Add to `.env` file:**
   ```env
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your_neo4j_password_here
   ```

#### Option B: Neo4j AuraDB (Cloud)

1. **Create a Neo4j AuraDB Instance:**

   - Visit [Neo4j Aura](https://neo4j.com/cloud/aura/)
   - Sign up for a free account
   - Create a new free instance
   - Wait for the instance to be provisioned

2. **Get Connection Details:**

   - After creation, you'll receive connection details
   - The URI format: `bolt+s://xxxxx.databases.neo4j.io`
   - Username: Usually `neo4j` or provided in the connection details
   - Password: The password you set during instance creation

3. **Add to `.env` file:**
   ```env
   NEO4J_URI=bolt+s://xxxxx.databases.neo4j.io
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your_aura_password_here
   ```

### Step 4: Verify Configuration

1. Make sure your `.env` file is in the `backend` directory
2. The file should look like this:

   ```env
   GROQ_API_KEY=gsk_your_groq_api_key
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your_password
   ```

3. Start the backend server:

   ```bash
   uvicorn main:app --reload
   ```

4. If configured correctly, you should see:
   - "Successfully connected to Neo4j database" message
   - Server running on http://localhost:8000

## Troubleshooting

### GROQ API Key Issues

- Ensure the API key starts with `gsk_`
- Check that the key is valid and not expired
- Verify you have credits/quota available in your Groq account

### Neo4j Connection Issues

**Local Neo4j:**

- Make sure Neo4j is running (check Neo4j Desktop or service status)
- Verify the port (default is 7687)
- Check firewall settings
- Ensure the password is correct

**Neo4j AuraDB:**

- Verify the URI format: should start with `bolt+s://`
- Check that the instance is running (not paused)
- Ensure you're using the correct region endpoint
- Verify username and password are correct

### Common Errors

1. **"Missing Neo4j credentials"**

   - Check that all three Neo4j environment variables are set
   - Ensure `.env` file is in the `backend` directory

2. **"Failed to connect to Neo4j"**

   - Verify Neo4j is running
   - Check connection URI format
   - Verify credentials are correct

3. **"GROQ_API_KEY not found"**
   - Ensure `.env` file exists in `backend` directory
   - Check that the variable name is exactly `GROQ_API_KEY`
   - Restart the server after creating/modifying `.env`

## Security Notes

- **Never commit `.env` file to git** (already in `.gitignore`)
- Keep your API keys and passwords secure
- Use different credentials for development and production
- Rotate API keys regularly

## Example `.env` File

```env
# GROQ API Configuration
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Neo4j Database Configuration (Local)
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=MySecurePassword123

# Or for Neo4j AuraDB (Cloud)
# NEO4J_URI=bolt+s://abc123.databases.neo4j.io
# NEO4J_USERNAME=neo4j
# NEO4J_PASSWORD=MySecureAuraPassword123
```
