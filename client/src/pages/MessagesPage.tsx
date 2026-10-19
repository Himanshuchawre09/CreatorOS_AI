import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Search,
  ArrowLeft,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  api,
  ConversationItem,
  MessageItem,
} from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCollabId = searchParams.get('collaborationId');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollabId, setSelectedCollabId] = useState<string | null>(queryCollabId);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await api.getConversations();
      if (res.success && res.data) {
        setConversations(res.data);
      }
    } catch (err: any) {
      if (!quiet) toast.error(err.message || 'Failed to load conversations');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [toast]);

  const fetchMessages = useCallback(
    async (collabId: string, quiet = false) => {
      if (!quiet) setLoadingMessages(true);
      try {
        const res = await api.getMessages(collabId);
        if (res.success && res.data) {
          setMessages(res.data);
          // Also mark conversations unread count as 0 locally
          setConversations((prev) =>
            prev.map((c) =>
              c.collaborationId === collabId ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      } catch (err: any) {
        if (!quiet) toast.error(err.message || 'Failed to load messages');
      } finally {
        if (!quiet) setLoadingMessages(false);
      }
    },
    [toast]
  );

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Sync selectedCollabId with query param if it changes
  useEffect(() => {
    if (queryCollabId && queryCollabId !== selectedCollabId) {
      setSelectedCollabId(queryCollabId);
    }
  }, [queryCollabId]);

  // When selectedCollabId changes, load messages
  useEffect(() => {
    if (selectedCollabId) {
      fetchMessages(selectedCollabId);
      setSearchParams({ collaborationId: selectedCollabId });
    }
  }, [selectedCollabId, fetchMessages, setSearchParams]);

  // Polling every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchConversations(true);
      if (selectedCollabId) {
        fetchMessages(selectedCollabId, true);
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchConversations, fetchMessages, selectedCollabId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollabId || !inputText.trim() || sending) return;

    if (inputText.length > 1000) {
      toast.error('Message cannot exceed 1000 characters');
      return;
    }

    setSending(true);
    try {
      const res = await api.sendMessage(selectedCollabId, inputText.trim());
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!]);
        setInputText('');
        fetchConversations(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find(
    (c) => c.collaborationId === selectedCollabId
  );

  const filteredConversations = conversations.filter((c) => {
    const partnerName = c.partner?.name?.toLowerCase() || '';
    const campaignTitle = c.campaign?.title?.toLowerCase() || '';
    const q = searchFilter.toLowerCase();
    return partnerName.includes(q) || campaignTitle.includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Collaboration Messages
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1">
            Direct, real-time messaging thread for active partnerships and deliverables.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchConversations();
            if (selectedCollabId) fetchMessages(selectedCollabId);
          }}
          disabled={loading || loadingMessages}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading || loadingMessages ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm overflow-hidden flex h-[calc(100vh-210px)] min-h-[500px]">
        {/* Left Sidebar: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-surface-200 dark:border-surface-800 flex flex-col shrink-0 ${
            selectedCollabId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Bar */}
          <div className="p-3.5 border-b border-surface-200 dark:border-surface-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl pl-9 pr-3 py-2 text-xs text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800/60">
            {loading ? (
              <div className="p-6 text-center text-xs text-surface-400 animate-pulse">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                  {conversations.length === 0
                    ? 'No collaboration conversations'
                    : 'No matching conversations'}
                </p>
                <p className="text-[11px] text-surface-400 mt-1">
                  {conversations.length === 0
                    ? 'Threads appear automatically when collaboration requests are created or accepted.'
                    : 'Try clearing your search query.'}
                </p>
              </div>
            ) : (
              filteredConversations.map((collab) => {
                const isSelected = collab.collaborationId === selectedCollabId;
                const partnerName = collab.partner?.name || 'Partner';
                const hasUnread = collab.unreadCount > 0;

                return (
                  <button
                    key={collab.collaborationId}
                    onClick={() => setSelectedCollabId(collab.collaborationId)}
                    className={`w-full text-left p-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'bg-brand-50/60 dark:bg-brand-950/30 border-l-4 border-brand-500'
                        : ''
                    }`}
                  >
                    <Avatar name={partnerName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-xs font-bold truncate ${
                            hasUnread
                              ? 'text-surface-900 dark:text-surface-100 font-extrabold'
                              : 'text-surface-800 dark:text-surface-200'
                          }`}
                        >
                          {partnerName}
                        </span>
                        {collab.lastMessage && (
                          <span className="text-[10px] text-surface-400 shrink-0">
                            {new Date(collab.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      {collab.campaign?.title && (
                        <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium truncate mb-1">
                          {collab.campaign.title}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                          {collab.lastMessage
                            ? collab.lastMessage.content
                            : 'No messages yet'}
                        </p>
                        {hasUnread && (
                          <span className="min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-accent-500 rounded-full shrink-0">
                            {collab.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chat Pane */}
        <div
          className={`flex-1 flex flex-col bg-surface-50/40 dark:bg-surface-950/40 ${
            !selectedCollabId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedCollabId && activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 px-4 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedCollabId(null)}
                    className="md:hidden p-1.5 -ml-1 text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar
                    name={activeConversation.partner?.name || 'Partner'}
                    size="md"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-surface-900 dark:text-surface-100">
                      {activeConversation.partner?.name || 'Partner'}
                    </h3>
                    <p className="text-[11px] text-surface-500 dark:text-surface-400">
                      {activeConversation.campaign?.title || 'Collaboration Thread'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="neutral" className="text-[10px] capitalize">
                    {activeConversation.status}
                  </Badge>
                  <Link to="/contracts">
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs">
                      <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                      Contracts
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {loadingMessages ? (
                  <div className="p-8 text-center text-xs text-surface-400 animate-pulse">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-12 text-center max-w-sm mx-auto">
                    <MessageSquare className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                      No messages yet
                    </p>
                    <p className="text-[11px] text-surface-400 mt-1">
                      Start the collaboration dialogue by typing a message below.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe =
                      msg.sender?._id?.toString() === user?._id?.toString() ||
                      msg.sender?._id?.toString() === user?.id?.toString();

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-medium text-surface-500 dark:text-surface-400">
                            {isMe ? 'You' : msg.sender?.name || 'Partner'}
                          </span>
                          <span className="text-[10px] text-surface-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                            isMe
                              ? 'bg-brand-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 border border-surface-200 dark:border-surface-800 rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <div className="p-3 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800">
                <form onSubmit={handleSendMessage} className="space-y-1.5">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      maxLength={1000}
                      disabled={sending}
                      className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl pl-3.5 pr-20 py-2.5 text-xs text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <div className="absolute right-1.5 flex items-center gap-1">
                      <Button
                        type="submit"
                        size="sm"
                        variant="primary"
                        disabled={!inputText.trim() || sending}
                        className="h-8 px-3 text-xs"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Send
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1 text-[10px] text-surface-400">
                    <span>Press Enter to send</span>
                    <span className={inputText.length > 900 ? 'text-rose-500 font-semibold' : ''}>
                      {1000 - inputText.length} chars left
                    </span>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 mb-3">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
                Select a conversation
              </h3>
              <p className="text-xs text-surface-400 max-w-sm mt-1">
                Choose a collaboration partner from the list to view chat history and send messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
