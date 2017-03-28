import React, { PropTypes } from 'react';

// TODO: Import CSS

function standardTimeToMinutes(min) { // eslint-disable-line no-unused-vars
  const data = min.split(/[: ]/);
  let res = data[2] === 'PM' ? 720 : 0;
  res += (+data[0] % 12) * 60;
  res += +data[1];
  return res;
}

function militaryTimeToMinutes(min) {
  return ((Math.floor(min / 100) * 60) + (min % 100)) % 1440;
}

function minutesToStandardTime(min) {
  let minutes = min % 1440;
  let hours = Math.floor(minutes / 60) % 12;
  const meridiem = minutes >= 720 ? 'PM' : 'AM';
  if (hours === 0) hours = 12;
  minutes %= 60;
  return `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${meridiem}`;
}

function getPercentDistance(start, end, step) {
  return `${((end - start) / 30) * step}%`;
}

// hash function and conversion to color from stack overflow answer
function djb2(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) + str.charCodeAt(i);
  }
  return hash;
}

function hashStringToColor(str) {
  const hash = djb2(str);
  /* eslint-disable no-bitwise */
  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = hash & 0x0000FF;
  /* eslint-enable no-bitwise */
  const getString = x => (`0${x.toString(16)}`).substr(-2);
  return `#${getString(r)}${getString(g)}${getString(b)}`;
}
// http://stackoverflow.com/a/16533568

function Text(props) {
  /* eslint-disable react/prop-types */
  const children = props.children;
  /* eslint-enable react/prop-types */
  return (
    <div className="text">
      {children}
    </div>
  );
}
Text.proptypes = {
  children: PropTypes.element.isRequired,
};

function CourseBlock(props) {
  /* eslint-disable react/prop-types */
  const course = props.course;
  const time = props.time;
  const scale = props.scale;
  /* eslint-enable react/prop-types */
  const color = hashStringToColor(course.alias);
  const start = militaryTimeToMinutes(time.start.time);
  const end = militaryTimeToMinutes(time.end.time);
  const styles = {
    top: getPercentDistance(scale.start, start, scale.step),
    height: getPercentDistance(start, end, scale.step),
    backgroundColor: color,
    borderColor: color,
    boxShadow: `2px 1px 1px ${color}`,
  };
  return (
    <div className={`course-block ${color}`} style={styles}>
      <Text>
        {`${course.info.subject} ${course.info.number}-${course.info.section}`}
      </Text>
    </div>
  );
}
CourseBlock.proptypes = {
  course: PropTypes.object.isRequired,
  time: PropTypes.object.isRequired,
  scale: PropTypes.object.isRequired,
};

function TimeBlock(props) {
  /* eslint-disable react/prop-types */
  const time = props.time;
  const scale = props.scale;
  /* eslint-enable react/prop-types */
  const spacing = {
    top: getPercentDistance(scale.start, time, scale.step),
    width: '90px',
  };
  return (
    <div className="time-block" style={spacing}>
      <Text>{minutesToStandardTime(time)}</Text>
    </div>
  );
}
TimeBlock.proptypes = {
  time: PropTypes.number.isRequired,
  scale: PropTypes.object.isRequired,
};

function SchedulePane(props) {
  /* eslint-disable react/prop-types */
  const data = props.data;
  const gradient = props.gradient;
  const scale = props.scale;
  /* eslint-enable react/prop-types */
  const title = data[0];
  const type = data[1];
  const times = [];
  const courses = [];

  if (type === 'time') {
    data[2].forEach((time) => {
      times.push(
        <TimeBlock time={time} scale={scale} key={time} />,
      );
    });
  } else {
    data[2].forEach((course) => {
      course.times.days[title.slice(0, 3)].forEach((time) => {
        courses.push(
          <CourseBlock course={course} time={time} scale={scale} key={`${course.alias} ${time.start} ${time.end}`} />,
        );
      });
    });
  }

  return (
    <div className={`schedule-pane pane-${type}`}>
      <div className="pane-header">
        <Text>{title}</Text>
      </div>
      <div className="times" style={gradient}>
        {type === 'time' ? times : courses}
      </div>
    </div>
  );
}
SchedulePane.proptypes = {
  data: PropTypes.array.isRequired,
  gradient: PropTypes.object.isRequired,
  scale: PropTypes.array.isRequired,
};

function Schedule(props) {
  let start = +props.start + 100 || 1000;
  let end = +props.end || 1500;

  const titles = [
    ['Times', 'time', []],
    ['Sunday', 'weekend', []],
    ['Monday', 'day', []],
    ['Tuesday', 'day', []],
    ['Wednesday', 'day', []],
    ['Thursday', 'day', []],
    ['Friday', 'day', []],
    ['Saturday', 'weekend', []],
  ];

  const getCoursesOnDay = day =>
    props.courses.filter(course =>
      course && course.times.days[day] && course.times.days[day].length > 0);

  props.courses.forEach((course) => {
    course.times &&
    course.times.getTimes().forEach((time) => {
      start = Math.min(time.start.time, start);
      end = Math.max(time.end.time, end);
    });
  });

  start = militaryTimeToMinutes(start);
  start = Math.max(((Math.floor(start / 60) * 60) - 60), 0);

  end = end >= 2400 ? 1440 : militaryTimeToMinutes(end);
  end = Math.min(((Math.floor(end / 60) * 60) + 60), 1440);

  const step = 3000 / (end - start);

  const scale = { start, end, step };

  for (let i = 1; i < titles.length; i++) {
    titles[i][2] = getCoursesOnDay(titles[i][0].slice(0, 3)) || [];
  }
  for (let i = start; i < end; i += 60) {
    titles[0][2].push(i);
  }
  const timeGradient = {
    background: `repeating-linear-gradient(to bottom, #C1D4F1, #C1D4F1 ${step}%, #E9EDF2 ${step}%, #E9EDF2 ${step * 2}%)`,
  };
  const gradient = {
    background: `repeating-linear-gradient(to bottom, #E2E2E2, #E2E2E2 ${step}%, white ${step}%, white ${step * 2}%)`,
  };

  const schedulePanes = [];
  for (let i = 0; i < titles.length; i++) {
    schedulePanes.push(
      <SchedulePane data={titles[i]} gradient={titles[i][1] === 'time' ? timeGradient : gradient} scale={scale} key={titles[i][0]} />,
    );
  }

  return (
    <div className="schedule">
      <div className="schedule-header">
        <Text>LMU Fall 2017 Schedule</Text>
      </div>
      <div className="schedule-main">
        {schedulePanes}
      </div>
    </div>
  );
}
Schedule.propTypes = {
  courses: PropTypes.array.isRequired,
  start: PropTypes.string,
  end: PropTypes.string,
};

export default Schedule;
