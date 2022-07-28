"use strict"
// Khai báo link API các biến hằng số
const gUSERS_URL = 'http://localhost:8080/api/users/';
const gORDERS_HISTORY_URL = 'http://localhost:8080/api/orders/history/';
const gORDER_DETAILS_URL = 'http://localhost:8080/api/order-details/history/';

// Trạng thái form
const gFORM_MODE_NORMAL = 'NORMAL';
const gFORM_MODE_INSERT = 'INSERT';
const gFORM_MODE_UPDATE = 'UPDATE';
const gFORM_MODE_DELETE = 'DELETE';

// Mảng các column table user
const gUSER_COLUMNS = [
    'stt',
    'fullName',
    'phone',
    'email',
    'address',
    'gender',
    'birthday',
    'height',
    'weight',
    'action'
];

// Mảng các column table order
const gORDER_COLUMNS = [
    'stt',
    'id',
    'orderDate',
    'requiredDate',
    'shippedDate',
    'status',
    'comments'
];

const gCOLUMN_STT = 0;

// Vị trí từng column table user
const gCOLUMN_FULL_NAME = 1;
const gCOLUMN_PHONE = 2;
const gCOLUMN_EMAIL = 3;
const gCOLUMN_ADDRESS = 4;
const gCOLUMN_GENDER = 5;
const gCOLUMN_BIRTHDAY = 6;
const gCOLUMN_HEIGHT = 7;
const gCOLUMN_WEIGHT = 8;
const gCOLUMN_ACTION = 9;

// Vị trí từng column table order
const gCOLUMN_ID = 1;
const gCOLUMN_ORDER_DATE = 2;
const gCOLUMN_REQUIRED_DATE = 3;
const gCOLUMN_SHIPPED_DATE = 4;
const gCOLUMN_STATUS = 5;
const gCOLUMN_COMMENTS = 6;

// Khai báo các biến toàn cục
var gFormMode = gFORM_MODE_NORMAL;
var gStt = 1;
var gUserId = 0;
const gPAGE_FIRST = 0;
const gPAGE_LOCAL_STORAGE = 'PAGE';
const gPAGE_ORDER_LOCAL_STORAGE = 'PAGE_ORDER';
var gTotalPages = 0;
var gTotalPagesOrder = 0;
var gCurrentPage = 0;
var gFilterUser = {
    fullName: '',
    phone: ''
}

// Array Object User
var gUserDB = {
    users: [], // biến lưu data User khi load page

    // method
    /**
     * Hàm xử lý create User
     * @param {*} pUser dữ liệu insert
     * Output: thông báo thêm thành công
     */
    insert: function (pUser) {
        $.ajax({
            url: gUSERS_URL,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(pUser),
            async: false,
            success: function (responseObject) {
                // console.log('Insert User: ', responseObject);
                toastr.success('Insert success User: ', responseObject.fullName); // show modal thông báo
            },
            error: function (error) {
                console.assert(error.responseText);
            }
        });
    },

    /**
     * Hàm xử lý update User
     * @param {*} pUser dữ liệu update
     * Output: thông báo update thành công
     */
    update: function (pUser) {
        $.ajax({
            url: gUSERS_URL + gUserId,
            type: 'PUT',
            headers: gHeaders,
            contentType: 'application/json',
            data: JSON.stringify(pUser),
            async: false,
            success: function (responseObject) {
                // console.log('Update User: ', responseObject);
                toastr.success('Update success User: ', responseObject.fullName); // show modal thông báo
            },
            error: function (error) {
                console.assert(error.responseText);
            }
        });
    },

};

// Định nghĩa table User
var gUserTable = $('#table-user').DataTable({
    // Khai báo các cột của datatable
    columns: [
        { data: gUSER_COLUMNS[gCOLUMN_STT] },
        { data: gUSER_COLUMNS[gCOLUMN_FULL_NAME] },
        { data: gUSER_COLUMNS[gCOLUMN_PHONE] },
        { data: gUSER_COLUMNS[gCOLUMN_EMAIL] },
        { data: gUSER_COLUMNS[gCOLUMN_ADDRESS] },
        { data: gUSER_COLUMNS[gCOLUMN_GENDER] },
        { data: gUSER_COLUMNS[gCOLUMN_BIRTHDAY] },
        { data: gUSER_COLUMNS[gCOLUMN_HEIGHT] },
        { data: gUSER_COLUMNS[gCOLUMN_WEIGHT] },
        { data: gUSER_COLUMNS[gCOLUMN_ACTION] }
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
        <i class="fas fa-edit text-primary edit-user" 
        style="cursor: pointer;" data-toggle="tooltip" title="Edit User">&nbsp;</i>
        `
        }
    ],
    searching: false,
    lengthChange: false,
    paging: false,
    info: false
});

// Định nghĩa table order
var gTableOrder = $('#table-order').DataTable({
    // Khai báo các cột của datatable
    columns: [
        { data: 'orderCode' },
        { data: 'orderDate' },
        { data: 'statusName' },
        { data: 'discount' },
        { data: 'priceShipped' },
        { data: 'tongTien' },

    ],
    columnDefs: [
        {   // map column discount
            targets: 0,
            class: "order-code cursor-pointer",
        },
        {   // map column discount
            targets: 3,
            render: function (data) {
                return data.toLocaleString() + 'đ';
            }
        },
        {   // map column discount
            targets: 4,
            render: function (data) {
                return data.toLocaleString() + 'đ';
            }
        },
        {   // map column discount
            targets: 5,
            render: function (data) {
                return data.toLocaleString() + 'đ';
            }
        },
    ],
    searching: false,
    lengthChange: false,
    paging: false,
    info: false
});

// create template order details
const gOrderDetailTemplate = (orderDetail) => {
    return `
    <li class="list-group-item">
        <div class="row form-group">
            <div class="col-sm-4">
                <img class="img-thumbnail"
                    src="../${orderDetail.imageUrl}">
            </div>
            <div class="col-sm-8">
                <div class="row">
                    <div class="col-sm-12">
                        <small class="text-primary font-weight-bold">${orderDetail.product}</small>
                    </div>
                </div>

                <div class="row">
                    <div class="col-sm-12">
                        <small>${orderDetail.color}</small>
                        <small class="font-weight-bold">(${orderDetail.quantity} cái)</small>
                    </div>
                </div>

                <div class="row">
                    <div class="col-sm-12">
                        <small>Đơn giá:</small>
                        <small class="text-danger">${orderDetail.price.toLocaleString()}đ</small>
                    </div>
                </div>

                <div class="row">
                    <div class="col-sm-12">
                        <small>Thành tiền:</small>
                        <small class="text-danger">${orderDetail.thanhTien.toLocaleString()}đ</small>
                    </div>
                </div>
            </div>
        </div>
    </li>
`
}

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

    // Initialize Select2 Elements
    $('.select2bs4').select2({
        theme: 'bootstrap4'
    })

    // use input mask
    $('[data-mask]').inputmask();

    onPageLoading();

    // click button open modal form INSERT User
    $('#btn-add-user').on('click', onBtnAddUserClick);

    // click icon edit User open form UPDATE User
    $('#table-user').on('click', '.edit-user', function () {
        onIconEditUserClick(this);
    });

    // click button save User
    $('#btn-save-data').on('click', onBtnSaveDataClick);

    // reset form khi close modal
    $('#modal-user').on('hidden.bs.modal', resetFormToStart);

    // click table order
    $('#table-order').on('click', '.order-code', function () {
        var vOrder = getDataOnTable(this, gTableOrder);
        $(this).toggleClass("highlight");
        getOrderDetailByOrderCode(vOrder.orderCode);
    });

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

    // event click current page
    $('#ul-paging-customer').on('click', '.current-page', function () {
        onCurrentPageCustomerClick(this);
    });

    // event click previous page
    $('#ul-paging-customer').on('click', '.previous-page', function () {
        onPreviousPageCustomerClick(this);
    });

    // event click next page
    $('#ul-paging-customer').on('click', '.next-page', function () {
        onNextPageCustomerClick(this);
    });

    // event click search
    $('#btn-search-customer').on('click', onBtnSearchCustomerClick);
});

/**
 * Hàm load paging khi khởi chạy web
 * Input/start: data chưa có
 * Output/end: fill data to table User và các select
 */
function onPageLoading() {
    "use strict";
    console.log(gFormMode);
    // read data
    readDataFilter(gFilterUser);
    // load table list Customer
    getCustomersFilter(gPAGE_FIRST, gFilterUser);
    // vẽ paging
    buildPagingCustomer();
    // set page
    setCurrentPage(gPAGE_FIRST);
}

/**
 * Hàm thu thập dữ liệu filter user
 * @param {*} pFilterUser chứa dữ liệu thu thập
 * @returns pFilterUser đã có dữ liệu
 */
function readDataFilter(pFilterUser) {
    "use strict";
    pFilterUser.fullName = $('#inp-search-full-name').val().trim();
    pFilterUser.phone = $('#inp-search-phone').val().trim();
    // console.log(pFilterUser);
    return pFilterUser;
}

/**
 * Hàm xử lý đổ dữ liệu User lên table
 * Input/start: read data, validate, call api
 * Output/end: show table đã đổ dữ liệu
 */
function getCustomersFilter(pPage, pFilterUser) {
    "use strict";
    // gọi API lấy data từ server
    $.ajax({
        url: gUSERS_URL + 'customer?page=' + pPage
            + '&fullName=' + pFilterUser.fullName + '&phone=' + pFilterUser.phone,
        type: "GET",
        headers: gHeaders,
        contentType: 'application/json',
        async: false,
        success: function (res) {
            // console.log(res);
            fillDataTable(res.content);
            gTotalPages = res.totalPages;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm đổ dữ liệu vào table
 * @param {*} pUsers từ server trả về
 * Output: đổ được dữ liệu vào table
 */
function fillDataTable(pUsers) {
    "use strict";
    gStt = 1;
    gUserTable.clear();
    gUserTable.rows.add(pUsers);
    gUserTable.draw();
}

/**
 * Hàm vẽ paging khi có TotalPages
 * Output: vẽ được paging đã phân trang theo tổng record
 */
function buildPagingCustomer() {
    "use strict";
    $('#ul-paging-customer').empty().append(gPreviousTemplate);
    for (let bIndex = 0; bIndex < gTotalPages; bIndex++) {
        const vPaging = gPagingTemplate(bIndex);
        $('#ul-paging-customer').append(vPaging);
    }
    $('#ul-paging-customer').append(gNextTemplate);
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
        recordTotal: 0,
        totalPages: 0,
    };
    vPage.currentPage = pCurrentPage;
    vPage.totalPages = gTotalPages;
    localStorage.setItem(gPAGE_LOCAL_STORAGE, JSON.stringify(vPage));

    // xử lý show hide khi click page
    if (vPage.currentPage === gPAGE_FIRST) {
        $('#ul-paging-customer').find('.previous-page').hide();
    } else {
        $('#ul-paging-customer').find('.previous-page').show();
    }
    if (vPage.currentPage == vPage.totalPages - 1) {
        $('#ul-paging-customer').find('.next-page').hide();
    } else {
        $('#ul-paging-customer').find('.next-page').show();
    }
}

/**
 * Hàm lấy currentPage và recordTotal từ localStorage
 * @returns vResult Object chứa currentPage, size và recordTotal
 */
function getPage() {
    var vResult = localStorage.getItem(gPAGE_LOCAL_STORAGE);
    return JSON.parse(vResult);
}

/**
 * Hàm xử lý khi click button paging
 * @param {*} pThis button page được chọn
 * output: set currentPage lên localStorage
 * load danh sách mới lấy từ server theo page được chọn
 */
function onCurrentPageCustomerClick(pThis) {
    "use strict";
    var vCurrentPage = $(pThis).val() - 1;
    var vPage = getPage();
    // read data filter
    readDataFilter(gFilterUser);
    // load list customer
    getCustomersFilter(vCurrentPage, gFilterUser);
    // xử lý show hide khi click page
    if (vCurrentPage === gPAGE_FIRST) {
        $('#ul-paging-customer').find('.previous-page').hide();
    } else {
        $('#ul-paging-customer').find('.previous-page').show();
    }
    if (vCurrentPage == vPage.totalPages - 1) {
        $('#ul-paging-customer').find('.next-page').hide();
    } else {
        $('#ul-paging-customer').find('.next-page').show();
    }
    setCurrentPage(vCurrentPage)
    gCurrentPage = vCurrentPage;
}

/**
 * Hàm xử lý khi click NextPage
 * @param {*} pThis page đang chọn
 * output: nếu page current = trang cuối, hide button next,
 */
function onPreviousPageCustomerClick(pThis) {
    "use strict";
    var vPage = getPage();
    if (vPage.currentPage > 0) {
        readDataFilter(gFilterUser);
        getCustomersFilter(vPage.currentPage - 1, gFilterUser);
        setCurrentPage(vPage.currentPage - 1);
        gCurrentPage = vPage.currentPage - 1;
    }
}

/**
 * Hàm xử lý khi click NextPage
 * @param {*} pThis page đang chọn
 * output: nếu page current = trang cuối, hide button next,
 */
function onNextPageCustomerClick(pThis) {
    "use strict";
    var vPage = getPage();
    if (vPage.currentPage < vPage.totalPages - 1) {
        // read data filter
        readDataFilter(gFilterUser);
        // load list customer
        getCustomersFilter(vPage.currentPage + 1, gFilterUser);
        setCurrentPage(vPage.currentPage + 1);
        gCurrentPage = vPage.currentPage + 1;
    }
}

/**
 * Hàm mở form modal insert hoặc update User
 * Input: chưa mở form
 * Output: Hiện form
 */
function onBtnAddUserClick() {
    "use strict";
    // update status form mode
    gFormMode = gFORM_MODE_INSERT;
    console.log(gFormMode);
    openFormUserDetail();
}

/**
 * Hàm xử lý khi click icon edit User
 * @param {*} pIconEdit được chọn trên row table
 */
function onIconEditUserClick(pIconEdit) {
    "use strict";
    gFormMode = gFORM_MODE_UPDATE;
    console.log(gFormMode);
    openFormUserDetail(pIconEdit);
}

/**
 * Hàm xử lý open form User detail
 * @param {*} pIconEdit icon được click
 * output: Show data vào form User
 */
function openFormUserDetail(pIconEdit) {
    "use strict";
    // open modal User
    $('#modal-user').modal("show");
    // gán title modal
    $('#h5-modal-title-user').html(gFORM_MODE_INSERT);
    // set slider
    setSlider();
    hideHistoryOrder();
    if (gFormMode === gFORM_MODE_UPDATE) {
        // gán title modal
        $('#h5-modal-title-user').html(gFORM_MODE_UPDATE);
        mapDataFormUser(pIconEdit)
        showHistoryOrder();
    }
}

// set slider height and weight
function setSlider() {
    "use strict";
    // defaul value height, weight
    $('#lbl-height').html($('#inp-slider-height').val());
    $('#lbl-weight').html($('#inp-slider-weight').val());

    // load value slider height on lable
    $('#inp-slider-height').on('input', function () {
        $('#lbl-height').html($(this).val());
    });

    // load value slider weight on lable
    $('#inp-slider-weight').on('input', function () {
        $('#lbl-weight').html($(this).val());
    });
}

// set hide form
function hideHistoryOrder() {
    "use strict";
    $('#div-history-order').hide();
    $('#div-history-order-detail').hide();
    $('#div-info-customer').prop('class', 'col-sm-12');
    // $('#modal-dialog-xl').attr('class', 'modal-dialog modal-dialog-scrollable');
}

// set show form
function showHistoryOrder() {
    "use strict";
    $('#div-history-order').show();
    $('#div-history-order-detail').show();
    $('#div-info-customer').prop('class', 'col-sm-9');
    $('#modal-dialog-xl').attr('class', 'modal-dialog modal-dialog-scrollable modal-xl');
}

/**
 * Hàm xử lý fill data vào form User
 * @param {*} pIconEdit 
 */
function mapDataFormUser(pIconEdit) {
    "use strict";
    // get data row from table
    var vDataRow = getDataOnTable(pIconEdit, gUserTable);
    // get id User
    gUserId = vDataRow.id;
    // map data to form
    fillDataToForm(vDataRow);
    // get history order
    getOrderHistoryByUserId(gPAGE_FIRST);
    // vẽ paging khi có số tổng record do server trả về
    builPagingOrder();
    // set trang ban đầu và tổng số record
    setCurrentPageOrder(gPAGE_FIRST);
}

/**
 * Hàm lấy UserId khi click icon tại 1 dòng trên table
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
 * @param {*} pUser chứa dữ liệu cần map
 * Output: các trường input có dữ liệu 
 */
function fillDataToForm(pUser) {
    "use strict";
    $('#inp-full-name').val(pUser.fullName);
    $('#inp-phone').val(pUser.phone);
    $('#inp-email').val(pUser.email);
    $('#inp-address').val(pUser.address);
    $('#radio-' + pUser.gender).prop('checked', true);
    $('#inp-birthday').val(pUser.birthday);
    $('#inp-slider-height').val(pUser.height);
    $('#lbl-height').html(pUser.height);
    $('#inp-slider-weight').val(pUser.weight);
    $('#lbl-weight').html(pUser.weight);
}

/**
 * Hàm lấy danh sách order của user 
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
            fillTableOrder(res.content);
            // set total page
            gTotalPagesOrder = res.totalPages;
            // set total record order
            $('#lbl-count-orders').html(res.totalElements);
        },
        error: function (xhr) {
            console.log(xhr);
            onBtnLogoutClick();
        }
    });
}

/**
 * Hàm đổ dữ liệu vào table
 * @param {*} pOrders từ server trả về
 * Output: đổ được dữ liệu vào table
 */
function fillTableOrder(pOrders) {
    "use strict";
    gTableOrder.clear();
    gTableOrder.rows.add(pOrders);
    gTableOrder.draw();
}

/**
 * Hàm vẽ paging khi có tổng số record
 * Output: vẽ được paging đã phân trang theo tổng record
 */
function builPagingOrder() {
    "use strict";
    $('#ul-paging').empty().append(gPreviousTemplate);
    for (let bIndex = 0; bIndex < gTotalPagesOrder; bIndex++) {
        const vPaging = gPagingTemplate(bIndex);
        $('#ul-paging').append(vPaging);
    }
    $('#ul-paging').append(gNextTemplate);
}

/**
 * Hàm set lại first page khi load 1 request filter mới
 * Input: currebt page
 * output: set page current, 
 */
function setCurrentPageOrder(pCurrentPage) {
    "use strict";
    var vPage = {
        currentPage: 0,
        totalPages: 0,
    };
    vPage.currentPage = pCurrentPage;
    vPage.totalPages = gTotalPagesOrder;
    localStorage.setItem(gPAGE_ORDER_LOCAL_STORAGE, JSON.stringify(vPage));

    // xử lý show hide khi click page
    if (vPage.currentPage === gPAGE_FIRST) {
        $('#ul-paging').find('.previous-page').hide();
    } else {
        $('#ul-paging').find('.previous-page').show();
    }
    if (vPage.currentPage === vPage.totalPages - 1 || vPage.totalPages === gPAGE_FIRST) {
        $('#ul-paging').find('.next-page').hide();
    } else {
        $('#ul-paging').find('.next-page').show();
    }
}

/**
 * Hàm lấy currentPage và recordTotal từ localStorage
 * @returns vResult Object chứa currentPage, size và recordTotal
 */
function getPageOrder() {
    var vResult = localStorage.getItem(gPAGE_ORDER_LOCAL_STORAGE);
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
    getOrderHistoryByUserId(vCurrentPage);
    var vPage = getPageOrder();
    // xử lý show hide khi click page
    if (vCurrentPage === gPAGE_FIRST) {
        $('#ul-paging').find('.previous-page').hide();
    } else {
        $('#ul-paging').find('.previous-page').show();
    }
    if (vCurrentPage === vPage.totalPages - 1) {
        $('#ul-paging').find('.next-page').hide();
    } else {
        $('#ul-paging').find('.next-page').show();
    }
    setCurrentPageOrder(vCurrentPage);
}

/**
 * Hàm xử lý khi click NextPage
 * @param {*} pThis page đang chọn
 * output: nếu page current = trang cuối, hide button next,
 */
function onPreviousPageClick(pThis) {
    "use strict";
    var vPage = getPageOrder();
    if (vPage.currentPage > 0) {
        getOrderHistoryByUserId(vPage.currentPage - 1);
        setCurrentPageOrder(vPage.currentPage - 1);
    }
}

/**
 * Hàm xử lý khi click NextPage
 * @param {*} pThis page đang chọn
 * output: nếu page current = trang cuối, hide button next,
 */
function onNextPageClick(pThis) {
    "use strict";
    var vPage = getPageOrder();
    if (vPage.currentPage < vPage.totalPages - 1) {
        getOrderHistoryByUserId(vPage.currentPage + 1);
        setCurrentPageOrder(vPage.currentPage + 1);
    }
}

/**
 * Hàm gọi API từ server để lấy danh sách chi tiết của một order
 * @param {*} pOrderCode orderCode gửi server
 */
function getOrderDetailByOrderCode(pOrderCode) {
    "use strict";
    // gọi API lấy data từ server
    var vUrl = gORDER_DETAILS_URL + pOrderCode;
    $.ajax({
        url: vUrl,
        method: "GET",
        headers: gHeaders,
        async: false,
        success: function (res) {
            // console.log(res)
            buildProductList(res);
        },
        error: function (xhr) {
        }
    });
}

/**
 * Hàm xây dựng template khi có dữ liệu truyền vào
 * @param {*} pOrderDetails dữ liệu lấy từ server
 * Output: show giao diện có dữ liệu
 */
function buildProductList(pOrderDetails) {
    "use strict";
    $('#ul-product-list').empty();
    pOrderDetails.forEach(orderDetail => {
        const vOrderDetail = gOrderDetailTemplate(orderDetail);
        $('#ul-product-list').append(vOrderDetail);
    });
}

/**
 * Hàm xử lý khi click button save User
 * Input: read data, validate, xử lý data
 * Ouput: insert data vào CSDL bằng API
 */
function onBtnSaveDataClick() {
    "use strict";
    // khai báo Object
    var vUser = {
        fullName: '',
        phone: '',
        email: '',
        address: '',
        gender: '',
        birthday: '',
        height: '',
        weight: ''
    }
    // read data
    readDataCustomer(vUser);
    // validate data
    if (validateCustomer(vUser)) {
        // save User
        saveUser(vUser)
        // read data filter
        readDataFilter(gFilterUser);
        // reload Customer
        getCustomersFilter(gCurrentPage, gFilterUser);
        // hide modal User when insert success
        $('#modal-user').modal('hide');
    }
}

/**
 * Hàm thu thập dữ liệu nhập
 * @param {*} pUser chứa dữ liệu nhập
 * @returns pUser dữ liệu đã được nhập
 */
function readDataCustomer(pUser) {
    "use strict";
    pUser.fullName = $('#inp-full-name').val().trim();
    pUser.phone = $('#inp-phone').val().trim();
    pUser.email = $('#inp-email').val().trim();
    pUser.address = $('#inp-address').val().trim();
    pUser.gender = $('input[name=gender]:checked').val();
    pUser.birthday = $('#inp-birthday').val().trim();
    pUser.height = parseInt($('#lbl-height').html().trim(), 10);
    pUser.weight = parseInt($('#lbl-weight').html().trim(), 10);
    // console.log(pUser);
    return pUser;
}

/**
 * Hàm kiểm tra dữ liệu nhập
 * @param {*} pUser dữ liệu người dùng nhập
 * @returns true nếu hợp lệ, ngược lại return false
 */
function validateCustomer(pUser) {
    "use strict";
    var vMess = '';
    if (!pUser.fullName) {
        vMess = 'Please input full name';
        console.assert(false, '100: ' + vMess);
        toastr.error(vMess);
        $('#inp-full-name').focus();
        return false;
    }
    if (!pUser.phone) {
        vMess = 'Please input phone number';
        console.assert(false, '200: ' + vMess);
        toastr.error(vMess);
        $('#inp-phone').focus();
        return false;
    } else {
        if (gFormMode === gFORM_MODE_INSERT) {
            if (isExistsByPhone(pUser.phone)) {
                vMess = 'Phone ' + pUser.phone + ' already exists';
                console.assert(false, '210: ' + vMess);
                toastr.error(vMess);
                $('#inp-phone').focus();
                return false;
            }
        } else if (gFormMode === gFORM_MODE_UPDATE) {
            if (isExistsIdAndPhone(gUserId, pUser.phone)) {
                vMess = 'Phone ' + pUser.phone + ' already exists';
                console.assert(false, '210: ' + vMess);
                toastr.error(vMess);
                $('#inp-phone').focus();
                return false;
            }
        }
    }
    if (!pUser.email) {
        vMess = 'Please input email';
        console.assert(false, '300: ' + vMess);
        toastr.error(vMess);
        $('#inp-email').focus();
        return false;
    } else if (!isEmail(pUser.email)) {
        vMess = 'Email not format';
        console.assert(false, '310: ' + vMess);
        toastr.error(vMess);
        $('#inp-email').focus();
        return false;
    } else {
        if (gFormMode === gFORM_MODE_INSERT) {
            if (isExistsEmail(pUser.email)) {
                vMess = 'Email ' + pUser.email + ' already exists';
                console.assert(false, '320: ' + vMess);
                toastr.error(vMess);
                $('#inp-email').focus();
                return false;
            }
        } else if (gFormMode === gFORM_MODE_UPDATE) {
            if (isExistsIdAndEmail(gUserId, pUser.email)) {
                vMess = 'Email ' + pUser.email + ' already exists';
                console.assert(false, '320: ' + vMess);
                toastr.error(vMess);
                $('#inp-email').focus();
                return false;
            }
        }
    }
    if (!pUser.address) {
        vMess = 'Please input address';
        console.assert(false, '400: ' + vMess);
        toastr.error(vMess);
        $('#inp-address').focus();
        return false;
    }
    if (!pUser.birthday) {
        vMess = 'Please input birthday';
        console.assert(false, '500: ' + vMess);
        toastr.error(vMess);
        $('#inp-birthday').focus();
        return false;
    }
    if (pUser.height === 0) {
        vMess = 'Please input height';
        console.assert(false, '600: ' + vMess);
        toastr.error(vMess);
        $('#inp-height').focus();
        return false;
    }
    if (pUser.weight === 0) {
        vMess = 'Please input weight';
        console.assert(false, '700: ' + vMess);
        toastr.error(vMess);
        $('#inp-weight').focus();
        return false;
    }
    return true;
}

/**
 * Hàm kiểm tra phone đã tồn tại hay không
 * @param {*} pPhone người dùng nhập
 * @returns true nếu tồn tại, ngược lại return false
 */
function isExistsByPhone(pPhone) {
    "use strict";
    var vExists = false;
    $.ajax({
        url: gUSERS_URL + 'exists/phone/' + pPhone,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            vExists = responseObject.exists;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
    return vExists;
}

/**
 * Hàm kiểm tra phone đã tồn tại hay không khi update
 * @param {*} pId id khi update 
 * @param {*} pPhone người dùng nhập
 * @returns true nếu tồn tại, ngược lại return false (bỏ qua chính nó)
 */
function isExistsIdAndPhone(pId, pPhone) {
    "use strict";
    var vExists = false;
    $.ajax({
        url: gUSERS_URL + 'exists/id-phone/' + pId + '/' + pPhone,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            vExists = responseObject.exists;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
    return vExists;
}

/**
 * Hàm kiểm tra format email
 * @param {*} pEmail người dùng nhập
 * @returns true nếu hợp lệ, ngược lại return false
 */
function isEmail(pEmail) {
    var vEmailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return vEmailReg.test(pEmail);
}

/**
 * Hàm kiểm tra email có tồn tại hay không
 * @param {*} pEmail người dùng nhập
 * @returns true nếu tồn tại, ngược lại return false
 */
function isExistsEmail(pEmail) {
    "use strict";
    var vExists = false;
    $.ajax({
        url: gUSERS_URL + 'exists/email/' + pEmail,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            vExists = responseObject.exists;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
    return vExists;
}

/**
 * Hàm kiểm tra email có tồn tại hay không khi update
 * @param {*} pId id khi update
 * @param {*} pEmail  người dùng nhập
 * @returns true nếu tồn tại, ngược lại return false (bỏ qua chính nó)
 */
function isExistsIdAndEmail(pId, pEmail) {
    "use strict";
    var vExists = false;
    $.ajax({
        url: gUSERS_URL + 'exists/id-email/' + pId + '/' + pEmail,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            vExists = responseObject.exists;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
    return vExists;
}

/**
 * Hàm xử lý save User
 * @param {*} pUser 
 */
function saveUser(pUser) {
    "use strict";
    if (gFormMode === gFORM_MODE_INSERT) {
        gUserDB.insert(pUser);
    } else if (gFormMode === gFORM_MODE_UPDATE) {
        gUserDB.update(pUser);
    }
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
    gUserId = 0;
    $('#inp-full-name').val('');
    $('#inp-phone').val('');
    $('#inp-email').val('');
    $('#inp-address').val('');
    $('input[name=gender]').prop(':check', false);
    $('#inp-birthday').val('');
    $('#inp-slider-height').val(0);
    $('#lbl-height').html('');
    $('#inp-slider-weight').val(0);
    $('#lbl-weight').html('');
    $('#ul-product-list').empty();
}

/**
 * Hàm xử lý filter user by fullName hoặc phone
 */
function onBtnSearchCustomerClick() {
    "use strict";
    // Read data
    readDataFilter(gFilterUser);
    // process data send request API
    getCustomersFilter(gPAGE_FIRST, gFilterUser);
    // vẽ paging
    buildPagingCustomer();
    // set page
    setCurrentPage(gPAGE_FIRST);
}