"use strict";
const gORDERS_SUCCESS_URL = 'http://localhost:8080/api/order-details/success/';

// Mảng các column table order detail
const gORDER_DETAILS_COLUMNS = [
    'product',
    'color',
    'quantity',
    'price',
    'thanhTien'
];

// Vị trí từng column table order detail
const gCOLUMN_PRODUCT = 0;
const gCOLUMN_COLOR = 1;
const gCOLUMN_QUANTITY = 2;
const gCOLUMN_PRICE = 3;
const gCOLUMN_THANH_TIEN = 4;

// Định nghĩa table Order
var gOrderDetailsTable = $('#table-order-details').DataTable({
    // Khai báo các cột của datatable
    columns: [
        { data: gORDER_DETAILS_COLUMNS[gCOLUMN_PRODUCT] },
        { data: gORDER_DETAILS_COLUMNS[gCOLUMN_COLOR] },
        { data: gORDER_DETAILS_COLUMNS[gCOLUMN_QUANTITY] },
        { data: gORDER_DETAILS_COLUMNS[gCOLUMN_PRICE] },
        { data: gORDER_DETAILS_COLUMNS[gCOLUMN_THANH_TIEN] }

    ], columnDefs: [
        {
            targets: gCOLUMN_PRICE,
            render: function (data) {
                return data.toLocaleString() + 'đ';
            }
        },
        {
            targets: gCOLUMN_THANH_TIEN,
            render: function (data) {
                return data.toLocaleString() + 'đ';
            }
        }
    ],
    searching: false,
    lengthChange: false,
    paging: false,
    info: false
});
var gOrderCode = 0;

$(document).ready(function () {
    // load username khi đã đăng nhập
    var vUser = getUser();
    if (vUser.fullName !== '') {
        $('#a-user-name').html('Xin chào! ' + vUser.fullName);
    }
    
    queryString();
    getOrderSuccess(gOrderCode);
    // đến trang login
    $('#btn-login').on('click', function () {
        window.location.href = "login.html";
    });
});

// show name từ localStorage hiển thị trên menu (nếu đăng nhập thành công)
function getUser() {
    "use strict";
    var vUser = localStorage.getItem('USER_NAME');
    // console.log(JSON.parse(vUser));
    return JSON.parse(vUser);
}

/**
  * Hàm lấy dữ liệu từ query string
  * Input: chưa có dữ liệu
  * Output: lấy được dữ liệu từ query string lưu vào biến global
  */
function queryString() {
    "use strict";
    var vUrlString = window.location.href;
    var vUrl = new URL(vUrlString);
    gOrderCode = vUrl.searchParams.get('orderCode');
    // console.log('orderid: ', gOrderCode);
    return
}

/**
 * Hàm gọi API từ server để lấy dữ liệu của 1 order
 * Output: lấy được danh sách thông tin order
 */
function getOrderSuccess() {
    "use strict";
    // gọi API lấy data từ server
    $.ajax({
        url: gORDERS_SUCCESS_URL + gOrderCode,
        type: "GET",
        dataType: 'json',
        success: function (responseObject) {
            console.log(responseObject);
            fillDataOrder(responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm xử lý load data lên giao diện
 * @param {*} paramOrders dữ liệu cần load
 * Output: load dữ liệu thành công
 */
function fillDataOrder(paramOrders) {
    "use strict";

    // total order
    $('#lbl-order-code').html('#' + paramOrders[0].orderCode);
    $('#lbl-order-date').html(paramOrders[0].date);
    $('#td-voucher-code').html(paramOrders[0].voucherCode);
    $('#td-price-discount').html(paramOrders[0].discount.toLocaleString() + 'đ');
    $('#td-price-shipped').html(paramOrders[0].priceShipped.toLocaleString() + 'đ');
    var totalValue = 0;
    paramOrders.forEach(order => {
        totalValue += order.thanhTien;
    });
    $('#td-total-value-product').html(totalValue.toLocaleString() + 'đ');
    var totalAmount = totalValue - paramOrders[0].discount + paramOrders[0].priceShipped;
    $('#td-total-amount').html(totalAmount.toLocaleString() + 'đ');

    // data table
    fillDataTable(paramOrders);

    // info user
    $('#lbl-full-name-info').html(paramOrders[0].fullName);
    $('#lbl-email').html(paramOrders[0].email);
    $('#lbl-phone').html(paramOrders[0].phone);
    $('#lbl-address').html(paramOrders[0].address);
    $('#lbl-note').html(paramOrders[0].note);
}

/**
 * Hàm đổ dữ liệu vào table
 * Input: paramOrders từ server trả về
 * Output: đổ được dữ liệu vào table
 */
function fillDataTable(paramOrders) {
    "use strict";
    gOrderDetailsTable.clear();
    gOrderDetailsTable.rows.add(paramOrders);
    gOrderDetailsTable.draw();
}



