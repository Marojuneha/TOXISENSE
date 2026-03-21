import { useEffect, useState } from 'react';
import { useAnalysisHistory, type AnalysisHistoryItem } from '@/hooks/useAnalysisHistory';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trash2, 
  Loader2, 
  History, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  FileText,
  Trash,
  Download,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HistoryAnalytics from './HistoryAnalytics';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AnalysisHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedded?: boolean;
}

const AnalysisHistory = ({ open, onOpenChange, embedded = false }: AnalysisHistoryProps) => {
  const { history, loading, fetchHistory, deleteHistoryItem, clearAllHistory } = useAnalysisHistory();
  const [selectedItem, setSelectedItem] = useState<AnalysisHistoryItem | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open]);

  const exportToCSV = () => {
    if (history.length === 0) return;
    
    const headers = ['Date', 'Content', 'Classification', 'Confidence', 'Severity', 'Language', 'Target Type'];
    const csvRows = [
      headers.join(','),
      ...history.map(item => [
        format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss'),
        `"${item.text_content.replace(/"/g, '""')}"`,
        item.classification,
        (item.confidence * 100).toFixed(1) + '%',
        item.severity || 'N/A',
        item.language,
        item.target_type || 'N/A'
      ].join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toxisense-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('History exported as CSV');
  };

  const exportToJSON = () => {
    if (history.length === 0) return;
    
    const exportData = history.map(item => ({
      date: item.created_at,
      content: item.text_content,
      classification: item.classification,
      confidence: item.confidence,
      severity: item.severity,
      language: item.language,
      targetType: item.target_type
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toxisense-history-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('History exported as JSON');
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'low':
        return 'bg-success/20 text-success border-success/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (classification: string, severity: string | null) => {
    if (severity === 'high' || severity === 'medium') {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-success" />;
  };

  const historyContent = (
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analysis History</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Your analysis history will appear here once you start analyzing content.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="history" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToCSV}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToJSON}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClearDialogOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          <TabsContent value="history" className="mt-0">
            <p className="text-sm text-muted-foreground mb-3">
              {history.length} {history.length === 1 ? 'analysis' : 'analyses'} found
            </p>
            <ScrollArea className="h-[500px] rounded-lg border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="w-[50px]">Status</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead className="w-[100px]">Category</TableHead>
                    <TableHead className="w-[100px]">Confidence</TableHead>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className="border-white/10 cursor-pointer hover:bg-white/5"
                      onClick={() => setSelectedItem(item)}
                    >
                      <TableCell>
                        {getCategoryIcon(item.classification, item.severity)}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate text-sm">{item.text_content}</p>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn("capitalize text-xs", getSeverityColor(item.severity))}
                        >
                          {item.classification}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {(item.confidence * 100).toFixed(0)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(item.created_at), 'MMM d, HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItem(item.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <HistoryAnalytics history={history} />
          </TabsContent>
        </Tabs>
      )}
    </>
  );

  if (embedded) {
    return (
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="gradient-text">Analysis</span> History
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              View and manage your past content analyses
            </p>
          </div>
          <div className="max-w-5xl mx-auto glass-card rounded-2xl p-6">
            {historyContent}
          </div>
        </div>

        {/* Detail View Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedItem && getCategoryIcon(selectedItem.classification, selectedItem.severity)}
                Analysis Details
              </DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Analyzed Text</p>
                  <p className="text-foreground">{selectedItem.text_content}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Classification</p>
                    <Badge variant="outline" className={cn("capitalize", getSeverityColor(selectedItem.severity))}>
                      {selectedItem.classification}
                    </Badge>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                    <p className="font-mono font-semibold">{(selectedItem.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Language</p>
                    <p className="font-medium">{selectedItem.language}</p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Target Type</p>
                    <p className="font-medium capitalize">{selectedItem.target_type || 'None'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(selectedItem.created_at), 'MMMM d, yyyy \'at\' HH:mm')}
                  </span>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive"
                    onClick={() => { deleteHistoryItem(selectedItem.id); setSelectedItem(null); }}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Clear All Confirmation */}
        <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <AlertDialogContent className="glass-card border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All History?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all {history.length} analysis records. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => { clearAllHistory(); setClearDialogOpen(false); }}>
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] glass-card border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <History className="w-5 h-5 text-primary" />
              Analysis History
            </DialogTitle>
            <DialogDescription>
              View and manage your past content analyses
            </DialogDescription>
          </DialogHeader>
          {historyContent}
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="glass-card border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && getCategoryIcon(selectedItem.classification, selectedItem.severity)}
              Analysis Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Analyzed Text</p>
                <p className="text-foreground">{selectedItem.text_content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Classification</p>
                  <Badge 
                    variant="outline" 
                    className={cn("capitalize", getSeverityColor(selectedItem.severity))}
                  >
                    {selectedItem.classification}
                  </Badge>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                  <p className="font-mono font-semibold">
                    {(selectedItem.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Language</p>
                  <p className="font-medium">{selectedItem.language}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Target Type</p>
                  <p className="font-medium capitalize">{selectedItem.target_type || 'None'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(new Date(selectedItem.created_at), 'MMMM d, yyyy \'at\' HH:mm')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    deleteHistoryItem(selectedItem.id);
                    setSelectedItem(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {history.length} analysis records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                clearAllHistory();
                setClearDialogOpen(false);
              }}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AnalysisHistory;
