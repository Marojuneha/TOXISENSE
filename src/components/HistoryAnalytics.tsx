import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Target, Shield, Calendar } from 'lucide-react';
import type { AnalysisHistoryItem } from '@/hooks/useAnalysisHistory';
import { format, subDays, startOfDay, isAfter } from 'date-fns';

interface HistoryAnalyticsProps {
  history: AnalysisHistoryItem[];
}

const COLORS = {
  hate: 'hsl(0, 84%, 60%)',
  abuse: 'hsl(38, 92%, 50%)',
  sarcasm: 'hsl(280, 70%, 60%)',
  neutral: 'hsl(142, 76%, 45%)',
};

const HistoryAnalytics = ({ history }: HistoryAnalyticsProps) => {
  const analytics = useMemo(() => {
    // Category distribution
    const categoryCount: Record<string, number> = {};
    let totalOffensive = 0;
    let totalSafe = 0;
    const severityCount = { high: 0, medium: 0, low: 0 };
    
    history.forEach((item) => {
      const cat = item.classification.toLowerCase();
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      
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
      color: COLORS[name as keyof typeof COLORS] || 'hsl(215, 20%, 55%)',
    }));

    // Last 7 days trend
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = startOfDay(subDays(date, -1));
      
      const dayItems = history.filter((item) => {
        const itemDate = new Date(item.created_at);
        return isAfter(itemDate, dayStart) && !isAfter(itemDate, dayEnd);
      });

      return {
        day: format(date, 'EEE'),
        total: dayItems.length,
        offensive: dayItems.filter((i) => i.severity === 'high' || i.severity === 'medium').length,
        safe: dayItems.filter((i) => i.severity === 'low' || !i.severity).length,
      };
    });

    const avgConfidence = history.length > 0
      ? history.reduce((sum, item) => sum + item.confidence, 0) / history.length
      : 0;

    return {
      categoryData,
      totalOffensive,
      totalSafe,
      severityCount,
      last7Days,
      avgConfidence,
    };
  }, [history]);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <Shield className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{history.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-success/10 rounded-lg p-3 text-center">
          <Target className="w-4 h-4 mx-auto mb-1 text-success" />
          <p className="text-lg font-bold text-success">{analytics.totalSafe}</p>
          <p className="text-xs text-muted-foreground">Safe</p>
        </div>
        <div className="bg-destructive/10 rounded-lg p-3 text-center">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-destructive" />
          <p className="text-lg font-bold text-destructive">{analytics.totalOffensive}</p>
          <p className="text-xs text-muted-foreground">Flagged</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-3 text-center">
          <Calendar className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{(analytics.avgConfidence * 100).toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">Avg Conf.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Category Pie Chart */}
        <div className="bg-secondary/20 rounded-lg p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Category Distribution</p>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 11%)',
                    border: '1px solid hsl(217, 33%, 20%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {analytics.categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Trend */}
        <div className="bg-secondary/20 rounded-lg p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">7-Day Trend</p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                <XAxis dataKey="day" stroke="hsl(215, 20%, 55%)" fontSize={10} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={10} width={20} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 11%)',
                    border: '1px solid hsl(217, 33%, 20%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="safe" stackId="a" fill="hsl(142, 76%, 45%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="offensive" stackId="a" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryAnalytics;
