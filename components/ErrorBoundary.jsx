const { React } = require('powercord/webpack');

const encounteredErrors = [];

module.exports = class ErrorBoundary extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      info: null
    };
  }

  componentDidCatch (error, info) {
    this.setState({
      hasError: true,
      error,
      info
    });
  }

  render () {
    const { hasError, error, info } = this.state;

    if (hasError) {
      if (!encounteredErrors.includes(error)) {
        console.log(
          '%c[ErrorBoundary:StatisticsCounter]', 'color: #f04747',
          'An error has occurred while rendering the statistics counter. Please contact Harley (350227339784880130), or open an issue on the GitHub repository.\n',
          { error, info }
        );

        encounteredErrors.push(error);
      }

      return (
        <div className='statistics-counter-list-item'>
          <div className='statistics-counter'>Error — 😞</div>
        </div>
      );
    }

    return this.props.children;
  }
};
