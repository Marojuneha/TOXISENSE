import { useState, useRef } from 'react';
import { Upload, FileText, Download, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyzeBatch, type BatchResult } from '@/lib/mockAnalysis';
import { cn } from '@/lib/utils';

const BatchAnalysis = () => {
  const [file, setFile] = useState<File | null>(null);
  const [texts, setTexts] = useState<string[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setResults([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      setTexts(lines.slice(0, 50)); // Limit to 50 texts
    };
    reader.readAsText(uploadedFile);
  };

  const handleAnalyze = async () => {
    if (texts.length === 0) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    setResults([]);

    const batchResults: BatchResult[] = [];
    
    for (let i = 0; i < texts.length; i++) {
      const result = await analyzeBatch([texts[i]]);
      batchResults.push(...result);
      setProgress(((i + 1) / texts.length) * 100);
      setResults([...batchResults]);
    }

    setIsAnalyzing(false);
  };

  const handleDownload = () => {
    if (results.length === 0) return;

    const csvContent = [
      'ID,Text,Offensive,Confidence,Category,Target,Language',
      ...results.map(r => 
        `${r.id},"${r.text.replace(/"/g, '""')}",${r.result.isOffensive},${r.result.confidence.toFixed(3)},${r.result.category},${r.result.target},${r.result.language}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setFile(null);
    setTexts([]);
    setResults([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const offensiveCount = results.filter(r => r.result.isOffensive).length;
  const safeCount = results.length - offensiveCount;

  return (
    <section id="batch" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text">Batch</span> Analysis
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a CSV or TXT file with multiple texts to analyze them all at once. 
            Download the results as a comprehensive report.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6">
            {/* Upload Area */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              
              {!file ? (
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                >
                  <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Drop your file here or click to upload</p>
                  <p className="text-sm text-muted-foreground">Supports .txt and .csv files (max 50 lines)</p>
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{texts.length} texts loaded</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearAll}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {isAnalyzing && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Analyzing texts...</span>
                  <span className="text-sm font-mono">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-[hsl(220,91%,54%)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleAnalyze}
                disabled={texts.length === 0 || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze All ({texts.length})
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={results.length === 0}
              >
                <Download className="w-4 h-4" />
                Download CSV
              </Button>
            </div>

            {/* Summary Stats */}
            {results.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-secondary/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{results.length}</p>
                  <p className="text-sm text-muted-foreground">Total Analyzed</p>
                </div>
                <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-success">{safeCount}</p>
                  <p className="text-sm text-muted-foreground">Safe Content</p>
                </div>
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-destructive">{offensiveCount}</p>
                  <p className="text-sm text-muted-foreground">Offensive Content</p>
                </div>
              </div>
            )}

            {/* Results Table */}
            {results.length > 0 && (
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">#</th>
                        <th className="text-left p-3 text-sm font-medium">Text</th>
                        <th className="text-left p-3 text-sm font-medium">Result</th>
                        <th className="text-left p-3 text-sm font-medium">Confidence</th>
                        <th className="text-left p-3 text-sm font-medium">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((item) => (
                        <tr key={item.id} className="border-t border-border hover:bg-secondary/20">
                          <td className="p-3 text-sm">{item.id}</td>
                          <td className="p-3 text-sm max-w-[200px] truncate" title={item.text}>
                            {item.text}
                          </td>
                          <td className="p-3">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                              item.result.isOffensive 
                                ? "bg-destructive/20 text-destructive"
                                : "bg-success/20 text-success"
                            )}>
                              {item.result.isOffensive ? (
                                <AlertTriangle className="w-3 h-3" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              {item.result.isOffensive ? 'Offensive' : 'Safe'}
                            </span>
                          </td>
                          <td className="p-3 text-sm font-mono">
                            {(item.result.confidence * 100).toFixed(1)}%
                          </td>
                          <td className="p-3">
                            <span className={cn(
                              "px-2 py-1 rounded text-xs capitalize",
                              item.result.category === 'hate' && "bg-destructive/20 text-destructive",
                              item.result.category === 'abuse' && "bg-warning/20 text-warning",
                              item.result.category === 'neutral' && "bg-muted text-muted-foreground"
                            )}>
                              {item.result.category}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BatchAnalysis;
