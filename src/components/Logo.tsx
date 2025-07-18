import React from 'react';

interface LogoProps {
  width?: number;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  onClick?: () => void;
  clickable?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  width = 301,
  height = 101,
  className = '',
  style = {},
  alt = 'ITruckr Logo',
  onClick,
  clickable = false,
  loading = false,
  disabled = false,
}) => {
  const handleClick = () => {
    if (onClick && !disabled && !loading) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick && !disabled && !loading) {
      event.preventDefault();
      onClick();
    }
  };

  const svgStyle: React.CSSProperties = {
    ...style,
    cursor: (clickable || onClick) && !disabled && !loading ? 'pointer' : 'default',
    opacity: disabled ? 0.5 : loading ? 0.7 : 1
  };

  const isInteractive = (onClick || clickable) && !disabled && !loading;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 301 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={svgStyle}
      onClick={handleClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : 'img'}
      aria-label={alt}
      tabIndex={isInteractive ? 0 : undefined}
      aria-disabled={disabled}
      aria-busy={loading}
    >
      <path
        d="M0.984375 0.0561523H200.984V100.056H0.984375V0.0561523Z"
        fill="white"
      />
      <path
        d="M200.984 0.0561523H300.984V100.056L200.984 0.0561523Z"
        fill="#3cbd7a"
      />
    </svg>
  );
};

export default Logo;