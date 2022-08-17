import { Component, PropsWithChildren } from 'react'

interface State {
  error?: string
}

export default class ComponentPreviewBoundary extends Component<PropsWithChildren, State> {
  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo)
  }

  render() {
    if (this.state?.error) {
      return <div>{this.state.error.toString()}</div>
    }

    return this.props.children
  }
}