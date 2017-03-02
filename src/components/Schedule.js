import React from 'react';

function standardTimeToMinutes (min) {
  var data = min.split(/[\: ]/);
  var res = data[2] === "PM" ? 720 : 0;
  res += +data[0] % 12 * 60;
  res += +data[1];
  return res;
}

function militaryTimeToMinutes (min) {
  return (((min / 100)|0) * 60 + min % 100) % 1440;
}

function minutesToStandardTime (min) {
  min = min % 1440;
  var meridiem = min >= 720 ? "PM" : "AM";
  var hours = ((min / 60)|0) % 12;
  if (hours === 0) hours = 12;
  var minutes = min % 60;
  return "" + hours + ":" + (minutes < 10 ? "0" : "") + minutes + " " + meridiem;
}

// hash function and conversion to color from stack overflow answer
function djb2(str){
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
  }
  return hash;
}

function hashStringToColor(str) {
  var hash = djb2(str);
  var r = (hash & 0xFF0000) >> 16;
  var g = (hash & 0x00FF00) >> 8;
  var b = hash & 0x0000FF;
  return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
}
// http://stackoverflow.com/a/16533568

function Text (props) {
  return (
    <div className="text">
      {props.children}
    </div>
  );
}

function CourseBlock (props) {
  var course = props.course;
  var courseTime = props.courseTime;
  var color = hashStringToColor(course.alias);
  var start = militaryTimeToMinutes(courseTime.start.time);
  var end = militaryTimeToMinutes(courseTime.end.time);
  var startDist = (start % 30)*(50/15)+"%";
  var height = (end - start)*(50/15)+"%";
  var styles = {
    top: startDist,
    height: height,
    "background-color": color,
    "border-color": color,
    "box-shadow": "2px 1px 1px " + color
  };
  return (
    <div className={"course-block "+ color} style={styles}>
      <Text>{course.info.subject + " " + course.info.number + "-" + course.info.section}</Text>
    </div>
  );
}

function TimeBlock (props) {
  var text = "";
  var time = props.time;
  if (props.type === "time" && time % 60 == 0) {
    text = (<Text>{minutesToStandardTime(time)}</Text>);
  }
  return (<div className="time-block">{text} {props.children}</div>)
}

function SchedulePane (props) {
  var title = props.title;
  var type = props.type;
  var courses = props.courses.filter((course)=>{
    return course
    && course.times.days[title.slice(0,3)]
    && course.times.days[title.slice(0,3)].length > 0
  });
  var timeBlocks = props.timeBlocks.map((time) => {
    var blocks = [];
    for (var course of courses) {
      for (var courseTime of course.times.days[title.slice(0,3)]) {
        if (((militaryTimeToMinutes(courseTime.start.time)/30)|0)*30 === time) {
          blocks.push(<CourseBlock course={course} courseTime={courseTime}/>);
        }
      }
    }
    return (<TimeBlock type={type} time={time}>{blocks}</TimeBlock>)
  });
  return (
    <div className={"schedule-pane pane-" + type}>
      <div className="pane-header">
        <Text>{props.title}</Text>
      </div>
      <div className="times">
        {timeBlocks}
      </div>
    </div>
  );
};

function Schedule (props) {
  var timeBlocks = [];
  var start = standardTimeToMinutes(props.start);
  var end = standardTimeToMinutes(props.end);
  for (var i = ((start/30)|0)*30; i <= end; i+= 30) {
    timeBlocks.push(i);
  }
  var titles = [["Times", "time"], ["Sunday", "weekend"], ["Monday", "day"], ["Tuesday", "day"], ["Wednesday", "day"], ["Thursday", "day"], ["Friday", "day"], ["Saturday", "weekend"]];
  var schedulePanes = [];
  for (var i = 0; i < titles.length; i++) {
    schedulePanes.push(<SchedulePane title={titles[i][0]} type={titles[i][1]} timeBlocks={timeBlocks} courses={props.courses}/>);
  }

  return (
    <div className="schedule">
      <div className="schedule-header">
        <Text>LMU Spring 2017 Schedule</Text>
      </div>
      <div className="schedule-main">
        {schedulePanes}
      </div>
    </div>
  );
};

export default Schedule;
