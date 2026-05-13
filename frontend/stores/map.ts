import { create } from 'zustand'

// ========================================
// Map Store — Sadak Saathi
// ========================================

interface MapState {
  center: { lat: number; lng: number }
  zoom: number
  selectedPotholeId: string | null
  selectedMarkerIds: string[]
  filterSeverity: string[]
  filterStatus: string[]
  showHeatmap: boolean
  showClusters: boolean
 jurisdictionFilter: string | null
  dateRange: { from: Date | null; to: Date | null }

  setCenter: (center: { lat: number; lng: number }) => void
  setZoom: (zoom: number) => void
  selectPothole: (id: string | null) => void
  toggleMarkerSelection: (id: string) => void
  clearMarkerSelection: () => void
  setSeverityFilter: (severity: string[]) => void
  setStatusFilter: (status: string[]) => void
  setShowHeatmap: (show: boolean) => void
  setShowClusters: (show: boolean) => void
  setJurisdictionFilter: (id: string | null) => void
  setDateRange: (from: Date | null, to: Date | null) => void
  resetFilters: () => void
}

const initialState = {
  center: { lat: 21.2514, lng: 81.6296 }, // Default: Raipur, Chhattisgarh
  zoom: 12,
  selectedPotholeId: null,
  selectedMarkerIds: [],
  filterSeverity: [],
  filterStatus: [],
  showHeatmap: false,
  showClusters: true,
  jurisdictionFilter: null,
  dateRange: { from: null, to: null },
}

export const useMapStore = create<MapState>((set) => ({
  ...initialState,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),

  selectPothole: (id) => set({ selectedPotholeId: id }),

  toggleMarkerSelection: (id) =>
    set((state) => ({
      selectedMarkerIds: state.selectedMarkerIds.includes(id)
        ? state.selectedMarkerIds.filter((mId) => mId !== id)
        : [...state.selectedMarkerIds, id],
    })),

  clearMarkerSelection: () => set({ selectedMarkerIds: [] }),

  setSeverityFilter: (filterSeverity) => set({ filterSeverity }),

  setStatusFilter: (filterStatus) => set({ filterStatus }),

  setShowHeatmap: (showHeatmap) => set({ showHeatmap }),

  setShowClusters: (showClusters) => set({ showClusters }),

  setJurisdictionFilter: (jurisdictionFilter) => set({ jurisdictionFilter }),

  setDateRange: (from, to) => set({ dateRange: { from, to } }),

  resetFilters: () =>
    set({
      filterSeverity: [],
      filterStatus: [],
      jurisdictionFilter: null,
      dateRange: { from: null, to: null },
    }),
}))
