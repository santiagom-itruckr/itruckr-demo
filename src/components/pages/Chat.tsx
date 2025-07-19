import { ArrowUp, Bot, Search, User } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Markdown } from '@/components/ui/markdown';
import { cn } from '@/lib/utils';
import { useConversationsStore } from '@/stores/conversationsStore';
import { useDriversStore } from '@/stores/driversStore';
import { MessageSenderType } from '@/types/app';

import { formatVerboseDate } from '../../stores/utils';
import { Textarea } from '../ui/textarea';

function ChatMessageBubble({
  message,
  senderName,
  senderType,
  senderId,
  currentUserId,
}: {
  message: any;
  senderName: string;
  senderType: MessageSenderType;
  senderId: string | number;
  currentUserId: string | number;
}) {
  // Determine if this is the current user's message
  const isMe =
    senderType === 'me' || senderId === currentUserId || senderId === 'me';

  // Determine icon type and styling
  const getMessageStyle = () => {
    if (isMe) {
      return {
        alignment: 'right',
        iconType: 'user' as const,
        bubbleClass: 'py-2 bg-absolute-black text-white rounded-tr-sm',
        iconClass: 'bg-absolute-black text-green-accent',
      };
    } else if (senderType === 'ai_agent') {
      return {
        alignment: 'left',
        iconType: 'bot' as const,
        bubbleClass:
          'py-3 bg-transparent border border-green-accent text-gray-800 rounded-tl-sm',
        iconClass: 'bg-green-accent text-absolute-black',
      };
    } else {
      // senderType === 'user' (other users)
      return {
        alignment: 'left',
        iconType: 'user' as const,
        bubbleClass:
          'py-3 bg-blue-50 border border-blue-200 text-gray-800 rounded-tl-sm',
        iconClass: 'bg-blue-500 text-white',
      };
    }
  };

  const messageStyle = getMessageStyle();

  const handleContentRender = () => {
    switch (message.content) {
      case 'POD':
        return (
          <img
            src='/POD.jpeg'
            alt='POD'
            className='max-w-xs rounded-sm mb-2'
          />
        );

      case 'Invoice':
        return (
          <img
            src='/Invoice.jpeg'
            alt='Invoice'
            className='max-w-xs rounded-sm mb-2'
          />
        );

      default:
        return (
          <Markdown className='flex flex-col gap-2 text-start leading-relaxed break-words w-full'>
            {message.content}
          </Markdown>
        );
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-1 animate-in slide-in-from-bottom-2 duration-300',
        messageStyle.alignment === 'right' ? 'items-end' : 'items-start'
      )}
    >
      {/* Sender name */}
      <div
        className={cn(
          'flex items-center gap-2 text-xs font-medium text-gray-600',
          messageStyle.alignment === 'right' ? 'flex-row-reverse' : ''
        )}
      >
        <div
          className={cn(
            'p-1 rounded-full transition-all duration-200',
            messageStyle.iconClass
          )}
        >
          {messageStyle.iconType === 'bot' ? (
            <Bot className='w-4 h-4' />
          ) : (
            <User className='w-4 h-4' />
          )}
        </div>
        <span className='text-absolute-black'>{senderName}</span>
      </div>

      {/* Chat bubble */}
      <div
        className={cn(
          'relative flex flex-col items-end max-w-[85%] rounded-xl px-3 gap-1 text-sm shadow-sm transition-all duration-200 hover:shadow-md',
          messageStyle.bubbleClass
        )}
      >
        {handleContentRender()}
        <span
          className={cn(
            'text-[10px] leading-none block text-gray-400',
            messageStyle.alignment === 'right' ? 'self-start' : ''
          )}
        >
          {formatVerboseDate(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function ChatMessagesList({
  messages,
  currentUserId,
  contactName,
}: {
  messages: any[];
  currentUserId: string | number;
  contactName: string;
}) {
  const { getDriverById } = useDriversStore();

  return (
    <div className='flex flex-col flex-1 gap-3 p-4 overflow-y-auto'>
      {messages.map((message, index) => {
        let senderName = contactName;

        // Determine sender name
        if (message.senderType === 'ai_agent') {
          senderName = 'General Assistant';
        } else if (
          message.senderId === currentUserId ||
          message.senderId === 'me'
        ) {
          senderName = 'You';
        } else if (message.senderType === 'user') {
          const driver = getDriverById(message.senderId);
          senderName = driver ? driver.name : contactName;
        }

        return (
          <div
            key={message.id}
            className='animate-in slide-in-from-bottom-1 duration-300'
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ChatMessageBubble
              message={message}
              senderName={senderName}
              senderType={message.senderType}
              senderId={message.senderId}
              currentUserId={currentUserId}
            />
          </div>
        );
      })}
    </div>
  );
}

export function Chat() {
  const { conversations, addMessageToConversation, addConversation } =
    useConversationsStore();
  const { getDriverById } = useDriversStore();

  // Build contacts from conversations + driver info
  const contacts = React.useMemo(() => {
    return conversations
      .map(conv => {
        const driver = getDriverById(conv.driverId);
        if (!driver) return null;
        return {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          avatar: '', // No avatar field, fallback to empty string or generate if needed
          online:
            driver.status === 'in_transit' || driver.status === 'available',
          lastMessage:
            conv.messages.length > 0
              ? conv.messages[conv.messages.length - 1]!.content
              : '',
          timestamp:
            conv.messages.length > 0
              ? conv.messages[conv.messages.length - 1]!.timestamp
              : '',
          unread: 0, // You can implement unread logic if needed
          conversationId: conv.id,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [conversations, getDriverById]);

  const [selectedContact, setSelectedContact] = React.useState(
    contacts[0] ?? null
  );
  const [messageText, setMessageText] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    // If contacts change, keep selectedContact in sync
    if (
      contacts.length > 0 &&
      (!selectedContact || !contacts.find(c => c.id === selectedContact.id))
    ) {
      setSelectedContact(contacts[0] ?? null);
    } else if (contacts.length === 0 && selectedContact) {
      setSelectedContact(null);
    }
  }, [contacts, selectedContact]);
  const selectedConversation = React.useMemo(() => {
    if (!selectedContact) return null;
    const conv = conversations.find(
      conv => String(conv.driverId) === String(selectedContact.id)
    );
    return conv || addConversation(String(selectedContact.id));
  }, [conversations, selectedContact, addConversation]);

  const filteredContacts = contacts
    .filter(
      contact =>
        contact &&
        (contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.phone.includes(searchTerm))
    )
    .sort((a, b) => {
      // Sort by timestamp in descending order (most recent first)
      // Handle cases where timestamp might be empty
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversation) {
      addMessageToConversation(selectedConversation.id, {
        senderId: 'me',
        senderType: 'user',
        content: messageText.trim(),
      });
      setMessageText('');
    }
  };

  return (
    <Card className='grid grid-cols-1 grid-rows-1 lg:grid-cols-[auto_1fr] h-full w-full overflow-hidden'>
      <div className='w-80 border-r border-custom-border flex flex-col'>
        {/* Header */}
        <div className='p-4 border-b border-custom-border'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-custom-text-disabled' />
          <Input
            placeholder='Search conversations...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10 bg-custom-background border-custom-border text-custom-text-primary'
          />
        </div>

        <div className='flex flex-col overflow-y-auto'>
          {filteredContacts.map(contact =>
            contact ? (
              <div
                key={contact.id}
                className={cn(
                  'group flex gap-4 py-4 px-5 border-b border-x-4 border-x-transparent cursor-pointer',
                  selectedContact && selectedContact.id === contact.id
                    ? 'border-l-green-accent bg-green-accent/50'
                    : ''
                )}
                onClick={() => setSelectedContact(contact)}
              >
                <div className='relative'>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback className='bg-custom-primary-accent text-black'>
                      {contact.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  {contact.online && (
                    <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-custom-surface' />
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <h3
                      className={`font-medium truncate ${selectedContact && selectedContact.id === contact.id
                        ? 'text-black'
                        : 'text-custom-text-primary'
                        }`}
                    >
                      {contact.name}
                    </h3>
                    <span
                      className={`text-xs ${selectedContact && selectedContact.id === contact.id
                        ? 'text-black opacity-70'
                        : 'text-custom-text-secondary'
                        }`}
                    >
                      {formatVerboseDate(contact.timestamp)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <p
                      className={`text-sm truncate ${selectedContact && selectedContact.id === contact.id
                        ? 'text-black opacity-70'
                        : 'text-custom-text-secondary'
                        }`}
                    >
                      {contact.lastMessage}
                    </p>
                    {contact.unread > 0 && (
                      <Badge className='bg-green-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center'>
                        {contact.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className='flex flex-col flex-1'>
        {/* Chat Header */}
        <div className='px-4 py-3 border-b border-custom-border'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <Avatar className='h-10 w-10'>
                <AvatarImage
                  src={selectedContact?.avatar}
                  alt={selectedContact?.name}
                />
                <AvatarFallback className='bg-custom-primary-accent text-black'>
                  {selectedContact?.name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              {selectedContact?.online && (
                <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-custom-surface' />
              )}
            </div>
            <div>
              <h3 className='font-medium text-custom-text-primary'>
                {selectedContact?.name}
              </h3>
              <p className='text-sm text-custom-text-secondary'>
                {selectedContact?.online ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>
        </div>

        <ChatMessagesList
          messages={selectedConversation ? selectedConversation.messages : []}
          currentUserId={'me'}
          contactName={selectedContact?.name || ''}
        />

        {/* Message Input */}
        <div className='flex gap-2 w-full rounded-b-xl p-4 border-t border-gray-300'>
          <Textarea
            placeholder='Type here...'
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            className='max-h-[120px] resize-none flex-1 border-gray-300 text-custom-text-primary'
          />
          <Button
            onClick={handleSendMessage}
            className='h-10 w-10 p-0 bg-custom-primary-accent hover:bg-custom-primary-hover text-black'
            size='sm'
          >
            <ArrowUp className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </Card>
  );
}
