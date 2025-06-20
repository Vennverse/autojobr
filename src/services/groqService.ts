import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface ResumeParseResult {
  personalDetails: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: {
      city?: string;
      state?: string;
      country?: string;
    };
    linkedinUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
  };
  professionalDetails: {
    currentCompany?: string;
    currentJobTitle?: string;
    experienceYears?: number;
    skills?: string[];
    education?: Array<{
      degree: string;
      institution: string;
      graduationYear?: number;
    }>;
    certifications?: string[];
  };
  extractedText: string;
  confidence: number;
  missingFields: string[];
}

export const parseResumeWithGroq = async (resumeText: string): Promise<ResumeParseResult> => {
  try {
    const prompt = `
    Parse the following resume text and extract structured information. Return a JSON object with the following structure:

    {
      "personalDetails": {
        "firstName": "string",
        "lastName": "string", 
        "email": "string",
        "phone": "string",
        "address": {
          "city": "string",
          "state": "string", 
          "country": "string"
        },
        "linkedinUrl": "string",
        "portfolioUrl": "string",
        "githubUrl": "string"
      },
      "professionalDetails": {
        "currentCompany": "string",
        "currentJobTitle": "string",
        "experienceYears": number,
        "skills": ["skill1", "skill2"],
        "education": [
          {
            "degree": "string",
            "institution": "string", 
            "graduationYear": number
          }
        ],
        "certifications": ["cert1", "cert2"]
      },
      "confidence": number (0-100),
      "missingFields": ["field1", "field2"]
    }

    Extract as much information as possible. For missing information, include the field name in missingFields array. 
    Calculate confidence based on how much information was successfully extracted.

    Resume Text:
    ${resumeText}
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert resume parser. Extract structured information from resumes and return valid JSON only."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.1,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq API');
    }

    // Clean the response to extract JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    
    return {
      personalDetails: parsedData.personalDetails || {},
      professionalDetails: parsedData.professionalDetails || {},
      extractedText: resumeText,
      confidence: parsedData.confidence || 0,
      missingFields: parsedData.missingFields || []
    };

  } catch (error) {
    console.error('Error parsing resume with Groq:', error);
    throw new Error('Failed to parse resume. Please try again.');
  }
};

export const generateCoverLetter = async (
  jobDescription: string,
  userProfile: any,
  companyName: string
): Promise<string> => {
  try {
    const prompt = `
    Generate a professional cover letter based on the following information:
    
    Job Description: ${jobDescription}
    Company: ${companyName}
    
    Candidate Profile:
    - Name: ${userProfile.personalDetails.firstName} ${userProfile.personalDetails.lastName}
    - Current Role: ${userProfile.professionalDetails.currentJobTitle}
    - Experience: ${userProfile.professionalDetails.experienceYears} years
    - Skills: ${userProfile.professionalDetails.skills?.join(', ')}
    - Education: ${userProfile.professionalDetails.education?.map((e: any) => `${e.degree} from ${e.institution}`).join(', ')}
    
    Write a compelling, personalized cover letter that:
    1. Shows enthusiasm for the role and company
    2. Highlights relevant experience and skills
    3. Demonstrates knowledge of the company
    4. Is professional but engaging
    5. Is 3-4 paragraphs long
    
    Format it as a proper business letter.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert career counselor who writes compelling cover letters that get interviews."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate cover letter');
  }
};