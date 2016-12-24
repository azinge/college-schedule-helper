'use strict';
const fs = require('fs');
const jsonfile = require('jsonfile');
const cheerio = require('cheerio');

const htmlFolder = 'data/lmu/html/';

var runHtmlToCourses = createAsync(function*() {
  var paths = yield getPaths(htmlFolder);
  var status = yield processFiles(paths);
  createStatusReport(status);
});

var jsonify = function(path) {
  var courses = parseCourses(cheerio.load(fs.readFileSync(path)));
  writeCoursesToFile(courses, path);
  return getStatusFromCourses(courses, path);
};

function writeCoursesToFile(courses, htmlPath) {
  var file = htmlPath.replace('.html', '.json').replace('/html/', '/json/');
  jsonfile.writeFile(file, courses, function(err) {
    if (err) {
      console.error(err);
    }
  });
}

function getStatusFromCourses(courses, path) {
  return {
    path: path,
    numCourses: Object.keys(courses).length
  };
}

function parseCourses($) {
  let courseGroups = [];
  let courses = {};
  $('.datadisplaytable').find('tr').each((i, row) => {
    let $row = $(row);
    if ($row.find('th').length === 1) {
      courseGroups.push([]);
    }
    courseGroups[courseGroups.length - 1].push($row);
  });

  for (let courseGroup of courseGroups) {
    let subject = courseGroup[0].find('th').text();
    let previousAlias = '';
    for (let rawCourse of courseGroup.slice(2)) {
      rawCourse = rawCourse.find('td');
      if (rawCourse.eq(1).text().charCodeAt(0) !== 160) {
        previousAlias = rawCourse.eq(1).text();
        let course = {
          alias: rawCourse.eq(1).text(),
          times: [rawCourse.eq(8).text() + ', ' + rawCourse.eq(9).text() + ', ' +
          rawCourse.eq(18).text()
        ],
        classInfo: {
          subject: subject,
          abbreviation: rawCourse.eq(2).text(),
          number: rawCourse.eq(3).text(),
          section: rawCourse.eq(4).text()
        },
        info: {
          searchable: {
            title: rawCourse.eq(7).text()
          },
          regular: {
            units: rawCourse.eq(6).text(),
            duration: rawCourse.eq(17).text(),
            campus: rawCourse.eq(5).text()
          },
          hidden: {}
        }
      }
      course.info.searchable.instructors = rawCourse.eq(16).text()
      .replace('(P)', '').replace(/\s+/g, ' ').trim().split(' , ');
      let attributes = rawCourse.eq(19).text().split(' and ');
      let labFee = attributes.indexOf('Lab Fee Required');
      if (labFee > -1) {
        attributes.splice(labFee, 1);
        course.info.regular.labFee = true;
      }
      if (attributes[0] && attributes[0].charCodeAt(0) !== 160) {
        course.info.searchable.flags = attributes;
      }
      courses[course.alias] = course;
    } else {
      courses[previousAlias].times.push(rawCourse.eq(8).text() + ', ' +
      rawCourse.eq(9).text() + ', ' + rawCourse.eq(18).text());
    }
  }
}
return courses;
}

function getPaths(folder) {
  return new Promise(function(fulfill) {
    fs.readdir(folder, (err, fileNames) => {
      fulfill(fileNames);
    });
  }).then(function(fileNames) {
    var filePaths = fileNames.filter(fileName => fileName.indexOf('.html') > -1)
    .map(fileName => folder + fileName);
    return Promise.resolve(filePaths);
  });
}

function processFiles(paths) {
  return Promise.all(paths.map(path => {
    return new Promise(function(fulfill) {
      fulfill(jsonify(path));
    })
  })).then(function(statuses) {
    return {
      lastModified: new Date().toString(),
      statuses: statuses
    };
  });
}

function createStatusReport(statusReport) {
  var file = htmlFolder.replace('/html/', '/statusReport.json');
  jsonfile.writeFile(file, statusReport, {
    spaces: 2
  }, function(err) {
    if (err) {
      console.error(err);
    }
  });
  console.log('Finished: Status Report made in ' + file);
}

/*
Asynchronous generator code and paradigm from:
https://www.promisejs.org/generators/
*/

function createAsync(makeGenerator) {
  return function() {
    var generator = makeGenerator.apply(this, arguments);

    function handle(result) {
      if (result.done) {
        return Promise.resolve(result.value);
      }
      return Promise.resolve(result.value).then(function(res) {
        return handle(generator.next(res));
      }, function(err) {
        return handle(generator.throw(err));
      });
    }

    try {
      return handle(generator.next());
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}

runHtmlToCourses();