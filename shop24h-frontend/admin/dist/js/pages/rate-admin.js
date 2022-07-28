"use strict"
// Khai báo link API
const gRATES_URL = 'http://localhost:8080/api/rates';
const gREPLY_RATES_URL = 'http://localhost:8080/api/reply-rates';
const gPRODUCTS_URL = 'http://localhost:8080/api/products/';
const gSTATUS_RATES_URL = 'http://localhost:8080/api/status-rates/';


// Trạng thái form
const gFORM_MODE_NORMAL = 'NORMAL';
const gFORM_MODE_INSERT = 'INSERT';
const gFORM_MODE_UPDATE = 'UPDATE';
const gFORM_REPLY_DELETE = 'REPLY_DELETE';
const gFORM_RATE_DELETE = 'RATE_DELETE';

const gSTATUS_RATE_DUYET = 2;

// Gán gia trị mặc định trên select
const gVALUE_SELECT = 'PLEASE_SELECT';
const gTEXT_SELECT = 'Please select';

// Mảng các column table rate
const gRATES_COLUMNS = [
    'stt',
    'commentDate',
    'fullName',
    'productName',
    'comment',
    'rate',
    'statusRateName',
    'action'
];

// Mảng các column table reply rate
const gREPLY_RATES_COLUMNS = [
    'reCommentDate',
    'fullName',
    'reCommnent',
    'action'
];

// Vị trí từng column table reply rate
const gCOLUMN_RE_COMMENT_DATE = 0;
const gCOLUMN_FULL_NAME_MODAL = 1;
const gCOLUMN_RE_COMMENT = 2;
const gCOLUMN_ACTION_MODAL = 3;


// Vị trí từng column table rate
const gCOLUMN_STT = 0;
const gCOLUMN_COMMENT_DATE = 1;
const gCOLUMN_FULL_NAME = 2;
const gCOLUMN_PRODUCT_NAME = 3;
const gCOLUMN_COMMENT = 4;
const gCOLUMN_RATE = 5;
const gCOLUMN_STATUS = 6;
const gCOLUMN_ACTION = 7;

// Khai báo các biến toàn cục
var gFormMode = gFORM_MODE_NORMAL;
var gStt = 1;
var gRateId = 0;
var gReplyRateId = 0;
var gUserId = 0;

// Biến toàn cục
const gPAGE_FIRST = 0;
const gPAGE_LOCAL_STORAGE = 'PAGE';
var gTotalPages = 0;
var gCurrentPage = 0;
var gFilterRate = {
    statusRateId: '',
    productName: ''
};


// Định nghĩa table rates
var gTableRate = $('#table-review').DataTable({
    // Khai báo các cột của datatable
    columns: [
        { data: gRATES_COLUMNS[gCOLUMN_STT] },
        { data: gRATES_COLUMNS[gCOLUMN_COMMENT_DATE] },
        { data: gRATES_COLUMNS[gCOLUMN_FULL_NAME] },
        { data: gRATES_COLUMNS[gCOLUMN_PRODUCT_NAME] },
        { data: gRATES_COLUMNS[gCOLUMN_COMMENT] },
        { data: gRATES_COLUMNS[gCOLUMN_RATE] },
        { data: gRATES_COLUMNS[gCOLUMN_STATUS] },
        { data: gRATES_COLUMNS[gCOLUMN_ACTION] }
    ],
    columnDefs: [
        {   // map column STT
            targets: gCOLUMN_STT,
            render: function () {
                return gStt++;
            }
        },
        {   // map column Action
            targets: gCOLUMN_ACTION,
            class: "text-center",
            defaultContent: `
            <i class="fas fa-reply text-info cursor-pointer reply-review" 
            data-toggle="tooltip" title="Trả lời"></i>&nbsp;&nbsp;&nbsp;&nbsp;
            <i class="fas fa-times text-danger cursor-pointer delete-review" 
            data-toggle="tooltip" title="Xóa review"></i>
        `
        }
    ],
    searching: false,
    lengthChange: false,
    paging: false,
    info: false
});

// Định nghĩa table reply rates
var gTableReplyRate = $('#table-reply-review').DataTable({
    // Khai báo các cột của datatable
    columns: [
        { data: gREPLY_RATES_COLUMNS[gCOLUMN_RE_COMMENT_DATE] },
        { data: gREPLY_RATES_COLUMNS[gCOLUMN_FULL_NAME_MODAL] },
        { data: gREPLY_RATES_COLUMNS[gCOLUMN_RE_COMMENT] },
        { data: gREPLY_RATES_COLUMNS[gCOLUMN_ACTION_MODAL] },
    ],
    columnDefs: [
        {   // map column Action
            targets: gCOLUMN_ACTION_MODAL,
            class: "text-center",
            defaultContent: `
            <i class="fas fa-edit text-primary edit-reply" 
            style="cursor: pointer;" data-toggle="tooltip" title="Sửa trả lời">&nbsp;</i>
            <i class="fas fa-trash-alt text-danger delete-reply" 
            style="cursor: pointer;" data-toggle="tooltip" title="Xóa trả lời"></i>&nbsp;</i>
        `
        }
    ],
    searching: false,
    lengthChange: false,
    paging: true,
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

//Khai báo xác thực ở headers
var gHeaders = { Authorization: "Token " + getCookie("token") };

// Call event khi page đã được load
$(document).ready(function () {

    // get usetId localStorage
    var vUser = getUser();
    gUserId = vUser.id;

    // Initialize Select2 Elements
    $('.select2bs4').select2({
        theme: 'bootstrap4'
    })

    onPageLoading();

    $('#table-review').on('click', '.reply-review', function () {
        onReplyReviewClick(this);
    });

    $('#table-review').on('click', '.delete-review', function () {
        onDeleteReviewClick(this);
    });

    // reset form khi close modal
    $('#modal-reply-review').on('hidden.bs.modal', resetFormToStart);
    $('#modal-delete').on('hidden.bs.modal', resetFormToStart);

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

    // event key press input phone
    $('#inp-reply').on('keypress', function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            // thêm trả lời đánh giá;
            onReplyKeyPress(this);
        }
    });

    // Sửa reply rate
    $('#table-reply-review').on('click', '.edit-reply', function () {
        onEditReplyClick(this);
    });

    // Xóa reply rate
    $('#table-reply-review').on('click', '.delete-reply', function () {
        onDeleteReplyClick(this);
    });

    $('#btn-delete').on('click', onDeleteClick);

    // event click search
    $('#btn-search-rate').on('click', onBtnSearchRateClick);
});

// show name từ localStorage hiển thị trên menu (nếu đăng nhập thành công)
function getUser() {
    "use strict";
    var vUser = localStorage.getItem('USER_NAME');
    // console.log(JSON.parse(vUser));
    return JSON.parse(vUser);
}

/**
 * Hàm load paging khi khởi chạy web
 * Input/start: data chưa có
 * Output/end: fill data to table product và các select
 */
function onPageLoading() {
    "use strict";
    console.log(gFormMode);
    getStatusRates();
    // Read data
    readDataFilter(gFilterRate);
    // load rate
    getRates(gPAGE_FIRST, gFilterRate);
    // vẽ paging khi có số tổng record do server trả về
    buildPaging();
    // setCurrentPage
    setCurrentPage(gPAGE_FIRST);
}

/**
 * Hàm đổ dữ liệu từ server đổ vào select
 * Output: select có dữ liệu
 */
function getStatusRates() {
    "use strict";
    // gọi API lấy data từ server
    $.ajax({
        url: gSTATUS_RATES_URL,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            fillDataSelectStatusRate(responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm đổ dữ liệu vào select
 * @param {*} pStatusRates dữ liệu sẽ đổ vào select
 * Output: select chứa dữ liệu
 */
function fillDataSelectStatusRate(pStatusRates) {
    "use strict";
    var vSelectElement = $('#select-filter-status').empty();
    $('<option>', {
        val: 0,
        text: 'Chọn trạng thái'
    }).appendTo(vSelectElement);
    pStatusRates.forEach(statusRate => {
        $('<option>', {
            val: statusRate.id,
            text: statusRate.statusRateName
        }).appendTo(vSelectElement);
    });
}


/**
 * Hàm thu thập dữ liệu filter product
 * @param {*} pFilterRate chứa dữ liệu thu thập
 * @returns pFilterProduct đã có dữ liệu
 */
function readDataFilter(pFilterRate) {
    "use strict";
    pFilterRate.statusRateId = $('#select-filter-status').val().trim();
    pFilterRate.productName = $('#inp-filter-product-name').val().trim();
    // console.log(pFilterRate)
    return pFilterRate;
}

/**
 * Hàm xử lý đổ dữ liệu product lên table
 * Input/start: read data, validate, call api
 * Output/end: show table đã đổ dữ liệu
 */
function getRates(pCurrentPage, pFilterRate) {
    "use strict";
    // gọi API lấy data từ server
    var vUrl = gRATES_URL + '?page=' + pCurrentPage
        + '&productName=' + pFilterRate.productName
        + '&statusId=' + pFilterRate.statusRateId;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        headers: gHeaders,
        contentType: 'application/json',
        async: false,
        success: function (res) {
            fillDataTable(res.content, gTableRate);
            gTotalPages = res.totalPages;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm đổ dữ liệu vào table
 * @param {*} gData từ server trả về
 * Output: đổ được dữ liệu vào table
 */
function fillDataTable(gData, gTable) {
    "use strict";
    gStt = 1;
    gTable.clear();
    gTable.rows.add(gData);
    gTable.draw();
}

/**
 * Hàm vẽ paging khi có tổng số record
 * @param {*} pRecordTotal tổng record lấy từ server
 * Output: vẽ được paging đã phân trang theo tổng record
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
 * 
 * Hàm set curent page
 * @param {*} pCurrentPage là số page khi chọn trên paging
 * ouput: update page lên localStorage
 */
function setCurrentPage(pCurrentPage) {
    // Khai báo page
    var vPage = {
        currentPage: 0,
        totalPages: 0,
    };
    vPage.currentPage = pCurrentPage;
    vPage.totalPages = gTotalPages;
    localStorage.setItem(gPAGE_LOCAL_STORAGE, JSON.stringify(vPage));

    // xử lý show hide khi click page
    if (vPage.currentPage === gPAGE_FIRST) {
        $('#ul-paging').find('.previous-page').hide();
    } else {
        $('#ul-paging').find('.previous-page').show();
    }
    if (vPage.currentPage == vPage.totalPages - 1) {
        $('#ul-paging').find('.next-page').hide();
    } else {
        $('#ul-paging').find('.next-page').show();
    }
}

/**
 * Hàm lấy currentPage và recordTotal từ localStorage
 * @returns vResult Object chứa currentPage, size và recordTotal
 */
function getPage() {
    var vResult = localStorage.getItem(gPAGE_LOCAL_STORAGE);
    // console.log('PAGE: ', JSON.parse(vResult));
    return JSON.parse(vResult);
}

/**
 * Hàm xử lý khi click button paging
 * @param {*} pThis button page được chọn
 * output: set currentPage lên localStorage
 * load danh sách mới lấy từ server theo page được chọn
 */
function onCurrentPageClick(pThis) {
    "use strict";
    var vCurrentPage = $(pThis).val() - 1;
    var vPage = getPage();
    readDataFilter(gFilterRate);
    getRates(vCurrentPage, gFilterRate);
    // xử lý show hide khi click page
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
    setCurrentPage(vCurrentPage)
    gCurrentPage = vCurrentPage;
}

/**
 * Hàm xử lý khi click NextPage
 * @param {*} pThis page đang chọn
 * output: nếu page current = trang cuối, hide button next,
 */
function onPreviousPageClick(pThis) {
    "use strict";
    var vPage = getPage();
    if (vPage.currentPage > 0) {
        readDataFilter(gFilterRate);
        getRates(vPage.currentPage - 1, gFilterRate);
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
        readDataFilter(gFilterRate);
        getRates(vPage.currentPage + 1, gFilterRate);
        setCurrentPage(vPage.currentPage + 1);
        gCurrentPage = vPage.currentPage + 1;
    }
}

// Hàm xử lý khi click icon edit product
function onReplyReviewClick(pIconReply) {
    "use strict";
    gFormMode = gFORM_MODE_INSERT;
    console.log(gFormMode);
    openFormReplyReview(pIconReply);
}

/**
 * Hàm xử lý open form product detail
 * @param {*} pIconReply icon được click
 * output: Show data vào form product
 */
function openFormReplyReview(pIconReply) {
    "use strict";
    // open modal product
    $('#modal-reply-review').modal("show");
    // map data
    var vDataRow = getDataOnTable(pIconReply, gTableRate);
    // map data to form
    fillDataToForm(vDataRow);
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
    // console.log('Detail: ', vDataRow);
    return vDataRow;
}

/**
 * Hàm map dữ liệu vào form
 * @param {*} pRate chứa dữ liệu cần map
 * Output: các trường input có dữ liệu 
 */
function fillDataToForm(pRate) {
    "use strict";
    gRateId = pRate.id;
    $('#lbl-full-name').html(pRate.fullName);
    $('#lbl-comment').html(pRate.comment);
    getReplyRatesByRateId(gRateId);
}

// Hàm lấy danh sách trả lời đánh giá của một sản phẩm
function getReplyRatesByRateId(pRateId) {
    "use strict"
    // gọi API lấy data từ server
    var vUrl = gREPLY_RATES_URL + '?rateId=' + pRateId;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            fillDataTable(responseObject, gTableReplyRate);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

// Hàm xử lý thêm trả lời đánh giá khi nhấn Enter
function onReplyKeyPress(pKeyPress) {
    "use strict";
    // khai bao data
    var vReplyRate = {
        reCommnent: ''
    };
    // read data
    vReplyRate.reCommnent = $.trim($(pKeyPress).val());
    // validate
    if (!vReplyRate.reCommnent) {
        var vMess = 'Bạn chưa nhập trả lời đánh giá';
        console.assert(false, '100: ', vMess);
        toastr.error(vMess);
        $(pKeyPress).focus();
    } else {
        if (gFormMode === gFORM_MODE_INSERT) {
            // thêm trả lời đánh giá
            createReplyRate(vReplyRate);
            // cập nhật trạng thái đánh giá là được duyệt
            updateStatusRate();
        } else if (gFormMode === gFORM_MODE_UPDATE) {
            // cập nhật trả lời đánh giá
            updateReplyRate(vReplyRate);
            updateStatusRate();
        }
        // load table
        getReplyRatesByRateId(gRateId);
        // reset form
        $(pKeyPress).val('');
    }
}

// Hàm tạo trả lời đánh giá mới
function createReplyRate(pReplyRate) {
    "use strict";
    var vURL = gREPLY_RATES_URL + '/' + gUserId + '/' + gRateId;
    $.ajax({
        url: vURL,
        type: 'POST',
        headers: gHeaders,
        contentType: 'application/json',
        data: JSON.stringify(pReplyRate),
        async: false,
        success: function (responseObject) {
            toastr.success('Đã thêm trả lời đánh giá!');
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

// Hàm tạo trả lời đánh giá mới
function updateReplyRate(pReplyRate) {
    "use strict";
    var vURL = gREPLY_RATES_URL + '/' + gReplyRateId + '/' + gUserId + '/' + gRateId;
    $.ajax({
        url: vURL,
        type: 'PUT',
        headers: gHeaders,
        contentType: 'application/json',
        data: JSON.stringify(pReplyRate),
        async: false,
        success: function (responseObject) {
            toastr.success('Đã cập nhật trả lời đánh giá!');
            gFormMode = gFORM_MODE_INSERT;
            console.log(gFormMode);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

// Hàm tạo đánh giá mới
function updateStatusRate() {
    "use strict";
    var vURL = gRATES_URL + '/status/' + gRateId;
    $.ajax({
        url: vURL,
        type: 'PUT',
        headers: gHeaders,
        async: false,
        success: function (responseObject) {
            // Read data
            readDataFilter(gFilterRate);
            // load rate
            getRates(gCurrentPage, gFilterRate);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

// Hàm cập nhật lại trả lời đánh giá 
function onEditReplyClick(pIconEdit) {
    "use strict";
    // get data table
    var vDataRow = getDataOnTable(pIconEdit, gTableReplyRate);
    gReplyRateId = vDataRow.id;
    // gán ngược lại input
    $('#inp-reply').val(vDataRow.reCommnent);
    // set status form
    gFormMode = gFORM_MODE_UPDATE;
    console.log(gFormMode);
}

// Hàm xóa trả lời đánh giá 
function onDeleteReplyClick(pIconDelete) {
    "use strict";
    // get data table
    var vDataRow = getDataOnTable(pIconDelete, gTableReplyRate);
    gReplyRateId = vDataRow.id;
    // set status form
    gFormMode = gFORM_REPLY_DELETE;
    console.log(gFormMode);
    // show modal delete
    $('#modal-delete').modal('show');
}

// Hàm xử lý sự kiện xóa đánh giá hoặc trả lời đánh giá
function onDeleteClick() {
    "use strict";
    if (gFormMode === gFORM_REPLY_DELETE) {
        // xóa trả lời đánh giá
        deleteReplyRate();
        // load table reply
        getReplyRatesByRateId(gRateId);
    } else if (gFormMode === gFORM_RATE_DELETE) {
        // xóa đánh giá
        deleteRate();
        // Read data
        readDataFilter(gFilterRate);
        // load rate
        getRates(gCurrentPage, gFilterRate);
    }
    // show modal delete
    $('#modal-delete').modal('hide');

}

// Hàm tạo trả lời đánh giá mới
function deleteReplyRate() {
    "use strict";
    var vURL = gREPLY_RATES_URL + '/' + gReplyRateId;
    $.ajax({
        url: vURL,
        type: 'DELETE',
        headers: gHeaders,
        async: false,
        success: function (responseObject) {
            toastr.success('Đã xóa trả lời đánh giá');
            gFormMode = gFORM_MODE_INSERT;
            console.log(gFormMode);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm xử lý sự kiện khi click vào icon delete trên table
 * @param {*} pIconDelete icon được click
 * Output: open form delete
 */
function onDeleteReviewClick(pIconDelete) {
    "use strict";
    // set status form
    gFormMode = gFORM_RATE_DELETE;
    console.log(gFormMode);
    // get data table
    var vDataRow = getDataOnTable(pIconDelete, gTableRate);
    gRateId = vDataRow.id;
    // show modal delete
    $('#modal-delete').modal('show');
}

// Hàm tạo trả lời đánh giá mới
function deleteRate() {
    "use strict";
    var vURL = gRATES_URL + '/' + gRateId;
    $.ajax({
        url: vURL,
        type: 'DELETE',
        headers: gHeaders,
        async: false,
        success: function (responseObject) {
            toastr.success('Đã xóa đánh giá');
        },
        error: function (error) {
            var vError = JSON.parse(error.responseText);
            toastr.error(vError.notification);
        }
    });
}

/**
 * Hàm xử lý filter order by fullName, phone, status, orderDate
 */
function onBtnSearchRateClick() {
    "use strict";
    // Read data
    readDataFilter(gFilterRate);
    // load rate
    getRates(gPAGE_FIRST, gFilterRate);
    // vẽ paging
    buildPaging();
    // set page
    setCurrentPage(gPAGE_FIRST);
}

/**
 * Hàm reset form về trạng thái ban đầu
 * Input: các trường input chứa dữ liệu
 * Output: các trường được gán rỗng
 */
function resetFormToStart() {
    "use strict";
    gFormMode = gFORM_MODE_NORMAL;
    console.log(gFormMode);
    $('#inp-reply').val('');
}

