import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, WifiOff, Package } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  inline?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: "chunk" | "network" | "generic";
}

function isChunkError(e: Error): boolean {
  return e.name === "ChunkLoadError" || /Loading chunk \d+ failed/i.test(e.message) || /Failed to fetch dynamically imported module/i.test(e.message);
}

function isNetworkError(e: Error): boolean {
  return e.message === "Failed to fetch" || e.name === "TypeError";
}

function FullPageFallback({ error, errorType, onReset }: { error: Error | null; errorType: State["errorType"]; onReset(): void }) {
  const isChunk = errorType === "chunk";
  const isNet = errorType === "network";
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto bg-red-500/10 border border-red-500/20">
          {isChunk ? <Package className="w-10 h-10 text-amber-400" /> : isNet ? <WifiOff className="w-10 h-10 text-blue-400" /> : <AlertTriangle className="w-10 h-10 text-red-400" />}
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{isChunk ? "New version available" : isNet ? "Connection lost" : "Something went wrong"}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{isChunk ? "FreelanceSkills just deployed an update. Refresh to get the latest version." : isNet ? "Check your internet connection and try again." : "An unexpected error occurred. Try refreshing or go back to the homepage."}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => window.location.reload()} className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white" data-testid="btn-error-reload"><RefreshCw className="w-4 h-4" />{isChunk ? "Refresh now" : "Try again"}</Button>
          {!isChunk && <Button variant="outline" onClick={() => { window.location.href = "/"; }} className="border-slate-700 text-slate-300 hover:text-white" data-testid="btn-error-home">Go Home</Button>}
        </div>
        {import.meta.env.DEV && error && <details className="text-left mt-4"><summary className="text-xs text-slate-500 cursor-pointer">Dev: error details</summary><pre className="mt-2 text-xs text-red-400 bg-slate-900 p-3 rounded-lg overflow-auto max-h-40 border border-red-500/20">{error.message}{"\n"}{error.stack}</pre></details>}
      </div>
    </div>
  );
}

function InlineFallback({ onReset }: { onReset(): void }) {
  return <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm" data-testid="error-boundary-inline"><div className="flex items-center gap-2 text-red-400"><AlertTriangle className="w-4 h-4 shrink-0" /><span>This section failed to load.</span></div><Button size="sm" variant="ghost" onClick={onReset} className="gap-1 text-xs text-red-400 hover:text-red-300"><RefreshCw className="w-3 h-3" /> Retry</Button></div>;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorType: "generic" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorType: isChunkError(error) ? "chunk" : isNetworkError(error) ? "network" : "generic" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleReset = () => this.setState({ hasError: false, error: null, errorType: "generic" });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    if (this.props.inline) return <InlineFallback onReset={this.handleReset} />;
    return <FullPageFallback error={this.state.error} errorType={this.state.errorType} onReset={this.handleReset} />;
  }
}

export function SectionBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary inline>{children}</ErrorBoundary>;
}
