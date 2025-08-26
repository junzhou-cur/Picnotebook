'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle,
  Info,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  X,
  Keyboard,
  Eye,
  Volume2
} from 'lucide-react';

interface TooltipProps {
  content: string | React.ReactNode;
  title?: string;
  type?: 'info' | 'help' | 'warning' | 'success' | 'tip';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  trigger?: 'hover' | 'click' | 'focus';
  shortcut?: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  maxWidth?: string;
  delay?: number;
  persistent?: boolean;
}

export function AccessibilityTooltip({
  content,
  title,
  type = 'info',
  position = 'auto',
  trigger = 'hover',
  shortcut,
  children,
  className = '',
  ariaLabel,
  maxWidth = '300px',
  delay = 500,
  persistent = false
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const newTimeoutId = setTimeout(() => {
      setIsVisible(true);
      
      // Calculate optimal position if auto
      if (position === 'auto' && triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        };
        
        // Default to top, but adjust based on available space
        let optimalPosition: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'top';
        
        if (triggerRect.top < 120) optimalPosition = 'bottom';
        if (triggerRect.right > viewport.width - 200) optimalPosition = 'left';
        if (triggerRect.left < 200) optimalPosition = 'right';
        
        setActualPosition(optimalPosition);
      }
    }, trigger === 'hover' ? delay : 0);
    
    setTimeoutId(newTimeoutId);
  }, [delay, position, timeoutId, trigger]);

  const hideTooltip = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    if (!persistent) {
      setIsVisible(false);
    }
  }, [persistent, timeoutId]);

  const toggleTooltip = useCallback(() => {
    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  }, [isVisible, hideTooltip, showTooltip]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        hideTooltip();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, hideTooltip]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        trigger === 'click' &&
        isVisible &&
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        hideTooltip();
      }
    };

    if (isVisible && trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, trigger, hideTooltip]);

  const getIcon = () => {
    const iconProps = { className: "w-4 h-4" };
    switch (type) {
      case 'help': return <HelpCircle {...iconProps} />;
      case 'warning': return <AlertCircle {...iconProps} />;
      case 'success': return <CheckCircle {...iconProps} />;
      case 'tip': return <Lightbulb {...iconProps} />;
      default: return <Info {...iconProps} />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'help': return 'bg-blue-600 text-white border-blue-600';
      case 'warning': return 'bg-yellow-600 text-white border-yellow-600';
      case 'success': return 'bg-green-600 text-white border-green-600';
      case 'tip': return 'bg-purple-600 text-white border-purple-600';
      default: return 'bg-gray-900 text-white border-gray-900';
    }
  };

  const getPositionStyles = () => {
    const base = 'absolute z-50';
    switch (actualPosition) {
      case 'top':
        return `${base} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${base} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${base} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${base} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${base} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getArrowStyles = () => {
    const arrowSize = 'w-3 h-3';
    const baseArrow = `absolute ${arrowSize} rotate-45 ${getTypeStyles()}`;
    
    switch (actualPosition) {
      case 'top':
        return `${baseArrow} top-full left-1/2 transform -translate-x-1/2 -mt-1.5`;
      case 'bottom':
        return `${baseArrow} bottom-full left-1/2 transform -translate-x-1/2 -mb-1.5`;
      case 'left':
        return `${baseArrow} left-full top-1/2 transform -translate-y-1/2 -ml-1.5`;
      case 'right':
        return `${baseArrow} right-full top-1/2 transform -translate-y-1/2 -mr-1.5`;
      default:
        return `${baseArrow} top-full left-1/2 transform -translate-x-1/2 -mt-1.5`;
    }
  };

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={trigger === 'hover' ? showTooltip : undefined}
      onMouseLeave={trigger === 'hover' ? hideTooltip : undefined}
      onFocus={trigger === 'focus' ? showTooltip : undefined}
      onBlur={trigger === 'focus' ? hideTooltip : undefined}
      onClick={trigger === 'click' ? toggleTooltip : undefined}
      tabIndex={trigger === 'focus' ? 0 : undefined}
      role={trigger === 'click' ? 'button' : undefined}
      aria-label={ariaLabel}
      aria-describedby={isVisible ? 'tooltip' : undefined}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            id="tooltip"
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`${getPositionStyles()} ${getTypeStyles()} rounded-lg shadow-lg border px-3 py-2 text-sm font-medium`}
            style={{ maxWidth }}
          >
            {/* Arrow */}
            <div className={getArrowStyles()} />
            
            {/* Content */}
            <div className="relative">
              {title && (
                <div className="flex items-center space-x-2 mb-2">
                  {getIcon()}
                  <span className="font-semibold">{title}</span>
                  {persistent && (
                    <button
                      onClick={hideTooltip}
                      className="ml-auto hover:bg-white hover:bg-opacity-20 rounded p-0.5"
                      aria-label="Close tooltip"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              
              <div className="leading-relaxed">
                {typeof content === 'string' ? (
                  <p>{content}</p>
                ) : (
                  content
                )}
              </div>
              
              {shortcut && (
                <div className="mt-2 pt-2 border-t border-white border-opacity-20">
                  <div className="flex items-center space-x-1 text-xs opacity-80">
                    <Keyboard className="w-3 h-3" />
                    <span>Shortcut: </span>
                    <kbd className="px-1.5 py-0.5 bg-white bg-opacity-20 rounded text-xs font-mono">
                      {shortcut}
                    </kbd>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Specialized tooltip components for common use cases
export function HelpTooltip({ 
  children, 
  content, 
  title = "Help",
  ...props 
}: Omit<TooltipProps, 'type'>) {
  return (
    <AccessibilityTooltip type="help" title={title} content={content} {...props}>
      {children}
    </AccessibilityTooltip>
  );
}

export function TipTooltip({ 
  children, 
  content, 
  title = "Pro Tip",
  ...props 
}: Omit<TooltipProps, 'type'>) {
  return (
    <AccessibilityTooltip type="tip" title={title} content={content} {...props}>
      {children}
    </AccessibilityTooltip>
  );
}

export function WarningTooltip({ 
  children, 
  content, 
  title = "Warning",
  ...props 
}: Omit<TooltipProps, 'type'>) {
  return (
    <AccessibilityTooltip type="warning" title={title} content={content} {...props}>
      {children}
    </AccessibilityTooltip>
  );
}

// Accessibility features component
export function AccessibilityFeatures() {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [screenReader, setScreenReader] = useState(false);

  useEffect(() => {
    // Apply accessibility preferences
    document.documentElement.classList.toggle('high-contrast', highContrast);
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
    document.documentElement.classList.toggle('large-text', fontSize === 'large');
    document.documentElement.classList.toggle('screen-reader-optimized', screenReader);
  }, [highContrast, reducedMotion, fontSize, screenReader]);

  // Detect system preferences
  useEffect(() => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    };

    setReducedMotion(mediaQueries.reducedMotion.matches);
    setHighContrast(mediaQueries.highContrast.matches);

    const handleChange = () => {
      setReducedMotion(mediaQueries.reducedMotion.matches);
      setHighContrast(mediaQueries.highContrast.matches);
    };

    mediaQueries.reducedMotion.addEventListener('change', handleChange);
    mediaQueries.highContrast.addEventListener('change', handleChange);

    return () => {
      mediaQueries.reducedMotion.removeEventListener('change', handleChange);
      mediaQueries.highContrast.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AccessibilityTooltip
        content={
          <div className="space-y-3 min-w-[250px]">
            <h4 className="font-semibold mb-2">Accessibility Options</h4>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="rounded border-white border-opacity-50"
                />
                <span className="text-sm">High Contrast</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="rounded border-white border-opacity-50"
                />
                <span className="text-sm">Reduce Motion</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={screenReader}
                  onChange={(e) => setScreenReader(e.target.checked)}
                  className="rounded border-white border-opacity-50"
                />
                <span className="text-sm">Screen Reader Mode</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full bg-white bg-opacity-20 border border-white border-opacity-50 rounded px-2 py-1 text-sm"
              >
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            <div className="pt-2 border-t border-white border-opacity-20 text-xs opacity-80">
              <p>Keyboard shortcuts:</p>
              <p>• Tab: Navigate elements</p>
              <p>• Enter/Space: Activate buttons</p>
              <p>• Esc: Close dialogs</p>
              <p>• Alt+H: Toggle help</p>
            </div>
          </div>
        }
        title="Accessibility"
        type="info"
        position="left"
        trigger="click"
        persistent={true}
        maxWidth="300px"
      >
        <button
          className="bg-lab-primary text-white p-3 rounded-full shadow-lg hover:bg-lab-primary/90 transition-colors focus:ring-2 focus:ring-lab-primary focus:ring-offset-2"
          aria-label="Accessibility options"
        >
          <Eye className="w-5 h-5" />
        </button>
      </AccessibilityTooltip>
    </div>
  );
}