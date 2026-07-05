import { Component, PropsWithChildren } from 'react';
import { getActionButtonClass } from '../config/buttonUi';
import { DefaultLanguage } from '../config/appConfig';
import { getAppText } from '../config/appI18n';

type AppErrorBoundaryProps = PropsWithChildren<object>;

type AppErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

function resolveBoundaryLanguage(): DefaultLanguage {
  if (typeof document === 'undefined') return 'english';
  const htmlLang = (document.documentElement.lang || '').toLowerCase();
  if (htmlLang.startsWith('my')) return 'burmese';
  if (htmlLang.startsWith('th')) return 'thai';
  if (htmlLang.startsWith('vi')) return 'vietnamese';
  return 'english';
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true, errorMessage: '' };
  }

  componentDidCatch(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
    this.setState({ errorMessage });
    console.error('App crashed:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const appStateText = getAppText(resolveBoundaryLanguage()).appState;
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-app">
          <div className="w-full max-w-md rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--surface-default)] p-6 text-center">
            <h1 className="mb-2 text-xl font-extrabold text-[var(--portfolio-text)]">{appStateText.unexpectedErrorTitle}</h1>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              {appStateText.unexpectedErrorMessage}
            </p>
            {this.state.errorMessage ? (
              <pre className="mb-4 overflow-x-auto rounded-xl bg-black/5 p-3 text-left text-xs text-[var(--portfolio-text)]">
                {this.state.errorMessage}
              </pre>
            ) : null}
            <button
              type="button"
              onClick={this.handleReload}
              className={getActionButtonClass({ variant: 'primary', size: 'md', fullWidth: true })}
            >
              {appStateText.reloadLabel}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

