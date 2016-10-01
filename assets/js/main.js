var output = document.getElementById('output');
PDFJS.getDocument('../pdf/Fall 2016.pdf').then(function (pdf) {
    pdf.getPage(1).then(function (page) {
        page.getTextContent().then(function (textContent) {
            output.innerHTML = textContent.items.map(x=>x.str).join(" | ");
        })
    })
})