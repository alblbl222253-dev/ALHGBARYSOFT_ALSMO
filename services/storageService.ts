import { Settings } from '../types';

const SETTINGS_KEY = 'gr-soft-settings';
const AUTH_KEY = 'gr-soft-auth';
const DB_PREFIX = 'gr-soft-db-';

// Generic function to get data from localStorage
export function getData<T>(key: string): T[] {
  try {
    const item = localStorage.getItem(`${DB_PREFIX}${key}`);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Error getting data for key ${key}`, error);
    return [];
  }
}

// Generic function to save data to localStorage
export function saveData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data for key ${key}`, error);
  }
}

// Settings management
export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings', error);
  }
}

export function getSettings(): Settings | null {
  try {
    const settingsStr = localStorage.getItem(SETTINGS_KEY);
    return settingsStr ? JSON.parse(settingsStr) : null;
  } catch (error) {
    console.error('Error getting settings', error);
    return null;
  }
}

// Authentication management
export function setIsAuthenticated(status: boolean): void {
    localStorage.setItem(AUTH_KEY, JSON.stringify(status));
}

export function getIsAuthenticated(): boolean {
    const authStatus = localStorage.getItem(AUTH_KEY);
    return authStatus ? JSON.parse(authStatus) : false;
}
