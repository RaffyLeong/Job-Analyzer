
interface Step1Props {
  profile: {
    roles: string[];
    experience: string;
  }
  onUpdate: (update: any) => void // Callback to update parent state
}

//  Tech roles
const ROLES = [
  'Software development',
  'Back-End Developer',
  'Front-End Developer',
  'Full-Stack Developer',
  'Machine Learning Engineer',
  'Mobile Developer',
  'AI Specialist',
  'Cybersecurity Specialist',
  'Cloud Engineer/Architect',
  'UX/UI Designer',
  'Product Manager',
  'Engineering Manager',
]
// Experience ranges
const EXPERIENCE = [
  '0-2 years',
  '2-4 years',
  '4-6 years',
  '6-8 years',
  '8+ years',
]

const Step1 = ({ profile, onUpdate }: Step1Props) => {
  const toggleRole = (role: string) => {
    const newRoles = profile.roles?.includes(role)
      ? profile.roles.filter((r) => r !== role)  // Remove if already selected
      : [...(profile.roles || []), role];        // Add if not selected
    onUpdate({ roles: newRoles });
  };
  return (
    <div>
      <h2 className="text-3xl font-bold text-blue-600 mb-2 dark:text-blue-500">Choose Your Role</h2>
      <p className="text-gray-500 mb-8 dark:text-white">
        Select the job title you're interested in applying for
      </p>
      <div className="flex items-center gap-2 mb-10">
        <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
        <div className="w-6 h-1 bg-blue-300 rounded-full"></div>
        <div className="w-3 h-1 bg-blue-200 rounded-full"></div>
      </div>

      {/* Role Selection */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">
          Select Your Target Role
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => toggleRole(role)}
              className={`p-4 rounded-xl border-2 text-left transition-all border-gray-300
                ${profile.roles?.includes(role)
                  ?  'bg-blue-500 ' 
                  : ' hover:border-blue-300'
                }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">{role}</div>
      
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">
          Years of Professional Experience
        </h3>
        <div className="flex flex-wrap gap-3">
          {EXPERIENCE.map((level) => (
            <button
              key={level}
              onClick={() => onUpdate({ experience: level })}
              className={`px-5 py-2 rounded-lg border transition-all dark:bg-gray-700 dark:text-white
                ${profile.experience === level
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      </div>
  )
}

export default Step1