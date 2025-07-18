import {
  Archive,
  Forward,
  Mail,
  Paperclip,
  Plus,
  RefreshCw,
  Reply,
  ReplyAll,
  Search,
  Send,
  Star,
  StarOff,
  Trash2,
  X,
} from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useEmailStore } from '@/stores/emailStore';
import { formatDate, formatTime, formatVerboseDate } from '@/stores/utils';
import { EmailAttachment } from '@/types/app';

import { Markdown } from '../ui/markdown';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';

function EmailMessage({
  email,
  isSelected,
  onClick,
}: {
  email: any;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { toggleStar } = useEmailStore();

  return (
    <div
      className={cn(
        'flex items-center gap-4 py-3 pr-4 pl-2 border-b border-custom-border border-l-4 border-l-transparent cursor-pointer hover:bg-gray-50 transition-colors',
        isSelected && 'bg-blue-50 border-l-blue-500'
      )}
      onClick={onClick}
    >
      <Button
        variant='ghost'
        size='sm'
        className='h-6 w-6 p-0'
        onClick={e => {
          e.stopPropagation();
          toggleStar(email.id);
        }}
      >
        {email.isStarred ? (
          <Star className='h-3 w-3 text-yellow-500 fill-current' />
        ) : (
          <StarOff className='h-3 w-3 text-custom-text-disabled' />
        )}
      </Button>

      <p className={cn(
        'flex items-center gap-2 basis-52 font-medium truncate',
        email.isRead ? 'text-absolute-gray-400' : 'text-absolute-black'
      )}>
        {email.sender.name}
        {email.hasAttachments && <Paperclip className='h-3 w-3' />}
      </p>

      <div
        className={cn(
          'flex-1 text-start truncate',
          email.isRead ? 'text-absolute-gray-400' : 'text-absolute-gray-800'
        )}
      >
        <span className='text-sm'>{email.subject}</span>
        {' - '}
        <span className='text-xs'>{email.preview}</span>
      </div>

      <span className='text-xs text-absolute-gray-400'>
        {formatVerboseDate(email.timestamp)}
      </span>
    </div>
  );
}

function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail,
}: {
  emails: any[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
}) {
  return (
    <div className='flex-1 overflow-y-auto'>
      {emails.map(email => (
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

function EmailDetailPanel({
  email,
  onClose,
}: {
  email: any;
  onClose: () => void;
}) {
  return (
    <div className='border-l border-custom-border flex flex-col bg-white'>
      {/* Header */}
      <div className='flex flex-col px-4 py-3 border-b border-custom-border'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='font-medium text-lg truncate'>{email.subject}</h3>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={email.sender.avatar} alt={email.sender.name} />
            <AvatarFallback className='bg-custom-primary-accent text-black'>
              {email.sender.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0 text-start'>
            <div className='font-medium text-gray-800'>{email.sender.name}</div>
            <div className='text-sm text-gray-600'>{email.sender.email}</div>
          </div>
          <div className='flex flex-col text-end text-xs text-gray-400'>
            <span>{formatDate(email.timestamp)}</span>
            <span>{formatTime(email.timestamp)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className='flex gap-1 mt-3'>
          <Button variant='ghost' size='sm'>
            <Reply className='h-4 w-4 mr-1' />
            Reply
          </Button>
          <Button variant='ghost' size='sm'>
            <ReplyAll className='h-4 w-4 mr-1' />
            Reply All
          </Button>
          <Button variant='ghost' size='sm'>
            <Forward className='h-4 w-4 mr-1' />
            Forward
          </Button>
          <Button variant='ghost' size='sm'>
            <Archive className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='sm'>
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Email content */}
      <div className='flex flex-col gap-2 flex-1 overflow-y-auto p-4'>
        <div className='text-sm text-start py-2'>
          <p>
            <strong>to:</strong> {email.recipients.join(', ')}
          </p>
          {email.cc && email.cc.length > 0 && (
            <p>
              <strong>cc:</strong> {email.cc.join(', ')}
            </p>
          )}
        </div>

        <Separator />

        {/* Content */}
        <Markdown className='flex-1 flex flex-col py-2 px-1 gap-0.5 text-start leading-relaxed break-words w-full'>
          {email.content}
        </Markdown>

        <Separator />

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <>
            <p className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
              {email.attachments.length} attachment
              {email.attachments.length > 1 ? 's' : ''}
            </p>

            <div className='flex flex-wrap gap-2'>
              {email.attachments.map((attachment: EmailAttachment) => {
                const isPDF = attachment.type === 'application/pdf';
                const isImage = attachment.type.startsWith('image/');

                return (
                  <a
                    href={attachment.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    key={attachment.url}
                    className='flex flex-col items-center gap-2 bg-white border border-gray-200 rounded p-2 hover:bg-gray-50 cursor-pointer group'
                  >
                    <div className='flex-shrink-0 w-full h-24 flex items-center justify-center'>
                      {isImage ? (
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className='w-full h-24 object-cover rounded'
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove(
                              'hidden'
                            );
                          }}
                        />
                      ) : isPDF ? (
                        <div className='w-full h-24 bg-red-600 rounded flex items-center justify-center'>
                          <span className='text-white text-xs font-bold'>
                            PDF
                          </span>
                        </div>
                      ) : (
                        <Paperclip className='h-4 w-4 text-gray-400' />
                      )}
                      {/* Fallback for images */}
                      {isImage && (
                        <Paperclip className='h-4 w-4 text-gray-400 hidden' />
                      )}
                    </div>

                    <div className='flex gap-2 text-sm p-2 text-gray-900 truncate max-w-40 overflow-hidden'>
                      {attachment.name}
                    </div>
                  </a>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ComposeEmail({
  isOpen,
  onClose,
  onSend,
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
    <div className='fixed inset-0 bg-black /50 flex items-center justify-center z-50'>
      <Card className='w-full max-w-2xl max-h-[80vh] flex flex-col'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='font-medium'>New Message</h3>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='flex-1 flex flex-col p-4 space-y-3'>
          <div className='space-y-2'>
            <Input
              placeholder='To'
              value={to}
              onChange={e => setTo(e.target.value)}
              className='border-0 border-b rounded-none focus:ring-0'
            />

            {!showCcBcc && (
              <Button
                variant='ghost'
                size='sm'
                className='text-xs h-6'
                onClick={() => setShowCcBcc(true)}
              >
                Cc/Bcc
              </Button>
            )}

            {showCcBcc && (
              <>
                <Input
                  placeholder='Cc'
                  value={cc}
                  onChange={e => setCc(e.target.value)}
                  className='border-0 border-b rounded-none focus:ring-0'
                />
                <Input
                  placeholder='Bcc'
                  value={bcc}
                  onChange={e => setBcc(e.target.value)}
                  className='border-0 border-b rounded-none focus:ring-0'
                />
              </>
            )}

            <Input
              placeholder='Subject'
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className='border-0 border-b rounded-none focus:ring-0'
            />
          </div>

          <Textarea
            placeholder='Compose your message...'
            value={content}
            onChange={e => setContent(e.target.value)}
            className='flex-1 min-h-[200px] resize-none border-0 focus:ring-0'
          />
        </div>

        <div className='flex items-center justify-between p-4 border-t'>
          <div className='flex gap-2'>
            <Button variant='ghost' size='sm'>
              <Paperclip className='h-4 w-4' />
            </Button>
          </div>
          <div className='flex gap-2'>
            <Button variant='ghost' onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              className='bg-custom-primary-accent hover:bg-custom-primary-hover text-black'
            >
              <Send className='h-4 w-4 mr-2' />
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
    refreshEmails,
  } = useEmailStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedEmailId, setSelectedEmailId] = React.useState<string | null>(
    null
  );
  const [isComposeOpen, setIsComposeOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const filteredEmails = React.useMemo(() => {
    let filtered = emails.filter(email => {
      if (selectedFolder === 'inbox')
        return !email.isArchived && !email.isDeleted && !email.isSent;
      if (selectedFolder === 'starred')
        return email.isStarred && !email.isDeleted;
      if (selectedFolder === 'sent') return email.isSent && !email.isDeleted;
      if (selectedFolder === 'drafts') return email.isDraft;
      if (selectedFolder === 'archive') return email.isArchived;
      if (selectedFolder === 'trash') return email.isDeleted;
      return true;
    });

    if (searchTerm) {
      filtered = filtered.filter(
        email =>
          email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [emails, selectedFolder, searchTerm]);

  const selectedEmail = selectedEmailId
    ? emails.find(e => e.id === selectedEmailId)
    : null;

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

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolder(folderId);
    setSelectedEmailId(null);
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
      if (folder === 'inbox')
        return !email.isRead && !email.isArchived && !email.isDeleted && !email.isSent;
      if (folder === 'starred')
        return !email.isRead && email.isStarred && !email.isDeleted && !email.isSent;
      if (folder === 'sent')
        return !email.isRead && email.isSent && !email.isDeleted;
      return false;
    }).length;
  };

  return (
    <Card
      className={cn(
        'grid grid-cols-1 grid-rows-1 h-full w-full overflow-hidden',
        !selectedEmail
          ? 'lg:grid-cols-[auto_1fr]'
          : 'lg:grid-cols-[auto_1fr_1fr]'
      )}
    >
      {/* Sidebar */}
      <div className='w-80 border-r border-custom-border flex flex-col'>
        {/* Header */}
        <div className='flex flex-col gap-3 p-4 border-b border-custom-border'>
          <Button
            className='flex gap-2 w-full bg-absolute-black hover:bg-absolute-black-hover text-white'
            size='sm'
            onClick={() => setIsComposeOpen(true)}
          >
            <Plus className='h-4 w-4' />
            <span>Compose Email</span>
          </Button>

          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-custom-text-disabled' />
            <Input
              placeholder='Search emails...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 bg-custom-background border-custom-border text-custom-text-primary'
            />
          </div>
        </div>

        {/* Folders */}
        <div className='flex-1 overflow-y-auto'>
          {folders.map(folder => {
            const unreadCount = getUnreadCount(folder.id);
            return (
              <div
                key={folder.id}
                className={cn(
                  'flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 border-l-4 border-l-transparent',
                  selectedFolder === folder.id &&
                  'bg-green-accent/50 border-l-green-accent'
                )}
                onClick={() => handleSelectFolder(folder.id)}
              >
                <div className='flex items-center gap-3'>
                  <folder.icon className='h-4 w-4' />
                  <span
                    className={cn(
                      'font-medium',
                      selectedFolder === folder.id
                        ? 'text-black'
                        : 'text-custom-text-primary'
                    )}
                  >
                    {folder.name}
                  </span>
                </div>
                {unreadCount > 0 && (
                  <Badge className='bg-green-500 text-white text-xs min-w-[20px] h-5'>
                    {unreadCount}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Email List Area */}
      <div className='flex flex-col overflow-hidden'>
        {/* Email Header */}
        <div className='px-4 py-3 border-b border-custom-border'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <h2 className='font-medium text-custom-text-primary capitalize'>
                {selectedFolder}
              </h2>
              <span className='text-sm text-custom-text-secondary'>
                ({filteredEmails.length})
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
                />
              </Button>

              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className='flex items-center gap-2'>
                        <folder.icon className='h-4 w-4' />
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
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <Mail className='h-12 w-12 text-custom-text-disabled mx-auto mb-4' />
              <p className='text-custom-text-secondary'>
                {searchTerm
                  ? 'No emails found matching your search.'
                  : 'No emails in this folder.'}
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
