import Step1 from "../components/Step1"
import Step2 from "../components/Step2"
import Step3 from "../components/Step3"
import Step4 from "../components/Step4"
import { useState } from "react"
import HistoryDropdown from "../components/HistoryDropdown"


interface StepPageProps {
    onComplete: (profile: any) => void
    initialStep?: number; // starting step (defaults to 1)
    initialProfile?: UserProfile; // pre-filled profile data
}

interface UserProfile {
    roles: string[];
    skills: string[];
    experience: string;
    description: string;
}

const StepPage = ({ onComplete, initialStep = 1, initialProfile } : StepPageProps) => {
    const [ darkMode, setDarkMode ] = useState(false) // Dark Mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
    }

    const [matchPercentage, setMatchPercentage] = useState("0"); // MATCH PERCENTAGE - gets updated by Step4 analysis
    const [ currentStep, setCurrentStep ] = useState(initialStep) // page 1 - 4, start with page 1
    // user profile, data colleced across all steps
    const [ userProfile, setUserProfile ] = useState<UserProfile>({
        roles: initialProfile?.roles || [],
        skills: initialProfile?.skills || [],
        experience: initialProfile?.experience || '',
        description: initialProfile?.description || '',
    })


    // save to backend - tries API first, falls back to localStorage
    const saveToBackend = async (historyData: any) => {
        try {
            console.log('sending to backend', historyData)
            // Try to save to backend API at localhost:5000
            const response = await fetch("http://localhost:5000/api/history", {
                method: 'POST',
                headers: {"Content-Type": 'application/json'},
                body: JSON.stringify(historyData)
            })

            if(response.ok){
                console.log('Save to backend')
                const savedItem = await response.json()
                console.log('Save item ID:', savedItem)
            } else {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        } catch (error) {
            console.log('Failed to save to backend:', error)
            const existing = JSON.parse(localStorage.getItem('jobAnalyzerHistory') || '[]');
            const newHistory = [historyData, ...existing]; // Add new item at beginning
            localStorage.setItem('jobAnalyzerHistory', JSON.stringify(newHistory));
        }
    }

    // WHEN USER CLICKS A HISTORY ITEM
    const handleSelectHistory = (profile: UserProfile) => {
        setUserProfile(profile); // load the saved profile
        setCurrentStep(4); // it turn to page 4 
    };

    // displaying current page and total page for user that can see
    const steps = [
        { number: 1, title: 'Choose Your Role' },
        { number: 2, title: 'Select Your Skills' },
        { number: 3, title: 'Paste the job description' },
        { number: 4, title: 'Profile Result' },
    ]
    const totalSteps = steps.length

    // next button
    const nextButton = () => {
        if (currentStep < 4 ) {
            setCurrentStep(currentStep + 1)
        }
    }

    // back button
    const backButton = () => {
        if (currentStep > 1 ) {
            setCurrentStep(currentStep - 1)
        }
    }

    // upload user Profile data - called by each step to update specific fields
    const handleUpdateProfile = (updates: Partial<UserProfile>) => {
        setUserProfile({ ...userProfile, ...updates })
    }

    // Finish button - saves analysis to history
    const finishButton = () => {
        const historyData = {
            roles: userProfile.roles,
            experience: userProfile.experience,
            skills: userProfile.skills,
            description: userProfile.description,
            matchPercentage: matchPercentage,
        }

        saveToBackend(historyData) // Save to backend/localStorage
        onComplete(userProfile)
    }

    return (
        <div className={`${darkMode && "dark"} min-h-screen`}>
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-300 flex items-center justify-center p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 dark:bg-gray-700">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center text-lg font-bold
                         text-blue-700 dark:text-blue-500">
                        {currentStep} / {totalSteps}
                    </div>
                    {/* History Dropdown button */}
                    <HistoryDropdown
                        onSelectHistory={handleSelectHistory}
                        darkMode={darkMode}
                    />
                    {/* Dark mode toggle button */}
                    <button onClick={toggleDarkMode} className=" w-10 h-10 font-bold text-[10px] bg-neutral-900 dark:bg-white rounded-md text-white dark:text-black">
                        {darkMode ? "LIGHT" : "DARK"}
                    </button>
                </div>
                
            </div>

            <div className="mt-8">

                    {/* shows current and total pages */}
                {currentStep === 1 && (
                    <Step1 profile={userProfile} onUpdate={handleUpdateProfile}/>
                )}

                {currentStep === 2 && (
                    <Step2 profile={userProfile} onUpdate={handleUpdateProfile}/>
                )}

                {currentStep === 3 && (
                    <Step3 profile={userProfile} onUpdate={handleUpdateProfile}/>
                )}

                {currentStep === 4 && (
                    <Step4 profile={userProfile} onUpdate={handleUpdateProfile} onMatchCalculated={setMatchPercentage}/>
                )}
            </div>

            <div className="flex justify-between mt-12 pt-8 border-t">
                    {/* Back button */}
                <button onClick={backButton} className={`px-6 py-3 rounded-lg font-medium ${currentStep === 1 ? 
                    'invisible' : 'bg-gray-100 text-gray-700 hover:bg-gray-300'}`}
                    disabled={currentStep === 1}
                    >
                    Back
                </button>

                <div className="flex gap-4">
                    {/* Next and Finish button */}
                    {currentStep === totalSteps ? (
                        <button
                        onClick={finishButton} className="px-8 py-3 bg-blue-600 
                        text-white rounded-lg font-medium hover:bg-blue-700">
                            Finish
                        </button>
                    ) : (
                        <button onClick={nextButton} className="px-8 py-3 bg-blue-600 
                        text-white rounded-lg font-medium hover:bg-blue-700">
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>

    </div>
        </div>
  )
}



export default StepPage