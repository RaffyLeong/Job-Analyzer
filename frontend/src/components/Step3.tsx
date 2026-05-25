import { useState } from "react";


interface Step3Prop {
  profile: {
    description: string
  };
  onUpdate: (updates: any) => void // Callback to update parent state
}

const Step3 = ({ profile, onUpdate }: Step3Prop) => {
    const [text, setText] = useState(profile.description || "");

    // clear button
    const handleClearButton = () => {
      setText("");
      onUpdate({ description: "" }) // Update parent state
    };
  

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value
      setText(newText) // Update local state for responsive UI
      onUpdate({ description: newText}) // Update parent state for analysis
    }
    return (
      
      <div className="min-h-screen p-4 mb-10 md:p-8 bg-white dark:bg-gray-700">
        {/* Header */}
        <header className="max-w-6xl mx-auto pb-8 border-b border-gray-200">
          <h2 className="text-[32px] md:text-4xl text-blue-600 font-semibold mb-2 dark:text-blue-500">
              Paste any job description
            </h2>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
            <div className="w-6 h-1 bg-blue-300 rounded-full"></div>
            <div className="w-3 h-1 bg-blue-200 rounded-full"></div>
          </div>
        </header>
  
        <div className="mt-6 max-w-6xl mx-auto flex flex-col gap-4 ">
          {/* How to use */}
          <div className="mb-2">
            <ol className="space-y-4 rounded-2xl">
              <li className="flex item-start gap-4">
                <div
                  className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full 
                flex items-center justify-center font-bold"
                >
                  1
                </div>
                <span className="font-medium text-[18px] text-gray-600 dark:text-white">
                  Go on any job board
                </span>
              </li>
              <li className="flex item-start gap-4">
                <div
                  className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full 
                flex items-center justify-center font-bold"
                >
                  2
                </div>
                <span className="font-medium text-[18px] text-gray-600 dark:text-white">
                  Find a job you're interested in
                </span>
              </li>

              <li className="flex item-start gap-4">
                <div
                  className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full 
                flex items-center justify-center font-bold"
                >
                  3
                </div>
                <span className="font-medium text-[18px] text-gray-600 dark:text-white">
                  Copy the entire job description
                </span>
              </li>

              <li className="flex item-start gap-4">
                <div
                  className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full 
                flex items-center justify-center font-bold"
                >
                  4
                </div>
                <span className="font-medium text-[18px] text-gray-600 dark:text-white">
                  Paste it in the box below
                </span>
              </li>
            </ol>
          </div>
  
          {/* job description input area */}
          <textarea
            value={text}
            onChange={handleTextChange}
            className="w-full h-[500px] p-4 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 
          focus:border-transparent resize-none dark:bg-gray-700 dark:text-white text-black"
            placeholder="Paste the job description here..."
            required
          />
          <div className="flex gap-3 mt-4">

          {/* Clear Button */}
            <button
              onClick={handleClearButton}
              className="bg-blue-600 text-white rounded p-2 hover:bg-blue-800 transition"
            >
              Clear
            </button>
          </div>
  
          {text.length > 0 && (
            <div className="text-[16px] text-gray-500 mt-2">
              {text.length} characters • Paste your job description above
            </div>
          )}
        </div>
  
        
      </div>
  )
}

export default Step3