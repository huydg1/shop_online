package com.devcamp.menfashion.service;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.devcamp.menfashion.repository.IMonthReport;

public class MonthExcelExporter {
	private XSSFWorkbook workbook;
	private XSSFSheet sheet;
	private List<IMonthReport> iMonthReports;

	/**
	 * Constructor khởi tạo server export danh sách DateReport
	 * 
	 * @param dateReports
	 */
	public MonthExcelExporter(List<IMonthReport> iMonthReports) {
		this.iMonthReports = iMonthReports;
		workbook = new XSSFWorkbook();
	}

	/**
	 * Tạo các ô cho excel file.
	 * 
	 * @param row
	 * @param columnCount
	 * @param value
	 * @param style
	 */
	private void createCell(Row row, int columnCount, Object value, CellStyle style) {
		sheet.autoSizeColumn(columnCount);
		Cell cell = row.createCell(columnCount);

		if (value instanceof Integer) {
			cell.setCellValue((Integer) value);
		} else if (value instanceof Boolean) {
			cell.setCellValue((Boolean) value);
		} else {
			cell.setCellValue((String) value);
		}
		cell.setCellStyle(style);
	}

	/**
	 * Khai báo cho sheet và các dòng đầu tiên
	 */
	private void writeHeaderLine() {
		sheet = workbook.createSheet("MonthReport");

		Row row = sheet.createRow(0);

		XSSFFont font = workbook.createFont();
		font.setBold(true);
		font.setFontHeight(16);

		CellStyle style = workbook.createCellStyle();
		style.setFont(font);

		createCell(row, 0, "Tháng", style);
		createCell(row, 1, "Tổng thành tiền", style);
	}

	/**
	 * fill dữ liệu cho các dòng tiếp theo.
	 */
	private void writeDataLines() {
		int rowCount = 1;

		XSSFFont font = workbook.createFont();
		font.setFontHeight(14);

		CellStyle style = workbook.createCellStyle();
		style.setFont(font);

		for (IMonthReport iMonthReport : this.iMonthReports) {
			Row row = sheet.createRow(rowCount++);
			int columnCount = 0;

			createCell(row, columnCount++, iMonthReport.getMonth(), style);
			createCell(row, columnCount++, iMonthReport.getTongThanhTien(), style);
		}
	}

	/**
	 * xuất dữ liệu ra dạng file
	 * 
	 * @param response
	 * @throws IOException
	 */
	public void export(HttpServletResponse response) throws IOException {
		writeHeaderLine();
		writeDataLines();

		ServletOutputStream outputStream = response.getOutputStream();

		workbook.write(outputStream);
		workbook.close();

		outputStream.close();

	}
}
