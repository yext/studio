import { Component, PropsWithChildren } from "react";

interface State {
  error?: Error;
}

/**
 * An error boundary component that catch JavaScript errors in their child component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 */
export default class ErrorBoundary extends Component<PropsWithChildren, State> {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state?.error) {
      return <div>{this.state.error.toString()}</div>;
    }
    return this.props.children;
  }
}
