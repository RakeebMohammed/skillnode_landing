"use client";

import type { ReactNode } from "react";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
};

export default function TableFilters({ query, onQueryChange, placeholder = "Search table...", children }: Props) {
  return <div className="table-filters">
    <input className="table-search" value={query} onChange={event => onQueryChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
    {children}
  </div>;
}
