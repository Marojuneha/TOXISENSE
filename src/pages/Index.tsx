import { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TextAnalyzer from '@/components/TextAnalyzer';
import BatchAnalysis from '@/components/BatchAnalysis';
import Dashboard from '@/components/Dashboard';
import LiveFeed from '@/components/LiveFeed';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import AuthScreen from '@/components/AuthScreen';
import AnalysisHistory from '@/components/AnalysisHistory';
import ProfilePage from '@/components/ProfilePage';
import { Shield } from 'lucide-react';

export type AppTab = 'home' | 'analyzer' | 'batch' | 'dashboard' | 'history' | 'livefeed' | 'profile';

const Index = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <p className="text-muted-foreground">Loading ToxiSense...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HeroSection onNavigate={(tab) => setActiveTab(tab as AppTab)} />;
      case 'analyzer':
        return <TextAnalyzer />;
      case 'batch':
        return <BatchAnalysis />;
      case 'dashboard':
        return <Dashboard />;
      case 'livefeed':
        return <LiveFeed />;
      case 'history':
        return (
          <div className="pt-20">
            <AnalysisHistory open={true} onOpenChange={(open) => { if (!open) setActiveTab('home'); }} embedded />
          </div>
        );
      case 'profile':
        return <ProfilePage />;
      default:
        return <HeroSection onNavigate={(tab) => setActiveTab(tab as AppTab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onNavigate={(tab) => setActiveTab(tab)} />
      <main>{renderContent()}</main>
      <Footer />
    </div>
  );
};

export default Index;
