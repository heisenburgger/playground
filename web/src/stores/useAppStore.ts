import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type State = {}

export const useAppStore = create<State>()(immer((set) => ({})))
