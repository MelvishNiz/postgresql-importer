import Excel from "exceljs";

export const readExcelFile = async (fileName) => {
  try {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(`./files/${fileName}`);
    const worksheet = workbook.getWorksheet(1);

    let headers = [];
    let rows = [];
    
    worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
      let tempRowData = {};
      row.values.forEach((value, index) => {
        if(rowNumber == 1) headers.push(value);
        else tempRowData[headers[index - 1]] =  value?.text || value || "";
      });
      if(rowNumber > 1 && tempRowData != {}) rows.push(tempRowData);
    });

    return {
      headers,
      rows
    };
  } catch (err) {
    console.error('Error reading Excel file:', err);
  }
}