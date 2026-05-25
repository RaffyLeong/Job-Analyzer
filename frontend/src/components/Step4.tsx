// Step4.tsx - AI-powered job description analysis using Ollama
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
  roleMatch: string;
  experienceMatch: string;
}

// ============================================
// AI FUNCTION - Calls Ollama for smart analysis
// ============================================
const analyzeWithLocalAI = async (jobDescription: string, userProfile: any) => {
  try {
    const prompt = `You are a job matching expert. Analyze this job description against the candidate's profile.

Return ONLY valid JSON with no extra text. Format exactly like this:
{
  "matchPercentage": 75,
  "requiredSkills": ["Skill1", "Skill2"],
  "matchingSkills": ["Skill1"],
  "missingSkills": ["Skill2"]
}

Candidate:
- Skills: ${userProfile.skills.join(", ")}
- Experience: ${userProfile.experience}
- Target roles: ${userProfile.roles.join(", ")}

Job Description:
${jobDescription.substring(0, 4000)}`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt: prompt,
        stream: false,
        format: "json"
      })
    });

    const data = await response.json();
    return JSON.parse(data.response);
  } catch (error) {
    console.error("Local AI failed:", error);
    return null;
  }
};

// ============================================
// this part is for Text Parsing - extracts requirements from job description text
// ============================================
const extractRequirementsFromText = (text: string): string[] => {
  const extractedRequirements: string[] = [];

  const requirementKeywords = [
    "Technical Requirements", "Requirements", "What you'll need", 
    "Qualifications", "Required Skills", "Minimum Qualifications",
    "Ideal Candidate", "Role Responsibilities"
  ];

  const lines = text.split('\n');
  let inRequirementsSection = false;

  for(let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    // Check if this line starts a requirements section
    for (const keyword of requirementKeywords) {
      if (lowerLine.includes(keyword.toLowerCase())) {
        inRequirementsSection = true;
        continue;
      }
    }
    
    // If we're in requirements section, collect bullet points
    if (inRequirementsSection) {
      // Stop if we hit another section header
      if (line.match(/^(What We Offer|Benefits|Nice to Have|About Us)/i)) {
        break;
      }
      
      // SKIP header lines that end with colon or look like section titles
      if (line.match(/:$/) || line.match(/^(Role Responsibilities|Technical Requirements|Requirements|Qualifications)$/i)) {
        continue;
      }
      
      // Collect bullet points or numbered items
      if (line.match(/^[-•*]\s/) || line.match(/^\d+\./) || line.match(/^[a-z]\)/)) {
        let cleanLine = line.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '').replace(/^[a-z]\)\s/, '');
        if (cleanLine.length > 10 && cleanLine.length < 200) {
          extractedRequirements.push(cleanLine);
        }
      }
      // Also collect non-bullet lines that look like requirements
      else if (line.length > 15 && line.length < 150 && !line.match(/^[A-Z][a-z]+:$/)) {
        if (!line.includes('competitive salary') && !line.includes('benefits')) {
          if (!line.match(/^(Role Responsibilities|Technical Requirements|Requirements|Qualifications)$/i)) {
            extractedRequirements.push(line);
          }
        }
      }
    }
  }
  
  // If we didn't find bullet points, try a simpler approach
  if (extractedRequirements.length === 0) {
    const requirementPhrases = [
      'experience with', 'knowledge of', 'familiarity with', 'proficiency in',
      'understanding of', 'ability to', 'skill in', 'expertise in'
    ];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const phrase of requirementPhrases) {
        if (lowerLine.includes(phrase) && line.length > 10 && line.length < 200) {
          extractedRequirements.push(line.trim());
          break;
        }
      }
    }
  }
  
  // Limit to top 5 requirements
  return extractedRequirements.slice(0, 5);
};

// ============================================
// MAIN COMPONENT
// ============================================
const Step4 = ({ profile, onMatchCalculated }: Step4Prop) => {
  const [analysis, setAnalysis] = useState<AnalysisType>({
    match: "0",
    techSkill: [],
    requirements: [],
    matchingSkills: [],
    missingSkills: [],
    roleMatch: "0%",
    experienceMatch: "0%",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // AI ANALYSIS ONLY (no fallback)
  // ============================================
  const analyzeJobDescription = async () => {
    const text = profile.description;
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const aiResult = await analyzeWithLocalAI(text, profile);
      
      if (aiResult && aiResult.matchPercentage) {
        // Extract requirements from the job description text
        const finalRequirements = extractRequirementsFromText(text);
        
        setAnalysis({
          match: aiResult.matchPercentage.toString(),
          techSkill: aiResult.requiredSkills || [],
          matchingSkills: aiResult.matchingSkills || [],
          missingSkills: aiResult.missingSkills || [],
          roleMatch: "AI Calculated",
          experienceMatch: "AI Calculated",
          requirements: finalRequirements.length > 0 ? finalRequirements : ["Unable to extract requirements from job description"],
        });
        
        if (onMatchCalculated) {
          onMatchCalculated(aiResult.matchPercentage.toString());
        }
      } else {
        setError("AI returned an invalid response. Please try again.");
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
      setError("Failed to connect to Ollama. Make sure Ollama is running (http://localhost:11434)");
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

  return (
    <div>
      <h2 className="text-3xl font-bold text-blue-600 mb-2 dark:text-blue-500">
        Analysis Results {isAnalyzing && <span className="text-sm ml-2">(Analyzing...)</span>}
      </h2>
      <p className="text-gray-600 mb-8 dark:text-white">
        Here's how your profile matches with the job description
        <span className="text-green-500 text-sm ml-2">✓ AI-powered by Ollama</span>
      </p>
      <div className="mt-6 flex items-center gap-2 mb-20">
        <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
        <div className="w-6 h-1 bg-blue-300 rounded-full"></div>
        <div className="w-3 h-1 bg-blue-200 rounded-full"></div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <p className="text-sm text-red-500 mt-2 dark:text-red-300">
            Make sure Ollama is installed and running: <code className="bg-red-100 px-1 rounded">ollama serve</code>
          </p>
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