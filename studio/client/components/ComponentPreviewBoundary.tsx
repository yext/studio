import { Component, PropsWithChildren } from 'react'

interface State {
  error?: Error
}

export default class ComponentPreviewBoundary extends Component<PropsWithChildren, State> {
  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state?.error) {
      return <div>{this.state.error.toString()}</div>
    }

    return this.props.children
  }
}