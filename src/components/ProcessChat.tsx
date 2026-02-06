'use client';

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AnalysisResult } from '@/lib/types';
import {
  saveChatMessage,
  getChatHistory,
  saveVersion,
  saveProcess,
  type ChatMessage,
} from '@/lib/versionDb';

interface ProcessChatProps {
  process: AnalysisResult;
  onProcessUpdate: (updated: AnalysisResult) => void;
}

export interface ProcessChatRef {
  openWithMessage: (msg: string) => void;
}

interface PendingOption {
  name: string;
  description: string;
  improvement: string;
  steps: Array<{
    id: string;
    label: string;
    type: string;
    connections: string[];
    description?: string;
  }>;
}

interface LocalChat {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  hasUpdate?: boolean;
  timestamp: string;
  pendingOption?: PendingOption;
}

const ProcessChat = forwardRef<ProcessChatRef, ProcessChatProps>(function ProcessChat({ process, onProcessUpdate }, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<LocalChat[]>([]);
  const [sending, setSending] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    openWithMessage: (msg: string) => {
      setIsOpen(true);
      setMessage(msg);
    },
  }));

  // Load chat history on mount
  useEffect(() => {
    getChatHistory(process.id).then((history) => {
      setChatHistory(history);
      const localChats: LocalChat[] = [];
      for (const h of history) {
        localChats.push({
          id: h.id + '_user',
          role: 'user',
          content: h.userMessage,
          timestamp: h.createdAt,
        });
        localChats.push({
          id: h.id + '_ai',
          role: 'assistant',
          content: h.aiResponse.reply,
          hasUpdate: h.aiResponse.hasProcessUpdate,
          timestamp: h.createdAt,
        });
      }
      setChats(localChats);
    });
  }, [process.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats]);

  const sendMessage = async () => {
    if (!message.trim() || sending) return;

    const userMsg = message.trim();
    setMessage('');
    setSending(true);

    const userChat: LocalChat = {
      id: uuidv4(),
      role: 'user',
      content: userMsg,
      timestamp: new Date().toISOString(),
    };
    setChats((prev) => [...prev, userChat]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          analysisContext: process,
          chatHistory: chatHistory.map((h) => ({
            userMessage: h.userMessage,
            aiResponse: h.aiResponse,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Chat failed');
      }

      const aiResponse = await res.json();

      const aiChat: LocalChat = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse.reply,
        hasUpdate: aiResponse.hasProcessUpdate,
        timestamp: new Date().toISOString(),
      };
      setChats((prev) => [...prev, aiChat]);

      // Save to IndexedDB
      const chatMsg: ChatMessage = {
        id: uuidv4(),
        processId: process.id,
        userMessage: userMsg,
        aiResponse,
        createdAt: new Date().toISOString(),
      };
      await saveChatMessage(chatMsg);
      setChatHistory((prev) => [...prev, chatMsg]);

      // If there's a process update, allow the user to apply it
      if (aiResponse.hasProcessUpdate && aiResponse.updatedOption) {
        setChats((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last) {
            last.pendingOption = aiResponse.updatedOption;
          }
          return updated;
        });
      }
    } catch (err) {
      const errChat: LocalChat = {
        id: uuidv4(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Something went wrong. Please try again.'}`,
        timestamp: new Date().toISOString(),
      };
      setChats((prev) => [...prev, errChat]);
    } finally {
      setSending(false);
    }
  };

  const applyUpdate = async (chatItem: LocalChat) => {
    if (!chatItem.pendingOption) return;

    // Save current version before modifying
    await saveVersion(process.id, process, `Before: ${chatItem.pendingOption.name}`);

    const updated: AnalysisResult = {
      ...process,
      options: [
        ...process.options,
        {
          name: chatItem.pendingOption.name,
          description: chatItem.pendingOption.description,
          improvement: chatItem.pendingOption.improvement,
          steps: chatItem.pendingOption.steps.map((s) => ({
            ...s,
            type: s.type as 'start' | 'process' | 'decision' | 'handoff' | 'bottleneck' | 'end',
          })),
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    await saveProcess(updated);
    onProcessUpdate(updated);

    // Remove pendingOption
    setChats((prev) => prev.map((c) => {
      if (c.id === chatItem.id) {
        return {
          ...c,
          pendingOption: undefined,
          content: c.content + '\n\n✅ Applied to process map!',
        };
      }
      return c;
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition-all hover:scale-105 flex items-center justify-center"
          title="AI Chat"
          aria-label="Open AI Chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {chats.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
              {Math.floor(chats.length / 2)}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden bottom-0 right-0 w-full h-full sm:bottom-6 sm:right-6 sm:w-[400px] sm:max-w-[calc(100vw-3rem)] sm:h-[560px] sm:max-h-[calc(100vh-6rem)] sm:rounded-2xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-brand-50 dark:bg-brand-950/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">AI Process Chat</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ask follow-up questions</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {chats.length === 0 && (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">💬</div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ask questions about your process analysis
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    'What if we automated the compliance step?',
                    'Can we add a parallel approval workflow?',
                    'How would adding a client portal change things?',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setMessage(suggestion);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                    >
                      &ldquo;{suggestion}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    chat.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md'
                  }`}
                >
                  {chat.content}
                  {chat.role === 'assistant' && chat.hasUpdate && chat.pendingOption && (
                    <button
                      onClick={() => applyUpdate(chat)}
                      className="mt-2 w-full px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Apply to Map
                    </button>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this process..."
                rows={1}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none text-sm"
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                aria-label="Send message"
                className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ProcessChat;
