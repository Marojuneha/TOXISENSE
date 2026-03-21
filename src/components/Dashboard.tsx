import { useEffect, useMemo } from 'react';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Legend,
} from 'recharts';
import {
  Shield, Target, TrendingUp, Calendar, Globe, AlertTriangle,
  CheckCircle2, BarChart3, Languages, Loader2, Smile, MessageSquare, Zap,
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const CATEGORY_COLORS: Record<string, string> = {
  hate: 'hsl(0, 84%, 60%)',
  abuse: 'hsl(38, 92%, 50%)',
  sarcasm: 'hsl(280, 70%, 60%)',
  neutral: 'hsl(142, 76%, 45%)',
};

const LANG_COLORS = [
  'hsl(210, 90%, 65%)',
  'hsl(142, 76%, 50%)',
  'hsl(38, 92%, 55%)',
  'hsl(280, 70%, 65%)',
  'hsl(0, 84%, 65%)',
  'hsl(180, 70%, 55%)',
  'hsl(320, 70%, 60%)',
  'hsl(55, 80%, 55%)',
  'hsl(195, 80%, 60%)',
  'hsl(100, 70%, 55%)',
];

const tooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 14%)',
  border: '1px solid hsl(217, 33%, 25%)',
  borderRadius: '8px',
  fontSize: '13px',
  color: 'hsl(0, 0%, 95%)',
  padding: '8px 12px',
};

const Dashboard = () => {
  const { history, loading, fetchHistory } = useAnalysisHistory();

  useEffect(() => {
    fetchHistory();
  }, []);

  const analytics = useMemo(() => {
    let totalOffensive = 0;
    let totalSafe = 0;
    const categoryCount: Record<string, number> = {};
    const languageCount: Record<string, number> = {};
    const severityCount = { high: 0, medium: 0, low: 0 };

    history.forEach((item) => {
      const cat = item.classification.toLowerCase();
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      languageCount[item.language] = (languageCount[item.language] || 0) + 1;

      if (item.severity === 'high' || item.severity === 'medium') {
        totalOffensive++;
      } else {
        totalSafe++;
      }
      if (item.severity && severityCount[item.severity as keyof typeof severityCount] !== undefined) {
        severityCount[item.severity as keyof typeof severityCount]++;
      }
    });

    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: CATEGORY_COLORS[name] || 'hsl(215, 20%, 55%)',
    }));

    const languageData = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value,
        color: LANG_COLORS[i % LANG_COLORS.length],
      }));

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStr = format(date, 'yyyy-MM-dd');
      const dayItems = history.filter((item) => {
        const itemDay = format(new Date(item.created_at), 'yyyy-MM-dd');
        return itemDay === dayStr;
      });
      return {
        day: format(date, 'MMM d'),
        total: dayItems.length,
        offensive: dayItems.filter((i) => i.severity === 'high' || i.severity === 'medium').length,
        safe: dayItems.filter((i) => i.severity === 'low' || !i.severity).length,
      };
    });

    const avgConfidence = history.length > 0
      ? history.reduce((sum, item) => sum + item.confidence, 0) / history.length
      : 0;

    const offensiveRate = history.length > 0 ? (totalOffensive / history.length) * 100 : 0;

    return { categoryData, languageData, totalOffensive, totalSafe, severityCount, last7Days, avgConfidence, offensiveRate };
  }, [history]);

  if (loading) {
    return (
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text">Analytics</span> Dashboard
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Overview of your content moderation activity, language distribution, and offensive content trends.
          </p>
        </div>

        {history.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16">
            <BarChart3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground text-sm">
              Start analyzing content to see your dashboard analytics here.
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={Shield} label="Total Analyses" value={history.length} />
              <StatCard icon={CheckCircle2} label="Safe" value={analytics.totalSafe} color="text-success" />
              <StatCard icon={AlertTriangle} label="Flagged" value={analytics.totalOffensive} color="text-destructive" />
              <StatCard icon={Target} label="Avg Confidence" value={`${(analytics.avgConfidence * 100).toFixed(0)}%`} />
              <StatCard icon={TrendingUp} label="Offensive Rate" value={`${analytics.offensiveRate.toFixed(1)}%`} color={analytics.offensiveRate > 50 ? 'text-destructive' : 'text-success'} />
              <StatCard icon={Languages} label="Languages" value={analytics.languageData.length} />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Category Distribution */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Category Distribution
                </h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none" activeIndex={undefined}>
                        {analytics.categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke={entry.color} strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'hsl(0, 0%, 90%)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {analytics.categoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language Distribution */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Language Distribution
                </h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.languageData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                        {analytics.languageData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke={entry.color} strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'hsl(0, 0%, 90%)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {analytics.languageData.slice(0, 6).map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                    </div>
                  ))}
                  {analytics.languageData.length > 6 && (
                    <span className="text-xs text-muted-foreground">+{analytics.languageData.length - 6} more</span>
                  )}
                </div>
              </div>

              {/* Severity Breakdown */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Severity Breakdown
                </h3>
                <div className="space-y-4 mt-6">
                  <SeverityBar label="High" count={analytics.severityCount.high} total={history.length} color="bg-destructive" />
                  <SeverityBar label="Medium" count={analytics.severityCount.medium} total={history.length} color="bg-warning" />
                  <SeverityBar label="Low" count={analytics.severityCount.low} total={history.length} color="bg-success" />
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-destructive">{analytics.severityCount.high}</p>
                      <p className="text-xs text-muted-foreground">High</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-warning">{analytics.severityCount.medium}</p>
                      <p className="text-xs text-muted-foreground">Medium</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-success">{analytics.severityCount.low}</p>
                      <p className="text-xs text-muted-foreground">Low</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Day Trend */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                7-Day Content Trend
              </h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.last7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                    <XAxis dataKey="day" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} width={30} />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'hsl(0, 0%, 90%)' }} cursor={{ fill: 'hsl(217, 33%, 20%)' }} />
                    <Legend />
                    <Bar dataKey="safe" name="Safe" stackId="a" fill="hsl(142, 76%, 45%)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="offensive" name="Offensive" stackId="a" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Languages Table */}
            {analytics.languageData.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Language Breakdown
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analytics.languageData.map((lang, i) => (
                    <div key={lang.name} className="flex items-center gap-3 bg-secondary/30 rounded-xl p-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${lang.color}20`, color: lang.color }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lang.name}</p>
                        <p className="text-xs text-muted-foreground">{lang.value} {lang.value === 1 ? 'analysis' : 'analyses'}</p>
                      </div>
                      <div className="text-sm font-mono text-muted-foreground">
                        {((lang.value / history.length) * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Analyses */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Recent Analyses
              </h3>
              <div className="space-y-3">
                {history.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 bg-secondary/20 rounded-xl p-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.severity === 'high' ? 'bg-destructive/20' :
                      item.severity === 'medium' ? 'bg-warning/20' :
                      'bg-success/20'
                    }`}>
                      {item.severity === 'high' || item.severity === 'medium' ? (
                        <AlertTriangle className={`w-4 h-4 ${item.severity === 'high' ? 'text-destructive' : 'text-warning'}`} />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.text_content}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{item.language}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          item.classification === 'hate' ? 'bg-destructive/20 text-destructive' :
                          item.classification === 'abuse' ? 'bg-warning/20 text-warning' :
                          item.classification === 'sarcasm' ? 'bg-[hsl(280,70%,50%)]/20 text-[hsl(280,70%,60%)]' :
                          'bg-success/20 text-success'
                        }`}>{item.classification}</span>
                        <span className="text-xs text-muted-foreground">{(item.confidence * 100).toFixed(0)}% confidence</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(item.created_at), 'MMM d, HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color?: string }) => (
  <div className="glass-card rounded-xl p-4 text-center">
    <Icon className={`w-5 h-5 mx-auto mb-2 ${color || 'text-primary'}`} />
    <p className={`text-xl font-bold ${color || ''}`}>{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </div>
);

const SeverityBar = ({ label, count, total, color }: { label: string; count: number; total: number; color: string }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default Dashboard;
