//No API key required

// Works offline
// Much more flexible than hardcoded keywords
// Easy to maintain

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

const techSkills = [
  "React", "TypeScript", "JavaScript", "Python", "Java", "C#", "Go", "Node.js", "Express", 
  "Next.js", "Vue", "Angular", "Tailwind CSS", "CSS", "SCSS", "Bootstrap", "HTML", "MongoDB", 
  "PostgreSQL", "MySQL", "AWS", "Docker", "Git", "REST", "GraphQL", "Redux", "Jest", "React Native", 
  "Flutter", "Dart", "Swift", "Figma", "Vite", "REST API", "React.js", "ReactJS", "Spring Boot", "Azure", 
  "Google Cloud", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions", "Agile", "Scrum", "JIRA", "Confluence", 
  "Postman", "Swagger", "Microservices", "SQL", "NoSQL", "Firebase", "Redis", "Elasticsearch"
  ];

const Step4 = ({ profile, onMatchCalculated }: Step4Prop) => {
  // Stores all calculated results from Page 1 - 3
  const [analysis, setAnalysis] = useState<AnalysisType>({
    match: "0",
    techSkill: [],
    requirements: [],
    matchingSkills: [],
    missingSkills: [],
    roleMatch: "0%",
    experienceMatch: "0%",
  });

  // Run analysis when description changes
  useEffect(() => {
    if (profile.description) {
      analyzeJobDescription();
    }
  }, [profile.description]);

  // this is check the matching role between user selected role and job description, it gives a score from 0 to 100
  const analyzeRoleWithMatching = (userRoles: string[], jobText: string): number => {
    const textLower = jobText.toLowerCase();
    let bestRoleScore = 0;
    
    for (const selectedRole of userRoles) {
        const roleLower = selectedRole.toLowerCase();
        
        // 1. If you selected "Front-End Developer" and job says "Front-End Developer"
        if (textLower.includes(roleLower)) {
            bestRoleScore = Math.max(bestRoleScore, 100);
            continue;
        }
        
        // 2. You selected "Front-End Developer" and Job says "Frontend Developer" (missing the hyphen)
        // It matches "Front" + "Developer" = 2 out of 2 words = 100%
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
        // this part is CALCULATION the role 
        const wordMatchScore = roleWords.length > 0 
            ? ((matchedWords + (partialMatches * 0.5)) / roleWords.length) * 100
            : 0;
        
        // 3. You selected "Machine Learning Engineer", Job says "ML Engineer" or "AI Engineer", Recognizes these as related → 75% match
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

  // ===================== Main Analyze function =====================
  const analyzeJobDescription = () => {
    const text = profile.description;
    if (!text.trim()) return; // if no description Exit


    // ======== SKILLS ANALYSIS (50%) ========
    // Find which tech skills are mentioned in the job description
    const requireSkills = techSkills.filter((skill) =>
      text.toLowerCase().includes(skill.toLowerCase()),
    );
    const uniqueRequireSkills = [...new Set(requireSkills)];  // Remove same skill mentioned multiple times
    // Find which required skills the user actually has click in the page 2
    const matchSkills = profile.skills.filter((skill) =>
      uniqueRequireSkills.includes(skill),
    );
    // Find skills mentioned in job that user doesn't have
    const missingSkills = uniqueRequireSkills.filter(
      (skill) => !profile.skills.includes(skill),
    );
    // Calculate skills score: (user's matching skills / total required skills) * 100
    const skillsScore =
      uniqueRequireSkills.length > 0
        ? (matchSkills.length / uniqueRequireSkills.length) * 100
        : 0;


    // ======== Role ANALYSIS (25% weight) ========
    // check if users role is in job description
    let roleScore = 0;
    if (profile.roles && profile.roles.length > 0) {
        roleScore = analyzeRoleWithMatching(profile.roles, text);
    }


    // ======== Experience ANALYSIS (25% weight) ========
    let experienceScore = 0;
    if (profile.experience) {
      // Experience levels from lowest to highest
      const expLevels = [
        "0-2 years", "2-4 years", "4-6 years", "6-8 years", "8+ years",
      ];
      const userExpIndex = expLevels.indexOf(profile.experience); // User's experience Level

      // Look for experience requirements in job description
      const expRegex = /(\d+)\+?\s*years?\s*(?:of)?\s*experience/gi;
      const matches = [...text.matchAll(expRegex)];

      if (matches.length > 0) {
        // Get the highest experience requirement mentioned
        const jobExpYears = Math.max(...matches.map((m) => parseInt(m[1])));

        const jobExpLevels = [
          { maxYears: 2, level: "0-2 years" },
          { maxYears: 4, level: "2-4 years" },
          { maxYears: 6, level: "4-6 years" },
          { maxYears: 8, level: "6-8 years" },
          { maxYears: Infinity, level: "8+ years" },
        ];

        const jobExpLevel =
          jobExpLevels.find((level) => jobExpYears <= level.maxYears)?.level ||
          "8+ years";
        const jobExpIndex = expLevels.indexOf(jobExpLevel);

        // Compare user's level with job requirement
        if (userExpIndex >= jobExpIndex) {
          experienceScore = 100; // User meets or exceeds requirement
        } else {
          // Calculate partial score based on how close they are
          const diff = jobExpIndex - userExpIndex;
          experienceScore = Math.max(0, 100 - diff * 25);
        }
      } else {
        // No experience requirement found, give medium score
        experienceScore = 50;
      }
    }

    // 50% skills + 25% role + 25% experience
    const totalMatch = Math.round(
      roleScore * 0.25 + experienceScore * 0.25 + skillsScore * 0.5,
    );

    // ========== KEY REQUIREMENTS ==========
    // looking from the job description line by line,  do any requirement-related phrases
    const requirements = text
      .split("\n")
      .filter(
        (line) =>
          line.includes("experience") ||
          line.includes("knowledge") ||
          line.includes("skill") ||
          line.includes("require") ||
          line.includes("ability") ||
          line.includes("qualification") ||
          line.includes("responsibility") ||
          line.includes("duties") ||
          line.includes("must have") ||
          line.includes("should have"),
      )
      .map((line) => line.trim())
      .filter((line) => line.length > 10) // Skip very short lines
      .slice(0, 6); // Take first 6 requirements

    

    const roleMatchPercentage = Math.round(roleScore);
    const experienceMatchPercentage = Math.round(experienceScore);

    // ========== UPDATE STATE WITH RESULTS ==========
    setAnalysis({
      match: totalMatch.toString(),
      techSkill: uniqueRequireSkills,
      requirements:
        requirements.length > 0
          ? requirements
          : [
              "Key requirements could not be extracted. Review the job description manually.",
            ],
      missingSkills: missingSkills,
      matchingSkills: matchSkills,
      roleMatch: `${roleMatchPercentage}%`,
      experienceMatch: `${experienceMatchPercentage}%`,
    });

    
    if (onMatchCalculated) {
    onMatchCalculated(totalMatch.toString());
  }
  };

  
// Overall Match percentage color
  const getMatchColor = (match: number) => {
    if (match >= 80) return "text-green-600";
    if (match >= 60) return "text-yellow-600";
    if (match >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getMatchBgColor = (match: number) => {
    if (match >= 80) return "text-green-600";
    if (match >= 60) return "text-yellow-600";
    if (match >= 40) return "text-orange-600";
    return "text-red-600";
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
        Analysis Results
      </h2>
      <p className="text-gray-600 mb-8 dark:text-white">
        Here's how your profile matches with the job description
      </p>
      <div className="mt-6 flex items-center gap-2 mb-20">
        <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
        <div className="w-6 h-1 bg-blue-300 rounded-full"></div>
        <div className="w-3 h-1 bg-blue-200 rounded-full"></div>
      </div>

      {/* ==== Profile Summary ==== */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 dark:bg-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">
          You Selected
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-800 mb-1 dark:text-white">Role</p>
            <p className="font-medium text-blue-600">
              {profile.roles && profile.roles.length > 0 
                    ? profile.roles.join(", ") 
                    : "No roles specified"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-800 mb-1 dark:text-white">Experience</p>
            <p className="font-medium text-blue-600">
              {profile.experience || "No specified"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-800 mb-1 dark:text-white">Skills</p>
            <p className="font-medium text-blue-600">
              {profile.skills.join(", ")}
            </p>
          </div>
        </div>
      </div>

      {/* ==== Overall Percentage ==== */}
      <div className="text-center mb-12">
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-8 flex items-center justify-center">
            <div className="text-center">
              <div
                className={`text-5xl font-bold ${getMatchColor(matchNumber)}`}
              >
                {analysis.match}%
              </div>
              <div className="text-gray-600 mt-2 dark:text-white">Overall Match</div>
            </div>
          </div>
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="#e5e7eb"
              strokeWidth="16"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke={getMatchStrokeColor(matchNumber)}
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${matchNumber * 5.52} 552`}
              style={{
                transition: "stroke-dasharray 1s ease-in-out",
                animation: "dash 1s ease-in-out forwards"
              }}
            />
          </svg>
        </div>
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getMatchBgColor(matchNumber)}`}
        >
          <div
            className={`w-3 h-3 rounded-full ${getMatchColor(matchNumber).replace("text-", "bg-")}`}
          ></div>
        </div>
      </div>

      <div className="grid md:gird-cols-2 gap-8">
        <div className="space-y-6">
          {/* ==== Role Requirement ====  */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 dark:bg-gray-700">
              <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-white">
                Role Requirement
              </h3>

              {/* What we found in job description */}
              <div className="mb-4">
                <div className=" bg-blue-50 rounded-lg dark:bg-gray-700 dark:text-white">
                  {(() => {
                    // Extract role requirements from text
                    const text = profile.description.toLowerCase();
                    const roleKeywords = [
                      "frontend", "backend", "fullstack", "full stack", "software developer", "software engineer",
                      "web developer", "ui developer", "ux designer", "product manager", "engineering manager", "machine learning",
                      "AI engineer", "data scientist", "mobile developer", "IOS", "react native", "React", "android",
                      "flutter", "devops", "cloud engineer", "cybersecurity", "security engineer",
                    ];

                    const foundRoles = roleKeywords.filter(
                      (keyword) =>
                        text.includes(keyword) ||
                        text.includes(keyword.replace(" ", "")),
                    );

                    if (foundRoles.length > 0) {
                      // Format and display found roles
                      const formattedRoles = foundRoles.map(
                        (role) => role.charAt(0).toUpperCase() + role.slice(1),
                      );
                      return (
                        <p className="text-blue-700 font-medium dark:text-blue-600">
                          {formattedRoles.slice(0, 10).join(", ")}
                          {foundRoles.length > 10 && "..."}
                        </p>
                      );
                    } else {
                      return (
                        <p className="text-gray-500 italic">
                          No specific role mentioned
                        </p>
                      );
                    }
                  })()}
                </div>
              </div>
              
            </div>

              {/* ==== Experience Requirement ==== */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 dark:bg-gray-700">
              <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-white">
                Experience Requirement
              </h3>

              {/* What we found in job description */}
              <div className="mb-4 ">
                <div className="bg-blue-50 rounded-lg dark:bg-gray-700">
                  {(() => {
                    // Extract experience requirements from text
                    const text = profile.description;
                    const expRegex =
                      /(\d+)\+?\s*years?\s*(?:of)?\s*experience/gi;
                    const matches = [...text.matchAll(expRegex)];

                    if (matches.length > 0) {
                      const expYears = matches.map((m) => parseInt(m[1]));
                      const maxExp = Math.max(...expYears);
                      return (
                        <p className="text-blue-700 font-medium ">
                          Requires: {maxExp}+ years of experience
                        </p>
                      );
                    } else {
                      // Look for experience keywords
                      const expKeywords = [
                        "senior", "lead", "principal", "staff", "mid-level", "mid level", "junior",
                        "entry level", "entry-level",  "experienced", "expert",
                      ];

                      const foundKeywords = expKeywords.filter((keyword) =>
                        text.toLowerCase().includes(keyword),
                      );

                      if (foundKeywords.length > 0) {
                        const formatted =
                          foundKeywords[0].charAt(0).toUpperCase() +
                          foundKeywords[0].slice(1);
                        return (
                          <p className="text-blue-700 font-medium dark:text-blue-600">
                            {formatted}
                          </p>
                        );
                      } else {
                        return (
                          <p className="text-gray-500 italic ">
                            No specific experience requirement mentioned
                          </p>
                        );
                      }
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* ==== Skill Match ==== */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 dark:bg-gray-700">
            <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-white">
              Skill Match ({analysis.matchingSkills.length}/
              {analysis.techSkill.length})
            </h3>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3 dark:text-white">
                Skills you have that match the job:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.matchingSkills.length > 0 ? (
                  analysis.matchingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-200 text-blue-800 rounded-lg text-sm font-medium"
                    >
                    {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">
                    No matching skills found
                  </span>
                )}
              </div>
            </div>
            <div>
              <div>
                <p className="text-sm text-gray-600 mb-3 dark:text-white">
                  Skills mentioned in job that you don't have:
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.length > 0 ? (
                    analysis.missingSkills.slice(0, 8).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">
                      No skills mentioned
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ==== Key Requirements ==== */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 dark:bg-gray-700">
              <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-white">
                Key Requirements Found
              </h3>
              <ul className="space-y-3">
                {analysis.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-[10px] leading-none">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-gray-700 dark:text-white">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4;
