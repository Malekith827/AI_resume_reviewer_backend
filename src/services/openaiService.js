import Groq from 'groq-sdk'

export async function analyzeResume(resumeText,jobDescription = '') {

  const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
  })
  
  const prompt = `
You are an expert HR consultant and ATS specialist with 15 years 
of experience reviewing resumes for top tech companies.

Analyze the following resume thoroughly and return ONLY a JSON object.
No explanation outside the JSON. No markdown. Just the JSON.

Be specific, harsh if needed, and actionable. 
Generic feedback is useless — give real detailed advice.

IMPORTANT RULES:

- Never give generic feedback.
- Every strength, weakness and suggestion must reference something specific found in the resume.
- Do not use vague phrases like "good technical skills", "strong background", or "good projects" unless you explain exactly why.
- Mention technologies, projects, achievements, certifications, coursework, internships, metrics, or accomplishments from the resume whenever possible.
- Evaluate the resume as a recruiter reviewing hundreds of applications.
- If something is missing, clearly state what is missing.
- Do not be overly positive.

Return exactly:
- 3 strengths
- 3 weaknesses
- 3 suggestion
Do not return fewer or more items.

Additional Constraints:
- Strength explanations: maximum 40 words.
- Weakness explanations: maximum 40 words.
- Suggestion howTo fields: maximum 60 words.
- Be concise.

ATS explanation must mention:
- keyword coverage
- formatting issues
- section organization
- ATS risks if present

For every weakness, explain how it affects hiring decisions.

For every suggestion, explain the expected improvement in recruiter perception or ATS performance.

Think like a recruiter deciding whether to interview the candidate.
Prioritize feedback that would most improve interview chances.

Act as a real recruiter.

Provide a hiring recommendation based only on the information in the resume.

Interview = candidate would likely move forward.
Maybe Interview = candidate has potential but has notable concerns.
Reject = resume is unlikely to move forward.

Choose only one.

Scores must be internally consistent.

If multiple major weaknesses exist, overallScore should reflect them.

overallScore should roughly align with the average quality of the section scores.

Do not inflate scores.

Decision Guidelines:

Interview:
- Strong candidate with few concerns.
- Would realistically move to the next hiring stage.

Maybe Interview:
- Shows potential but has meaningful weaknesses.

Reject:
- Missing critical requirements, weak evidence, poor presentation, or insufficient experience.

Do not default to Maybe Interview.
Choose the most realistic outcome.

If a job description is provided, analyze how well the resume 
matches it and fill the jobMatch object.
If no job description is provided, set matchScore to null 
and leave other jobMatch fields empty.

Job Description:
${jobDescription || 'No job description provided'}

{
  "overallScore": <number 0-100>,
  "overallSummary": "<maximum 2 concise sentences, 
                      what stands out, what hurts the most>",

  "sections": {
    "experience":  { 
      "score": <0-100>, 
      "comment": "<one sentence>",
      "detail": "<2-3 sentences of specific detailed feedback>"
    },
    "education":   { 
      "score": <0-100>, 
      "comment": "<one sentence>",
      "detail": "<2-3 sentences of specific detailed feedback>"
    },
    "skills":      { 
      "score": <0-100>, 
      "comment": "<one sentence>",
      "detail": "<2-3 sentences of specific detailed feedback>"
    },
    "formatting":  { 
      "score": <0-100>, 
      "comment": "<one sentence>",
      "detail": "<2-3 sentences of specific detailed feedback>"
    },
    "impact":      { 
      "score": <0-100>, 
      "comment": "<one sentence>",
      "detail": "<2-3 sentences of specific detailed feedback>"
    }
  },

  "strengths": [
    {
      "point": "<strength title>",
      "explanation": "<why this is good and how it helps>"
    }
  ],

  "weaknesses": [
    {
      "point": "<weakness title>",
      "explanation": "<specifically what is wrong and why it hurts>"
    }
  ],

  "suggestions": [
    {
      "action": "<what to do>",
      "howTo": "<exactly how to do it, with an example if possible>"
    }
  ],

  "recruiterVerdict": {
    "decision": "<Interview | Maybe Interview | Reject>",
    "reason": "<2-3 sentences explaining the hiring decision>"
  },

  "topPriorityFix": {
    "title": "<single most important improvement>",
    "whyItMatters": "<why recruiters care>",
    "howToFix": "<specific action>"
  },

  "jobMatch": {
  "matchScore": <0-100>,
  "summary": "<2-3 sentences on overall match>",
  "missingKeywords": ["<keyword>", "<keyword>"],
  "presentKeywords": ["<keyword>", "<keyword>"],
  "whatToAdd": [
    {
      "skill": "<missing skill>",
      "suggestion": "<how to add it to the resume>"
    }
  ]
  },

  "atsScore": <number 0-100>,
  "atsExplanation": "<2-3 sentences explaining ATS compatibility 
                     and specific issues found>"
}

Resume:
${resumeText}
`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3
  })

  try{
    return JSON.parse(response.choices[0].message.content)
  }catch{
    throw new Error('Invalid AI response')
  }
}