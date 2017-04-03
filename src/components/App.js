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
            <li><a href="http://academics.lmu.edu/media/lmuacademics/officeoftheregistrar/documents/schedules/Fall%202017%20Schedule%20of%20Classes.pdf" rel="noopener noreferrer" target="_blank">Click Here to Search for Courses!</a></li>
            <li><a href="https://github.com/cazinge/college-schedule-helper/issues" rel="noopener noreferrer" target="_blank">Issues</a></li>
          </ul>
        </div>
      </nav>
      {children}
    </div>
  );
}

App.propTypes = propTypes;

export default App;
