import React, { useState } from 'react';
import { useUserStore, type ProficiencyLevel } from '../../store/userStore';
import { useChatStore } from '../../store/chatStore';
import { CheckCircle, ArrowRight } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    question: "Select the correct sentence:",
    options: ["She don't like coffee.", "She doesn't like coffee.", "She no like coffee.", "She not likes coffee."],
    correct: 1,
    difficulty: 1
  },
  {
    id: 2,
    question: "I _____ to the store yesterday.",
    options: ["go", "gone", "went", "going"],
    correct: 2,
    difficulty: 1
  },
  {
    id: 3,
    question: "If I _____ you, I would study harder.",
    options: ["was", "am", "were", "be"],
    correct: 2,
    difficulty: 2
  },
  {
    id: 4,
    question: "By this time next year, I _____ graduated.",
    options: ["will have", "will had", "would have", "have"],
    correct: 0,
    difficulty: 3
  },
  {
    id: 5,
    question: "The meeting has been _____ until next week.",
    options: ["put out", "put off", "put away", "put on"],
    correct: 1,
    difficulty: 3
  },
  {
    id: 6,
    question: "I look forward _____ from you soon.",
    options: ["to hear", "hearing", "to hearing", "hear"],
    correct: 2,
    difficulty: 2
  },
  {
    id: 7,
    question: "He is responsible _____ the project management.",
    options: ["of", "for", "to", "with"],
    correct: 1,
    difficulty: 2
  },
  {
    id: 8,
    question: "I wish I _____ that yesterday.",
    options: ["didn't say", "hadn't said", "haven't said", "wouldn't say"],
    correct: 1,
    difficulty: 3
  },
  {
    id: 9,
    question: "Hardly _____ entered the room when the phone rang.",
    options: ["had I", "I had", "have I", "I have"],
    correct: 0,
    difficulty: 3
  },
  {
    id: 10,
    question: "It's high time we _____ home.",
    options: ["go", "went", "have gone", "will go"],
    correct: 1,
    difficulty: 3
  },
  {
    id: 11,
    question: "She accused him _____ stealing the money.",
    options: ["of", "for", "on", "about"],
    correct: 0,
    difficulty: 2
  },
  {
    id: 12,
    question: "I'd rather you _____ smoke in here.",
    options: ["don't", "didn't", "won't", "not"],
    correct: 1,
    difficulty: 3
  },
  {
    id: 13,
    question: "Despite _____ tired, he finished the work.",
    options: ["he was", "of being", "being", "to be"],
    correct: 2,
    difficulty: 2
  },
  {
    id: 14,
    question: "You _____ have seen him; he's in Paris!",
    options: ["mustn't", "can't", "shouldn't", "needn't"],
    correct: 1,
    difficulty: 2
  },
  {
    id: 15,
    question: "Not only _____ beautiful, but she is also intelligent.",
    options: ["she is", "is she", "she was", "was she"],
    correct: 1,
    difficulty: 3
  }
];

const InitialAssessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0: Intro, 1-N: Questions, N+1: Result
  const [answers, setAnswers] = useState<number[]>([]);
  const { setProficiencyLevel, completeAssessment } = useUserStore();
  const { resetChat, addMessage } = useChatStore();
  const [calculatedLevel, setCalculatedLevel] = useState<ProficiencyLevel | null>(null);

  const handleStart = () => setCurrentStep(1);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: number[]) => {
    let score = 0;
    finalAnswers.forEach((ans, idx) => {
      if (ans === QUESTIONS[idx].correct) {
        score += 1;
      }
    });

    let level: ProficiencyLevel = 'Principiante';
    if (score >= 13) level = 'Madrelingua';
    else if (score >= 10) level = 'Esperto';
    else if (score >= 8) level = 'Avanzato';
    else if (score >= 4) level = 'Intermedio';
    else level = 'Principiante';
    
    setCalculatedLevel(level);
    setProficiencyLevel(level);
    
    // Reset chat and add personalized welcome message
    resetChat();
    addMessage({
      id: 1,
      text: `Hello! 👋 I'm your AI English Tutor. I see you are at the **${level}** level. 🌟 How are you today?`,
      sender: 'ai',
      timestamp: new Date(),
      translation: `Ciao! 👋 Sono il tuo tutor di inglese AI. Vedo che sei al livello **${level}**. 🌟 Come stai oggi?`
    });

    completeAssessment(level);
    setCurrentStep(currentStep + 1);
  };

  if (currentStep === 0) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Welcome! 👋</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Before we start, let's take a quick test to understand your English level and personalize your experience. 🚀
        </p>
        <button
          onClick={handleStart}
          className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
        >
          Start Test <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    );
  }

  if (currentStep <= QUESTIONS.length) {
    const question = QUESTIONS[currentStep - 1];
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full">
          <div className="mb-6 flex justify-between items-center text-sm text-gray-400">
            <span>Question {currentStep} of {QUESTIONS.length}</span>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-6">{question.question}</h2>
          
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep > QUESTIONS.length) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Completed! 🎉</h2>
        <p className="text-gray-600 mb-6">
          Your estimated level is: <span className="font-bold text-blue-600 text-xl block mt-2">{calculatedLevel}</span>
        </p>
        <button
          onClick={() => {
             // Just close the modal/component. App.tsx will unmount it because hasCompletedAssessment is true.
          }} 
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
        >
          Start Chatting 💬
        </button>
      </div>
    );
  }

  return null; // Should not reach here
};

export default InitialAssessment;
