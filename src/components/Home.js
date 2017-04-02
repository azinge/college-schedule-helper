import React from 'react';
import Schedule from '../js/react-schedule/Schedule';
import CourseList from './Panel/CourseList';
import CourseSearch from './Panel/CourseSearch';
import CourseJS from './course';

// TODO: Convert CRN select method to course search and select

var Home = React.createClass({
  getInitialState: function () {
    return {
      start: "900",
      end: "1500",
      courses: []
    }
  },

  onGetInfo: function (entries) {
    this.setState({
      start: $("#start").val().trim(),
      end: $("#end").val().trim(),
      courses: entries
    });
  },

  parseDataToCourse: function (data) {
    var dayFromLetter = {
      "M": "Mon",
      "T": "Tue",
      "W": "Wed",
      "R": "Thu",
      "F": "Fri",
      "S": "Sat",
      "U": "Sun"
    };
    var timesProp = data.times;
    var times = [];
    for (var i = 0; i < timesProp.length; i++) {
      var prop = timesProp[i].split(",");

      if (prop[1] == " TBA") {
        return;
      }

      var moments = prop[1].split("-");
      var startMoment = moments[0].split(" ");
      var isPm = startMoment[2] == "pm";
      startMoment = startMoment[1].split(":");
      startMoment = parseInt(startMoment[0] + startMoment[1] - 1) % 1200 + (isPm ? 1201 : 1);
      var endMoment = moments[1].split(" ");
      isPm = endMoment[1] == "pm";
      endMoment = endMoment[0].split(":")
      endMoment = parseInt(endMoment[0] + endMoment[1] - 1) % 1200 + (isPm ? 1201 : 1);

      var days = prop[0];
      for (var j = 0; j < days.length; j++) {
        var day = dayFromLetter[days.charAt(j)];
        var start = {"day":day, time:startMoment};
        var end = {"day":day, time:endMoment};
        times.push(new CourseJS.Time(start, end));
      }
    }
    var timeSet = new CourseJS.TimeSet(times);

    var courseInfo = new CourseJS.CourseInfo(data.info.searchable, data.info.regular, data.info.hidden, data.classInfo.number, data.classInfo.section, data.classInfo.abbreviation);

    var course = new CourseJS.Course(data.alias, timeSet, courseInfo);
    return course;
  },

  componentDidMount: function () {
    var entries = [];
    var courseMap = {};
    var exampleSchedules = [
      ["70816", "70815", "73755", "71009", "71624"],
      ["70848", "70815", "76780", "77185", "77231", "78158", "78394"]
    ];
    var onGetInfo = this.onGetInfo;

    $.getJSON("https://cdn.rawgit.com/cazinge/college-schedule-helper/540c0672/data/lmu/json/Fall_2017.json", function(data) {
      courseMap = data;
      $("#crn-submit").prop("disabled", false);
      $('#crn-submit').click(() => {
        entries = [];
        if ($('#examples').val() !== "") {
          exampleSchedules[$('#examples').val()-1].forEach((crn)=>{
            entries.push(courseMap[crn]);
          });
        } else {
          $('.crn').each(function () {
            courseMap[$(this).val().trim()] && entries.push(courseMap[$(this).val().trim()]);
          })
        }
        onGetInfo(entries);
      });
    });
  },

  render: function () {
    // TODO: Implement Settings
    const courses = this.state.courses.map((entry) => {return this.parseDataToCourse(entry)})
    return (
      <div>
        <div className="section no-pad-bot" id="index-banner">
          <div className="container">
            <br /><br />
            <div className="row center">
              <Schedule courses={courses} start={this.state.start} end={this.state.end} />
            </div>
            <br /><br />
          </div>
        </div>
        <div className="container lower-half">
          <div className="row">
            <CourseList />
            <CourseSearch />
          </div>
        </div>
        <br/><br/>
        <footer className="page-footer light-blue lighten-1">
          <div className="container">
            <div className="row">
              <div className="col l6 s12">
                <h5 className="white-text">Settings:</h5>
                <p className="grey-text text-lighten-4">Select Semester: Coming Soon!</p>
              </div>
              <div className="col l4 offset-l2 s12">
                <h5 className="white-text">Our Other Projects:</h5>
                <ul>
                  <li><a className="grey-text text-lighten-3" href="#!">Spotify Transition</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-copyright">
            <div className="container">
              By Eddie Azinge and Brian Joerger
              <a className="grey-text text-lighten-4 right" href="#!">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }
});

export default Home;
