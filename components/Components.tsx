import React from 'react';
import { Loader2 } from 'lucide-react';

// --- BUTTONS ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, className = '', ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-paper focus:ring-azure disabled:opacity-50 disabled:pointer-events-none rounded-lg tracking-tight";
  
  const variants = {
    primary: "bg-azure text-white hover:bg-azure-hover shadow-sm hover:shadow-md border border-transparent",
    secondary: "bg-paleslate text-ink border border-ink/10 hover:bg-paleslate-dark hover:text-ink hover:border-ink/20",
    outline: "border border-ink/20 text-ink hover:bg-paleslate hover:border-azure hover:text-azure",
    ghost: "text-ink/70 hover:bg-paleslate hover:text-ink",
    warning: "bg-highlight text-ink border border-highlight/20 hover:bg-yellow-400",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-5 py-2 text-sm",
    lg: "h-12 px-8 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

// --- CARDS ---
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`bg-paleslate border border-ink/5 rounded-xl shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-b border-ink/5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-bold text-ink tracking-tight ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

// --- INPUTS ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-semibold text-ink mb-1.5">{label}</label>}
    <input 
      className={`flex h-10 w-full rounded-md border border-ink/10 bg-paleslate px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-azure focus:border-azure transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white ${className}`}
      {...props}
    />
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-semibold text-ink mb-1.5">{label}</label>}
    <textarea 
      className={`flex min-h-[80px] w-full rounded-md border border-ink/10 bg-paleslate px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-azure focus:border-azure transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white ${className}`}
      {...props}
    />
  </div>
);

// --- CHIPS ---
export const Chip: React.FC<{ label: string; onRemove?: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-azure/10 border border-azure/20 px-3 py-1 text-xs font-semibold text-azure">
    {label}
    {onRemove && (
      <button onClick={onRemove} className="ml-1 rounded-full p-0.5 hover:bg-azure/20 text-azure hover:text-azure-hover">
        <span className="sr-only">Remove</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    )}
  </span>
);

// --- JSON VIEWER ---
export const JsonViewer: React.FC<{ data: string | object }> = ({ data }) => {
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  
  // Minimal highlighting logic
  const highlighted = content.replace(/"([^"]+)":/g, '<span class="text-ink font-bold">"$1"</span>:');

  return (
    <pre className="overflow-auto rounded-lg bg-paleslate p-4 text-xs font-mono text-ink/70 border border-ink/5">
      <code dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  );
};