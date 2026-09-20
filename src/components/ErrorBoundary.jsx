import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="bg-base-200/60 backdrop-blur-xl border border-base-content/10 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">Something went wrong</h2>
              <p className="text-xs text-base-content/60 mt-1.5 leading-relaxed">
                {this.state.error?.message || "An unexpected error occurred while rendering this page."}
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="btn btn-sm btn-primary rounded-xl gap-2"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
              <a
                href="/"
                className="btn btn-sm btn-outline rounded-xl gap-2"
              >
                <Home size={14} />
                Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
