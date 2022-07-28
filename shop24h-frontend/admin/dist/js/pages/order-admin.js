"use strict"
// Khai báo link API các biến hằng số
const gORDERS_URL = 'http://localhost:8080/api/orders/';
const gPRODUCTS_URL = 'http://localhost:8080/api/products';
const gUSERS_URL = 'http://localhost:8080/api/users/';
const gORDER_DETAILS_URL = 'http://localhost:8080/api/order-details/';
const gSTATUS_URL = 'http://localhost:8080/api/status';
const gCOLORS_URL = 'http://localhost:8080/api/colors/';
const gCATEGORIES_URL = 'http://localhost:8080/api/categories/';

// Trạng thái form
const gFORM_MODE_NORMAL = 'NORMAL';
const gFORM_MODE_INSERT = 'INSERT';
const gFORM_MODE_UPDATE = 'UPDATE';
const gFORM_MODE_DELETE = 'DELETE';

// Gán gia trị mặc định trên select
const gVALUE_SELECT = 'SELECT_CUSTOMER';
const gTEXT_SELECT = 'Select Customer';

// Mảng các column table order
const gORDER_COLUMNS = [
    'stt',
    'orderCode',
    'orderDate',
    'expectedShippedDate',
    'fullName',
    'voucherCode',
    'discount',
    'priceShipped',
    'note',
    'statusName',
    'action'
];

// Mảng các column table order detail
const gORDER_DETAIL_COLUMNS = [
    'idProduct',
    'quantityOrder',
    'priceEach',
    'action'
];

// Vị trí từng column table order
const gCOLUMN_STT = 0;
const gCOLUMN_ORDER_CODE = 1;
const gCOLUMN_ORDER_DATE = 2;
const gCOLUMN_EXPECTED_SHIPPED_DATE = 3;
const gCOLUMN_FULLNAME = 4;
const gCOLUMN_VOUCHER_CODE = 5;
const gCOLUMN_DISCOUNT = 6;
const gCOLUMN_PRICE_SHIPPED = 7;
const gCOLUMN_NOTE = 8;
const gCOLUMN_STATUS_NAME = 9;
const gCOLUMN_ACTION = 10;

// Vị trí từng column table order detail
const gCOLUMN_PRODUCT_ID = 0;
const gCOLUMN_QUANTITY_ORDER = 1;
const gCOLUMN_PRICE_EACH = 2;
const gCOLUMS_UPDATE_QUANTITY_ORDER = 3;

const gCART_STAFF = 'CART_STAFF';

// Trạng thái đơn hàng
const gDA_DAT_HANG = 'Đã đặt hàng'
const gDA_XAC_NHAN = 'Đã xác nhận';
const gHUY_DON_HANG = 'Hủy đơn hàng';

// Khai báo các biến toàn cục
var gFormMode = gFORM_MODE_NORMAL;
var gStatusUser = gFORM_MODE_NORMAL;
var gStt = 1;
var gOrderId = 0;
var gZERO = 0;
var gUserId = 0;

// khai báo biến phân trang
const gPAGE_FIRST = 0;
const gPAGE_LOCAL_STORAGE = 'PAGE';
var gTotalPages = 0;
var gCurrentPage = 0;
var gFilterOrder = {
    fullName: '',
    phone: '',
    statusId: '',
    orderDate: ''
};

// khai báo Object lưu filter product khi tạo đơn hàng
var gFilterProduct = {
    colorId: 0,
    categoryId: 0
};

// Định nghĩa table Order
var gOrderTable = $('#table-order').DataTable({
    // Khai báo các cột của datatable
    columns: [
        { data: gORDER_COLUMNS[gCOLUMN_STT] },
        { data: gORDER_COLUMNS[gCOLUMN_ORDER_CODE] },
        { data: gORDER_COLUMNS[gCOLUMN_ORDER_DATE] },
        { data: gORDER_COLUMNS[gCOLUMN_EXPECTED_SHIPPED_DATE] },
        { data: gORDER_COLUMNS[gCOLUMN_FULLNAME] },
        { data: gORDER_COLUMNS[gCOLUMN_VOUCHER_CODE] },
        { data: gORDER_COLUMNS[gCOLUMN_DISCOUNT] },
        { data: gORDER_COLUMNS[gCOLUMN_PRICE_SHIPPED] },
        { data: gORDER_COLUMNS[gCOLUMN_NOTE] },
        { data: gORDER_COLUMNS[gCOLUMN_STATUS_NAME] },
        { data: gORDER_COLUMNS[gCOLUMN_ACTION] },
    ],
    columnDefs: [
        {   // map column STT
            targets: gCOLUMN_STT,
            render: function () {
                return gStt++;
            }
        },
        {   // map column STT
            targets: gCOLUMN_PRICE_SHIPPED,
            render: function (data) {
                return data.toLocaleString() + 'đ';
            }
        },
        {   // map column Action
            targets: gCOLUMN_ACTION,
            class: "text-center",
            defaultContent: `
        <i class="fas fa-edit text-primary edit-order" 
        style="cursor: pointer;" data-toggle="tooltip" title="Xác nhận order">
        `
        }
    ],
    searching: false,
    lengthChange: false,
    paging: false,
    info: false
});

// Định nghĩa table Order
var gTableCart = $('#table-cart').DataTable({
    // Khai báo các cột của datatable
    columns: [
        { data: gORDER_DETAIL_COLUMNS[gCOLUMN_PRODUCT_ID] },
        { data: gORDER_DETAIL_COLUMNS[gCOLUMN_QUANTITY_ORDER] },
        { data: gORDER_DETAIL_COLUMNS[gCOLUMN_PRICE_EACH] },
        { data: gORDER_DETAIL_COLUMNS[gCOLUMS_UPDATE_QUANTITY_ORDER] }

    ],
    columnDefs: [
        {   // map column 
            targets: gCOLUMN_PRODUCT_ID,
            class: "text-center",
            render: function (data) {
                var vInfoProduct = getProductDetail(data);
                return vInfoProduct.productName + '<br>' + vInfoProduct.colorName;
            }
        },
        {   // map column 
            targets: gCOLUMN_PRICE_EACH,
            class: "text-center",
            render: function (data) {
                return data.toLocaleString() + 'đ';
            }
        },
        {   // map column Action
            targets: gCOLUMS_UPDATE_QUANTITY_ORDER,
            class: "text-center",
            defaultContent: `
            <i class="far fa-minus-square text-primary minus-quantity-order" 
            style="cursor: pointer;" data-toggle="tooltip" title="Giảm số lượng">&nbsp;</i>
            <i class="far fa-plus-square text-success plus-quantity-order" 
            style="cursor: pointer;" data-toggle="tooltip" title="Tăng số lượng">&nbsp;</i>
            <i class="fas fa-trash-alt text-danger delete-product" 
            style="cursor: pointer;" data-toggle="tooltip" title="Xóa sản phẩm"></i></i>
        `
        }
    ],
    searching: false,
    lengthChange: false,
    paging: true,
    info: false
});

// create template products
const gProductTemplate = (product) => {
    return `
    <li class="list-group-item">
        <div class="row form-group btn-select-product" 
            data-product-id="${product.id}"
            data-price-discount="${product.priceDiscount}" 
            data-price="${product.price}">
            <div class="col-md-4">
                <img class="img-thumbnail"
                    src="../${product.imageUrl}">
            </div>
            <div class="col-md-8">
                <div class="item-box-blog-body ">
                    <div class="row">
                        <div class="col-md-10">
                            <h5 class="text-primary">${product.productName}</h5>
                            <label class="font-weight-bold">${product.materialName}</label>
                            <p id="p-color">${product.colorName}</p>
                            <label id="p-discountPrice" class="font-weight-bold" >
                                ${product.priceDiscount.toLocaleString()}đ</label>
                            <small id="sml-price"
                                class="text-decoration-line-through text-secondary">${product.price.toLocaleString()}đ</small>
                        </div>
                        <div class="col-md-2">#${product.id}</div>
                    </div>
                </div>
            </div>
        </div>
    </li >
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
    $('[data-mask]').inputmask();

    onPageLoading();

    // click button open modal form INSERT ORDER
    $('#btn-add-order').on('click', onBtnAddOrderClick);

    // click icon edit order open form UPDATE ORDER
    $('#table-order').on('click', '.edit-order', function () {
        onIconEditOrderClick(this);
    });
    // click button save order
    $('#btn-order').on('click', onBtnOrderClick);

    // click button update order
    $('#btn-confirm').on('click', onBtnConfirmClick);

    // click button cancel order
    $('#btn-cancel').on('click', onBtnCancelClick);

    // click button delete order
    $('#btn-delete').on('click', onBtnDeleteClick);

    // reset form khi close modal
    $('#modal-order').on('hidden.bs.modal', resetFormToStart);

    // event click image add cart
    $('#ul-product-list').on('click', '.btn-select-product', function () {
        onBtnSelectProduct(this);
    });

    // click button minus để giảm số lượng sản phẩm được chọn
    $('#table-cart').on('click', '.minus-quantity-order', function () {
        onMinusQuantirtOrderClick(this);
    });

    // click button plus để tăng số lượng sản phẩm được chọn
    $('#table-cart').on('click', '.plus-quantity-order', function () {
        onPlusQuantirtOrderClick(this);
    });

    // click button delete xóa sản phẩm khỏi giỏ hàng
    $('#table-cart').on('click', '.delete-product', function () {
        onDeleteProductClick(this);
    });

    // event key press input phone
    $('#inp-phone').on('keypress', function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            fillDataUser(getUserByPhone($('#inp-phone').val()));
        }
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

    // event click search
    $('#btn-search-order').on('click', onBtnSearchOrderClick);

    // event select change
    $('#select-category-modal').on('change', function () {
        // var vValue = $(this).val();
        readDataFilterProduct(gFilterProduct);
        getProducts(gFilterProduct);
        // onSelectCategoryModalChange(vValue);
    });

    // event select change
    $('#select-color-modal').on('change', function () {
        // var vValue = $(this).val();
        // console.log(vValue);
        // onSelectColorModalChange(vValue);
        readDataFilterProduct(gFilterProduct);
        getProducts(gFilterProduct);
    });
});

/**
 * Hàm load paging khi khởi chạy web
 * Input/start: data chưa có
 * Output/end: fill data to table payment và các select
 */
function onPageLoading() {
    "use strict";
    console.log(gFormMode);
    getStatus($('#select-filter-status'));
    // Read data filter
    readDataFilter(gFilterOrder);
    // load table list order
    getOrders(gPAGE_FIRST, gFilterOrder);
    // vẽ paging
    buildPaging();
    // set page
    setCurrentPage(gPAGE_FIRST);
}

/**
 * Hàm đổ dữ liệu từ server đổ vào select
 * @param {*} pSelect select cần đổ dữ liệu
 * Output: select có dữ liệu
 */
function getStatus(pSelect) {
    "use strict";
    // gọi API lấy data từ server
    $.ajax({
        url: gSTATUS_URL,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            fillDataStatus(pSelect, responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm đổ dữ liệu vào select
 * @param {*} pSelect select cần đổ dữ liệu
 * @param {*} pStatus dữ liệu sẽ đổ vào select
 * Output: select chứa dữ liệu
 */
function fillDataStatus(pSelect, pStatus) {
    "use strict";
    pSelect.empty();
    $('<option>', {
        val: 0,
        text: 'Trạng thái'
    }).appendTo(pSelect);
    pStatus.forEach(status => {
        $('<option>', {
            val: status.id,
            text: status.statusName
        }).appendTo(pSelect);
    });
}

/**
 * Hàm thu thập dữ liệu filter product
 * @param {*} pFilterOrder chứa dữ liệu thu thập
 * @returns pFilterProduct đã có dữ liệu
 */
function readDataFilter(pFilterOrder) {
    "use strict";
    pFilterOrder.fullName = $('#inp-filter-full-name').val().trim();
    pFilterOrder.phone = $('#inp-filter-phone').val().trim();
    pFilterOrder.statusId = $('#select-filter-status').val().trim();
    pFilterOrder.orderDate = $('#inp-order-date').val().trim();
    return pFilterOrder;
}

/**
 * Hàm xử lý đổ dữ liệu payment lên table
 * Input/start: read data, validate, call api
 * Output/end: show table đã đổ dữ liệu
 */
function getOrders(pCurrentPage, pFilterOrder) {
    "use strict";
    // gọi API lấy data từ server
    $.ajax({
        url: gORDERS_URL + '?page=' + pCurrentPage
            + '&fullName=' + pFilterOrder.fullName + '&phone=' + pFilterOrder.phone
            + '&orderDate=' + pFilterOrder.orderDate + '&statusId=' + pFilterOrder.statusId,
        type: "GET",
        headers: gHeaders,
        async: false,
        success: function (responseObject) {
            // đổ dữ liệu vào table
            // console.log(responseObject);
            fillDataTable(responseObject.content);
            gTotalPages = responseObject.totalPages;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm đổ dữ liệu vào table
 * Input: pOrders từ server trả về
 * Output: đổ được dữ liệu vào table
 */
function fillDataTable(pOrders) {
    "use strict";
    gStt = 1;
    gOrderTable.clear();
    gOrderTable.rows.add(pOrders);
    gOrderTable.draw();
}

/**
 * Hàm vẽ paging khi có TotalPages
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
 * Hàm lấy currentPage  từ localStorage
 * @returns vResult Object chứa currentPage
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
function onCurrentPageClick(pThis) {
    "use strict";
    var vCurrentPage = $(pThis).val() - 1;

    var vPage = getPage();
    // Read data filter
    readDataFilter(gFilterOrder);
    // load table list order
    getOrders(vCurrentPage, gFilterOrder);
    // xử lý show hide khi click page
    if (vCurrentPage === gPAGE_FIRST) {
        $('#ul-paging').find('.previous-page').hide();
    } else {
        $('#ul-paging').find('.previous-page').show();
    }
    if (vCurrentPage == vPage.totalPages - 1 || vCurrentPage === gPAGE_FIRST) {
        $('#ul-paging').find('.next-page').hide();
    } else {
        $('#ul-paging').find('.next-page').show();
    }
    // set CurrentPage localStorage
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
        readDataFilter(gFilterOrder);
        getOrders(vPage.currentPage - 1, gFilterOrder);
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
        readDataFilter(gFilterOrder);
        getOrders(vPage.currentPage + 1, gFilterOrder);
        setCurrentPage(vPage.currentPage + 1);
        gCurrentPage = vPage.currentPage + 1;
    }
}




// Hàm tính tổng tự động và show giao diện khi thêm sản phẩm vào giỏ hàng
function builTotal() {
    "use strict";
    var vDiscount = parseInt($('#inp-discount').val(), 10);
    var vPriceShipped = parseInt($('#inp-price-shipped').val(), 10);
    var vProvisional = parseInt($('#inp-provisional').val(), 10);
    var vTotal = vDiscount + vPriceShipped + vProvisional;
    $('#lbl-total').html(vTotal.toLocaleString() + 'đ');
}

/**
 * Hàm giảm 1 số lượng sản phẩm trong giỏ hàng khi click -
 * @param {*} pIcon 
 */
function onMinusQuantirtOrderClick(pIcon) {
    "use strict";
    // get data row from table
    var vDataRow = getDataOnTable(pIcon, gTableCart);
    // get product id
    var vProductId = vDataRow.idProduct;
    let vProductData = [];
    vProductData = getCart();
    var vCheck = false;
    let bI = 0;
    while (!vCheck && bI < vProductData.items.length) {
        if (vProductData.items[bI].idProduct === vProductId && vProductData.items[bI].quantityOrder > 1) {
            vCheck = true;
        } else {
            bI++;
        }
    }
    if (vCheck) {
        vProductData.items[bI].quantityOrder--;
    }
    localStorage.setItem(gCART_STAFF, JSON.stringify(vProductData));
    var vCart = getCart();
    fillDataTableModal(vCart.items);
}

/**
 * Hàm tăng 1 số lượng sản phẩm trong giỏ hàng khi click +
 * @param {*} pIcon 
 */
function onPlusQuantirtOrderClick(pIcon) {
    "use strict";
    // get data row from table
    var vDataRow = getDataOnTable(pIcon, gTableCart);
    // get product id
    var vProductId = vDataRow.idProduct;
    let vProductData = [];
    vProductData = getCart();
    var vCheck = false;
    let bI = 0;
    while (!vCheck && bI < vProductData.items.length) {
        if (vProductData.items[bI].idProduct === vProductId) {
            vCheck = true;
        } else {
            bI++;
        }
    }
    if (vCheck) {
        vProductData.items[bI].quantityOrder++;
    }
    localStorage.setItem(gCART_STAFF, JSON.stringify(vProductData));
    var vCart = getCart();
    fillDataTableModal(vCart.items);
}

/**
 * Hàm xóa sản phẩm trong giỏ hàng khi click delete
 * @param {*} pIcon 
 */
function onDeleteProductClick(pIcon) {
    "use strict";
    // get data row from table
    var vDataRow = getDataOnTable(pIcon, gTableCart);
    // get product id
    var vProductId = vDataRow.idProduct;
    let vProductData = [];
    vProductData = getCart();
    var vCheck = false;
    let bI = 0;
    while (!vCheck && bI < vProductData.items.length) {
        if (vProductData.items[bI].idProduct === vProductId) {
            vCheck = true;
        } else {
            bI++;
        }
    }
    if (vCheck) {
        vProductData.items.splice(bI, 1);
    }
    localStorage.setItem(gCART_STAFF, JSON.stringify(vProductData));
    var vCart = getCart();
    fillDataTableModal(vCart.items);
}

/**
 * Hàm xử lý khi chọn sản phẩm, sẽ đưa sản phẩm vào giỏ hàng và add vào table
 * @param {*} paramThis 
 */
function onBtnSelectProduct(paramThis) {
    "use strict";
    // Khai bao object
    var vProduct = {
        idProduct: 0,
        quantityOrder: 0,
        priceEach: 0
    };
    // read product khi click vào 1 product
    readProduct(vProduct, paramThis);
    if (gFormMode === gFORM_MODE_INSERT) {
        // add cart
        addCart(vProduct);
        // fill data to table on modal
        var vCart = getCart();
        fillDataTableModal(vCart.items);
    }
}

/**
 * Hàm thu thập dữ liệu sản phẩm khi chọn 1 sản phẩm trên list
 * @param {*} paramProduct 
 * @param {*} paramThis 
 * @returns 
 */
function readProduct(paramProduct, paramThis) {
    "use strict";
    paramProduct.idProduct = $(paramThis).data('product-id');
    paramProduct.quantityOrder = 1;
    var vPrice = $(paramThis).data('price');
    var vPriceDiscount = $(paramThis).data('price-discount');
    if (vPriceDiscount === gZERO) {
        paramProduct.priceEach = vPrice;

    } else {
        paramProduct.priceEach = vPriceDiscount;
    }
    // console.log('read product: ', paramProduct);
    return paramProduct;
}

/**
 * Hàm thêm sản phẩm vào giỏ hàng
 * @param {*} paramProduct 
 */
function addCart(paramProduct) {
    "use strict";
    // Khai báo card
    var vCart = {
        items: []
    };

    // get cart
    var vGetCart = getCart();
    if (vGetCart === null) {
        vCart.items.push(paramProduct);
        // console.log('Cart add: ', vCart);

    } else { // update cart
        vCart.items = updateProduct(vGetCart, paramProduct);
        // console.log('Cart update: ', vCart);
    }
    // set cart
    localStorage.setItem(gCART_STAFF, JSON.stringify(vCart));
}

/**
 * Hàm update sản phẩm trong giỏ hàng, nếu chưa có thì thêm
 * nếu có rồi thì tăng số lượng
 * @param {*} paramCart 
 * @param {*} paramProduct 
 * @returns 
 */
function updateProduct(paramCart, paramProduct) {
    "use strict";
    var vProducts = paramCart.items;
    var iCheck = false;
    var index = 0;
    while (!iCheck && index < vProducts.length) {
        if (vProducts[index].idProduct === paramProduct.idProduct) {
            iCheck = true;
        } else {
            index++;
        }
    }
    console.log('index', index);
    if (iCheck) {
        vProducts[index].quantityOrder += paramProduct.quantityOrder;
    } else {
        vProducts.push(paramProduct);
    }
    return vProducts;
}

/**
 * Hàm get sản phẩm trong giỏ hàng
 * @returns 
 */
function getCart() {
    "use strict";
    var vResult = localStorage.getItem(gCART_STAFF);
    console.log('Cart: ', JSON.parse(vResult));
    return JSON.parse(vResult);
}

// hàm set cart null và set trên localStorage
function setNullCart() {
    "use strict";
    // Khai báo card
    var vCart = {
        items: []
    };
    localStorage.setItem(gCART_STAFF, JSON.stringify(vCart));
}

/**
 * Hàm đổ dữ liệu vào table
 * Output: table chứa dữ liệu
 */
function fillDataTableModal(pOrderDetails) {
    "use strict";
    // buil data cho table
    gTableCart.clear();
    gTableCart.rows.add(pOrderDetails);
    gTableCart.draw();

    // buil provisional
    var vProvisional = 0;
    pOrderDetails.forEach(orderDetail => {
        var vIntoMoney = orderDetail.quantityOrder * orderDetail.priceEach;
        vProvisional += vIntoMoney;
    });
    // console.log('vProvisional ', vProvisional)
    $('#inp-provisional').val(vProvisional);

    // buil total
    builTotal();
}

/**
 * Hàm lấy dữ liệu chi tiết 1 product từ API
 * @param {*} pProductId là id lấy từ list cart
 * Output: lấy được info product từ server trả về
 */
function getProductDetail(pProductId) {
    "use strict";
    // gọi API lấy data từ server
    var vProductDetail = {};
    $.ajax({
        url: gPRODUCTS_URL + '/' + pProductId,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            vProductDetail = responseObject;
            // console.log(vProductDetail);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
    return vProductDetail;
}



/**
 * Hàm thu thập dữ liệu filter product
 * @param {*} pFilterProduct chứa dữ liệu thu thập
 * @returns pFilterProduct đã có dữ liệu
 */
function readDataFilterProduct(pFilterProduct) {
    "use strict";
    pFilterProduct.colorId = $('#select-color-modal').val().trim();
    pFilterProduct.categoryId = $('#select-category-modal').val().trim();
    return pFilterProduct;
}






/**
 * Hàm mở form modal insert hoặc update payment
 * Input: chưa mở form
 * Output: Hiện form
 */
function onBtnAddOrderClick() {
    "use strict";
    // update status form mode
    gFormMode = gFORM_MODE_INSERT;
    console.log(gFormMode);
    gStatusUser = gFORM_MODE_INSERT;
    console.log('gStatusUser: ', gStatusUser);
    openFormOrderDetail();
}

/**
 * Hàm xử lý khi click icon edit payment
 */
function onIconEditOrderClick(pIconEdit) {
    "use strict";
    gFormMode = gFORM_MODE_UPDATE;
    console.log(gFormMode);
    openFormOrderDetail(pIconEdit);
}

/**
 * Hàm xử lý open form payment detail
 * @param {*} pIconEdit icon được click
 * output: Show data vào form payment
 */
function openFormOrderDetail(pIconEdit) {
    "use strict";
    // open modal
    $('#modal-order').modal("show");
    // gán title modal
    $('#h5-modal-title-order').html(gFORM_MODE_INSERT);
    // get today
    getToday();
    // load products to modal
    getProducts(gFilterProduct);
    // load color, category
    getColors($('#select-color-modal'));
    getCategories($('#select-category-modal'));
    // show hide button
    $('#btn-order').show();
    $('#btn-confirm').hide();
    $('#btn-cancel').hide();
    showListProduct();
    if (gFormMode === gFORM_MODE_UPDATE) {
        // gán title modal
        $('#h5-modal-title-order').html(gFORM_MODE_UPDATE);
        $('#btn-order').hide();
        $('#btn-confirm').show();
        $('#btn-cancel').show();
        // map data to form
        mapDataFormOrder(pIconEdit)
        hideListProduct();
    }
}

// hàm lấy ngày hiện tại
function getToday() {
    "use strict";
    var vDate = new Date();
    var vDay = vDate.getDate();
    var vMonth = vDate.getMonth() + 1;
    var vYear = vDate.getFullYear();
    $('#h5-order-date').html(vDay + '/' + vMonth + '/' + vYear);
}

/**
 * Hàm lấy danh sách sản phẩm mới nhất
 * Input: chưa load
 * Output: load vào template
 */
function getProducts(pFilterProduct) {
    "use strict";
    // gọi API lấy data từ server
    var vUrl = gPRODUCTS_URL + '?categoryId=' + pFilterProduct.categoryId + '&colorId=' + pFilterProduct.colorId;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        success: function (responseObject) {
            // console.log(responseObject);
            buildProductList(responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm xây dựng template khi có dữ liệu truyền vào
 * @param {*} pProducts dữ liệu lấy từ server
 * Output: show giao diện có dữ liệu
 */
function buildProductList(pProducts) {
    "use strict";
    $('#ul-product-list').empty();
    pProducts.forEach(product => {
        const vProduct = gProductTemplate(product);
        $('#ul-product-list').append(vProduct);
    });
}

/**
 * Hàm đổ dữ liệu từ server đổ vào select
 * @param {*} pSelect select cần đổ dữ liệu
 * Output: select có dữ liệu
 */
function getColors(pSelect) {
    "use strict";
    // gọi API lấy data từ server
    $.ajax({
        url: gCOLORS_URL,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            fillDataSelectColor(pSelect, responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm đổ dữ liệu vào select
 * @param {*} pSelect select cần đổ dữ liệu
 * @param {*} pColors dữ liệu sẽ đổ vào select
 * Output: select chứa dữ liệu
 */
function fillDataSelectColor(pSelect, pColors) {
    "use strict";
    pSelect.empty();
    $('<option>', {
        val: 0,
        text: 'Màu sắc'
    }).appendTo(pSelect);
    pColors.forEach(color => {
        $('<option>', {
            val: color.id,
            text: color.colorName
        }).appendTo(pSelect);
    });
}

/**
 * Hàm đổ dữ liệu từ server đổ vào select
 * @param {*} pSelect select cần đổ dữ liệu
 * Output: select có dữ liệu
 */
function getCategories(pSelect) {
    "use strict";
    // gọi API lấy data từ server
    $.ajax({
        url: gCATEGORIES_URL,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            fillDataSelectCategory(pSelect, responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm đổ dữ liệu vào select
 * @param {*} pCategories select cần đổ dữ liệu
 * @param {*} pColors dữ liệu sẽ đổ vào select
 * Output: select chứa dữ liệu
 */
function fillDataSelectCategory(pSelect, pCategories) {
    "use strict";
    pSelect.empty();
    $('<option>', {
        val: 0,
        text: 'Loại sản phẩm'
    }).appendTo(pSelect);
    pCategories.forEach(category => {
        $('<option>', {
            val: category.id,
            text: category.categoryName
        }).appendTo(pSelect);
    });
}

// set hide form
function hideListProduct() {
    "use strict";
    $('#div-list-product').hide();
    $('#div-order-detail').prop('class', 'col-sm-12');
    $('#modal-dialog-xl').attr('class', 'modal-dialog modal-dialog-scrollable modal-lg');
}

// set show form
function showListProduct() {
    "use strict";
    $('#div-list-product').show();
    $('#div-order-detail').prop('class', 'col-sm-8');
    $('#modal-dialog-xl').attr('class', 'modal-dialog modal-dialog-scrollable modal-xl');
}
/**
 * Hàm xử lý fill data vào form payment
 * @param {*} pIconEdit 
 */
function mapDataFormOrder(pIconEdit) {
    "use strict";
    // get data row from table
    var vDataRow = getDataOnTable(pIconEdit, gOrderTable);
    // get id
    gOrderId = vDataRow.id;
    gUserId = vDataRow.idUser;
    setShowHideButton(vDataRow.statusName);
    // map data to form
    fillDataToForm(vDataRow);
    // hide icon on table detail
    $('#table-cart').find($('.minus-quantity-order')).hide();
    $('#table-cart').find($('.plus-quantity-order')).hide();
    $('#table-cart').find($('.delete-product')).hide();
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
 * Hàm hiển thị button tùy ngữ cảnh
 * @param {*} pStatus 
 */
function setShowHideButton(pStatus) {
    "use strict";
    if (pStatus === gDA_DAT_HANG) {
        $('#btn-confirm').prop('disabled', false);
        $('#btn-cancel').prop('disabled', false);
    } else if (pStatus === gDA_XAC_NHAN) {
        $('#btn-confirm').prop('disabled', true);
        $('#btn-cancel').prop('disabled', true);
    } else {
        $('#btn-confirm').prop('disabled', true);
        $('#btn-cancel').prop('disabled', true);
    }
}

/**
 * Hàm map dữ liệu vào form
 * @param {*} pOrder chứa dữ liệu cần map
 * Output: các trường input có dữ liệu 
 */
function fillDataToForm(pOrder) {
    "use strict";
    // Map order
    $('#h5-status-name').html(pOrder.statusName);
    $('#h5-order-date').html(pOrder.orderDate);
    $('#inp-note').val(pOrder.note);
    $('#inp-voucher-code').val(pOrder.voucherCode);
    $('#inp-discount').val(pOrder.discount);
    $('#inp-price-shipped').val(pOrder.priceShipped);

    // map user
    var vUser = getUserById(pOrder.idUser);
    $('#inp-phone').attr('readonly', true).val(vUser.phone);
    $('#inp-full-name').val(vUser.fullName);
    $('#inp-email').val(vUser.email);
    $('#inp-address').val(vUser.address);

    // map order detail
    getOrderDetailByOrderId(gOrderId);
}

/**
 * Hàm lấy info user by id
 * @param {*} pId 
 * @returns 
 */
function getUserById(pId) {
    "use strict";
    // gọi API lấy data từ server
    var vUser = '';
    $.ajax({
        url: gUSERS_URL + 'info/id/' + pId,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            vUser = responseObject;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
    return vUser;
}

/**
 * Map data user lên form
 * @param {*} pUser 
 */
function fillDataUser(pUser) {
    "use strict";
    if (pUser.id === gZERO) {
        gStatusUser = gFORM_MODE_INSERT;
        console.log('gStatusUser: ', gStatusUser);
        $('#inp-phone').val(pUser.phone);
        $('#inp-full-name').val('');
        $('#inp-email').val('');
        $('#inp-address').val('');
    } else {
        gStatusUser = gFORM_MODE_UPDATE;
        console.log('gStatusUser: ', gStatusUser);
        $('#inp-full-name').val(pUser.fullName);
        $('#inp-phone').val(pUser.phone);
        $('#inp-email').val(pUser.email);
        $('#inp-address').val(pUser.address);
    }
}

/**
 * Hàm get order detail by orderId
 * @param {*} pOrderId 
 */
function getOrderDetailByOrderId(pOrderId) {
    "use strict";
    // gọi API lấy data từ server
    $.ajax({
        url: gORDER_DETAILS_URL + pOrderId,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            fillDataTableModal(responseObject);
            // console.log(responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm xử lý khi click button save order
 * Input: read data, validate, xử lý data
 * Ouput: insert data vào CSDL bằng API
 */
function onBtnOrderClick() {
    "use strict";
    // Khai bao Object user
    var vObjectUser = {
        fullName: '',
        phone: '',
        email: '',
        address: ''
    }

    // Khai bao Object Order
    var vObjectOrder = {
        voucherCode: '',
        discount: 0.0,
        priceShipped: 0.0,
        note: '',
        status: 0
    }
    // read data
    readUser(vObjectUser);
    readOrder(vObjectOrder);
    // validate
    if (validateOrder(vObjectUser)) {
        // get cart nếu khác rỗng mới đươc tạo order
        var vProductInCart = getCart();
        var vLengthCart = vProductInCart.items.length;
        if (vLengthCart === gZERO) {
            toastr.error('Bạn chưa thêm sản phẩm vào đơn hàng');
        } else {
            // get user trả về userId
            getUserByPhone(vObjectUser.phone);
            // nếu userId = 0 là chưa tồn tại
            if (gUserId === gZERO) {
                // console.log('create user');
                gUserId = createUser(vObjectUser);
            } else {
                // Nếu tồn tại update user
                // console.log('update user');
                updateUser(vObjectUser, gUserId);
            }
            gOrderId = createOrder(vObjectOrder, gUserId);

            // Thêm từng sản phẩm order details vào csdl
            while (vLengthCart >= 1) {
                var bItemProduct = vProductInCart.items[vLengthCart - 1];
                createOrderDetail(bItemProduct, gOrderId, bItemProduct.idProduct);
                vProductInCart.items.splice(vLengthCart - 1, 1);
                vLengthCart--;
            }
            // set lại cart khi đã thêm giỏ hàng vào đơn hàng
            localStorage.setItem(gCART_STAFF, JSON.stringify(vProductInCart));
            // Đóng modal
            $('#modal-order').modal("hide");
            // show modal thông báo
            toastr.success('Đặt hàng thành công');
            // Read data filter
            readDataFilter(gFilterOrder);
            // load lại order
            getOrders(gCurrentPage, gFilterOrder);
        }
    }
}

/**
 * Hàm thu thập thông tin user
 * @param {*} pUser 
 * @returns 
 */
function readUser(pUser) {
    "use strict";
    pUser.fullName = $.trim($('#inp-full-name').val());
    pUser.phone = $.trim($('#inp-phone').val());
    pUser.email = $.trim($('#inp-email').val());
    pUser.address = $.trim($('#inp-address').val());
    return pUser;
}

/**
 * hàm thu thập thông tin order
 * @param {*} pOrder 
 * @returns 
 */
function readOrder(pOrder) {
    "use strict";
    if (gFormMode === gFORM_MODE_INSERT) {
        pOrder.status = 1;
    } else if (gFormMode === gFORM_MODE_UPDATE) {
        pOrder.status = 2;
    } else if (gFormMode === gFORM_MODE_DELETE) {
        pOrder.status = 3;
    }
    pOrder.voucherCode = $.trim($('#inp-voucher-code').val());
    pOrder.discount = parseFloat($.trim($('#inp-discount').val()));
    pOrder.priceShipped = parseFloat($.trim($('#inp-price-shipped').val()));
    pOrder.note = $.trim($('#inp-note').val());
    return pOrder;
}

/**
 * Hàm kiểm tra dữ liệu user có hợp lệ hay không
 * @param {*} pUser dữ liệu cần kiểm tra
 * @returns true hợp lệ, ngược lại return false
 */
function validateOrder(pUser) {
    "use strict";
    var vMess = '';
    if (!pUser.phone) {
        vMess = 'Bạn chưa nhập số điện thoại';
        console.assert(false, '200: ', vMess);
        toastr.error(vMess);
        $('#inp-phone').focus();
        return false;
    }
    if (!pUser.fullName) {
        vMess = 'Bạn chưa nhập họ tên';
        console.assert(false, '100: ', vMess);
        toastr.error(vMess);
        $('#inp-full-name').focus();
        return false;
    }
    if (!pUser.email) {
        vMess = 'Bạn chưa nhập email';
        console.assert(false, '300: ', vMess);
        toastr.error(vMess);
        $('#inp-email').focus();
        return false;
    } else if (!isEmail(pUser.email)) {
        vMess = 'Email not format';
        console.assert(false, '310: ', vMess);
        toastr.error(vMess);
        $('#inp-email').focus();
        return false;
    } else {
        if (gStatusUser === gFORM_MODE_INSERT) {
            if (isExistsEmail(pUser.email)) {
                vMess = 'Email ' + pUser.email + ' already exists';
                console.assert(false, '320: ' + vMess);
                toastr.error(vMess);
                $('#inp-email').focus();
                return false;
            }
        } else if (gStatusUser === gFORM_MODE_UPDATE) {
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
        vMess = 'Bạn chưa nhập địa chỉ';
        console.assert(false, '400: ', vMess);
        toastr.error(vMess);
        $('#inp-address').focus();
        return false;
    }
    return true
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
 * hàm lấy info user by phone
 * @param {*} pPhone 
 * @returns 
 */
function getUserByPhone(pPhone) {
    "use strict";
    // gọi API lấy data từ server
    var vUser = '';
    $.ajax({
        url: gUSERS_URL + 'info/phone/' + pPhone,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            vUser = responseObject;
            gUserId = responseObject.id;
            console.log('gUserId: ', gUserId);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
    return vUser;
}

/**
 * Hàm tạo user
 * @param {*} pUser 
 * @returns 
 */
function createUser(pUser) {
    "use strict";
    var vUserId = 0;
    $.ajax({
        url: gUSERS_URL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(pUser),
        async: false,
        success: function (responseObject) {
            console.log('create user: ', responseObject);
            vUserId = responseObject.id;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
    return vUserId;
}

/**
 * Hàm cập nhật user
 * @param {*} pUser 
 * @param {*} pId 
 */
function updateUser(pUser, pId) {
    "use strict";
    $.ajax({
        url: gUSERS_URL + pId,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(pUser),
        success: function (responseObject) {
            console.log('update user: ', responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm tạo order mới
 * @param {*} pOrder 
 * @param {*} pUserId 
 * @returns 
 */
function createOrder(pOrder, pUserId) {
    "use strict";
    var vOrderId = 0;
    $.ajax({
        url: gORDERS_URL + pUserId + '/' + pOrder.status,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(pOrder),
        async: false,
        success: function (responseObject) {
            console.log('create order: ', responseObject);
            vOrderId = responseObject.id;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
    return vOrderId;
}

/**
 * Hàm tạo order detail
 * @param {*} pOrderDetails 
 * @param {*} pOrderId 
 * @param {*} pProductId 
 */
function createOrderDetail(pOrderDetails, pOrderId, pProductId) {
    "use strict";
    var vURL = gORDER_DETAILS_URL + pOrderId + '/' + pProductId;
    $.ajax({
        url: vURL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(pOrderDetails),
        async: false,
        success: function (responseObject) {
            console.log('create order detail: ', responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}


// Hàm xác nhận đơn hàng
function onBtnConfirmClick() {
    "use strict";
    // Khai bao Object Order
    var vObjectOrder = {
        status: 2
    }
    updateOrder(vObjectOrder);
    minusQuantityInStock();
    // Read data filter
    readDataFilter(gFilterOrder);
    // load table list order
    getOrders(gCurrentPage, gFilterOrder);
    toastr.success('Đã xác nhận đơn hàng: ', gOrderId);
    $('#modal-order').modal('hide');
}

/**
 * Hàm cập nhật order
 * @param {*} pOrder 
 * @param {*} pUserId 
 */
function updateOrder(pOrder) {
    "use strict";
    var vURL = gORDERS_URL + gOrderId + '/' + pOrder.status;
    console.log(vURL);
    $.ajax({
        url: vURL,
        type: 'PUT',
        headers: gHeaders,
        contentType: 'application/json',
        data: JSON.stringify(pOrder),
        async: false,
        success: function (responseObject) {
            console.log('update order: ', responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

// Hàm giảm số lượng trong tồn kho
function minusQuantityInStock() {
    "use strict";
    var vURL = gORDER_DETAILS_URL + gOrderId;
    console.log(vURL);
    $.ajax({
        url: vURL,
        method: "PUT",
        timeout: 0,
        success: function (responseObject) {
            console.log('minus quantity product: ', responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

// show modal thông báo hủy đơn hàng
function onBtnCancelClick() {
    "use strict";
    // Khai bao Object Order
    $('#modal-delete').modal('show');
    $('#lbl-order-id').html(gOrderId);
}

// Hàm hủy đơn hàng
function onBtnDeleteClick() {
    "use strict";
    // Khai bao Object Order
    var vObjectOrder = {
        status: 3
    }
    updateOrder(vObjectOrder);
    // Read data filter
    readDataFilter(gFilterOrder);
    // load table list order
    getOrders(gCurrentPage, gFilterOrder);
    toastr.success('Đã hủy đơn hàng: ', gOrderId);
    $('#modal-delete').modal('hide');
    $('#modal-order').modal('hide');
}

/**
 * Hàm reset form về trạng thái ban đầu
 * Input: các trường input chứa dữ liệu
 * Output: các trường được gán rỗng
 */
function resetFormToStart() {
    "use strict";
    gFormMode = gFORM_MODE_NORMAL;
    gStatusUser = gFORM_MODE_NORMAL;
    console.log(gFormMode);
    gOrderId = 0;
    gUserId = 0;
    $('#inp-full-name').val('');
    $('#inp-phone').attr('readonly', false).val('');
    $('#inp-email').val('');
    $('#inp-address').val('');
    $('#inp-note').val('');
    $('#inp-voucher-code').val('');
    $('#inp-price-shipped').val(25000);
    $('#inp-discount').val(0);
    $('#inp-provisional').val(0);
    $('#lbl-total').html(0);
    setNullCart();
    gTableCart.clear();
    gTableCart.draw();
}

/**
 * Hàm xử lý filter order by fullName, phone, status, orderDate
 */
function onBtnSearchOrderClick() {
    "use strict";
    // Read data
    readDataFilter(gFilterOrder);
    // process data send request API
    getOrders(gPAGE_FIRST, gFilterOrder);
    // vẽ paging
    buildPaging();
    // set page
    setCurrentPage(gPAGE_FIRST);
}