import React, { useState, useRef, useEffect } from 'react';
import {
  AirQualityResponse,
  UserProfile,
  AQIStandard,
} from '../types';
import {
  Send,
  Sparkles,
  User,
  Bot,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ChatAssistantTabProps {
  airData: AirQualityResponse | null;
  profile: UserProfile;
  standard: AQIStandard;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const SAMPLE_QUESTIONS = [
  'Is it safe to go for a run outside today?',
  'How can I protect my children from severe winter smog?',
  'What is the optimal indoor ventilation routine today?',
  'Will indoor houseplants effectively clean PM2.5 soot?',
  'Which commute mode generates the lowest emissions for 12 km?',
  'What is the difference between personal exposure reduction and reducing emissions?',
];

export const ChatAssistantTab: React.FC<ChatAssistantTabProps> = ({
  airData,
  profile,
  standard,
}) => {
  const current = airData?.current;
  const aqiVal = current
    ? standard === 'indian'
      ? current.aqiIndian
      : current.aqiUs
    : 145;

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: `Hello ${profile.name.split(' ')[0]}! I am **BreatheWise AI**, your environmental and air-quality intelligence assistant.

I have synchronized with live atmospheric measurements for **${airData?.city || 'your area'}**:
- **Current AQI:** ${aqiVal} (${current?.categoryIndian || 'Moderate'})
- **PM2.5 Concentration:** ${current?.pm25 ?? 85} µg/m³
- **Weather:** ${current?.temperature ?? 20}°C, ${current?.humidity ?? 65}% humidity

How can I help you and your family navigate air quality and low-emission choices today? Ask me anything or select a prompt below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6),
          environmentalContext: {
            city: airData?.city,
            latitude: airData?.latitude,
            longitude: airData?.longitude,
            aqiIndian: current?.aqiIndian,
            categoryIndian: current?.categoryIndian,
            aqiUs: current?.aqiUs,
            pm25: current?.pm25,
            pm10: current?.pm10,
            temperature: current?.temperature,
            humidity: current?.humidity,
            weatherCondition: current?.weatherCondition,
            source: airData?.source,
          },
          userProfile: {
            occupation: profile.occupation,
            travelMethod: profile.travelMethod,
            workoutPreference: profile.workoutPreference,
            householdType: profile.householdType,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'No response returned from the assistant.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `**Connection Notice:** I could not reach the server endpoint (${err.message || 'Network error'}). Please verify that the local server is operating or try again in a few moments.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        text: `Dialogue refreshed. Ready for questions regarding **${airData?.city}** air quality, masks, routines, or low-emission transport.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Context Badge Strip */}
      <div className="bg-slate-100 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-900 dark:text-white">Active Gemini Context:</span>
          <span className="text-slate-600 dark:text-slate-300">
            {airData?.city} · AQI {aqiVal} · PM2.5 {current?.pm25 ?? 'N/A'} µg/m³
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[520px]">
        {/* Messages scroll area */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 max-h-[580px]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-slate dark:prose-invert max-w-none text-sm">
                    {msg.text}
                  </div>

                  <div
                    className={`mt-2 flex items-center justify-between gap-4 text-[11px] ${
                      isUser ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3.5 items-center text-slate-500 dark:text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                <span>BreatheWise AI is evaluating atmospheric dynamics...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Question Chips */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat input box */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BreatheWise about smog protection, masks, routines, or travel..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          {/* Safety & Medical Disclaimer */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
              Educational environmental guidance only. Does not replace professional medical diagnosis.
            </span>
            <span className="hidden sm:inline font-mono">Gemini 4 Hydrogen</span>
          </div>
        </div>
      </div>
    </div>
  );
};
