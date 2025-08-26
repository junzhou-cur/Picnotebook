'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  ChevronDown,
  Beaker,
  Thermometer,
  Clock,
  Scale,
  Droplets,
  Zap,
  CheckCircle
} from 'lucide-react';
import { searchLabTerms, getCategories, type LabTerm, validateMeasurement, getSuggestedUnits } from '@/lib/labTerms';

interface LabAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCategoryIcons?: boolean;
  showUnits?: boolean;
  measurementType?: string;
  onUnitSelect?: (unit: string) => void;
  maxSuggestions?: number;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Chemical': Beaker,
  'Buffer': Droplets,
  'Temperature': Thermometer,
  'Time': Clock,
  'Mass': Scale,
  'Volume': Droplets,
  'Concentration': Beaker,
  'Procedure': Zap,
  'Equipment': Zap,
  'Parameter': CheckCircle,
};

export function LabAutocomplete({
  value,
  onChange,
  placeholder = "Start typing lab terms...",
  disabled = false,
  className = '',
  showCategoryIcons = true,
  showUnits = false,
  measurementType,
  onUnitSelect,
  maxSuggestions = 8
}: LabAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LabTerm[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestedUnits, setSuggestedUnits] = useState<string[]>([]);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    warning?: string;
    suggestion?: string;
  } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Update suggestions when value changes
  useEffect(() => {
    if (value.length >= 2) {
      const results = searchLabTerms(value, undefined, maxSuggestions);
      setSuggestions(results);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [value, maxSuggestions]);
  
  // Update suggested units based on measurement type
  useEffect(() => {
    if (showUnits && measurementType) {
      const units = getSuggestedUnits(measurementType);
      setSuggestedUnits(units);
    }
  }, [measurementType, showUnits]);
  
  // Validate numeric values
  useEffect(() => {
    if (measurementType && value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        const result = validateMeasurement(measurementType, numericValue);
        setValidationResult(result);
      } else {
        setValidationResult(null);
      }
    }
  }, [value, measurementType]);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  }, [onChange]);
  
  const handleSuggestionClick = useCallback((suggestion: LabTerm) => {
    onChange(suggestion.term);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, [onChange]);
  
  const handleUnitClick = useCallback((unit: string) => {
    onUnitSelect?.(unit);
  }, [onUnitSelect]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSuggestionClick]);
  
  const getCategoryIcon = (category: string) => {
    const IconComponent = CATEGORY_ICONS[category] || Flask;
    return <IconComponent className="w-4 h-4" />;
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md focus:ring-lab-primary focus:border-lab-primary ${
            validationResult && !validationResult.isValid 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300'
          } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        />
        
        {/* Search icon */}
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      
      {/* Validation warning */}
      {validationResult && !validationResult.isValid && (
        <div className="mt-1 text-xs text-red-600">
          <p>{validationResult.warning}</p>
          {validationResult.suggestion && (
            <p className="text-gray-500 mt-1">{validationResult.suggestion}</p>
          )}
        </div>
      )}
      
      {/* Suggested units */}
      {showUnits && suggestedUnits.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Suggested units:</p>
          <div className="flex flex-wrap gap-1">
            {suggestedUnits.map((unit, index) => (
              <button
                key={`unit-${index}`}
                onClick={() => handleUnitClick(unit)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-lab-primary hover:text-white rounded transition-colors"
                disabled={disabled}
              >
                {unit || 'unitless'}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={`${suggestion.term}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                  index === selectedIndex ? 'bg-lab-primary/10' : ''
                } ${index === suggestions.length - 1 ? '' : 'border-b border-gray-100'}`}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
              >
                <div className="flex items-start space-x-3">
                  {showCategoryIcons && (
                    <div className="flex-shrink-0 mt-0.5 text-gray-400">
                      {getCategoryIcon(suggestion.category)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {suggestion.term}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {suggestion.category}
                      </span>
                    </div>
                    
                    {suggestion.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {suggestion.description}
                      </p>
                    )}
                    
                    {suggestion.commonUnits && suggestion.commonUnits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestion.commonUnits.slice(0, 4).map((unit, unitIndex) => (
                          <span
                            key={`unit-${unitIndex}`}
                            className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {unit}
                          </span>
                        ))}
                        {suggestion.commonUnits.length > 4 && (
                          <span className="text-xs text-gray-400">
                            +{suggestion.commonUnits.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    {suggestion.aliases && suggestion.aliases.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Also: {suggestion.aliases.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
            
            {/* Footer with category info */}
            <div className="border-t border-gray-100 px-3 py-2 bg-gray-50">
              <p className="text-xs text-gray-500">
                {suggestions.length} suggestion{suggestions.length === 1 ? '' : 's'} • 
                Use ↑↓ arrows to navigate, Enter to select
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* No suggestions message */}
      {showSuggestions && value.length >= 2 && suggestions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
        >
          <div className="text-center text-gray-500">
            <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No lab terms found for "{value}"</p>
            <p className="text-xs mt-1">Try a different term or check spelling</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Enhanced text input with lab autocomplete
export function LabTextInput({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  showUnits = false,
  measurementType,
  onUnitSelect,
  helpText,
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showUnits?: boolean;
  measurementType?: string;
  onUnitSelect?: (unit: string) => void;
  helpText?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <LabAutocomplete
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        showUnits={showUnits}
        measurementType={measurementType}
        onUnitSelect={onUnitSelect}
        {...props}
      />
      
      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}