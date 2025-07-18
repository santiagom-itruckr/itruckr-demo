import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Loader2 } from 'lucide-react';
import { Case } from '@/types/app';

type ProcessInputProps = {
  activeCase: Case | null;
  onSendMessage: (content: string) => void;
};

function ProcessInput({ activeCase, onSendMessage }: ProcessInputProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = async () => {
    if (!activeCase || !currentMessage.trim() || isLoading) return;
    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    setIsLoading(true);
    // Call the callback to send the message
    await onSendMessage(userMessage);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentMessage]);

  return (
    <div className="flex gap-2 w-full rounded-b-xl p-4 border-t border-gray-300">
      <Textarea
        ref={textareaRef}
        placeholder="Talk with the assistant"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        className="max-h-[120px] resize-none flex-1 border-gray-300 text-custom-text-primary"
        disabled={isLoading || !activeCase}
      />
      <Button
        onClick={handleSendMessage}
        className="h-10 w-10 p-0 bg-custom-primary-accent hover:bg-custom-primary-hover text-black"
        size="sm"
        disabled={!currentMessage.trim() || isLoading || !activeCase}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowUp className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

export default ProcessInput; 