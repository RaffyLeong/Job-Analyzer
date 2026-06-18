// Step4.tsx - AI-powered job analysis with Groq
import { useEffect, useState } from "react";

interface Step4Prop {
  profile: {
    roles: string[];
    skills: string[];
    experience: string;
    description: string;
  };
  onUpdate: (updates: any) => void;
  onMatchCalculated?: (match: string) => void;
}

interface AnalysisType {
  match: string;
  techSkill: string[];
  requirements: string[];
  matchingSkills: string[];
  missingSkills: string[];
}

// Get API key with .env
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

// ============================================
// AI FUNCTION - Uses Groq (Free Tier)
// ============================================
const analyzeWithGroq = async (jobDescription: string, userProfile: any) => {
  // check if have api key
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key is not configured. Add NEXT_PUBLIC_GROQ_API_KEY to your environment variables.");
  }

  // Prepare the prompt for the AI model
  const prompt = `You are a job matching expert. Analyze this job description against the candidate's profile.

Return ONLY valid JSON with no extra text. Format exactly like this:
{
  "matchPercentage": 75,
  "requiredSkills": ["Skill1", "Skill2", "Skill3"],
  "matchingSkills": ["Skill1"],
  "missingSkills": ["Skill2", "Skill3"],
  "requirements": ["Requirement 1", "Requirement 2", "Requirement 3", "Requirement 4", "Requirement 5"]
}

Candidate:
- Skills: ${userProfile.skills.join(", ")}
- Experience: ${userProfile.experience}
- Target roles: ${userProfile.roles.join(", ")}

Job Description:
${jobDescription.substring(0, 4000)}`;

  // send the request to Groq API
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile", // The AI model
      messages: [
        { 
          role: "system", 
          content: "You are a job matching expert. Return ONLY valid JSON. No explanation, no extra text." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });

  // handle errors
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "API request failed");
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};

// ============================================
// MAIN COMPONENT
// ============================================
const Step4 = ({ profile, onMatchCalculated }: Step4Prop) => {

  // start with default analysis state
  const [analysis, setAnalysis] = useState<AnalysisType>({
    match: "0",
    techSkill: [],
    requirements: [],
    matchingSkills: [],
    missingSkills: [],
  });

  // showing the "Analyzing..." loading state true/false 
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // store any error messages from the AI analysis
  const [error, setError] = useState<string | null>(null);

  // -------- Main Analysis Function --------
  const analyzeJobDescription = async () => {
    // Get the job description
    const text = profile.description;
    if (!text.trim()) return;

    // Show the loading spinner and clear any old errors
    setIsAnalyzing(true);
    setError(null);
    
    try {
       // -------- Call the AI function --------
      const aiResult = await analyzeWithGroq(text, profile);
      
      // If the AI returned a valid response
      if (aiResult && aiResult.matchPercentage !== undefined) {
        // Update the state with the AI's results
        setAnalysis({
          match: aiResult.matchPercentage.toString(),
          techSkill: aiResult.requiredSkills || [],
          matchingSkills: aiResult.matchingSkills || [],
          missingSkills: aiResult.missingSkills || [],
          requirements: (aiResult.requirements || []).slice(0, 5),
        });
        
        // Calculated the match ??
        if (onMatchCalculated) {
          onMatchCalculated(aiResult.matchPercentage.toString());
        }
      } else {
        setError("AI returned an invalid response. Please try again.");
      }
    } catch (err: any) {
      console.error("AI Analysis failed:", err);
      setError(err.message || "Failed to analyze job description. Please check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run analysis when description changes
  useEffect(() => {
    if (profile.description) {
      analyzeJobDescription();
    }
  }, [profile.description]);

  // UI Helper Functions
  const getMatchColor = (match: number) => {
    if (match >= 80) return "text-green-600 dark:text-green-400";
    if (match >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (match >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getMatchStrokeColor = (match: number) => {
    if (match >= 80) return "#10b981";
    if (match >= 60) return "#f59e0b";
    if (match >= 40) return "#f97316";
    return "#ef4444";
  };

  const matchNumber = parseInt(analysis.match);
  const hasApiKey = !!GROQ_API_KEY;

  return (
    <div>
      <h2 className="text-3xl font-bold text-blue-600 mb-2 dark:text-blue-500">
        Analysis Results {isAnalyzing && <span className="text-sm ml-2">(Analyzing...)</span>}
      </h2>
      <p className="text-gray-600 mb-8 dark:text-white">
        Here's how your profile matches with the job description
        <span className="text-green-500 text-sm ml-2">✓ AI-powered by Groq</span>
      </p>
      <div className="mt-6 flex items-center gap-2 mb-10">
        <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
        <div className="w-6 h-1 bg-blue-300 rounded-full"></div>
        <div className="w-3 h-1 bg-blue-200 rounded-full"></div>
      </div>

      {/* API Key Warning */}
      {!hasApiKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 dark:bg-yellow-900/20 dark:border-yellow-800">
          <p className="text-yellow-600 dark:text-yellow-400">
            ⚠️ Groq API key not configured. Add <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_GROQ_API_KEY</code> to your environment variables.
          </p>
          <p className="text-sm text-yellow-500 mt-2 dark:text-yellow-300">
            Get a free key at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com</a>
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Profile Summary */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 dark:bg-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">
          Your Profile
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1 dark:text-gray-300">Target Role</p>
            <p className="font-medium text-blue-600 dark:text-blue-400">
              {profile.roles && profile.roles.length > 0 
                ? profile.roles.join(", ") 
                : "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1 dark:text-gray-300">Experience</p>
            <p className="font-medium text-blue-600 dark:text-blue-400">
              {profile.experience || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1 dark:text-gray-300">Skills</p>
            <p className="font-medium text-blue-600 dark:text-blue-400">
              {profile.skills.length} skills selected
            </p>
          </div>
        </div>
      </div>

      {/* Overall Match Circle */}
      <div className="text-center mb-12">
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-8 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getMatchColor(matchNumber)}`}>
                {isAnalyzing ? "..." : analysis.match}%
              </div>
              <div className="text-gray-600 mt-2 dark:text-gray-300">Overall Match</div>
            </div>
          </div>
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="88" stroke="#e5e7eb" strokeWidth="16" fill="none" />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke={getMatchStrokeColor(matchNumber)}
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${matchNumber * 5.52} 552`}
              style={{ transition: "stroke-dasharray 1s ease-in-out" }}
            />
          </svg>
        </div>
      </div>

      {/* Skills Match Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 dark:bg-gray-700">
        <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-white">
          Skill Match ({analysis.matchingSkills.length}/{analysis.techSkill.length})
        </h3>
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3 dark:text-gray-300">
            ✅ Skills you have that match the job:
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.matchingSkills.length > 0 ? (
              analysis.matchingSkills.map((skill, index) => (
                <span key={index} className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium dark:bg-green-900/30 dark:text-green-300">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500 italic dark:text-gray-400">
                {isAnalyzing ? "Analyzing..." : "No matching skills found"}
              </span>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-3 dark:text-gray-300">
            ⚠️ Skills you're missing:
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.length > 0 ? (
              analysis.missingSkills.slice(0, 8).map((skill, index) => (
                <span key={index} className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium dark:bg-orange-900/30 dark:text-orange-300">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500 italic dark:text-gray-400">
                {isAnalyzing ? "Analyzing..." : "Perfect match! No missing skills"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key Requirements Section */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 dark:bg-gray-700">
        <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-white">
          📋 Key Requirements
        </h3>
        <ul className="space-y-3">
          {analysis.requirements.length > 0 ? (
            analysis.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-[10px] leading-none">{index + 1}</span>
                </div>
                <span className="text-gray-700 dark:text-gray-200">{req}</span>
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic dark:text-gray-400">
              {isAnalyzing ? "Analyzing requirements..." : "No requirements extracted"}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Step4;