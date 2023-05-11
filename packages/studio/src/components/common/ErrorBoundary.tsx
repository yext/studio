import { Component, PropsWithChildren } from "react";

interface State {
  error?: Error;
}

type Props = PropsWithChildren<{
  customError?: string;
}>;

/**
 * An error boundary component that catch JavaScript errors in their child component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 */
export default class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state?.error) {
      return this.props.children;
    }
    const error = this.props.customError ?? this.state.error.toString();

    return <div>{error}</div>;
  }
}
