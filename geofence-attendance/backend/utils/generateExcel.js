const excel = require("exceljs");
const path = require("path");
const fs = require("fs");

const generateExcel = async (data, sessionName) => {
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet("Attendance");

  worksheet.columns = [
    { header: "Name", key: "name", width: 30 },
    { header: "Email", key: "email", width: 30 },
    { header: "Timestamp", key: "timestamp", width: 25 },
  ];

  data.forEach((record) => {
    worksheet.addRow({
      name: record.user.name,
      email: record.user.email,
      timestamp: record.timestamp,
    });
  });

  const dir = path.join(__dirname, "..", "reports");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const fileName = `Attendance-${sessionName.replace(
    /\s+/g,
    "_"
  )}-${Date.now()}.xlsx`;
  const filePath = path.join(dir, fileName);

  await workbook.xlsx.writeFile(filePath);
  return `/reports/${fileName}`; // Return relative path for serving
};

module.exports = generateExcel;
    