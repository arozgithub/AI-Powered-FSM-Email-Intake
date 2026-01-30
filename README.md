# AI-Powered FSM Email Intake System

An intelligent email intake system for Field Service Management (FSM) companies in the elevator services industry. This system uses AI to automatically classify incoming service requests, extract relevant information, and route emails appropriately.

## Features

### 🤖 AI-Powered Email Classification
- **JUNK** - Automatically identifies and filters spam, marketing emails, and irrelevant content
- **INCOMPLETE** - Detects service requests missing critical information and requests clarification
- **VALID** - Processes complete service requests and logs them in the FSM system

### 📧 Intelligent Email Processing
- Automatic extraction of service details:
  - Customer name and email
  - Service type (maintenance, repair, inspection)
  - Elevator brand (Otis, Schindler, KONE, ThyssenKrupp, Mitsubishi)
  - Building type (educational, commercial, healthcare, residential)
  - Service address
  - Urgency level
  - Service description

### 🔄 Automated Workflows
- **JUNK emails**: No reply sent, marked as junk
- **INCOMPLETE emails**: Automated clarification request sent to customer
- **VALID emails**: Service query logged and acknowledgement sent

### 📊 Real-time Processing Dashboard
- Visual processing steps (Analyzing → Extracting → Classifying)
- Field-by-field extraction display
- Classification reasoning
- Automated action tracking

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` to configure your setup:
   ```env
   # For production with n8n workflow
   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/email-intake
   VITE_USE_MOCK=false

   # For development without n8n
   VITE_USE_MOCK=true
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## n8n Workflow Integration

### Setting Up n8n Workflow

The system can integrate with an n8n workflow for AI-powered email processing. Here's how to set it up:

1. **Create a new n8n workflow** with:
   - **Webhook Trigger**: POST endpoint `/webhook/email-intake`
   - **AI Node**: OpenAI/Claude/etc. for classification
   - **Response Node**: Return JSON response

2. **AI Agent System Prompt**:
   ```
   You are an FSM (Field Service Management) email intake agent for an elevator services company.

   CLASSIFY EACH EMAIL INTO ONE OF THESE TYPES:
   - JUNK → spam, marketing, irrelevant content
   - INCOMPLETE → service-related but missing key details
   - VALID → clear service request with sufficient information

   RULES:
   - JUNK → do NOT reply
   - INCOMPLETE → reply asking ONLY for missing information
   - VALID → do NOT ask questions, proceed to logging

   RETURN OUTPUT IN JSON ONLY using this structure:

   {
     "classification": "JUNK | INCOMPLETE | VALID",
     "shouldReply": true | false,
     "replyMessage": "email text or empty string",
     "extractedQuery": {
       "customerName": "",
       "customerEmail": "",
       "serviceType": "",
       "elevatorBrand": "",
       "buildingType": "",
       "address": "",
       "urgency": "",
       "description": ""
     }
   }

   IMPORTANT:
   - Do not hallucinate missing information
   - Leave unknown fields as empty strings
   - If classification = JUNK → extractedQuery must be null
   ```

3. **Configure the webhook URL** in your `.env` file

4. **Set `VITE_USE_MOCK=false`** to use the n8n workflow

## Development Mode (Mock)

For development without n8n:

- Set `VITE_USE_MOCK=true` in `.env`
- Mock processor simulates AI classification
- Includes realistic extraction patterns

## Usage

### Processing Emails

1. **Select an email** from the inbox (left panel)
2. **View email details** in the center panel
3. **Watch AI processing** in the right panel:
   - Step 1: Analyzing email intent
   - Step 2: Extracting service fields
   - Step 3: Classifying email type
   - Step 4: Taking appropriate action

### Email Status Flow

```
Unprocessed → (AI Processing) → JUNK | INCOMPLETE | VALID
                                   ↓         ↓          ↓
                              No Action  Waiting   Query Logged
                                         for Reply
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_N8N_WEBHOOK_URL` | n8n webhook endpoint URL | - |
| `VITE_USE_MOCK` | Use mock processor | `true` |

## API Response Format

The n8n workflow should return this JSON structure:

```typescript
{
  classification: 'JUNK' | 'INCOMPLETE' | 'VALID',
  shouldReply: boolean,
  replyMessage: string,
  extractedQuery: {
    customerName: string,
    customerEmail: string,
    serviceType: string,
    elevatorBrand: string,
    buildingType: string,
    address: string,
    urgency: string,
    description: string
  } | null
}
```

## Project Structure

```
src/
├── components/              # React components
│   ├── AIAgentPanel.tsx    # AI processing panel
│   ├── EmailDetail.tsx     # Email viewer
│   ├── InboxList.tsx       # Email inbox
│   ├── QueryConfirmation.tsx
│   └── QueryLoggedModal.tsx
├── services/               # Business logic
│   └── emailProcessingService.ts
├── types/                  # TypeScript definitions
│   └── emailProcessing.ts
└── App.tsx                # Main application
```

## Troubleshooting

**Emails not processing**
- Check `.env` configuration
- Verify n8n webhook URL is accessible
- Check browser console for errors

**Mock mode not working**
- Ensure `VITE_USE_MOCK=true` in `.env`
- Restart dev server after changing `.env`

## License

This project is licensed under the MIT License.

---

**Built for FSM elevator services teams**
