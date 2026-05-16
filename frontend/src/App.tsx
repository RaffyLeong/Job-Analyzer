
import { useEffect, useState } from "react";
import MainApp from "./pages/MainApp";

interface UserProfile {
    roles: string[];
    skills: string[];
    experience: string; 
    description: string;
}

// Main App component - controls whether to show the analyzer or completion screen
function App() {
    const [hasCompletedPage, setHasCompletedPage] = useState(false) // Check if user has already completed the profile setup

    const [startFromStep, setStartFromStep] = useState<number>(1) // Track which step to start from
    // Store the user's profile data
    const [userProfile, setUserProfile] = useState<UserProfile>({
        roles: [],
        skills: [],
        experience: '', 
        description: '',
    })
    const [isLoading, setIsLoading] = useState(true)
    

    // On component mount, check localStorage for saved profile
    useEffect(() => {
        setIsLoading(false)
    }, [])

    // Called when user completes the analysis flow
    const handleCompletedPage = (profile: UserProfile) => {
        setUserProfile(profile)
        setHasCompletedPage(true)
        localStorage.setItem('jobAnalyzerProfile', JSON.stringify(profile))
    }

    // Reset everything - clears localStorage and starts fresh
    const handleReset = () => {
        localStorage.removeItem('jobAnalyzerProfile')
        setUserProfile({ roles: [], skills: [], experience: '', description: '' })
        setHasCompletedPage(false)
        setStartFromStep(1) // Start from step 1 for new analysis
    }

    const handleAnalyzeAnotherJob = () => {
        setStartFromStep(3) // Start from step 3 for analyzing another job
        setHasCompletedPage(false) // Show the MainApp again
    }

    if (isLoading) {
        return <div>Loading...</div> // Or a spinner
    }

    // If user hasn't completed profile, show the MainApp
    // if user has completed, then show the success screen
    return (
        <div>
            {!hasCompletedPage ? (
                <MainApp 
                onComplete={handleCompletedPage}
                initialStep={startFromStep}
                initialProfile={userProfile}
                />
            ) : (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-300 p-4 dark:from-gray-900 dark:to-gray-800">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md dark:bg-gray-700 ">
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">Profile Saved!</h1>
            <p className="text-gray-600 mb-6 dark:text-white">
              Your profile has been saved successfully. You can now analyze job descriptions and get personalized insights.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left dark:bg-gray-700">
              <p className="text-sm text-gray-700 dark:text-white border border-gray-200 p-4 rounded-lg">
                <strong className="dark:text-blue-500">Roles:</strong> {userProfile.roles?.join(', ') || "Not set"}<br />
                <strong className="dark:text-blue-500">Experience:</strong> {userProfile.experience || "Not set"}<br />
                <strong className="dark:text-blue-500">Skills:</strong> {userProfile.skills.length} selected
              </p>
            </div>
            <div className="gap-3">
              <button
                onClick={handleAnalyzeAnotherJob}
                className="px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Analyze Another Job
              </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 text-blue-600 hover:underline font-medium w-full"
            >
              Start New Analysis
            </button>
            </div>
            <p className="text-xs text-gray-500 mt-4 dark:text-gray-300">
              "Analyze New Job" keeps your role, experience & skills • "Start New Analysis" resets everything
            </p>
          </div>
        </div>
      )}
    </div>
    );
}

export default App;