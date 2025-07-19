import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Accepts markdown string and optional custom components
export interface MarkdownProps {
  children: string;
  components?: Parameters<typeof ReactMarkdown>[0]['components'];
  className?: string;
}

const markdownComponents = {
  h1: ({ children }: any) => (
    <h1 className='text-xl font-bold leading-relax'>{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className='text-lg font-semibold leading-relax'>{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className='text-base font-medium leading-relax'>{children}</h3>
  ),
  p: ({ children }: any) => <p className='text-sm w-full'>{children}</p>,
  ul: ({ children }: any) => (
    <ul className='list-disc list-inside flex flex-col gap-1'>{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className='list-decimal list-inside flex flex-col gap-1'>{children}</ol>
  ),
  li: ({ children }: any) => <li className='text-sm pl-3'>{children}</li>,
  table: ({ children }: any) => (
    <div className='border border-absolute-black rounded-md overflow-hidden'>
      <table className='w-full border-collapse scale-[1.01]'>{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className='bg-absolute'>{children}</thead>
  ),
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr: ({ children }: any) => (
    <tr className='border border-absolute-black last-of-type rounded-b-md'>
      {children}
    </tr>
  ),
  th: ({ children }: any) => (
    <th className='px-3 py-2 text-left text-xs font-medium bg-absolute-black text-white uppercase tracking-wider'>
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className='px-3 py-2 text-sm font-regular'>{children}</td>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className='border-l-4 border-primary pl-4 italic text-muted-foreground'>
      {children}
    </blockquote>
  ),
  code: ({ children, className }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className='bg-muted px-1 py-0.5 rounded text-xs font-mono'>
          {children}
        </code>
      );
    }
    return (
      <pre className='bg-muted p-3 rounded-md overflow-x-auto'>
        <code className='text-xs font-mono'>{children}</code>
      </pre>
    );
  },
  hr: () => <hr className='border-border my-4' />,
  strong: ({ children }: any) => (
    <strong className='font-semibold text-foreground'>{children}</strong>
  ),
  em: ({ children }: any) => <em className='italic'>{children}</em>,
  a: ({ children, href }: any) => (
    <a href={href} className='text-blue-600 hover:underline'>
      {children}
    </a>
  ),
};

export const Markdown: React.FC<MarkdownProps> = ({ children, className }) => {
  return (
    <div className={className}>
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm]} // Add this line for table support
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};
