import React, { useState, useRef, useEffect } from 'react';

interface ChipInputProps {
    label: string;
    placeholder?: string;
    availableOptions: string[];
    selectedOptions: string[];
    onChange: (options: string[]) => void;
}

const ChipInput: React.FC<ChipInputProps> = ({ label, placeholder, availableOptions, selectedOptions, onChange }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter suggestions based on input
    useEffect(() => {
        if (inputValue.trim()) {
            const filtered = availableOptions.filter(
                opt => opt.toLowerCase().includes(inputValue.toLowerCase()) && !selectedOptions.includes(opt)
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [inputValue, availableOptions, selectedOptions]);

    const addOption = (option: string) => {
        onChange([...selectedOptions, option]);
        setInputValue('');
        setSuggestions([]);
        inputRef.current?.focus();
    };

    const removeOption = (option: string) => {
        onChange(selectedOptions.filter(o => o !== option));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue) {
            // Allow adding custom values if not in list? Or just select first suggestion?
            // User asked for autocomplete. Let's assume strict selection for now or allow if it matches.
            // Let's allow custom for now if it's not empty, or strictly from list if we want to enforce "Stores".
            // Since user said "autocomplete", usually implies picking from list, but I'll allow "custom" if it's meaningful?
            // Nah, let's stick to picking from suggestions or exact match.
            const match = availableOptions.find(o => o.toLowerCase() === inputValue.toLowerCase());
            if (match && !selectedOptions.includes(match)) {
                addOption(match);
            } else if (suggestions.length > 0) {
                 addOption(suggestions[0]);
            }
        } else if (e.key === 'Backspace' && !inputValue && selectedOptions.length > 0) {
            removeOption(selectedOptions[selectedOptions.length - 1]);
        }
    };

    // Simple Drag and Drop implementation for "rearrangable for preference order"
    // For simplicity without heavy dnd libs, we can add Move Left/Right buttons or just use simple array move.
    
    const moveOption = (index: number, direction: 'left' | 'right') => {
        if (direction === 'left' && index > 0) {
            const newOptions = [...selectedOptions];
            [newOptions[index - 1], newOptions[index]] = [newOptions[index], newOptions[index - 1]];
            onChange(newOptions);
        } else if (direction === 'right' && index < selectedOptions.length - 1) {
            const newOptions = [...selectedOptions];
            [newOptions[index + 1], newOptions[index]] = [newOptions[index], newOptions[index + 1]];
            onChange(newOptions);
        }
    };

    return (
        <div className="w-full">
            <label className="block text-gray-500 font-bold mb-2 uppercase text-xs tracking-wider">{label}</label>
            <div className="bg-white border-2 border-gray-300 rounded-xl p-2 flex flex-wrap gap-2 shadow-inner focus-within:border-orange-400 min-h-[60px]">
                {selectedOptions.map((option, index) => (
                    <div key={option} className="bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-orange-200">
                        {index > 0 && (
                             <button onClick={() => moveOption(index, 'left')} className="text-orange-300 hover:text-orange-500 text-xs">◀</button>
                        )}
                        <span>{option}</span>
                        {index < selectedOptions.length - 1 && (
                             <button onClick={() => moveOption(index, 'right')} className="text-orange-300 hover:text-orange-500 text-xs">▶</button>
                        )}
                        <button onClick={() => removeOption(option)} className="ml-1 w-4 h-4 bg-orange-200 text-orange-500 rounded-full flex items-center justify-center text-[10px] hover:bg-orange-300">
                           ✕
                        </button>
                    </div>
                ))}
                <div className="relative flex-grow">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedOptions.length === 0 ? placeholder : ""}
                        className="w-full h-full bg-transparent outline-none font-bold text-gray-700 min-w-[100px]"
                    />
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border-2 border-gray-100 z-50 max-h-40 overflow-y-auto">
                            {suggestions.map(s => (
                                <div 
                                    key={s} 
                                    onClick={() => addOption(s)}
                                    className="p-3 hover:bg-orange-50 cursor-pointer font-bold text-gray-600 border-b border-gray-50 last:border-0"
                                >
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <p className="text-[10px] text-gray-400 font-bold mt-1 text-right">Tip: Use arrows to reorder preference</p>
        </div>
    );
};

export default ChipInput;
