const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();

workbook.creator = 'Me';
workbook.lastModifiedBy = 'Her';
workbook.created = new Date(1985, 8, 30);
workbook.modified = new Date();
workbook.lastPrinted = new Date(2016, 9, 27);

workbook.properties.date1904 = true;
workbook.calcProperties.fullCalcOnLoad = true;

workbook.views = [
    {
        x: 0, y: 0, width: 10000, height: 20000,
        firstSheet: 0, activeTab: 1, visibility: 'visible'
    }
]

const sheet = workbook.addWorksheet('My Sheet', {properties:{tabColor:{argb:'FFC0000'}}});
