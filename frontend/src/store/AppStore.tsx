import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import type { Ticket, User } from '@/types';
import { lsGet, lsSet, STORAGE_KEYS } from '@/lib/storage';
import { getTg } from '@/lib/telegram';

interface AppState {
  user: User | null;
  tickets: Ticket[];
  language: 'en' | 'am';
  recentSearches: { from: string; to: string; mode: 'bus' | 'rail'; ts: number }[];
}

type Action =
  | { type: 'HYDRATE'; payload: Partial<AppState> }
  | { type: 'SET_USER'; user: User | null }
  | { type: 'ADD_TICKET'; ticket: Ticket }
  | { type: 'UPDATE_TICKET'; id: string; patch: Partial<Ticket> }
  | { type: 'REMOVE_TICKET'; id: string }
  | { type: 'SET_LANGUAGE'; language: 'en' | 'am' }
  | { type: 'ADD_RECENT_SEARCH'; from: string; to: string; mode: 'bus' | 'rail' };

const initialState: AppState = {
  user: null,
  tickets: [],
  language: 'en',
  recentSearches: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'SET_USER':
      return { ...state, user: action.user };
    case 'ADD_TICKET':
      return { ...state, tickets: [action.ticket, ...state.tickets] };
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.id ? ({ ...t, ...action.patch } as Ticket) : t
        ),
      };
    case 'REMOVE_TICKET':
      return { ...state, tickets: state.tickets.filter(t => t.id !== action.id) };
    case 'SET_LANGUAGE':
      return { ...state, language: action.language };
    case 'ADD_RECENT_SEARCH': {
      const next = [
        { from: action.from, to: action.to, mode: action.mode, ts: Date.now() },
        ...state.recentSearches.filter(s => !(s.from === action.from && s.to === action.to && s.mode === action.mode)),
      ].slice(0, 5);
      return { ...state, recentSearches: next };
    }
    default:
      return state;
  }
}

interface AppStoreContextValue {
  state: AppState;
  setUser: (user: User | null) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  removeTicket: (id: string) => void;
  setLanguage: (lang: 'en' | 'am') => void;
  addRecentSearch: (from: string, to: string, mode: 'bus' | 'rail') => void;
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const tickets = lsGet<Ticket[]>(STORAGE_KEYS.TICKETS) ?? [];
    const user = lsGet<User>(STORAGE_KEYS.USER);
    const recentSearches = lsGet<AppState['recentSearches']>(STORAGE_KEYS.RECENT_SEARCHES) ?? [];
    dispatch({ type: 'HYDRATE', payload: { tickets, user, recentSearches } });

    // Try to populate user from Telegram WebApp if available
    if (!user) {
      const tg = getTg();
      const tgUser = tg?.initDataUnsafe?.user;
      if (tgUser) {
        dispatch({
          type: 'SET_USER',
          user: {
            id: `tg-${tgUser.id}`,
            name: `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`,
            phone: '',
            preferredPayment: 'stars', // sensible default for Telegram users
            language: tgUser.language_code === 'am' ? 'am' : 'en',
            telegramUserId: tgUser.id,
          },
        });
      }
    }
  }, []);

  // Persist on relevant changes
  useEffect(() => { lsSet(STORAGE_KEYS.TICKETS, state.tickets); }, [state.tickets]);
  useEffect(() => {
    if (state.user) lsSet(STORAGE_KEYS.USER, state.user);
  }, [state.user]);
  useEffect(() => { lsSet(STORAGE_KEYS.RECENT_SEARCHES, state.recentSearches); }, [state.recentSearches]);

  const setUser = useCallback((user: User | null) => dispatch({ type: 'SET_USER', user }), []);
  const addTicket = useCallback((ticket: Ticket) => dispatch({ type: 'ADD_TICKET', ticket }), []);
  const updateTicket = useCallback((id: string, patch: Partial<Ticket>) => dispatch({ type: 'UPDATE_TICKET', id, patch }), []);
  const removeTicket = useCallback((id: string) => dispatch({ type: 'REMOVE_TICKET', id }), []);
  const setLanguage = useCallback((language: 'en' | 'am') => dispatch({ type: 'SET_LANGUAGE', language }), []);
  const addRecentSearch = useCallback((from: string, to: string, mode: 'bus' | 'rail') =>
    dispatch({ type: 'ADD_RECENT_SEARCH', from, to, mode }), []);

  return (
    <AppStoreContext.Provider value={{ state, setUser, addTicket, updateTicket, removeTicket, setLanguage, addRecentSearch }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore(): AppStoreContextValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider');
  return ctx;
}
