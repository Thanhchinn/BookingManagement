import { create } from 'zustand';

interface SearchFilters {
  query: string;
  address: string;
  category: string;
}

interface AppState {
  searchFilters: SearchFilters;
  bookingSuccessData: any | null;
  selectedLocationId: string | null;
  selectedCourtId: string | null;

  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  setBookingSuccessData: (data: any) => void;
  setSelectedLocationId: (locationId: string | null) => void;
  setSelectedCourtId: (courtId: string | null) => void;
  resetBookingData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  searchFilters: {
    query: '',
    address: 'all',
    category: 'all',
  },
  bookingSuccessData: null,
  selectedLocationId: null,
  selectedCourtId: null,

  setSearchFilters: (filters) =>
    set((state) => ({
      searchFilters: { ...state.searchFilters, ...filters },
    })),

  setBookingSuccessData: (data) => set({ bookingSuccessData: data }),
  setSelectedLocationId: (locationId) => set({ selectedLocationId: locationId }),
  setSelectedCourtId: (courtId) => set({ selectedCourtId: courtId }),
  resetBookingData: () => set({ bookingSuccessData: null, selectedLocationId: null, selectedCourtId: null }),
}));
