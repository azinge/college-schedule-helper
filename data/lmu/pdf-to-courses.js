require('pdfjs-dist');
var fs = require('fs');
var jsonfile = require('jsonfile');

const pdfFolder = 'data/lmu/pdf/';

var runPDFToCourses = createAsync(function* () {
  var pdfPaths = yield getPDFPaths(pdfFolder);
  var status = yield processPDFs(pdfPaths);
  createStatusReport(status);
});

var jsonify = createAsync(function* (pdfPath) {
  var pdfDoc = yield PDFJS.getDocument(new Uint8Array(fs.readFileSync(pdfPath)));
  var pages = [];
  for (var i = 1; i <= pdfDoc.numPages; i++) {
    pages[i - 1] = i;
  }
  var rawCourseData = yield getRawCourseInfo(pdfDoc, pages);
  var courses = parseCourses(rawCourseData);
  writeCoursesToFile(courses, pdfPath);
  return getStatusFromCourses(courses, pdfPath);
});

var getCourseDataFromPageNumber = createAsync(function* (pdfDoc, pageNum) {
  var page = yield pdfDoc.getPage(pageNum);
  var textContent = yield page.getTextContent();
  return textContent.items.map(x => x.str).slice(14,-3);
});

function getRawCourseInfo (pdfDoc, pages) {
  return Promise.all(pages.map(pageNum => {
    return new Promise(function (fulfill) {
      fulfill(getCourseDataFromPageNumber(pdfDoc, pageNum));
    })
  })).then(function (rawCourseData) {
    return rawCourseData.reduce(function(a, b) {
      return a.concat(b);
    }, []);
  });
}

function writeCoursesToFile (courses, pdfPath) {
  var file = pdfPath.replace('.pdf', '.json').replace('/pdf/', '/json/');
  jsonfile.writeFile(file, courses, function(err) {
    if (err) {
      console.error(err);
    }
  });
}

function getStatusFromCourses (courses, pdfPath) {
  return {
    pdf: pdfPath,
    numCourses: Object.keys(courses).length
  };
}

function parseCourses (rawCourseData) {
  var subjMap = {};
  var courses = {};
  var separatedCourseData = [[]];
  var currentSubject = '';
  for (var item of rawCourseData) {
    if (/^\d{5}$/.test(item)) {
        separatedCourseData.push([]);
    }
    separatedCourseData[separatedCourseData.length-1].push(item);
  }
  for (var i = 1; i < separatedCourseData.length; i++) {
    if (separatedCourseData[i][1] !== currentSubject) {
      subjMap[separatedCourseData[i][1]] = separatedCourseData[i-1].pop();
      currentSubject = separatedCourseData[i][1];
    }
  }
  for (var i = 1; i < separatedCourseData.length; i++) {
     course = {
      alias: separatedCourseData[i][0],
      times: [separatedCourseData[i][5] + ', ' + separatedCourseData[i][6] + ', ' + separatedCourseData[i][7]],
      classInfo: {
        number: separatedCourseData[i][2],
        section: separatedCourseData[i][3],
        subject: separatedCourseData[i][1]
      },
      info: {
        searchable: {
          title: separatedCourseData[i][4],
          instructor: separatedCourseData[i][8],
          flags: []
        },
        regular: {
          extraData: []
        },
        hidden: {}
      }
    }
    var extraData = separatedCourseData[i].slice(9);
    for (var j = 0; j < extraData.length; j++){
      if (/^\d+$/.test(extraData[j]) || /^\d+ TO \d+/.test(extraData[j])) {
        course.info.regular.units = extraData[j];
      } else if (/^[A-Z]+$/.test(extraData[j])) {
        course.times.push(extraData[j++] + ', ' + extraData[j++] + ', ' + extraData[j]);
      } else if (/^[A-Z]+\:/.test(extraData[j])) {
        course.info.searchable.flags.push(extraData[j]);
      } else if (/\$/.test(extraData[j])) {
        course.info.regular.labFee = extraData[j];
      } else if (subjMap[course.classInfo.subject] === extraData[j]) {
        course.info.regular.extraData.push(extraData[j]);
      }
    }
    courses[separatedCourseData[i][0]] = course;
  }
  return courses;
}

function getPDFPaths (folder) {
  return new Promise(function (fulfill) {
    fs.readdir(folder, (err, pdfNames) => {
      fulfill(pdfNames);
    });
  }).then(function (pdfNames) {
    var pdfPaths = pdfNames.map(pdfName => folder + pdfName);
    return Promise.resolve(pdfPaths);
  });
}

function processPDFs (pdfPaths) {
  return Promise.all(pdfPaths.map(pdfPath => {
    return new Promise(function (fulfill) {
      fulfill(jsonify(pdfPath));
    })
  })).then(function (statuses) {
    return {
      lastModified: new Date().toString(),
      statuses: statuses
    };
  });
}

function createStatusReport (statusReport) {
  var file = pdfFolder.replace('/pdf/', '/statusReport.json');
  jsonfile.writeFile(file, statusReport, {spaces: 2}, function(err) {
    if (err) {
      console.error(err);
    }
  });
  console.log('Finished: Status Report made in ' + file);
}

function createAsync (makeGenerator) {
  return function () {
    var generator = makeGenerator.apply(this, arguments);

    function handle (result) {
      if (result.done) {
        return Promise.resolve(result.value);
      }
      return Promise.resolve(result.value).then(function (res){
        return handle(generator.next(res));
      }, function (err){
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

runPDFToCourses();