import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bot,
  CheckCheck,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AiAgentRole, ProcessStep, ProcessStepStatus } from '@/types/app';
import { Separator } from '../ui/separator';
import { Markdown } from '../ui/markdown';

interface IntegratedProcessTimelineProps {
  process: any;
  onCompleteStep: () => void;
  isLoading: boolean;
  onTimelineCompleteStepReady?: (completeStepFn: () => void) => void;
}

interface StepHeaderProps {
  step: ProcessStep;
  index: number;
  status: ProcessStepStatus;
  isExpanded: boolean;
  onToggle: () => void;
  isFetching: boolean;
}

interface StepMessagesProps {
  step: ProcessStep;
}

interface StepActionsProps {
  step: ProcessStep;
  onCompleteStep: () => void;
}

interface MessageBubbleProps {
  message: any;
  senderName: string;
  isUser: boolean;
}

function StepHeader({
  step,
  index,
  status,
  isExpanded,
  onToggle,
  isFetching = false
}: StepHeaderProps & { isFetching?: boolean }) {
  const isActive = status === 'in_progress';
  const isCompleted = status === 'completed';
  const isPending = status === 'pending';

  return (
    <>
      {/* Timeline connector line */}
      {index !== 0 && (
        <div
          className={cn(
            'absolute left-8 -top-8 w-0.5 h-8 -z-1 transition-colors duration-300',
            isCompleted ? 'bg-gray-300' : 'bg-absolute-black'
          )}
        />
      )}

      {/* Step number/icon circle */}
      <div
        className={cn(
          'flex items-center justify-center absolute rounded-full h-8 w-8 -top-4 left-4 transition-all duration-300',
          isCompleted
            ? 'bg-gray-300 text-absolute-black shadow-sm'
            : 'bg-absolute-black text-green-accent shadow-md'
        )}
      >
        {isCompleted ? (
          <CheckCheck className="w-4 h-4" />
        ) : step.lucideIcon ? (
          React.createElement(step.lucideIcon, { className: 'w-4 h-4' })
        ) : (
          <span className="text-xs font-bold">{index + 1}</span>
        )}
      </div>

      {/* Step Header Content */}
      <div
        className="flex items-center justify-between cursor-pointer group rounded-lg transition-colors duration-200"
        onClick={onToggle}
      >
        <span className="text-xs text-start text-custom-text-secondary bg-gray-100 px-2 py-1 rounded-md transition-colors duration-200 group-hover:bg-gray-200 whitespace-nowrap">
          {new Date(step.startedAt).toLocaleDateString()}
          <br />
          {new Date(step.startedAt).toLocaleTimeString()}
        </span>

        <h4
          className={cn(
            'font-semibold text-lg leading-tight transition-colors duration-200 flex-1',
            isPending
              ? 'text-custom-text-disabled'
              : 'text-custom-text-primary group-hover:text-absolute-black'
          )}
        >
          {step.title}
        </h4>

        <div className="flex gap-4 items-center transition-transform duration-200 ease-in-out">
          {isFetching && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-xs text-blue-600 font-medium">Working...</span>
            </div>
          )}

          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          )}
        </div>
      </div>


      {/* Expanded Content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-3 flex flex-col gap-4">
          <p
            className={cn(
              'text-sm text-start leading-relaxed transition-colors duration-200',
              isPending
                ? 'text-custom-text-disabled'
                : 'text-custom-text-secondary'
            )}
          >
            {step.description}
          </p>

          {/* Step Status Badge */}
          <div className="flex items-center">
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
                isCompleted
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : isActive
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
              )}
            >
              {isCompleted
                ? 'Completed'
                : isActive
                  ? 'In Progress'
                  : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function MessageBubble({ message, senderName, isUser }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 animate-in slide-in-from-bottom-2 duration-300',
        isUser ? 'items-end' : 'items-start'
      )}
    >
      {/* Sender name */}
      <div
        className={cn(
          'flex items-center gap-2 text-xs font-medium text-gray-600',
          isUser ? 'flex-row-reverse' : ''
        )}
      >
        <div
          className={cn(
            'p-1 rounded-full transition-all duration-200',
            isUser
              ? 'bg-absolute-black text-green-accent'
              : 'bg-green-accent text-absolute-black'
          )}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        <span className="text-absolute-black">{senderName}</span>
      </div>

      {/* Chat bubble */}
      <div
        className={cn(
          'relative flex flex-col items-end max-w-[85%] rounded-xl px-3 gap-1 text-sm shadow-sm transition-all duration-200 hover:shadow-md',
          isUser
            ? 'py-2 bg-absolute-black text-white rounded-tr-sm'
            : 'py-3 bg-transparent border border-green-accent text-gray-800 rounded-tl-sm'
        )}
      >
        <Markdown className="flex flex-col gap-2 text-start leading-relaxed break-words w-full">
          {message.content}
        </Markdown>

        <span
          className={cn(
            'text-[10px] leading-none block text-gray-400',
            isUser ? 'self-start' : ''
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
}

function StepMessages({ step }: StepMessagesProps) {
  const getAgentDisplayName = (agentRole?: AiAgentRole) => {
    if (!agentRole) return 'Assistant';

    const agentNames = {
      'Operations Agent': 'Operations Agent',
      'Rate Negotiator': 'Rate Negotiator',
      'Maintenance Support Agent': 'Emergency Support',
      'General Assistant': 'Assistant'
    };

    return agentNames[agentRole] || 'Assistant';
  };

  return (
    <div className="flex flex-col animate-in slide-in-from-top-2 duration-300">
      <h5 className="text-sm font-medium text-absolute-black flex items-center gap-2 mb-4 transition-colors duration-200">
        Conversation ({step.messages.length})
      </h5>

      <div className="flex flex-col gap-3">
        {step.messages.map((message: any, index: number) => {
          const isUser = message.senderType === 'user';
          const senderName = isUser
            ? 'You'
            : getAgentDisplayName(step.aiAgentAssigned);

          return (
            <div
              key={message.id}
              className="animate-in slide-in-from-bottom-1 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <MessageBubble
                message={message}
                senderName={senderName}
                isUser={isUser}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepActions({ step, onCompleteStep }: StepActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {step.nextStepOptions!.map((option: any, optionIndex: number) => (
        <Button
          key={optionIndex}
          variant="outline"
          size="sm"
          className={cn(
            "text-xs hover:bg-gray-50 transition-all duration-200 hover:shadow-sm animate-in slide-in-from-bottom-1",
            optionIndex === 0 && "bg-absolute-black text-absolute-gray-200 hover:bg-absolute-black-hover hover:text-white"
          )}
          style={{ animationDelay: `${optionIndex * 100}ms` }}
          onClick={() => onCompleteStep()}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function IntegratedProcessTimeline({
  process,
  onCompleteStep,
  isLoading,
  onTimelineCompleteStepReady
}: IntegratedProcessTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevStepCountRef = useRef(0);
  const prevCurrentStepRef = useRef(process.currentStepIndex);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(() => {
    const initialExpanded = new Set<number>();
    if (process.currentStepIndex >= 0) {
      initialExpanded.add(process.currentStepIndex);
    }
    return initialExpanded;
  });

  const getStepStatus = (stepIndex: number) => {
    return process.steps[stepIndex]?.status || 'pending';
  };

  const toggleStepExpansion = (stepIndex: number) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };

  const handleCompleteStep = () => {
    // Close the current step before completing
    const currentStep = process.currentStepIndex;
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.delete(currentStep);
      return newSet;
    });

    setTimeout(() => {
      onCompleteStep();
    }, 150);
  };

  // Expose the handleCompleteStep function to parent component
  useEffect(() => {
    if (onTimelineCompleteStepReady) {
      onTimelineCompleteStepReady(handleCompleteStep);
    }
  }, [onTimelineCompleteStepReady]);

  // Helper functions to check if content exists
  const hasMessages = (step: ProcessStep) =>
    step.messages && step.messages.length > 0;
  const hasActions = (step: ProcessStep) =>
    step.nextStepOptions && step.nextStepOptions.length > 0;

  // Auto-scroll when new step appears
  useEffect(() => {
    const visibleSteps = process.steps.filter((_: any, index: number) => {
      const status = getStepStatus(index);
      return status;
    });

    if (
      visibleSteps.length > prevStepCountRef.current &&
      containerRef.current
    ) {
      setTimeout(() => {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }

    prevStepCountRef.current = visibleSteps.length;
  }, [process.currentStepIndex, process.steps]);

  useEffect(() => {
    const currentStepIndex = process.currentStepIndex;

    if (
      currentStepIndex !== prevCurrentStepRef.current &&
      currentStepIndex >= 0
    ) {
      setTimeout(() => {
        setExpandedSteps((prev) => new Set(prev).add(currentStepIndex));
      }, 200);
    }

    prevCurrentStepRef.current = currentStepIndex;
  }, [process.currentStepIndex]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col flex-1 gap-7 py-6 px-4 max-h-full overflow-y-auto scroll-smooth"
    >
      {process.steps.map((step: ProcessStep, index: number) => {
        const status = step.status;
        const isActive = status === 'in_progress';
        const isCompleted = status === 'completed';
        const isExpanded = expandedSteps.has(index);

        // Main conditional rendering logic moved here
        if (!(isActive || isCompleted)) {
          return null;
        }

        // Check if step has expandable content
        const stepHasMessages = hasMessages(step);
        const stepHasActions = hasActions(step);
        const hasExpandableContent = stepHasMessages || stepHasActions;

        return (
          <div
            key={step.name}
            className={cn(
              'relative flex flex-col rounded-xl border transition-all py-5 px-4',
              isExpanded ? 'gap-4' : 'gap-0',
              isActive &&
              'border-absolute-black shadow-md hover:shadow-lg',
              isCompleted &&
              'border-gray-300 bg-gray-50 shadow-lg hover:shadow-xl',
              'transform-gpu'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StepHeader
              step={step}
              index={index}
              status={status}
              isExpanded={isExpanded}
              onToggle={() => toggleStepExpansion(index)}
              isFetching={isLoading && isActive}
            />

            {/* Only show separator and content if there's expandable content */}
            {hasExpandableContent && (
              <>
                {isExpanded && <Separator />}

                <div
                  className={cn(
                    'flex flex-col gap-4 overflow-hidden transition-all duration-300 ease-in-out',
                    isExpanded
                      ? 'max-h-[2000px] opacity-100'
                      : 'max-h-0 opacity-0'
                  )}
                >
                  {stepHasMessages && <StepMessages step={step} />}
                  {stepHasMessages && stepHasActions && <Separator />}
                  {stepHasActions && (
                    <StepActions
                      step={step}
                      onCompleteStep={handleCompleteStep}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default IntegratedProcessTimeline;