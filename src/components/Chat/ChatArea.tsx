import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Globe, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUserStore } from '../../store/userStore';
import { useChatStore } from '../../store/chatStore';
import { useProgressStore } from '../../store/progressStore';
import { sendMessageToAI } from '../../services/ai';

const ChatArea: React.FC = () => {
  const { messages, isTyping, addMessage, setTyping, setFeedback } = useChatStore();
  const { proficiencyLevel } = useUserStore();
  const { addMistake, getRecentMistakes, trackWords, pruneVocabulary, updateAccuracy, incrementDailyCorrectMessages, incrementDailyLongMessages } = useProgressStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    
    addMessage({
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    });

    setTyping(true);

    try {
      // Get recent mistakes to provide context to AI
      const recentMistakes = getRecentMistakes(3);
      
      const response = await sendMessageToAI(
        userMessage, 
        messages.map(msg => ({
          role: msg.sender,
          content: msg.text
        })), 
        proficiencyLevel,
        recentMistakes
      );
      
      addMessage({
        id: Date.now() + 1,
        text: response.text,
        sender: 'ai',
        translation: response.translation,
        timestamp: new Date(),
      });

      setFeedback(response.feedback);

      // Update progress stats
      if (response.vocabularyWords && response.vocabularyWords.length > 0) {
        trackWords(response.vocabularyWords, Date.now()); 
      }
      // Prune old vocabulary
      pruneVocabulary(Date.now());

      if (response.grammarScore !== undefined) {
        updateAccuracy(response.grammarScore);
      }

      // Save mistake if correction is provided
      if (response.feedback.correction) {
        addMistake({
          original: userMessage, 
          correction: response.feedback.correction,
          suggestion: response.feedback.suggestion
        });
      } else {
        // If no correction, it's a correct message!
        incrementDailyCorrectMessages();
      }

      // Track Long Messages (Goal: 100 messages with >= 5 words and >= 10 chars)
      const wordCount = userMessage.trim().split(/\s+/).length;
      const charCount = userMessage.replace(/\s/g, '').length;

      if (wordCount >= 5 && charCount >= 10) {
        incrementDailyLongMessages();
      }

    } catch (error) {
      console.error("Failed to get response:", error);
      addMessage({
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      });
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-full backdrop-blur-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg">English Tutor AI</h2>
            <p className="text-xs text-blue-100 opacity-80">Level: {proficiencyLevel}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {/* Settings or other icons */}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-gray-900/50 transition-colors">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm relative group transition-all duration-300 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
              }`}
            >
              <div className="text-sm md:text-base leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 text-inherit dark:prose-invert">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              
              {msg.sender === 'ai' && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-blue-500 transition-colors" title="Listen">
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-blue-500 transition-colors" title="Translate">
                      <Globe className="w-4 h-4" />
                    </button>
                  </div>
                  {msg.translation && (
                    <p className="text-xs text-gray-400 italic ml-4">{msg.translation}</p>
                  )}
                </div>
              )}
              
              <span className={`text-[10px] absolute bottom-1 ${msg.sender === 'user' ? 'left-2 text-blue-200' : 'right-2 text-gray-300 dark:text-gray-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-full border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900 transition-all shadow-inner">
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-white dark:hover:bg-gray-700">
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-100 placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
