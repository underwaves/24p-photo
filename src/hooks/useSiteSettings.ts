import { useState, useEffect, useCallback } from 'react';
import type { SiteSettings } from '../types';
import { apiSettings } from '../lib/api';
import { INITIAL_SITE_SETTINGS } from '../lib/mockData';

const SETTINGS_STORAGE_KEY = 'palm_site_settings';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SITE_SETTINGS;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiSettings.get();
      if (data) {
        setSettings(data);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (err: unknown) {
      console.warn('API fetch site_settings error, using fallback:', err);
      // Fallback to local storage or initial
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch {
          setSettings(INITIAL_SITE_SETTINGS);
        }
      } else {
        setSettings(INITIAL_SITE_SETTINGS);
      }
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> => {
    const updated = {
      ...settings,
      ...newSettings,
      updated_at: new Date().toISOString(),
    };

    try {
      await apiSettings.update(newSettings);
      setSettings(updated);
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    } catch (err: unknown) {
      console.error('Update settings failed:', err);
      // Fallback local update
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      setSettings(updated);
      return { success: true };
    }
  };

  return {
    settings,
    loading,
    error,
    refresh: fetchSettings,
    updateSettings,
  };
}
