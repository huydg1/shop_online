"use strict";
const gORDERS_HISTORY_URL = 'http://localhost:8080/api/orders/history/';
const gORDER_DETAILS_URL = 'http://localhost:8080/api/order-details/history/';
const gRATES_URL = 'http://localhost:8080/api/rates/';

const gOrderTemplate = (order) => {
    return `
    <div class = "card bg-light" id="heading${order.orderCode}">
        <div class ="row form-group pt-2 pl-2 cursor-pointer order-detail" 
            data-order-code="${order.orderCode}" data-toggle="collapse"
            data-target="#collapse${order.orderCode}" aria-expanded="false"
            aria-controls="collapse${order.orderCode}">
            <div class="col-sm-2 text-info">
                <lable>#${order.orderCode}</lable>
            </div>
            <div class="col-sm-2 text-center">
                <lable>${order.orderDate}</lable>
            </div>
            <div class="col-sm-2 text-right text-success">
                <lable>${order.statusName}</lable>
            </div>
            <div class="col-sm-2 text-center">
                <lable>${order.discount.toLocaleString()}đ</lable>
            </div>
            <div class="col-sm-2">
                <lable>${order.priceShipped.toLocaleString()}đ</lable>
            </div>
            <div class="col-sm-2 text-danger font-weight-bold">
                <lable>${order.tongTien.toLocaleString()}đ</lable>
            </div>
        </div>
    </div>

    <div id="collapse${order.orderCode}" class="collapse" aria-labelledby="heading${order.orderCode}"
        data-parent="#accordion">
    </div>
    `
}

const gOrderDetailTemplate = (product) => {
    return `
    <div class="card-body">
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
    </div>
    `
};

// create template previous paging
const gPreviousTemplate = `
    <li class="page-item">
        <button class="page-link previous-page" aria-label="Previous">
            <span aria-hidden="true">Trang trước</span>
            <span class="sr-only">Previous</span>
        </button>
    </li>`

// create template next paging
const gNextTemplate = `
    <li class="page-item">
        <button class="page-link next-page" aria-label="Next">
            <span aria-hidden="true">Trang sau</span>
            <span class="sr-only">Next</span>
        </button>
    </li>`

// create template current paging
const gPagingTemplate = (page) => {
    return `
    <li class="page-item">
    <input class="page-link current-page" value ="${page + 1}" type="button"></li>`
}

const gPAGE_FIRST = 0;
const gPAGE_LOCAL_STORAGE = 'PAGE';
var gTotalPages = 0;
var gUserId = 0;
var gProductId = 0;

//Khai báo xác thực ở headers
var gHeaders = { Authorization: "Token " + getCookie("token") };

$(document).ready(function () {

    // load username khi đã đăng nhập
    var vUser = getUser();
    if (vUser.fullName !== '') {
        $('#a-user-name').html('Xin chào! ' + vUser.fullName);
    }

    // Lưu vào biến toàn cục
    gUserId = vUser.id;

    // get list order
    getOrderHistoryByUserId(gPAGE_FIRST);

    // vẽ paging
    buildPaging();

    // set page
    setCurrentPage(gPAGE_FIRST);

    // event click current page
    $('#ul-paging').on('click', '.current-page', function () {
        onCurrentPageClick(this);
    });

    // event click previous page
    $('#ul-paging').on('click', '.previous-page', function () {
        onPreviousPageClick(this);
    });

    // event click next page
    $('#ul-paging').on('click', '.next-page', function () {
        onNextPageClick(this);
    });

    //Set sự kiện cho nút logout
    $("#a-logout").on("click", onBtnLogoutClick);

    // event click cho label orderCode
    $('#accordion').on('click', '.order-detail', function () {
        var vOrderCode = $(this).data('order-code');
        getOrderDetailByOrderCode(gHeaders, vOrderCode);
    })

    // event click button rate on list order
    $('#accordion').on('click', '.rate-product', function () {
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

/**
 * Hàm show fullName từ localStorage hiển thị trên menu 
 * (nếu đăng nhập thành công)
 * @returns 
 */
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
 * Hàm lấy danh sách order của user (đã đăng nhập)
 * @param {*} pHeader khai báo xác thực
 * @param {*} pPage phân trang
 */
function getOrderHistoryByUserId(pPage) {
    "use strict";
    var vUrl = gORDERS_HISTORY_URL + gUserId + '?page=' + pPage;
    $.ajax({
        url: vUrl,
        method: "GET",
        headers: gHeaders,
        async: false,
        success: function (res) {
            // console.log(res);
            // load orders
            buildOrder(res.content);
            // set totalPages
            gTotalPages = res.totalPages;
            // set totalElements
            $('#lbl-count-orders').html(res.totalElements);
        },
        error: function (xhr) {
            console.log(xhr);
            onBtnLogoutClick();
        }
    });
}

// Xây dựng danh sách order
function buildOrder(pOrder) {
    $('#accordion').empty();
    pOrder.forEach(order => {
        const vProduct = gOrderTemplate(order);
        $('#accordion').append(vProduct);
    });
}

/**
 * Hàm gọi API từ server để lấy danh sách chi tiết của một order
 * @param {*} pHeader khai báo xác thực
 * @param {*} pOrderCode orderCode gửi server
 */
function getOrderDetailByOrderCode(pHeader, pOrderCode) {
    "use strict";
    // gọi API lấy data từ server
    var vUrl = gORDER_DETAILS_URL + pOrderCode;
    $.ajax({
        url: vUrl,
        method: "GET",
        headers: pHeader,
        async: false,
        success: function (responseObject) {
            buildProducts(pOrderCode, responseObject);
        },
        error: function (xhr) {
        }
    });
}

/**
 * Hàm xây dựng template list product khi có dữ liệu truyền vào
 * @param {*} pProducts dữ liệu lấy từ server
 * Output: show giao diện có dữ liệu
 */
function buildProducts(pOrderCode, pProducts) {
    "use strict";
    $('#collapse' + pOrderCode).empty();
    pProducts.forEach(bProduct => {
        const vProduct = gOrderDetailTemplate(bProduct);
        $('#collapse' + pOrderCode).append(vProduct);
    });
}

/**
 * Hàm vẽ paging khi có TotalPages
 * Output: vẽ được paging đã phân trang theo TotalPages
 */
function buildPaging() {
    "use strict";
    $('#ul-paging').empty().append(gPreviousTemplate);
    for (let bIndex = 0; bIndex < gTotalPages; bIndex++) {
        const vPaging = gPagingTemplate(bIndex);
        $('#ul-paging').append(vPaging);
    }
    $('#ul-paging').append(gNextTemplate);
}

/**
 * Hàm set page hiện tại khi load request mới
 * @param {*} pCurrentPage page hiện tại
 * Output: load data new
 */
function setCurrentPage(pCurrentPage) {
    "use strict";
    var vPage = {
        currentPage: 0,
        size: 5,
        totalPages: 0
    };
    vPage.currentPage = pCurrentPage;
    vPage.totalPages = gTotalPages;
    // set data localStorage
    localStorage.setItem(gPAGE_LOCAL_STORAGE, JSON.stringify(vPage));

    // xử lý show hide khi click number page
    var vPage = getPage();
    if (vPage.currentPage === gPAGE_FIRST) {
        $('#ul-paging').find('.previous-page').hide();
    } else {
        $('#ul-paging').find('.previous-page').show();
    }
    if (vPage.currentPage == vPage.totalPages - 1 || vPage.totalPages === gPAGE_FIRST) {
        $('#ul-paging').find('.next-page').hide();
    } else {
        $('#ul-paging').find('.next-page').show();
    }
}

/**
 * Hàm xử lý khi click button paging
 * @param {*} pThis button page được chọn
 * output: set currentPage lên localStorage
 * load danh sách mới lấy từ server theo page được chọn
 */
function onCurrentPageClick(pThis) {
    "use strict";
    // get currentPage đang chọn
    var vCurrentPage = $(pThis).val() - 1;
    // get currentPage từ localStorage
    var vPage = getPage();
    // load orders by userId
    getOrderHistoryByUserId(vCurrentPage);

    // xử lý show hide button previous and next khi click currentPage
    if (vCurrentPage === gPAGE_FIRST) {
        $('#ul-paging').find('.previous-page').hide();
    } else {
        $('#ul-paging').find('.previous-page').show();
    }
    if (vCurrentPage == vPage.totalPages - 1) {
        $('#ul-paging').find('.next-page').hide();
    } else {
        $('#ul-paging').find('.next-page').show();
    }

    // set currentPage lên localStorage 
    setCurrentPage(vCurrentPage);
}

/**
 * Hàm xử lý khi click previous
 * @param {*} pThis page đang chọn
 * output: nếu page current = trang đầu, hide button previous,
 */
function onPreviousPageClick(pThis) {
    "use strict";
    var vPage = getPage();
    if (vPage.currentPage > 0) {
        // load orders by userId
        getOrderHistoryByUserId(vPage.currentPage - 1);
        // set currentPage lên localStorage 
        setCurrentPage(vPage.currentPage - 1);
    }
}

/**
 * Hàm xử lý khi click NextPage
 * @param {*} pThis page đang chọn
 * output: nếu page current = trang cuối, hide button next,
 */
function onNextPageClick(pThis) {
    "use strict";
    var vPage = getPage();
    if (vPage.currentPage < vPage.totalPages - 1) {
        // load orders by userId
        getOrderHistoryByUserId(vPage.currentPage + 1);
        // set currentPage lên localStorage 
        setCurrentPage(vPage.currentPage + 1);
    }
}

/**
 * Hàm lấy currentPage và totalPages từ localStorage
 * @returns vResult Object chứa currentPage, size và totalPages
 */
function getPage() {
    // get Object from localStorage
    var vResult = localStorage.getItem(gPAGE_LOCAL_STORAGE);
    return JSON.parse(vResult);
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
    var vURL = gRATES_URL + gUserId + '/' + gProductId;
    $.ajax({
        url: vURL,
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