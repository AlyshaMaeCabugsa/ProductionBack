const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function printFieldNames(pdfPath) {
  try {
    console.log(`Reading PDF from path: ${pdfPath}`);
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    if (fields.length === 0) {
      console.log('No form fields found in the PDF.');
    } else {
      fields.forEach(field => {
        console.log(`Field name: ${field.getName()}`);
      });
    }
  } catch (error) {
    console.error('Error reading the PDF:', error);
  }
}

const pdfPath = path.resolve(__dirname, 'pdf/FSED-42F.pdf');
printFieldNames(pdfPath).catch(console.error);
