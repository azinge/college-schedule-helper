import React, { PropTypes } from 'react';

function Course(props) {
  // TODO: Implement Course
  return (
    <div className="course card">
      Course
      <i className="material-icons disable-icon">clear</i>
      <i className="material-icons trash-icon">delete</i>
    </div>
  );
}

function CourseList(props) {
  // TODO: Implement CourseList
  return (
    <div className="component col l6 s12">
      <div className="header center">Schedule</div>
      <div className="schedule-body">
        <div className="courses">
          <Course />
        </div>
        <div className="schedule-combinations center">Multiple Schedules: Coming Soon!</div>
      </div>
    </div>
  );
}

export default CourseList;
