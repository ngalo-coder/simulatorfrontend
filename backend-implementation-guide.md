# Backend Implementation Guide for Virtual Patient Simulator

## Overview
This guide provides complete implementation details for the backend to support the Virtual Patient Simulator frontend. The frontend expects specific data structures and API endpoints as defined in `src/types/index.ts`.

## Required Data Structure

Based on `src/types/index.ts`, each case must include:

```typescript
interface PatientCase {
  id: string;
  title: string;
  description: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime?: string;
  tags?: string[];
  specialty?: string;
  level?: string;
  duration?: string;
  learningObjectives?: string[];
  clinicalContext?: string;
  patientAge?: string | number;
  patientGender?: string;
  chiefComplaint?: string;
  presentingSymptoms?: string[];
}
```

## API Endpoints Implementation

### 1. GET /api/simulation/cases

**Purpose**: Return all available patient cases with complete metadata.

**Expected Response Format**:
```json
{
  "VP-ABD-001": {
    "case_metadata": {
      "title": "Abdominal Pain Case",
      "description": "Practice taking a focused history for abdominal pain",
      "category": "Gastroenterology",
      "difficulty": "Beginner",
      "estimated_time": "15-20 minutes",
      "tags": ["abdominal pain", "history taking"],
      "specialty": "Internal Medicine",
      "level": "Beginner",
      "duration": "15-20 minutes",
      "learning_objectives": [
        "Perform systematic abdominal history",
        "Identify red flag symptoms",
        "Develop differential diagnosis"
      ],
      "clinical_context": "Emergency department presentation",
      "patient_age": 35,
      "patient_gender": "Female",
      "chief_complaint": "Severe abdominal pain for 6 hours",
      "presenting_symptoms": [
        "Right lower quadrant pain",
        "Nausea",
        "Vomiting",
        "Low-grade fever"
      ]
    }
  },
  "VP-CHEST-002": {
    "case_metadata": {
      // ... similar structure for other cases
    }
  }
}
```

**Implementation Notes**:
- Use snake_case for specific fields: `estimated_time`, `learning_objectives`, `clinical_context`, `patient_age`, `patient_gender`, `chief_complaint`, `presenting_symptoms`
- Other fields can remain in camelCase
- Ensure all cases have at minimum: `title`, `description`, `category`, `difficulty`

### 2. POST /api/simulation/start

**Purpose**: Initialize a new simulation session for a specific case.

**Request Body**:
```json
{
  "caseId": "VP-ABD-001"
}
```

**Expected Response**:
```json
{
  "sessionId": "unique-session-id-12345",
  "initialPrompt": "Hello, I'm experiencing severe pain in my lower right abdomen. It started about 6 hours ago and has been getting worse. I also feel nauseous and have vomited twice."
}
```

**Implementation Logic**:
1. Validate that `caseId` exists in your case database
2. Generate a unique `sessionId` (UUID recommended)
3. Create `initialPrompt` based on case's `chief_complaint` and `clinical_context`
4. Store session state linking `sessionId` to `caseId` and conversation history
5. Initialize AI context with case details

**Sample Initial Prompt Generation**:
```javascript
function generateInitialPrompt(caseData) {
  const { chief_complaint, clinical_context, patient_age, patient_gender } = caseData.case_metadata;
  
  return `Hello, I'm a ${patient_age}-year-old ${patient_gender.toLowerCase()} and I'm here because ${chief_complaint.toLowerCase()}. ${clinical_context ? `This is happening in the ${clinical_context.toLowerCase()}.` : ''}`;
}
```

### 3. POST /api/simulation/ask

**Purpose**: Process clinician questions and return patient responses.

**Request Body**:
```json
{
  "sessionId": "unique-session-id-12345",
  "question": "Can you tell me more about when the pain started?"
}
```

**Expected Response**:
```json
{
  "response": "The pain started suddenly around 2 PM today while I was at work. It began as a dull ache around my belly button, but then moved to my lower right side and became much sharper and more intense.",
  "isFinal": false,
  "evaluation": null
}
```

**For Final Response**:
```json
{
  "response": "Thank you for taking such a thorough history. Based on your questions, I feel confident that you've gathered the key information needed for my case.",
  "isFinal": true,
  "evaluation": {
    "overall_score": 85,
    "feedback": "Excellent systematic approach to history taking. You covered all major areas and identified key red flag symptoms.",
    "strengths": [
      "Systematic questioning approach",
      "Good use of open-ended questions",
      "Identified red flag symptoms",
      "Appropriate follow-up questions"
    ],
    "areas_for_improvement": [
      "Could have explored family history more thoroughly",
      "Consider asking about recent travel"
    ]
  }
}
```

**Implementation Logic**:
1. Retrieve session state using `sessionId`
2. Add question to conversation history
3. Generate AI response using case context and conversation history
4. Determine if simulation should end (based on question count, key topics covered, etc.)
5. If final, generate evaluation based on conversation quality
6. Update session state
7. Return response with `isFinal` flag and optional `evaluation`

## Case Data Storage Structure

### Option 1: JSON Files (Recommended for initial implementation)

Create individual JSON files for each case in a `cases/` directory:

**cases/VP-ABD-001.json**:
```json
{
  "case_metadata": {
    "title": "Acute Abdominal Pain",
    "description": "A 35-year-old female presents with acute onset right lower quadrant abdominal pain",
    "category": "Gastroenterology",
    "difficulty": "Beginner",
    "estimated_time": "15-20 minutes",
    "tags": ["abdominal pain", "appendicitis", "emergency", "history taking"],
    "specialty": "Emergency Medicine",
    "level": "Medical Student",
    "duration": "15-20 minutes",
    "learning_objectives": [
      "Perform systematic abdominal history",
      "Identify red flag symptoms for acute abdomen",
      "Develop appropriate differential diagnosis",
      "Practice pain assessment techniques"
    ],
    "clinical_context": "Emergency department presentation at 8 PM",
    "patient_age": 35,
    "patient_gender": "Female",
    "chief_complaint": "Severe abdominal pain for 6 hours",
    "presenting_symptoms": [
      "Right lower quadrant pain",
      "Nausea and vomiting",
      "Low-grade fever (100.2°F)",
      "Loss of appetite"
    ],
    "patient_background": {
      "occupation": "Office worker",
      "medical_history": "No significant past medical history",
      "medications": "Oral contraceptive pill",
      "allergies": "No known drug allergies",
      "social_history": "Non-smoker, occasional alcohol use"
    },
    "key_history_points": {
      "pain_characteristics": {
        "onset": "Sudden, started around 2 PM",
        "location": "Initially periumbilical, now RLQ",
        "quality": "Sharp, constant",
        "severity": "8/10",
        "radiation": "No radiation",
        "aggravating_factors": ["Movement", "coughing"],
        "relieving_factors": ["Lying still"]
      },
      "associated_symptoms": {
        "nausea": true,
        "vomiting": "Twice, non-bloody",
        "fever": "Low-grade",
        "bowel_changes": "No recent changes",
        "urinary_symptoms": "None"
      }
    },
    "evaluation_criteria": {
      "essential_questions": [
        "Pain onset and progression",
        "Pain characteristics (location, quality, severity)",
        "Associated symptoms",
        "Medical history",
        "Medications",
        "Last menstrual period"
      ],
      "bonus_questions": [
        "Family history",
        "Travel history",
        "Recent dietary changes"
      ]
    }
  }
}
```

### Option 2: Database Schema (For production)

**Cases Table**:
```sql
CREATE TABLE cases (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(20),
  estimated_time VARCHAR(50),
  specialty VARCHAR(100),
  level VARCHAR(50),
  duration VARCHAR(50),
  clinical_context TEXT,
  patient_age INTEGER,
  patient_gender VARCHAR(20),
  chief_complaint TEXT,
  case_data JSONB, -- Store complex nested data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE case_tags (
  case_id VARCHAR(50) REFERENCES cases(id),
  tag VARCHAR(100),
  PRIMARY KEY (case_id, tag)
);

CREATE TABLE case_learning_objectives (
  case_id VARCHAR(50) REFERENCES cases(id),
  objective TEXT,
  order_index INTEGER,
  PRIMARY KEY (case_id, order_index)
);

CREATE TABLE case_presenting_symptoms (
  case_id VARCHAR(50) REFERENCES cases(id),
  symptom VARCHAR(255),
  order_index INTEGER,
  PRIMARY KEY (case_id, order_index)
);
```

## Session Management

### Session Storage Structure
```json
{
  "sessionId": "uuid-12345",
  "caseId": "VP-ABD-001",
  "startTime": "2024-01-15T10:30:00Z",
  "conversationHistory": [
    {
      "role": "patient",
      "content": "Hello, I'm experiencing severe pain...",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "role": "clinician", 
      "content": "Can you tell me more about when the pain started?",
      "timestamp": "2024-01-15T10:31:00Z"
    }
  ],
  "questionCount": 5,
  "topicsCovered": ["pain_onset", "pain_location", "associated_symptoms"],
  "isComplete": false
}
```

## AI Integration Guidelines

### Context Setup for AI Model
```javascript
function setupAIContext(caseData) {
  const systemPrompt = `
You are a virtual patient with the following characteristics:
- Age: ${caseData.patient_age}
- Gender: ${caseData.patient_gender}
- Chief Complaint: ${caseData.chief_complaint}
- Clinical Context: ${caseData.clinical_context}

Background Information:
${JSON.stringify(caseData.patient_background, null, 2)}

Key History Points:
${JSON.stringify(caseData.key_history_points, null, 2)}

Instructions:
1. Respond as this patient would, staying in character
2. Provide information gradually - don't volunteer everything at once
3. Answer questions honestly but require specific questions for detailed information
4. Show appropriate emotional responses (pain, anxiety, etc.)
5. Use natural, conversational language
6. If asked about something not in your background, respond appropriately ("I don't think so" or "I'm not sure")

Current situation: You are in the ${caseData.clinical_context} seeking help for ${caseData.chief_complaint}.
`;

  return systemPrompt;
}
```

### Evaluation Logic
```javascript
function generateEvaluation(conversationHistory, caseData) {
  const essentialQuestions = caseData.evaluation_criteria.essential_questions;
  const bonusQuestions = caseData.evaluation_criteria.bonus_questions;
  
  // Analyze conversation for covered topics
  const coveredTopics = analyzeConversationTopics(conversationHistory);
  
  // Calculate scores
  const essentialScore = calculateEssentialScore(coveredTopics, essentialQuestions);
  const bonusScore = calculateBonusScore(coveredTopics, bonusQuestions);
  const communicationScore = evaluateCommunicationStyle(conversationHistory);
  
  const overallScore = Math.round(
    (essentialScore * 0.7) + 
    (bonusScore * 0.2) + 
    (communicationScore * 0.1)
  );
  
  return {
    overall_score: overallScore,
    feedback: generateFeedback(overallScore, coveredTopics),
    strengths: identifyStrengths(conversationHistory, coveredTopics),
    areas_for_improvement: identifyImprovements(essentialQuestions, coveredTopics)
  };
}
```

## Implementation Checklist

### Phase 1: Basic Functionality
- [ ] Set up case data storage (JSON files or database)
- [ ] Implement `/api/simulation/cases` endpoint
- [ ] Implement `/api/simulation/start` endpoint
- [ ] Implement basic `/api/simulation/ask` endpoint
- [ ] Set up session management
- [ ] Test with VP-ABD-001 case

### Phase 2: Enhanced Features
- [ ] Implement evaluation logic
- [ ] Add Server-Sent Events for streaming responses
- [ ] Create additional case files
- [ ] Implement conversation analysis
- [ ] Add error handling and validation

### Phase 3: Production Ready
- [ ] Add database storage
- [ ] Implement proper authentication
- [ ] Add logging and monitoring
- [ ] Performance optimization
- [ ] Comprehensive testing

## Testing Strategy

1. **Unit Tests**: Test individual functions (case loading, session management, evaluation)
2. **Integration Tests**: Test complete API workflows
3. **End-to-End Tests**: Test with actual frontend integration
4. **Load Tests**: Ensure performance with multiple concurrent sessions

## Sample Implementation Files

The following files would need to be created/modified in your backend:

1. `routes/simulationRoutes.js` - API route definitions
2. `controllers/simulationController.js` - Business logic
3. `services/caseService.js` - Case data management
4. `services/sessionService.js` - Session management
5. `services/aiService.js` - AI integration
6. `services/evaluationService.js` - Evaluation logic
7. `cases/` directory - Case data files

This implementation will ensure your backend fully supports the frontend's expectations and provides a robust foundation for the Virtual Patient Simulator.