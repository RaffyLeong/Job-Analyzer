// Step4.tsx - Hybrid Analysis (Fallback for Macau, AI for UK)
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
// TECH SKILLS LIST (for fallback analysis)
// ============================================
const techSkills = [
  "React", "TypeScript", "JavaScript", "Python", "Java", "C#", "Go", "Node.js", "Express", 
  "Next.js", "Vue", "Angular", "Tailwind CSS", "CSS", "SCSS", "Bootstrap", "HTML", "MongoDB", 
  "PostgreSQL", "MySQL", "AWS", "Docker", "Git", "REST", "GraphQL", "Redux", "Jest", "React Native", 
  "Flutter", "Dart", "Swift", "Figma", "Vite", "REST API", "React.js", "ReactJS", "Spring Boot", "Azure", 
  "Google Cloud", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions", "Agile", "Scrum", "JIRA", "Confluence", 
  "Postman", "Swagger", "Microservices", "SQL", "NoSQL", "Firebase", "Redis", "Elasticsearch"
];

// ============================================
// ROLE MATCHING (for fallback analysis)
// ============================================
const analyzeRoleWithMatching = (userRoles: string[], jobText: string): number => {
  const textLower = jobText.toLowerCase();
  let bestRoleScore = 0;
  
  for (const selectedRole of userRoles) {
    const roleLower = selectedRole.toLowerCase();
    
    if (textLower.includes(roleLower)) {
      bestRoleScore = Math.max(bestRoleScore, 100);
      continue;
    }
    
    const roleWords = roleLower.split(' ');
    let matchedWords = 0;
    let partialMatches = 0;
    
    for (const word of roleWords) {
      if (word.length < 3) continue;
      
      if (textLower.includes(word)) {
        matchedWords++;
      } else {
        const textWords = textLower.split(' ');
        for (const textWord of textWords) {
          if (textWord.includes(word) || word.includes(textWord)) {
            partialMatches++;
            break;
          }
        }
      }
    }
    
    const wordMatchScore = roleWords.length > 0 
      ? ((matchedWords + (partialMatches * 0.5)) / roleWords.length) * 100
      : 0;
    
    const variations: Record<string, string[]> = {
      'developer': ['dev', 'engineer', 'programmer', 'coder'],
      'front end': ['frontend', 'ui', 'client side'],
      'back end': ['backend', 'server side', 'api'],
      'full stack': ['fullstack', 'mean', 'mern'],
      'machine learning': ['ml', 'ai'],
      'mobile': ['ios', 'android', 'react native'],
      'cloud': ['aws', 'azure', 'devops'],
      'security': ['cyber', 'infosec'],
      'product': ['pm', 'product owner'],
      'engineering manager': ['tech lead', 'team lead']
    };
    
    let variationScore = 0;
    for (const [key, variants] of Object.entries(variations)) {
      if (roleLower.includes(key)) {
        for (const variant of variants) {
          if (textLower.includes(variant)) {
            variationScore = 75;
            break;
          }
        }
      }
    }
    
    const roleBestScore = Math.max(wordMatchScore, variationScore);
    bestRoleScore = Math.max(bestRoleScore, roleBestScore);
  }
  
  return bestRoleScore;
};

// ============================================
// AI FUNCTION - Calls Ollama (will work in UK)
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
// TEXT PARSING - extracts requirements
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

    for (const keyword of requirementKeywords) {
      if (lowerLine.includes(keyword.toLowerCase())) {
        inRequirementsSection = true;
        continue;
      }
    }
    
    if (inRequirementsSection) {
      if (line.match(/^(What We Offer|Benefits|Nice to Have|About Us)/i)) {
        break;
      }
      
      if (line.match(/:$/) || line.match(/^(Role Responsibilities|Technical Requirements|Requirements|Qualifications)$/i)) {
        continue;
      }
      
      if (line.match(/^[-•*]\s/) || line.match(/^\d+\./) || line.match(/^[a-z]\)/)) {
        let cleanLine = line.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '').replace(/^[a-z]\)\s/, '');
        if (cleanLine.length > 10 && cleanLine.length < 200) {
          extractedRequirements.push(cleanLine);
        }
      }
      else if (line.length > 15 && line.length < 150 && !line.match(/^[A-Z][a-z]+:$/)) {
        if (!line.includes('competitive salary') && !line.includes('benefits')) {
          if (!line.match(/^(Role Responsibilities|Technical Requirements|Requirements|Qualifications)$/i)) {
            extractedRequirements.push(line);
          }
        }
      }
    }
  }
  
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
  
  return extractedRequirements.slice(0, 5);
};

// ============================================
// FALLBACK ANALYSIS (Works in Macau, no setup)
// ============================================
const runFallbackAnalysis = (profile: any, setAnalysis: any, onMatchCalculated?: any) => {
  const text = profile.description;
  if (!text.trim()) return;

  // Skills analysis
  const requireSkills = techSkills.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase()),
  );
  const uniqueRequireSkills = [...new Set(requireSkills)];
  const matchSkills = profile.skills.filter((skill: string) =>
    uniqueRequireSkills.includes(skill),
  );
  const missingSkills = uniqueRequireSkills.filter(
    (skill) => !profile.skills.includes(skill),
  );
  const skillsScore = uniqueRequireSkills.length > 0
    ? (matchSkills.length / uniqueRequireSkills.length) * 100
    : 0;

  // Role analysis
  let roleScore = 0;
  if (profile.roles && profile.roles.length > 0) {
    roleScore = analyzeRoleWithMatching(profile.roles, text);
  }

  // Experience analysis
  let experienceScore = 0;
  if (profile.experience) {
    const expLevels = ["0-2 years", "2-4 years", "4-6 years", "6-8 years", "8+ years"];
    const userExpIndex = expLevels.indexOf(profile.experience);
    const expRegex = /(\d+)\+?\s*years?\s*(?:of)?\s*experience/gi;
    const matches = [...text.matchAll(expRegex)];

    if (matches.length > 0) {
      const jobExpYears = Math.max(...matches.map((m) => parseInt(m[1])));
      const jobExpLevels = [
        { maxYears: 2, level: "0-2 years" },
        { maxYears: 4, level: "2-4 years" },
        { maxYears: 6, level: "4-6 years" },
        { maxYears: 8, level: "6-8 years" },
        { maxYears: Infinity, level: "8+ years" },
      ];
      const jobExpLevel = jobExpLevels.find((level) => jobExpYears <= level.maxYears)?.level || "8+ years";
      const jobExpIndex = expLevels.indexOf(jobExpLevel);
      
      if (userExpIndex >= jobExpIndex) {
        experienceScore = 100;
      } else {
        const diff = jobExpIndex - userExpIndex;
        experienceScore = Math.max(0, 100 - diff * 25);
      }
    } else {
      experienceScore = 50;
    }
  }

  const totalMatch = Math.round(roleScore * 0.25 + experienceScore * 0.25 + skillsScore * 0.5);
  const requirements = extractRequirementsFromText(text);

  setAnalysis({
    match: totalMatch.toString(),
    techSkill: uniqueRequireSkills,
    requirements: requirements.length > 0 ? requirements : ["Key requirements could not be extracted."],
    missingSkills: missingSkills,
    matchingSkills: matchSkills,
    roleMatch: `${Math.round(roleScore)}%`,
    experienceMatch: `${Math.round(experienceScore)}%`,
  });

  if (onMatchCalculated) {
    onMatchCalculated(totalMatch.toString());
  }
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
  const [usingAI, setUsingAI] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);

  // Check if Ollama is available (will be true in UK)
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const response = await fetch("http://localhost:11434/api/tags");
        if (response.ok) {
          setOllamaAvailable(true);
        } else {
          setOllamaAvailable(false);
        }
      } catch {
        setOllamaAvailable(false);
      }
    };
    checkOllama();
  }, []);

  // ============================================
  // HYBRID ANALYSIS: Fallback always works, AI when available
  // ============================================
  const analyzeJobDescription = async () => {
    const text = profile.description;
    if (!text.trim()) return;

    setIsAnalyzing(true);
    
    // Step 1: Run fallback analysis immediately (works in Macau and UK)
    runFallbackAnalysis(profile, setAnalysis, onMatchCalculated);
    
    // Step 2: If Ollama is available, try AI for better results (will work in UK)
    if (ollamaAvailable) {
      try {
        const aiResult = await analyzeWithLocalAI(text, profile);
        
        if (aiResult && aiResult.matchPercentage) {
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
          
          setUsingAI(true);
          
          if (onMatchCalculated) {
            onMatchCalculated(aiResult.matchPercentage.toString());
          }
        }
      } catch (err) {
        console.log("AI enhancement failed, keeping fallback results");
        setUsingAI(false);
      }
    }
    
    setIsAnalyzing(false);
  };

  // Run analysis when description changes
  useEffect(() => {
    if (profile.description) {
      analyzeJobDescription();
    }
  }, [profile.description, ollamaAvailable]);

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
        {usingAI ? (
          <span className="text-green-500 text-sm ml-2">✓ AI-enhanced (Ollama)</span>
        ) : (
          <span className="text-blue-500 text-sm ml-2">✓ Smart Matching</span>
        )}
      </p>
      <div className="mt-6 flex items-center gap-2 mb-20">
        <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
        <div className="w-6 h-1 bg-blue-300 rounded-full"></div>
        <div className="w-3 h-1 bg-blue-200 rounded-full"></div>
      </div>

      {/* Show Ollama hint when not available */}
      {ollamaAvailable === false && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 dark:bg-blue-900/20 dark:border-blue-800">
          <p className="text-blue-600 text-sm dark:text-blue-400">
            💡 Tip: Install Ollama for AI-powered insights when you're in the UK
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

      {/* Role & Experience Match (only for fallback mode) */}
      {!usingAI && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-gray-700">
            <p className="text-sm text-gray-600 mb-1 dark:text-gray-300">Role Match</p>
            <p className="text-2xl font-bold text-blue-600">{analysis.roleMatch}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-gray-700">
            <p className="text-sm text-gray-600 mb-1 dark:text-gray-300">Experience Match</p>
            <p className="text-2xl font-bold text-blue-600">{analysis.experienceMatch}</p>
          </div>
        </div>
      )}

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