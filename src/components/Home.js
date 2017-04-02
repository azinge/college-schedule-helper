import React from 'react';
import Schedule from '../js/react-schedule/Schedule';
import CourseJS from './course';

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
      courses: entries.map((entry) => {return this.parseDataToCourse(entry)})
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

    return (
      <div>
      <div className="section no-pad-bot" id="index-banner">
      <div className="container">
      <br /><br />
      <div className="row center">
      <Schedule courses={this.state.courses} start={this.state.start} end={this.state.end} />
      </div>
      <div className="row center">
      <div className="row">
      <div className="input-field col l1 m2 s3">
      <input placeholder="CRN #1" id="CRN #1" type="text" className="validate crn" />
      </div>
      <div className="input-field col l1 m2 s3">
      <input placeholder="CRN #2" id="CRN #2" type="text" className="validate crn" />
      </div>
      <div className="input-field col l1 m2 s3">
      <input placeholder="CRN #3" id="CRN #3" type="text" className="validate crn" />
      </div>
      <div className="input-field col l1 m2 s3">
      <input placeholder="CRN #4" id="CRN #4" type="text" className="validate crn" />
      </div>
      <div className="input-field col l1 m2 s3">
      <input placeholder="CRN #5" id="CRN #5" type="text" className="validate crn" />
      </div>
      <div className="input-field col l1 m2 s3">
      <input placeholder="CRN #6" id="CRN #6" type="text" className="validate crn" />
      </div>
      <div className="input-field col l1 m2 s3">
      <input placeholder="CRN #7" id="CRN #7" type="text" className="validate crn" />
      </div>
      <div className="input-field col l1 m2 s3">
      <input placeholder="CRN #8" id="CRN #8" type="text" className="validate crn" />
      </div>
      <div className="input-field col l1 m2 s3">
      <input placeholder="CRN #9" id="CRN #9" type="text" className="validate crn" />
      </div>
      <div className="input-field col l1 m2 s3">
      <input placeholder="CRN #10" id="CRN #10" type="text" className="validate crn" />
      </div>
      <div className="input-field col l1 m2 s3">
      <input placeholder="CRN #11" id="CRN #11" type="text" className="validate crn" />
      </div>
      <div className="input-field col l1 m2 s3">
      <input placeholder="CRN #12" id="CRN #12" type="text" className="validate crn" />
      </div>
      </div>
      <div className="row">
      <div className="input-field col l6 m12 s12">
      <select id="examples">
      <option value="" selected>Example Schedules: Coming Soon!</option>
      </select>
      <label>Example Schedules</label>
      </div>
      <div className="input-field col l2 m4 s6">
      <select id="start">
      <option value="0" selected>12:00 AM</option>
      <option value="100">1:00 AM</option>
      <option value="200">2:00 AM</option>
      <option value="300">3:00 AM</option>
      <option value="400">4:00 AM</option>
      <option value="500">5:00 AM</option>
      <option value="600">6:00 AM</option>
      <option value="700">7:00 AM</option>
      <option value="800">8:00 AM</option>
      <option value="900" selected>9:00 AM</option>
      <option value="1000">10:00 AM</option>
      <option value="1100">11:00 AM</option>
      <option value="1200">12:00 PM</option>
      <option value="1300">1:00 PM</option>
      <option value="1400">2:00 PM</option>
      <option value="1500">3:00 PM</option>
      <option value="1600">4:00 PM</option>
      <option value="1700">5:00 PM</option>
      <option value="1800">6:00 PM</option>
      <option value="1900">7:00 PM</option>
      <option value="2000">8:00 PM</option>
      <option value="2100">9:00 PM</option>
      <option value="2200">10:00 PM</option>
      <option value="2300">11:00 PM</option>
      <option value="2400">12:00 AM</option>
      </select>
      <label>Start Time</label>
      </div>
      <div className="input-field col l2 m4 s6">
      <select id="end">
      <option value="0">12:00 AM</option>
      <option value="100">1:00 AM</option>
      <option value="200">2:00 AM</option>
      <option value="300">3:00 AM</option>
      <option value="400">4:00 AM</option>
      <option value="500">5:00 AM</option>
      <option value="600">6:00 AM</option>
      <option value="700">7:00 AM</option>
      <option value="800">8:00 AM</option>
      <option value="900">9:00 AM</option>
      <option value="1000">10:00 AM</option>
      <option value="1100">11:00 AM</option>
      <option value="1200">12:00 PM</option>
      <option value="1300">1:00 PM</option>
      <option value="1400">2:00 PM</option>
      <option value="1500" selected>3:00 PM</option>
      <option value="1600">4:00 PM</option>
      <option value="1700">5:00 PM</option>
      <option value="1800">6:00 PM</option>
      <option value="1900">7:00 PM</option>
      <option value="2000">8:00 PM</option>
      <option value="2100">9:00 PM</option>
      <option value="2200">10:00 PM</option>
      <option value="2300">11:00 PM</option>
      <option value="2400">12:00 AM</option>
      </select>
      <label>End Time</label>
      </div>
      <div className="col l2 m4 s12">
      <button id="crn-submit" className="btn waves-effect waves-light" type="submit" name="action" style={{ margin: 'auto' }} disabled>Submit</button>
      </div>
      </div>
      </div>
      <br /><br />
      </div>
      </div>
      </div>
    );
  }
});

export default Home;
