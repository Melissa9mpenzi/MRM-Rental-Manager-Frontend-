import { create } from 'zustand'

export const useUiStore = create(() => ({
  sidebarOpen: true,
  activeModal: null,
  globalLoading: false,
}))

