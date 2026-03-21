import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { EnhancedAnalysisResult } from '@/lib/enhancedAnalysis';

export interface AnalysisHistoryItem {
  id: string;
  text_content: string;
  language: string;
  classification: string;
  confidence: number;
  severity: string | null;
  target_type: string | null;
  created_at: string;
}

export const useAnalysisHistory = () => {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('analysis_history')
        .select('id, text_content, language, classification, confidence, severity, target_type, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAnalysis = async (text: string, result: EnhancedAnalysisResult) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('You must be logged in'); return; }

      const { data, error } = await supabase
        .from('analysis_history')
        .insert({
          user_id: user.id,
          text_content: text,
          language: result.language,
          classification: result.category,
          confidence: result.confidence,
          severity: result.isOffensive ? (result.category === 'hate' ? 'high' : 'medium') : 'low',
          target_type: result.target,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setHistory(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to save analysis:', err);
      toast.error('Failed to save analysis');
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('analysis_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setHistory(prev => prev.filter(item => item.id !== id));
      toast.success('Analysis deleted');
    } catch (err) {
      console.error('Failed to delete:', err);
      toast.error('Failed to delete');
    }
  };

  const clearAllHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('analysis_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setHistory([]);
      toast.success('All history cleared');
    } catch (err) {
      console.error('Failed to clear history:', err);
      toast.error('Failed to clear history');
    }
  };

  return {
    history,
    loading,
    saveAnalysis,
    fetchHistory,
    deleteHistoryItem,
    clearAllHistory,
  };
};
