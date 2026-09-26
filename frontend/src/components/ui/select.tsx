'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  useSyncExternalStore,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export interface SelectOption {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  description?: ReactNode;
}

export interface CustomSelectProps {
  value?: string | number;
  onChange?: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  searchable?: boolean;
  searchPlaceholder?: string;
  icon?: ReactNode;
  id?: string;
  name?: string;
  'aria-label'?: string;
  minMenuWidth?: number;
  align?: 'left' | 'right';
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className,
  triggerClassName,
  menuClassName,
  disabled = false,
  size = 'md',
  searchable,
  searchPlaceholder = 'Search...',
  icon,
  id,
  name,
  'aria-label': ariaLabel,
  minMenuWidth,
  align = 'left',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const mounted = useMounted();
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUpwards: boolean;
    maxHeight: number;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Normalize string value
  const normalizedValue = value !== undefined && value !== null ? String(value) : '';

  // Selected option
  const selectedOption = options.find(
    (opt) => String(opt.value) === normalizedValue
  );

  // Auto-enable search if more than 10 options unless explicitly set
  const showSearch =
    searchable !== undefined ? searchable : options.length > 10;

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const labelText =
      typeof opt.label === 'string'
        ? opt.label
        : String(opt.value);
    return labelText.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate coordinates and direction (up/down)
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedMenuHeight = Math.min(320, options.length * 40 + 60);

    const openUpwards = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
    const targetWidth = minMenuWidth
      ? Math.max(rect.width, minMenuWidth)
      : rect.width;

    const left =
      align === 'right'
        ? rect.right - targetWidth
        : Math.min(rect.left, window.innerWidth - targetWidth - 12);

    const maxHeight = openUpwards
      ? Math.max(160, spaceAbove - 16)
      : Math.max(160, spaceBelow - 16);

    setCoords({
      top: openUpwards ? rect.top - 6 : rect.bottom + 6,
      left: Math.max(12, left),
      width: targetWidth,
      openUpwards,
      maxHeight: Math.min(360, maxHeight),
    });
  }, [options.length, minMenuWidth, align]);

  // Handle open/close
  const handleOpen = () => {
    if (disabled) return;
    updatePosition();
    setIsOpen(true);
    setSearchQuery('');
    const curIndex = filteredOptions.findIndex(
      (opt) => String(opt.value) === normalizedValue
    );
    setHighlightedIndex(curIndex >= 0 ? curIndex : 0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  // Reposition on scroll or resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleScrollResize);
    window.addEventListener('scroll', handleScrollResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollResize);
      window.removeEventListener('scroll', handleScrollResize, true);
    };
  }, [isOpen, updatePosition]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showSearch]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      handleClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  // Select an option
  const handleSelect = (val: string | number) => {
    onChange?.(String(val));
    handleClose();
    triggerRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
      triggerRef.current?.focus();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        let next = prev + 1;
        while (next < filteredOptions.length && filteredOptions[next].disabled) {
          next++;
        }
        return next < filteredOptions.length ? next : prev;
      });
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        let next = prev - 1;
        while (next >= 0 && filteredOptions[next].disabled) {
          next--;
        }
        return next >= 0 ? next : prev;
      });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < filteredOptions.length &&
        !filteredOptions[highlightedIndex].disabled
      ) {
        handleSelect(filteredOptions[highlightedIndex].value);
      }
    }
  };

  // Size styling variants
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3 rounded-lg min-h-[34px] h-[34px]',
    md: 'text-sm py-2.5 px-3.5 rounded-xl min-h-[44px] h-11',
    lg: 'text-base py-3 px-4 rounded-xl min-h-[48px] h-12',
  };

  const itemSizeClasses = {
    sm: 'text-xs py-1.5 px-2.5 rounded-md my-0.5',
    md: 'text-sm py-2 px-3 rounded-lg my-0.5',
    lg: 'text-base py-2.5 px-3.5 rounded-lg my-0.5',
  };

  return (
    <div className={cn('relative inline-block w-full', className)}>
      {/* Hidden input for standard form serialization */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={normalizedValue}
          disabled={disabled}
        />
      )}

      {/* Modern Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={cn(
          'group relative flex w-full items-center justify-between gap-2.5 text-left font-medium outline-none transition-all duration-200 select-none cursor-pointer',
          'bg-surface dark:bg-surface-container text-on-surface border border-outline-variant hover:border-outline',
          'shadow-xs hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none bg-surface/50 dark:bg-surface-container/50',
          isOpen && 'border-primary ring-2 ring-primary/20 shadow-sm',
          sizeClasses[size],
          triggerClassName
        )}
      >
        <span className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="shrink-0 text-muted">{icon}</span>}
          {selectedOption ? (
            <span className="truncate flex items-center gap-2">
              {'icon' in selectedOption && selectedOption.icon && (
                <span className="shrink-0">{selectedOption.icon}</span>
              )}
              <span className="truncate font-medium">{selectedOption.label}</span>
              {'badge' in selectedOption && selectedOption.badge && (
                <span className="shrink-0">{selectedOption.badge}</span>
              )}
            </span>
          ) : (
            <span className="truncate text-on-surface-variant/70 font-normal">
              {placeholder}
            </span>
          )}
        </span>

        <span className="flex items-center pl-1 text-muted shrink-0 transition-transform duration-200">
          <ChevronDown
            className={cn(
              'transition-transform duration-200 text-on-surface-variant',
              size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
              isOpen ? 'rotate-180 text-primary' : 'group-hover:text-on-surface'
            )}
          />
        </span>
      </button>

      {/* Floating Popover Portal */}
      {mounted &&
        isOpen &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-labelledby={selectId}
            onKeyDown={handleKeyDown}
            style={{
              position: 'fixed',
              top: coords.openUpwards ? undefined : `${coords.top}px`,
              bottom: coords.openUpwards
                ? `${window.innerHeight - coords.top}px`
                : undefined,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: `${coords.maxHeight}px`,
              zIndex: 99999,
            }}
            className={cn(
              'flex flex-col rounded-xl border border-outline-variant/80 dark:border-outline-variant',
              'bg-surface/98 dark:bg-surface-container/98 text-on-surface backdrop-blur-xl',
              'shadow-2xl shadow-black/15 dark:shadow-black/60',
              'animate-in fade-in-0 zoom-in-95 duration-150 ease-out overflow-hidden',
              menuClassName
            )}
          >
            {/* Search Input if enabled */}
            {showSearch && (
              <div className="p-2 border-b border-outline-variant/50 sticky top-0 bg-surface/90 dark:bg-surface-container/90 backdrop-blur-md z-10">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setHighlightedIndex(0);
                    }}
                    placeholder={searchPlaceholder}
                    className="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg border border-outline-variant bg-surface-container/50 dark:bg-surface-container-high/50 text-on-surface placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 p-0.5 rounded text-muted hover:text-on-surface"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto p-1.5 overscroll-contain flex-1">
              {filteredOptions.length === 0 ? (
                <div className="py-4 px-3 text-center text-xs text-muted">
                  No options found
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === normalizedValue;
                  const isHighlighted = idx === highlightedIndex;
                  const isOptDisabled = opt.disabled;

                  return (
                    <div
                      key={`${opt.value}-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={isOptDisabled}
                      onMouseEnter={() => {
                        if (!isOptDisabled) setHighlightedIndex(idx);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isOptDisabled) handleSelect(opt.value);
                      }}
                      className={cn(
                        'flex items-center justify-between gap-2.5 cursor-pointer transition-colors duration-100 select-none',
                        itemSizeClasses[size],
                        isSelected
                          ? 'bg-primary/10 text-primary font-semibold'
                          : isHighlighted
                          ? 'bg-surface-container-high dark:bg-surface-container-highest text-on-surface'
                          : 'text-on-surface hover:bg-surface-container-high/60',
                        isOptDisabled &&
                          'opacity-40 cursor-not-allowed pointer-events-none'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {'icon' in opt && opt.icon && (
                          <span className="shrink-0 text-muted">{opt.icon}</span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{opt.label}</div>
                          {'description' in opt && opt.description && (
                            <div className="text-[11px] text-muted truncate font-normal">
                              {opt.description}
                            </div>
                          )}
                        </div>
                        {'badge' in opt && opt.badge && (
                          <span className="shrink-0">{opt.badge}</span>
                        )}
                      </div>

                      {isSelected && (
                        <Check
                          className={cn(
                            'shrink-0 text-primary',
                            size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
                          )}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

// Export Select as alias for CustomSelect
export const Select = CustomSelect;
export default CustomSelect;
