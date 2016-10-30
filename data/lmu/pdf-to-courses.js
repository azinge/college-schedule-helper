var PDFJS = require('../pdf.js');
PDFJS.workerSrc = 'data/pdf.worker.js';
var result = [];
var scheduleName = 'Fall_2016';
PDFJS.getDocument('https://rawgit.com/cazinge/LMU-Schedule-Helper/master/assets/pdf/' + scheduleName + '.pdf').then(function (pdf) {
    pdf.getPage(1).then(function (page) {
        page.getTextContent().then(function (textContent) {
            result = textContent.items.map(x => x.str).join(' | ');
        });
    });
});

var jsonfile = require('jsonfile');

var file = 'data/lmu/json/data.json';
var obj = {name: 'Haha'};

jsonfile.writeFile(file, obj, {spaces: 2}, function(err) {
  console.error(err);
});