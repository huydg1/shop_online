"use strict";
// LINK API
const gRATES_URL = 'http://localhost:8080/api/rates/';

// Biến toàn cục
var gUserId = 0;
var gRateId = 0;

// Biến toàn cục
const gPAGE_FIRST = 0;
const gPAGE_LOCAL_STORAGE = 'PAGE';
var gTotalPages = 0;
var gCurrentPage = 0;

//Khai báo xác thực ở headers
var gHeaders = { Authorization: "Token " + getCookie("token") };

// Mảng các column table order
const gRATES_COLUMNS = [
    'imageUrl',
    'productName',
    'comment',
    'rate',
    'statusRate',
    'action'
];

// Vị trí từng column table order
const gCOLUMN_IMAGE_URL = 0;
const gCOLUMN_PRODUCT_NAME = 1;
const gCOLUMN_COMMENT = 2;
const gCOLUMN_RATE = 3;
const gCOLUMN_STATUS_RATE = 4;
const gCOLUMN_ACTION = 5;

// Định nghĩa table rate
var gTableRate = $('#table-rate').DataTable({
    // Khai báo các cột của datatable
    columns: [
        { data: gRATES_COLUMNS[gCOLUMN_IMAGE_URL] },
        { data: gRATES_COLUMNS[gCOLUMN_PRODUCT_NAME] },
        { data: gRATES_COLUMNS[gCOLUMN_COMMENT] },
        { data: gRATES_COLUMNS[gCOLUMN_RATE] },
        { data: gRATES_COLUMNS[gCOLUMN_STATUS_RATE] },
        { data: gRATES_COLUMNS[gCOLUMN_ACTION] }
    ],
    columnDefs: [
        {   // map column 
            targets: gCOLUMN_IMAGE_URL,
            render: function (data) {
                return data ?
                    '<img class="img-table" src="../' + data + '">' :
                    null;
            }
        },
        {   // map column 
            targets: gCOLUMN_ACTION,
            class: "text-center",
            defaultContent: `
                <i class="fas fa-edit text-primary edit-rate" 
                style="cursor: pointer;" data-toggle="tooltip" 
                title="Edit rate">&nbsp;</i>`
        }
    ],
    searching: false,
    lengthChange: false,
    paging: false,
    info: false
});

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

$(document).ready(function () {

    // load username khi đã đăng nhập
    var vUser = getUser();
    gUserId = vUser.id;
    if (vUser.fullName !== '') {
        $('#a-user-name').html('Xin chào! ' + vUser.fullName);
    }

    // load danh sách đánh giá
    getRatesByUserId(gPAGE_FIRST);

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

    $('#btn-test').on('click', function () {
        $('#modal-rate').modal('show');
    });

    $('#table-rate').on('click', '.edit-rate', function () {
        onIconEditRateClick(this);
    })

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

// Hàm lấy danh sách đánh giá sản phẩm by userId
function getRatesByUserId(pPage) {
    "use strict";
    var vUrl = gRATES_URL + gUserId + '?page=' + pPage;
    $.ajax({
        url: vUrl,
        method: "GET",
        headers: gHeaders,
        async: false,
        success: function (res) {
            // console.log(res);
            fillDataTable(res.content);
            gTotalPages = res.totalPages;
            $('#lbl-count-rate').html(res.totalElements);
        },
        error: function (xhr) {
            console.log(xhr);
            onBtnLogoutClick();
        }
    });
}

/**
 * Hàm đổ dữ liệu vào table
 * @param {*} pRates từ server trả về
 * Output: đổ được dữ liệu vào table
 */
function fillDataTable(pRates) {
    "use strict";
    gTableRate.clear();
    gTableRate.rows.add(pRates);
    gTableRate.draw();
}

// Hàm mở modal sửa đánh giá
function onIconEditRateClick(pIcon) {
    "use strict";
    $('#modal-rate').modal('show');
    var vRate = getDataOnTable(pIcon, gTableRate);
    $('#txt-comment').val(vRate.comment);
    $('#h1-rating').html(vRate.rate);
    gRateId = vRate.id;
}

/**
 * Hàm lấy CustomerId khi click icon tại 1 dòng trên table
 * @param {} pIcon icon được click
 */
function getDataOnTable(pIcon, pTable) {
    "use strict";
    // truy vấn đến node cha của thẻ tr
    var vTableRow = $(pIcon).parents('tr');
    // get data từng cell của dòng lấy được trong table
    var vDataRow = pTable.row(vTableRow).data();
    return vDataRow;
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
        // update rate
        updateRate(vRate);
        // close modal
        $('#modal-rate').modal('hide');
        // load list rate
        getRatesByUserId(gCurrentPage);
    }
}

// hàm thu thập dữ liệu rate
function readRate(pRate) {
    "use strict";
    pRate.comment = $.trim($('#txt-comment').val());
    pRate.rate = $('#h1-rating').html();
    // console.log(pRate);
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
function updateRate(pRate) {
    "use strict";
    $.ajax({
        url: gRATES_URL + gRateId,
        type: 'PUT',
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

// Hàm reset form khi modal close
function resetFormToStart() {
    "use strict";
    $('#txt-comment').val('');
    $('#h1-rating').html('');
    $("input[type='radio']").prop('checked', false);
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
    // load rates by userId
    getRatesByUserId(vCurrentPage);

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
    gCurrentPage = vCurrentPage;
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
        // load rates by userId
        getRatesByUserId(vPage.currentPage - 1);
        // set currentPage lên localStorage 
        setCurrentPage(vPage.currentPage - 1);
        gCurrentPage = vPage.currentPage - 1;
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
        // load rates by userId
        getRatesByUserId(vPage.currentPage + 1);
        // set currentPage lên localStorage 
        setCurrentPage(vPage.currentPage + 1);
        gCurrentPage = vPage.currentPage + 1;
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