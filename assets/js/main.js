var output = document.getElementById('output');
var scheduleName = 'Fall_2016';
PDFJS.getDocument('https://rawgit.com/cazinge/LMU-Schedule-Helper/master/assets/pdf/' + scheduleName + '.pdf').then(function (pdf) {
    pdf.getPage(1).then(function (page) {
        page.getTextContent().then(function (textContent) {
            output.innerHTML = textContent.items.map(x=>x.str).join(" | ");
        })
    })
})