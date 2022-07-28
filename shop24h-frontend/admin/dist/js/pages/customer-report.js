"use strict"
// Khai báo link API các biến hằng số
const gUSERS_SUM_MONEY_URL = 'http://localhost:8080/api/users/sum/';
const gUSERS_COUNT_ORDER_URL = 'http://localhost:8080/api/users/count/order';
const gUSERS_COUNT_ORDER_EXPORT_URL = 'http://localhost:8080/api/users/export/excel/count';
const gUSERS_SUM_MONEY_EXPORT_URL = 'http://localhost:8080/api/users/export/excel/sum/';

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
        sum: ''
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
    pFilter.sum = $('#select-report').val();
    // console.log(pFilter);
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
    if (pFilter.sum === 'SELECT_REPORT') {
        vMess = "Bạn chưa chọn điều kiện lọc";
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
    switch (pFilter.sum) {
        case 'COUNT_ORDER':
            getCountOrderByCustomer(pFilter);
            $('#a-link-export-excel').prop('href', gUSERS_COUNT_ORDER_EXPORT_URL
                + '?dateMin=' + pFilter.dateMin + '&dateMax=' + pFilter.dateMax);
            break;
        case 'SELECT_REPORT':
            $('#a-link-export-excel').prop('href', '');
            break;
        default:
            getSumMoneyByCustomer(pFilter);
            $('#a-link-export-excel').prop('href', gUSERS_SUM_MONEY_EXPORT_URL
                + pFilter.sum + '?dateMin=' + pFilter.dateMin + '&dateMax=' + pFilter.dateMax);
            break;
    }
}

/**
 *  Hàm xử lý đếm order group by customer
 * @param {*} pFilter 
 */
function getCountOrderByCustomer(pFilter) {
    "use strict";
    // gọi API lấy data từ server
    var vUrl = gUSERS_COUNT_ORDER_URL + '?dateMin=' + pFilter.dateMin + '&dateMax=' + pFilter.dateMax;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        headers: gHeaders,
        contentType: 'application/json',
        success: function (responseObject) {
            // console.log(responseObject);
            drawBarChartCount(responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm xử lý vẽ biểu đồ bar chart
 * @param {*} pCountOrders dữ liệu lấy từ server
 * Output: vẽ được biểu đồ bar chart
 */
function drawBarChartCount(pCountOrders) {
    "use strict";
    // Khai báo biến lưu trữ data để vẽ biểu đồ
    var vAreaChartData = {
        labels: [],
        datasets: [
            {
                label: 'Tổng đơn đặt hàng',
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

    // duyệt for để lưu dữ liệu vào biến được khai báo
    pCountOrders.forEach(report => {
        vAreaChartData.labels.push(report.fullName);
        vAreaChartData.datasets[0].data.push(report.countOrder);
    });


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
                    return lable + ' ' + value;
                },
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    userCallback: function (value, index, values) {
                        return value;
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

/**
 * Hàm lấy tổng tiền của khách hàng theo điều kiện lọc
 * @param {*} pFilter 
 */
 function getSumMoneyByCustomer(pFilter) {
    "use strict";
    // gọi API lấy data từ server
    var vUrl = gUSERS_SUM_MONEY_URL + pFilter.sum + '?dateMin=' + pFilter.dateMin + '&dateMax=' + pFilter.dateMax;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        headers: gHeaders,
        contentType: 'application/json',
        success: function (responseObject) {
            // console.log(responseObject);
            drawBarChartSum(responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm xử lý vẽ biểu đồ bar chart
 * @param {*} pCountOrders dữ liệu lấy từ server
 * Output: vẽ được biểu đồ bar chart
 */
function drawBarChartSum(pSumOrders) {
    "use strict";
    // Khai báo biến lưu trữ data để vẽ biểu đồ
    var vAreaChartData = {
        labels: [],
        datasets: [
            {
                label: 'Tổng tiền mua hàng',
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

    // duyệt for để lưu dữ liệu vào biến được khai báo
    pSumOrders.forEach(report => {
        vAreaChartData.labels.push(report.fullName);
        vAreaChartData.datasets[0].data.push(report.totalOrder);
    });


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
