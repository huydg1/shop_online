"use strict"
// Khai báo link API các biến hằng số
const gORDERS_REPORT_URL = 'http://localhost:8080/api/orders/report/';
const gORDERS_EXPORT_URL = 'http://localhost:8080/api/orders/export/excel/';
const gSELECT_DATE = 'SELECT_DATE';
const gSELECT_WEEK = 'SELECT_WEEK';
const gSELECT_MONTH = 'SELECT_MONTH';

//Khai báo xác thực ở headers
var gHeaders = { Authorization: "Token " + getCookie("token") };

// Call event khi page đã được load
$(document).ready(function () {

    // Initialize Select2 Elements
    $('.select2bs4').select2({
        theme: 'bootstrap4'
    })

    // use input mask
    $('[data-mask]').inputmask();

    $('#btn-view-graph').on('click', onBtnViewGraphClick);

});

// Hàm xử lý xem báo cáo khi click button
function onBtnViewGraphClick() {
    "use strict";
    // khai báo
    var vFilter = {
        dateMin: '',
        dateMax: '',
        typeReport: ''
    }
    // read date
    readFilter(vFilter);
    // validate
    if (validateFilter(vFilter)) {
        getReport(vFilter);
    }
}

/**
 * Hàm lấy các dữ liệu để lọc khách hàng
 * @param {*} pFilter object lưu dữ liệu thu thập
 * @returns pFilter chứa dữ liệu
 */
function readFilter(pFilter) {
    "use strict";
    pFilter.dateMin = $.trim($('#inp-date-min').val());
    pFilter.dateMax = $.trim($('#inp-date-max').val());
    pFilter.typeReport = $('#select-report').val();
    console.log(pFilter);
    return pFilter;
}

/**
 * Hàm kiểm tra dữ liệu nhập
 * @param {*} pFilter dữ liệu cần kiểm tra
 * @returns true nếu hợp lệ, ngược lại return false
 */
function validateFilter(pFilter) {
    "user strict"
    var vMess = '';
    if (!pFilter.dateMin) {
        vMess = "Bạn chưa nhập ngày min";
        console.assert(false, '100: ', vMess);
        toastr.error(vMess);
        $('#inp-date-min').focus();
        return false;
    }
    if (!pFilter.dateMax) {
        vMess = "Bạn chưa nhập ngày max";
        console.assert(false, '200: ', vMess);
        toastr.error(vMess);
        $('#inp-date-max').focus();
        return false;
    }
    if (pFilter.typeReport === 'SELECT_REPORT') {
        vMess = "Bạn chưa chọn phương thức xem báo cáo";
        console.assert(false, '300: ', vMess);
        toastr.error(vMess);
        $('#select-report').focus();
        return false;
    }
    return true;
}

/**
 * Hàm xử lý lấy báo cáo từ server qua API
 * @param {*} pFilter 
 */
function getReport(pFilter) {
    "use strict";
    switch (pFilter.typeReport) {
        case gSELECT_DATE:
            getOrderReportDate(pFilter.dateMin, pFilter.dateMax);
            $('#a-link-export-excel')
                .prop('href', gORDERS_EXPORT_URL + 'date?dateMin='
                    + pFilter.dateMin + '&dateMax=' + pFilter.dateMax);
            break;
        case gSELECT_WEEK:
            getOrderReportWeek(pFilter.dateMin, pFilter.dateMax);
            $('#a-link-export-excel').prop('href', gORDERS_EXPORT_URL + 'week?dateMin='
                + pFilter.dateMin + '&dateMax=' + pFilter.dateMax);
            break;
        case gSELECT_MONTH:
            getOrderReportMonth(pFilter.dateMin, pFilter.dateMax);
            $('#a-link-export-excel').prop('href', gORDERS_EXPORT_URL + 'month?dateMin='
                + pFilter.dateMin + '&dateMax=' + pFilter.dateMax);
            break;
        default:
            $('#a-link-export-excel').prop('href', '');
            break;
    }
}

/**
 * Hàm lấy doanh số theo ngày min và ngày max
 * @param {*} pDateMin người dùng nhập
 * @param {*} pDateMax người dùng nhập
 */
function getOrderReportDate(pDateMin, pDateMax) {
    "use strict";
    // gọi API lấy data từ server
    $.ajax({
        url: gORDERS_REPORT_URL + 'date?dateMin=' + pDateMin + '&dateMax=' + pDateMax,
        type: "GET",
        headers: gHeaders,
        contentType: 'application/json',
        success: function (responseObject) {
            console.log(responseObject);
            drawBarChart(responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

// hàm lấy doanh thu theo tuần
function getOrderReportWeek(pDateMin, pDateMax) {
    "use strict";
    // read data
    // validate data
    // gọi API lấy data từ server
    $.ajax({
        url: gORDERS_REPORT_URL + 'week?dateMin=' + pDateMin + '&dateMax=' + pDateMax,
        type: "GET",
        headers: gHeaders,
        contentType: 'application/json',
        success: function (responseObject) {
            console.log(responseObject);
            // convert week to first and last day
            var vWeekConvert = [];
            responseObject.forEach(item => {
                var vResult = getStartAndEndDayByWeek(2021, item.week);
                item.week = vResult;
                vWeekConvert.push(item);
            });
            drawBarChart(vWeekConvert);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm lấy ngày bắt đầu và kết thúc trong tuần của năm
 * @param {*} pYear năm
 * @param {*} pWeek tuần
 * @returns startDay and endDay
 */
function getStartAndEndDayByWeek(pYear, pWeek) {
    "use strict";
    var vDate = new Date("Jan 01, " + pYear + " 01:00:00");
    var vWeek = vDate.getTime() + 604800000 * (pWeek - 1);
    var vFirstDay = new Date(vWeek);
    var vLastDay = new Date(vWeek + 518400000);
    var vFirstDayFormat = vFirstDay.getMonth() + 1 + '/' + vFirstDay.getDate() + '/' + vFirstDay.getFullYear();
    var vLastDayFormat = vLastDay.getMonth() + 1 + '/' + vLastDay.getDate() + '/' + vLastDay.getFullYear();
    console.log(vFirstDayFormat + ' - ' + vLastDayFormat);
    return vFirstDayFormat + ' - ' + vLastDayFormat;
}

/**
 * Hàm lấy doanh thu theo tháng
 * @param {*} pDateMin 
 * @param {*} pDateMax 
 */
function getOrderReportMonth(pDateMin, pDateMax) {
    "use strict";
    // read data
    // validate data
    // gọi API lấy data từ server
    $.ajax({
        url: gORDERS_REPORT_URL + 'month?dateMin=' + pDateMin + '&dateMax=' + pDateMax,
        type: "GET",
        headers: gHeaders,
        contentType: 'application/json',
        success: function (responseObject) {
            console.log(responseObject);
            drawBarChart(responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm xử lý vẽ biểu đồ bar chart
 * @param {*} pOrderReportDates dữ liệu lấy từ server
 * Output: vẽ được biểu đồ bar chart
 */
function drawBarChart(pOrderReportDates) {
    "use strict";
    // Khai báo biến lưu trữ data để vẽ biểu đồ
    var vAreaChartData = {
        labels: [],
        datasets: [
            {
                label: 'Doanh Thu',
                backgroundColor: 'rgba(60,141,188,0.9)',
                borderColor: 'rgba(60,141,188,0.8)',
                pointRadius: false,
                pointColor: '#3b8bba',
                pointStrokeColor: 'rgba(60,141,188,1)',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(60,141,188,1)',
                data: []
            }
        ]
    }

    var vSelectReport = $('#select-report').val();
    if (vSelectReport === gSELECT_DATE) {
        // duyệt for để lưu dữ liệu vào biến được khai báo
        pOrderReportDates.forEach(report => {
            vAreaChartData.labels.push(report.date);
            vAreaChartData.datasets[0].data.push(report.tongThanhTien);
        });
    }
    if (vSelectReport === gSELECT_WEEK) {
        // duyệt for để lưu dữ liệu vào biến được khai báo
        pOrderReportDates.forEach(report => {
            vAreaChartData.labels.push(report.week);
            vAreaChartData.datasets[0].data.push(report.tongThanhTien);
        });
    }
    if (vSelectReport === gSELECT_MONTH) {
        // duyệt for để lưu dữ liệu vào biến được khai báo
        pOrderReportDates.forEach(report => {
            vAreaChartData.labels.push(report.month);
            vAreaChartData.datasets[0].data.push(report.tongThanhTien);
        });
    }
    console.log(vAreaChartData);

    // Vẽ biểu đồ
    $('#results-graph').remove(); // this is my <canvas> element
    $('#graph-container')
        .append('<canvas id="results-graph"'
            + 'style = "min-height: 400px; height: 400px; max-height: 400px; max-width: 100%;" ></canvas > ');
    var barChartCanvas = $('#results-graph').get(0).getContext('2d');
    var barChartData = $.extend(true, {}, vAreaChartData);
    var temp0 = vAreaChartData.datasets[0];
    barChartData.datasets[0] = temp0;

    var barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        datasetFill: false,
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var lable = data.datasets[tooltipItem.datasetIndex].label;
                    var value = data.datasets[0].data[tooltipItem.index];
                    return lable + ' ' + value.toLocaleString() + 'đ';
                },
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    userCallback: function (value, index, values) {
                        return value.toLocaleString() + 'đ';
                    }
                }
            }]
        }
    };

    new Chart(barChartCanvas, {
        type: 'bar',
        data: barChartData,
        options: barChartOptions
    });
}



