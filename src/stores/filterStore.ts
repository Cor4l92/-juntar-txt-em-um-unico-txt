import { create } from 'zustand';
import type { FilterCondition } from '@/types';

interface FilterState {
  filters: Record<string, FilterCondition[]>;
  searchQuery: string;
  setFilters: (entityType: string, filters: FilterCondition[]) => void;
  clearFilters: (entityType: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: {},
  searchQuery: '',
  setFilters: (entityType, newFilters) =>
    set((state) => ({ filters: { ...state.filters, [entityType]: newFilters } })),
  clearFilters: (entityType) =>
    set((state) => {
      const filters = { ...state.filters };
      delete filters[entityType];
      return { filters };
    }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
