'use client';

import { useRef } from 'react';
import { Box, Chip } from '@mui/material';
import type { ChipColor } from '@/lib/display';

export interface OptionChipItem<T extends string = string> {
  value: T;
  label: string;
  /** Color used for the selected state. Defaults to 'primary'. */
  color?: ChipColor;
}

interface OptionChipsProps<T extends string> {
  options: OptionChipItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group, e.g. "Project status". */
  'aria-label': string;
}

/**
 * Accessible single-select chip group with radio semantics and
 * roving-tabindex keyboard support (arrow keys, Home/End).
 */
export function OptionChips<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: OptionChipsProps<T>) {
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);

  const focusAndSelect = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    chipRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const lastIndex = options.length - 1;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusAndSelect(index === lastIndex ? 0 : index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusAndSelect(index === 0 ? lastIndex : index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusAndSelect(0);
        break;
      case 'End':
        event.preventDefault();
        focusAndSelect(lastIndex);
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        onChange(options[index].value);
        break;
    }
  };

  return (
    <Box role="radiogroup" aria-label={ariaLabel} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <Chip
            key={option.value}
            ref={(el) => {
              chipRefs.current[index] = el;
            }}
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            label={option.label}
            color={selected ? (option.color ?? 'primary') : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            sx={{ cursor: 'pointer' }}
          />
        );
      })}
    </Box>
  );
}
