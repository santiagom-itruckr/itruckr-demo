import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Star,
  StarOff,
  Paperclip,
  Send,
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Trash2,
  Mail,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Markdown } from '@/components/ui/markdown';
import { useEmailStore } from '@/stores/emailStore';
import React from 'react';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { emailTemplate } from '@/constants';

// Email message component (simplified for list view)
function EmailMessage({
  email,
  isSelected,
  onClick
}: {
  email: any;
  isSelected: boolean;
  onClick: () => void;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 py-2 pr-4 pl-2 border-b border-custom-border border-l-4 border-l-transparent cursor-pointer hover:bg-gray-50 transition-colors",
        isSelected && "bg-blue-50 border-l-blue-500"
      )}
      onClick={onClick}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={(e) => {
          e.stopPropagation();
          // Toggle star
        }}
      >
        {email.isStarred ? (
          <Star className="h-3 w-3 text-yellow-500 fill-current" />
        ) : (
          <StarOff className="h-3 w-3 text-custom-text-disabled" />
        )}
      </Button>

      <p className="flex items-center gap-2 basis-32 font-medium truncate">
        {email.sender.name}
        {email.hasAttachments && (
          <Paperclip className="h-3 w-3" />
        )}
      </p>

      <div className={cn(
        "flex-1 text-start truncate",
        email.isRead ? "text-absolute-gray-600" : "text-absolute-gray-700"
      )}>
        <span className="text-sm">{email.subject}</span>
        {' - '}
        <span className="text-xs">{email.preview}</span>
      </div>

      <span className="text-xs text-absolute-gray-400">
        {formatDate(email.timestamp)}
      </span>
    </div>
  );
}

// Email list component
function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail
}: {
  emails: any[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {emails.map((email) => (
        <EmailMessage
          key={email.id}
          email={email}
          isSelected={selectedEmailId === email.id}
          onClick={() => onSelectEmail(email.id)}
        />
      ))}
    </div>
  );
}

// Email detail panel
function EmailDetailPanel({
  email,
  onClose
}: {
  email: any;
  onClose: () => void;
}) {
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="border-l border-custom-border flex flex-col bg-white">
      {/* Header */}
      <div className="flex flex-col px-4 py-3 border-b border-custom-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-lg truncate">{email.subject}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={email.sender.avatar} alt={email.sender.name} />
            <AvatarFallback className="bg-custom-primary-accent text-black">
              {email.sender.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-custom-text-primary">
              {email.sender.name}
            </div>
            <div className="text-sm text-custom-text-secondary">
              {email.sender.email}
            </div>
            <div className="text-xs text-custom-text-disabled">
              {formatFullDate(email.timestamp)}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1 mt-3">
          <Button variant="ghost" size="sm">
            <Reply className="h-4 w-4 mr-1" />
            Reply
          </Button>
          <Button variant="ghost" size="sm">
            <ReplyAll className="h-4 w-4 mr-1" />
            Reply All
          </Button>
          <Button variant="ghost" size="sm">
            <Forward className="h-4 w-4 mr-1" />
            Forward
          </Button>
          <Button variant="ghost" size="sm">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Recipients */}
          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">To:</span> {email.recipients.join(', ')}
            </div>
            {email.cc && email.cc.length > 0 && (
              <div>
                <span className="font-medium">Cc:</span> {email.cc.join(', ')}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="border-t pt-4" dangerouslySetInnerHTML={{ __html: email.content }}></div>

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Attachments:</p>
              <div className="space-y-2">
                {email.attachments.map((attachment: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2 border text-sm"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span className="flex-1">{attachment.name}</span>
                    <span className="text-xs text-custom-text-disabled">
                      ({attachment.size})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compose email modal/panel
function ComposeEmail({
  isOpen,
  onClose,
  onSend
}: {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: any) => void;
}) {
  const [to, setTo] = React.useState('');
  const [cc, setCc] = React.useState('');
  const [bcc, setBcc] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [content, setContent] = React.useState('');
  const [showCcBcc, setShowCcBcc] = React.useState(false);

  const handleSend = () => {
    if (to.trim() && subject.trim() && content.trim()) {
      onSend({
        to: to.split(',').map(email => email.trim()),
        cc: cc ? cc.split(',').map(email => email.trim()) : [],
        bcc: bcc ? bcc.split(',').map(email => email.trim()) : [],
        subject: subject.trim(),
        content: content.trim(),
      });

      // Reset form
      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
      setContent('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">New Message</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col p-4 space-y-3">
          <div className="space-y-2">
            <Input
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border-0 border-b rounded-none focus:ring-0"
            />

            {!showCcBcc && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6"
                onClick={() => setShowCcBcc(true)}
              >
                Cc/Bcc
              </Button>
            )}

            {showCcBcc && (
              <>
                <Input
                  placeholder="Cc"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="border-0 border-b rounded-none focus:ring-0"
                />
                <Input
                  placeholder="Bcc"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="border-0 border-b rounded-none focus:ring-0"
                />
              </>
            )}

            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border-0 border-b rounded-none focus:ring-0"
            />
          </div>

          <Textarea
            placeholder="Compose your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[200px] resize-none border-0 focus:ring-0"
          />
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} className="bg-custom-primary-accent hover:bg-custom-primary-hover text-black">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function Email() {
  const {
    emails,
    folders,
    selectedFolder,
    setSelectedFolder,
    addEmail,
    markAsRead,
    refreshEmails
  } = useEmailStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedEmailId, setSelectedEmailId] = React.useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const filteredEmails = React.useMemo(() => {
    let filtered = emails.filter(email => {
      if (selectedFolder === 'inbox') return !email.isArchived && !email.isDeleted;
      if (selectedFolder === 'starred') return email.isStarred && !email.isDeleted;
      if (selectedFolder === 'sent') return email.isSent;
      if (selectedFolder === 'drafts') return email.isDraft;
      if (selectedFolder === 'archive') return email.isArchived;
      if (selectedFolder === 'trash') return email.isDeleted;
      return true;
    });

    if (searchTerm) {
      filtered = filtered.filter(email =>
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [emails, selectedFolder, searchTerm]);

  const selectedEmail = selectedEmailId ? emails.find(e => e.id === selectedEmailId) : null;

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmailId(emailId);
    // Mark as read when selected
    const email = emails.find(e => e.id === emailId);
    if (email && !email.isRead) {
      markAsRead(emailId);
    }
  };

  const handleCloseEmailDetail = () => {
    setSelectedEmailId(null);
  };

  const handleSendEmail = async (emailData: any) => {
    try {
      // await gmailAPI.sendEmail(emailData);
      addEmail({
        subject: emailData.subject,
        content: emailData.content,
        sender: { name: 'You', email: 'you@example.com' },
        recipients: emailData.to,
        cc: emailData.cc || [],
        bcc: emailData.bcc || [],
        isRead: true,
        isSent: true,
        isStarred: false,
        isArchived: false,
        isDeleted: false,
        isDraft: false,
        hasAttachments: false,
        attachments: [],
        preview: emailData.content.substring(0, 100) + '...',
        threadId: '', // or generate a threadId if needed
        labels: [],
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshEmails();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getUnreadCount = (folder: string) => {
    return emails.filter(email => {
      if (folder === 'inbox') return !email.isRead && !email.isArchived && !email.isDeleted;
      if (folder === 'starred') return !email.isRead && email.isStarred && !email.isDeleted;
      return false;
    }).length;
  };

  return (
    <Card className={cn(
      "grid grid-cols-1 grid-rows-1 h-full w-full overflow-hidden",
      !selectedEmail ? "lg:grid-cols-[auto_1fr]" : "lg:grid-cols-[auto_1fr_1fr]"
    )}>
      {/* Sidebar */}
      <div className="w-80 border-r border-custom-border flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-3 p-4 border-b border-custom-border">
          <Button
            className="flex gap-2 w-full bg-absolute-black hover:bg-absolute-black-hover text-white"
            size="sm"
            onClick={() => setIsComposeOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Compose Email</span>
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-custom-text-disabled" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-custom-background border-custom-border text-custom-text-primary"
            />
          </div>
        </div>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto">
          {folders.map((folder) => {
            const unreadCount = getUnreadCount(folder.id);
            return (
              <div
                key={folder.id}
                className={cn(
                  "flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 border-l-4 border-l-transparent",
                  selectedFolder === folder.id && "bg-green-accent/50 border-l-green-accent"
                )}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <div className="flex items-center gap-3">
                  <folder.icon className="h-4 w-4" />
                  <span className={cn(
                    "font-medium",
                    selectedFolder === folder.id ? "text-black" : "text-custom-text-primary"
                  )}>
                    {folder.name}
                  </span>
                </div>
                {unreadCount > 0 && (
                  <Badge className="bg-green-500 text-white text-xs min-w-[20px] h-5">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Email List Area */}
      <div className="flex flex-col overflow-hidden">
        {/* Email Header */}
        <div className="px-4 py-3 border-b border-custom-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-medium text-custom-text-primary capitalize">
                {selectedFolder}
              </h2>
              <span className="text-sm text-custom-text-secondary">
                ({filteredEmails.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>

              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <folder.icon className="h-4 w-4" />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Email List */}
        {filteredEmails.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Mail className="h-12 w-12 text-custom-text-disabled mx-auto mb-4" />
              <p className="text-custom-text-secondary">
                {searchTerm ? 'No emails found matching your search.' : 'No emails in this folder.'}
              </p>
            </div>
          </div>
        ) : (
          <EmailList
            emails={filteredEmails}
            selectedEmailId={selectedEmailId}
            onSelectEmail={handleSelectEmail}
          />
        )}
      </div>

      {/* Email Detail Panel */}
      {selectedEmail && (
        <EmailDetailPanel
          email={selectedEmail}
          onClose={handleCloseEmailDetail}
        />
      )}

      {/* Compose Modal */}
      <ComposeEmail
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendEmail}
      />
    </Card>
  );
}