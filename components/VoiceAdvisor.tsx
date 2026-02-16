
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, VoiceConversation } from '../types';
import { AdvisoryApi } from '../client_api/advisory/service';

interface VoiceAdvisorProps {
    user: User;
}

const VoiceAdvisor: React.FC<VoiceAdvisorProps> = ({ user }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [history, setHistory] = useState<VoiceConversation[]>([]);
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        // Initialize Speech Recognition
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = user.language === 'mr' ? 'mr-IN' : user.language === 'hi' ? 'hi-IN' : 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setStatus('listening');
            };

            recognitionRef.current.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                if (transcript) {
                    handleQuery(transcript);
                } else {
                    setStatus('idle');
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setStatus('idle');
                setIsListening(false);
            }
        }

        // Initialize Speech Synthesis
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }

        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, [user.language]);

    const startListening = () => {
        if (recognitionRef.current) {
            setTranscript('');
            setResponse('');
            setStatus('listening');
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Recognition start error", e);
            }
        } else {
            alert("Voice recognition not supported in this browser.");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const handleQuery = async (query: string) => {
        if (!query.trim()) return;

        setStatus('processing');

        // Simulate API call to AI agent
        try {
            // In a real app, this would call an AI service
            // For now, we'll simulate a response based on keywords or use a basic response
            let aiResponse = "I'm processing your request.";

            // Simple keyword matching for demo purposes since we removed the complex AI logic
            const lowerQuery = query.toLowerCase();
            if (lowerQuery.includes('weather') || lowerQuery.includes('rain')) {
                aiResponse = "The forecast for Nashik indicates scattered showers tomorrow. It's a good time to check your drainage systems.";
            } else if (lowerQuery.includes('market') || lowerQuery.includes('price')) {
                aiResponse = "Onion prices in Lasalgaon are currently stable at 2400 rupees per quintal. Tomato prices are seeing a slight upward trend.";
            } else if (lowerQuery.includes('crop') || lowerQuery.includes('disease')) {
                aiResponse = "Please scan your crop using the camera tool for accurate disease diagnosis. I can help you interpret the results once you scan them.";
            } else {
                aiResponse = `I heard you say "${query}". As an AI advisor, I can help you with weather, market prices, and crop management. How can I assist you further?`;
            }

            setResponse(aiResponse);

            const newRecord: VoiceConversation = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                queryText: query,
                responseText: aiResponse
            };

            setHistory(prev => [newRecord, ...prev]);
            speak(aiResponse);
            setStatus('speaking');

        } catch (error) {
            console.error("Error processing query", error);
            setStatus('idle');
            setResponse("Sorry, I encountered an error processing your request.");
        }
    };

    const speak = (text: string) => {
        if (synthRef.current) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = user.language === 'mr' ? 'mr-IN' : user.language === 'hi' ? 'hi-IN' : 'en-US';
            utterance.onend = () => {
                setIsSpeaking(false);
                setStatus('idle');
            };
            setIsSpeaking(true);
            synthRef.current.speak(utterance);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Voice Advisor</h1>
                    <p className="text-slate-500 font-medium mt-2">Speak naturally to get instant farming advice.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Voice Interface */}
                <div className="bg-white rounded-[20px] shadow-xl p-8 flex flex-col items-center justify-center min-h-[400px] border border-slate-200 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-50`}></div>

                    {/* Status Indicator */}
                    <div className="mb-8 relative z-10">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${status === 'listening' ? 'bg-red-100 text-red-600 animate-pulse' :
                                status === 'processing' ? 'bg-blue-100 text-blue-600 animate-bounce' :
                                    status === 'speaking' ? 'bg-emerald-100 text-emerald-600' :
                                        'bg-slate-100 text-slate-400'
                            }`}>
                            {status === 'listening' ? 'Listening...' :
                                status === 'processing' ? 'Processing...' :
                                    status === 'speaking' ? 'Speaking...' : 'Ready'}
                        </span>
                    </div>

                    {/* Mic Button */}
                    <button
                        onClick={isListening ? stopListening : startListening}
                        className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isListening
                                ? 'bg-red-500 shadow-lg shadow-red-200 scale-110'
                                : 'bg-emerald-600 shadow-xl shadow-emerald-200 hover:scale-105 active:scale-95'
                            }`}
                    >
                        <i data-lucide={isListening ? "mic-off" : "mic"} className="w-10 h-10 text-white"></i>
                        {isListening && (
                            <span className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping"></span>
                        )}
                    </button>

                    {/* Transcript Area */}
                    <div className="mt-10 w-full text-center space-y-4 relative z-10 min-h-[100px]">
                        {transcript && (
                            <p className="text-lg font-medium text-slate-700">"{transcript}"</p>
                        )}
                        {response && !isListening && (
                            <div className="bg-emerald-50 p-4 rounded-[15px] border border-emerald-100 inline-block">
                                <p className="text-emerald-800 font-medium">{response}</p>
                            </div>
                        )}
                        {!transcript && !response && (
                            <p className="text-slate-400 text-sm">Tap the microphone to start talking</p>
                        )}
                    </div>
                </div>

                {/* Conversation History */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Conversations</h3>
                        <button
                            onClick={() => setHistory([])}
                            className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                        >
                            Clear History
                        </button>
                    </div>

                    <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden max-h-[500px] overflow-y-auto no-scrollbar">
                        {history.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">
                                <i data-lucide="message-square" className="w-8 h-8 mx-auto mb-3 opacity-20"></i>
                                <p className="text-sm font-medium">No recent conversations</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {history.map((item) => (
                                    <div key={item.id} className="pt-5 pb-5 pl-5 pr-5 border-b border-b-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 mb-2">You: {item.queryText}</p>
                                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-[10px]">
                                            <span className="font-bold block text-[10px] uppercase text-emerald-600 mb-1">Advisor</span>
                                            <p className="text-sm font-medium text-emerald-800">{item.responseText}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
        </div>
    );
};

export default VoiceAdvisor;
