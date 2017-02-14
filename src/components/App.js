import React, { PropTypes } from 'react';

const propTypes = {
  children: PropTypes.element.isRequired,
};

function App({ children }) {
  return (
    <div>
      <nav className="light-blue lighten-1" role="navigation">
        <div className="nav-wrapper container"><a id="logo-container" href="#logo" className="brand-logo">College Schedule Helper</a>
          <ul className="right hide-on-med-and-down">
            <li><a href="#github">Github</a></li>
            <li><a href="#version">v0.0.0</a></li>
          </ul>
        </div>
      </nav>
      {children}
    </div>
  );
}

App.propTypes = propTypes;

export default App;
