import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="rounded-xl bg-red-50 p-6 text-red-700">Something went wrong while rendering DakX.</div>;
    }
    return this.props.children;
  }
}
