import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../services/api';
import { 
  Send, 
  Loader2, 
  MessageCircle, 
  Trash2, 
  Bot,
  User
} from 'lucide-react';
import type { ChatMessage } from '../types';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取聊天历史
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await chatApi.getHistory(1, 50);
        if (response.success && response.data) {
          setMessages(response.data.messages);
        }
      } catch (err) {
        console.error('获取聊天历史失败:', err);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // 添加用户消息
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      content: userMessage,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(userMessage);
      if (response.success && response.data) {
        // 添加AI回复
        const newAiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data.reply,
          role: 'assistant',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newAiMessage]);
      }
    } catch (err) {
      console.error('发送消息失败:', err);
      // 添加错误消息
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: '道友见谅，贫道一时感悟太深，未能及时回应。请稍后再试。',
        role: 'assistant',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('确定要清空所有聊天记录吗？')) return;
    
    try {
      await chatApi.clearHistory();
      setMessages([]);
    } catch (err) {
      console.error('清空历史失败:', err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-xiu-dark via-xiu-navy to-xiu-dark">
      <div className="max-w-4xl mx-auto h-[calc(100vh-7rem)]">
        {/* 聊天容器 */}
        <div className="xiu-card rounded-2xl h-full flex flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b border-xiu-gold/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-xiu-cyan to-blue-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">AI道友</div>
                <div className="text-xs text-green-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  <span>在线</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearHistory}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="清空聊天记录"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isHistoryLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-xiu-gold" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-xiu-gold/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-xiu-gold" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">开始问道</h3>
                <p className="text-gray-400 max-w-sm mb-6">
                  向AI道友请教修炼之法，探索天地奥秘
                </p>
                <div className="space-y-2">
                  {['如何提升修炼效率？', '五行相生相克是什么？', '什么是五运六气？'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-400 hover:text-xiu-gold hover:bg-xiu-gold/10 rounded-lg transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] flex space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    {/* 头像 */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-xiu-gold/20'
                          : 'bg-gradient-to-br from-xiu-cyan to-blue-500'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-xiu-gold" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* 消息内容 */}
                    <div className="space-y-1">
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-xiu-gold text-xiu-dark'
                            : 'bg-xiu-dark/50 border border-xiu-gold/20 text-gray-200'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                      </div>
                      <div
                        className={`text-xs text-gray-500 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-xiu-cyan to-blue-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-xiu-dark/50 border border-xiu-gold/20">
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 rounded-full bg-xiu-gold animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-xiu-gold animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 rounded-full bg-xiu-gold animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="p-4 border-t border-xiu-gold/20">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="向AI道友请教..."
                  rows={1}
                  className="xiu-input resize-none min-h-[44px] max-h-32"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-xiu-gold to-xiu-goldLight text-xiu-dark rounded-lg hover:shadow-gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 text-center">
              AI道友的回复仅供参考，修炼之路需自行体悟
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
