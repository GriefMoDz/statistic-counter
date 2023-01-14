import { common } from 'replugged';
import type { ErrorBoundaryState } from '@types';

const { React } = common;

class ErrorBoundary extends React.Component<React.PropsWithChildren, React.ComponentState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log(
      '%c[ErrorBoundary:StatisticCounter]',
      'color: #f04747;',
      'An error has occurred while rendering the statistic counter. Please contact Harley (350227339784880130), or open an issue on the GitHub repository.\n',
      { error, errorInfo }
    );
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className='statistic-counter-list-item'>
          <div className='statistic-counter'>Error — 😞</div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
