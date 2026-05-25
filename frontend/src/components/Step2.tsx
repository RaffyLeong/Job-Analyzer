import { useState } from "react";

interface Step2Prop {
  profile: {
    skills: string[];
  };
  onUpdate: (updates: any) => void; // Callback to update parent state
}

// Tech Skills 
const techSkills = [
  "React", "TypeScript", "JavaScript", "Python", "Java", "C#", "Go", "Node.js", 
    "Express", "Next.js", "Vue", "Angular", "Tailwind CSS", "CSS", "SCSS", "Bootstrap", 
    "HTML", "MongoDB", "PostgreSQL", "Docker", "Git", "GraphQL", "Redux", "Jest", "React Native", 
    "Flutter", "Dart", "Swift", "Figma", "Vite", "REST API","Spring Boot", "AWS", "Azure", 
    "Google Cloud", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions","Agile", 
    "Scrum", "JIRA", "Confluence", "Postman", "Swagger", "Microservices",
    "SQL", "NoSQL", "Firebase", "MySQL", "Redis", "Elasticsearch"
];

const Step2 = ({ profile, onUpdate }: Step2Prop) => {
  const [searchTerm, setSearchTerm] = useState(""); // this status is for Search bar

  // Filter Skills Based On Search Bar
  const filteredSkills = techSkills.filter((skill) =>
    skill.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleSkill = (skill: string) => {
    const newSkills = profile.skills.includes(skill) //  If skill already selected, remove it; otherwise add it
      ? profile.skills.filter((s) => s !== skill) // Remove skill
      : [...profile.skills, skill]; // Add skill
    onUpdate({ skills: newSkills }); // Update parent state with new skills array
  };


  return (
    <div>
      <h2 className="text-3xl font-bold text-blue-600 mb-2 dark:text-blue-500">
        Select Your Skills
      </h2>
      <p className="text-gray-500 mb-8 dark:text-white">
        Choose the skills you're comfortable with. Be honest - this helps us
        give you better job match insights.
      </p>
      <div className="mt-6 flex items-center gap-2 mb-10">
        <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
        <div className="w-6 h-1 bg-blue-300 rounded-full"></div>
        <div className="w-3 h-1 bg-blue-200 rounded-full"></div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
          focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Quick Select Categories */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">
          Common Skills
        </h3>
        
      </div>

      {/* Skills Grid */}
      <div className="max-h-96 overflow-y-auto pr-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredSkills.map((skill) => {
            const isSelected = profile.skills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`p-3 rounded-lg border text-center transition-all dark:bg-gray-700 dark:text-white
                  ${
                    isSelected
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {skill}
                {isSelected && <span className="ml-2 text-blue-600">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Skills Count */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 dark:text-white">
            <span className="font-semibold ">{profile.skills.length}</span>{" "}
            skills selected
          </span>
          {profile.skills.length > 0 && (
            <button
              onClick={() => onUpdate({ skills: [] })}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          )}
        </div>
        {profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.skills.slice(0, 8).map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
            {profile.skills.length > 8 && (
              <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                +{profile.skills.length - 8} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2;
