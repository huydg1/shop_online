"use strict";
const gORDER_DETAILS_URL = 'http://localhost:8080/api/order-details/history/';
const gRATES_URL = 'http://localhost:8080/api/rates/';

const gProductTemplate = (product) => {
    return `
    <div class="row form-group">
        <div class="col-sm-2">
            <img class="img-thumbnail" src="../${product.imageUrl}">
        </div>
        <div class="col-sm-7">
            <div class="row">
                <div class="col-sm-12 font-weight-bold text-primary">
                    <label>${product.product}</label>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <small>Màu sắc :</small>
                    <small class="font-weight-bold">${product.color}</small>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <small>Số lượng :</small>
                    <small class="font-weight-bold">${product.quantity}</small>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <small>Đơn giá :</small>
                    <small class="font-weight-bold">${product.price.toLocaleString()}đ</small>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <small>Thành tiền :</small>
                    <small class="font-weight-bold">${product.thanhTien.toLocaleString()}đ</small>
                </div>
            </div>
        </div>
        <div class="col-sm-3">
            <input data-product-id="${product.productId}" class="btn btn-outline-warning rate-product" value="Đánh giá sản phẩm" type="button">
        </div>
    </div>
    `
};

var gOrderCode = 0;
var gUserId = 0;
var gProductId = 0;

//Khai báo xác thực ở headers
var gHeaders = { Authorization: "Token " + getCookie("token") };

$(document).ready(function () {

    // get usetId localStorage
    var vUser = getUser();
    gUserId = vUser.id;
    $('#a-user-name').html(vUser.fullName);

    // Lấy list order history
    queryString();
    getOrderDetailByOrderCode(gHeaders);

    //Set sự kiện cho nút logout
    $("#a-logout").on("click", onBtnLogoutClick);

    // event click button rate on list order
    $('#div-list-product').on('click', '.rate-product', function () {
        onBtnRateProductClick(this);
    });

    // event click button send rate
    $('#btn-send-rate').on('click', onBtnSendRateClick);

    // event khi select star
    $("input[type='radio']").click(function () {
        var vSim = $("input[type='radio']:checked").val();
        if (vSim < 3) {
            $('#h1-rating').css('color', 'red'); $("#h1-rating").text(vSim);
        } else {
            $('#h1-rating').css('color', 'green'); $("#h1-rating").text(vSim);
        }
    });

    // close modal
    $('#modal-rate').on('hidden.bs.modal', resetFormToStart);

});

// show name từ localStorage hiển thị trên menu (nếu đăng nhập thành công)
function getUser() {
    "use strict";
    var vUser = localStorage.getItem('USER_NAME');
    return JSON.parse(vUser);
}

/**
 * Hàm lấy cookie đã lưu ở trình duyệt
 * @param {*} pName chuỗi token đã lưu
 * @returns 
 */
function getCookie(pName) {
    var vName = pName + "=";
    var vDecodedCookie = decodeURIComponent(document.cookie);
    var vCa = vDecodedCookie.split(';');
    for (var bI = 0; bI < vCa.length; bI++) {
        var vC = vCa[bI];
        while (vC.charAt(0) == ' ') {
            vC = vC.substring(1);
        }
        if (vC.indexOf(vName) == 0) {
            return vC.substring(vName.length, vC.length);
        }
    }
    return "";
}

// Hàm setCookie lên trình duyệt
function setCookie(pName, pValue, pExdays) {
    var vDate = new Date();
    vDate.setTime(vDate.getTime() + (pExdays * 24 * 60 * 60 * 1000));
    var vExpires = "expires=" + vDate.toUTCString();
    document.cookie = pName + "=" + pValue + ";" + vExpires + ";path=/";
}

// Hàm set null user localStorage khi logout 
function setNullUser() {
    "use strict";
    var vUser = {
        id: 0,
        fullName: ''
    }
    localStorage.setItem('USER_NAME', JSON.stringify(vUser));
}

// Hàm logout tài khoản
function onBtnLogoutClick() {
    // Trước khi logout cần xóa token đã lưu trong cookie
    setCookie("token", "", 1);
    setNullUser();
    window.location.href = "login.html";
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
 *  Hàm gọi API từ server để lấy danh sách chi tiết của một order
 * @param {*} pHeader khai báo xác thực 
 */
function getOrderDetailByOrderCode(pHeader) {
    "use strict";
    // gọi API lấy data từ server
    var vUrl = gORDER_DETAILS_URL + gOrderCode;
    $.ajax({
        url: vUrl,
        method: "GET",
        headers: pHeader,
        success: function (responseObject) {
            fillDataOrder(responseObject);
            console.log(responseObject);
        },
        error: function (xhr) {
            console.log(xhr);
            // Khi token hết hạn, AJAX sẽ trả về lỗi 
            // khi đó sẽ redirect về trang login để người dùng đăng nhập lại
            onBtnLogoutClick();
        }
    });
}

/**
 * Hàm xử lý load data lên giao diện
 * @param {*} pOrders dữ liệu cần load
 * Output: load dữ liệu thành công
 */
function fillDataOrder(pOrders) {
    "use strict";

    // total order
    $('#lbl-order-code').html('#' + pOrders[0].orderCode);
    $('#lbl-order-date').html(pOrders[0].date);
    $('#td-voucher-code').html(pOrders[0].voucherCode);
    $('#td-price-discount').html(pOrders[0].discount.toLocaleString() + 'đ');
    $('#td-price-shipped').html(pOrders[0].priceShipped.toLocaleString() + 'đ');
    var totalValue = 0;
    pOrders.forEach(order => {
        totalValue += order.thanhTien;
    });
    $('#td-total-value-product').html(totalValue.toLocaleString() + 'đ');
    var totalAmount = totalValue - pOrders[0].discount + pOrders[0].priceShipped;
    $('#td-total-amount').html(totalAmount.toLocaleString() + 'đ');

    // data table
    buildProducts(pOrders);

    // info user
    $('#lbl-full-name-info').html(pOrders[0].fullName);
    $('#lbl-email').html(pOrders[0].email);
    $('#lbl-phone').html(pOrders[0].phone);
    $('#lbl-address').html(pOrders[0].address);
    $('#lbl-note').html(pOrders[0].note);
}

/**
 * Hàm xây dựng template list product khi có dữ liệu truyền vào
 * @param {*} pProducts dữ liệu lấy từ server
 * Output: show giao diện có dữ liệu
 */
function buildProducts(pProducts) {
    "use strict";
    $('#div-list-product').empty();
    pProducts.forEach(bProduct => {
        const vProduct = gProductTemplate(bProduct);
        $('#div-list-product').append(vProduct);
    });
}

/**
 * Hàm xử lý gửi đánh giá của sản phẩm đã mua
 * Input: read data, validate, process
 * Output: send data API
 */
function onBtnSendRateClick() {
    "use strict";
    // Khai báo Object
    var vRate = {
        comment: '',
        rate: 0
    }
    // Read object
    readRate(vRate);
    if (validate(vRate)) {
        createRate(vRate);
        $('#modal-rate').modal('hide');
    }
}

// hàm thu thập dữ liệu rate
function readRate(pRate) {
    "use strict";
    pRate.comment = $.trim($('#txt-comment').val());
    pRate.rate = $('#h1-rating').html();
    console.log(pRate);
    return pRate;
}

// Hàm kiểm tra dữ liệu nhập vào
function validate(pRate) {
    "use strict";
    var vMess = '';
    if (!pRate.comment) {
        vMess = 'Bạn chưa nhập đánh giá !';
        console.assert(false, '100: ', vMess);
        toastr.error(vMess);
        $('#txt-comment').focus();
        return false;
    }
    if (!pRate.rate) {
        vMess = 'Bạn chưa đánh giá điểm sản phẩm !';
        console.assert(false, '200: ', vMess);
        toastr.error(vMess);
        return false;
    }
    return true;
}

// Hàm tạo đánh giá mới
function createRate(pRate) {
    "use strict";
    $.ajax({
        url: gRATES_URL + gUserId + '/' + gProductId,
        type: 'POST',
        headers: gHeaders,
        contentType: 'application/json',
        data: JSON.stringify(pRate),
        async: false,
        success: function (responseObject) {
            toastr.success('Cám ơn bạn đã đánh giá !');
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm show modal đánh giá của sản phẩm đã từng mua
 * Input: modal hide
 * Output: modal show
 */
function onBtnRateProductClick(pThis) {
    "use strict";
    $('#modal-rate').modal('show');
    gProductId = $(pThis).data('product-id');
}


// Hàm reset form khi modal close
function resetFormToStart() {
    "use strict";
    gProductId = 0;
    $('#txt-comment').val('');
    $('#h1-rating').html('');
    $("input[type='radio']").prop('checked', false);
}



