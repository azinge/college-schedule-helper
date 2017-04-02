import React, { PropTypes } from 'react';

function SearchResult(props) {
  // TODO: Implement SearchResult
  return (
    <div className="search-result card">
      Search Result
      <i className="material-icons add-icon">add</i>
    </div>
  );
}

function CourseSearch(props) {
  // TODO: Implement Course Search
  // TODO: Implement Custom Event
  return (
    <div className="component col l6 s12">
      <div className="header center">Course Search</div>
      <div className="body">
        <div className="search">
          <div className="search-bar card">
            <input id="search-bar" />
            <i className="material-icons search-icon">search</i>
          </div>
        </div>
        <div className="search-results">
          <SearchResult />
        </div>
      </div>
      <div className="header center">Custom Event</div>
      <div className="body center" style={{ padding: '25px' }}>
        Custom Events: Coming Soon!
      </div>
    </div>
  );
}

export default CourseSearch;
