import { Component, type ReactNode } from 'react'

export class ConceptualViewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="concept-loading" role="alert">
          The optional 3D view could not load. Close this section and reopen it to retry; the planar calculations are unaffected.
        </div>
      )
    }
    return this.props.children
  }
}
