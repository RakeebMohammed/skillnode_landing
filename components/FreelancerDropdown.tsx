"use client";

import { useEffect, useId, useRef, useState } from "react";

export type FreelancerDropdownOption = {
  value: string;
  label: string;
};

type Props = {
  id: string;
  label: string;
  note?: string;
  placeholder: string;
  options: readonly FreelancerDropdownOption[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export default function FreelancerDropdown({
  id,
  label,
  note,
  placeholder,
  options,
  value,
  disabled = false,
  onChange,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedLabel = selectedIndex >= 0 ? options[selectedIndex].label : "";

  const openMenu = () => {
    if (disabled || !options.length) return;
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!open) return;
    rootRef.current
      ?.querySelector<HTMLElement>(`[data-option-index="${highlightedIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, open]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setHighlightedIndex((current) => (current + direction + options.length) % options.length);
      return;
    }

    if (event.key === "Home" && open) {
      event.preventDefault();
      setHighlightedIndex(0);
      return;
    }

    if (event.key === "End" && open) {
      event.preventDefault();
      setHighlightedIndex(options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(highlightedIndex);
      else openMenu();
    }
  };

  return (
    <div ref={rootRef} className={`field qform-dropdown-field ${open ? "is-open" : ""}`}>
      <label className="qform-dropdown-label" htmlFor={id}>
        <span>{label}</span>
        {note && <small>{note}</small>}
      </label>

      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`qform-dropdown-trigger ${value ? "has-value" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? `${listboxId}-option-${highlightedIndex}` : undefined}
        disabled={disabled}
        data-analytics-ignore="true"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        <span className="qform-dropdown-value">{selectedLabel || placeholder}</span>
        <span className="qform-dropdown-chevron" aria-hidden="true" />
      </button>

      {open && (
        <div id={listboxId} className="qform-dropdown-menu" role="listbox" aria-label={label}>
          {options.map((option, index) => {
            const selected = option.value === value;
            const highlighted = index === highlightedIndex;

            return (
              <button
                id={`${listboxId}-option-${index}`}
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={`qform-dropdown-option ${selected ? "is-selected" : ""} ${highlighted ? "is-highlighted" : ""}`}
                data-option-index={index}
                data-analytics-ignore="true"
                onPointerMove={() => setHighlightedIndex(index)}
                onClick={() => choose(index)}
              >
                <span>{option.label}</span>
                {selected && <span className="qform-dropdown-check" aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
