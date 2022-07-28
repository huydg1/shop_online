"use strict"
// Khai báo link API
const gPRODUCT_CODE_EXISTS_URL = 'http://localhost:8080/api/products/exists/';
const gPRODUCTS_URL = 'http://localhost:8080/api/products/';
const gCOLORS_URL = 'http://localhost:8080/api/colors/';
const gMATERIALS_URL = 'http://localhost:8080/api/materials/';
const gCATEGORIES_URL = 'http://localhost:8080/api/categories/';
const gIMAGES_URL = 'http://localhost:8080/api/images/';
const gRATES_URL = 'http://localhost:8080/api/rates/product/';
const gREPLY_RATES_URL = 'http://localhost:8080/api/reply-rates?rateId=';

// Trạng thái form
const gFORM_MODE_NORMAL = 'NORMAL';
const gFORM_MODE_INSERT = 'INSERT';
const gFORM_MODE_UPDATE = 'UPDATE';
const gFORM_MODE_DELETE = 'DELETE';

// Gán gia trị mặc định trên select
const gVALUE_SELECT = 'PLEASE_SELECT';
const gTEXT_SELECT = 'Please select';

// Mảng các column table product
const gPRODUCT_COLUMNS = [
    'stt',
    'imageUrl',
    'productName',
    'colorName',
    'categoryName',
    'materialName',
    'price',
    'priceDiscount',
    'quantityInStock',
    'action'
];

// Vị trí từng column table product
const gCOLUMN_STT = 0;
const gCOLUMN_IMAGE = 1;
const gCOLUMN_PRODUCT_NAME = 2;
const gCOLUMN_COLOR = 3;
const gCOLUMN_CATEGORY = 4;
const gCOLUMN_MATERIAL = 5;
const gCOLUMN_PRICE = 6;
const gCOLUMN_PRICE_DISCOUNT = 7;
const gCOLUMN_QUANTITY_IN_STOCK = 8;
const gCOLUMN_ACTION = 9;

// Khai báo các biến toàn cục
var gFormMode = gFORM_MODE_NORMAL;
var gStt = 1;
var gProductId = 0;
var gProductName = '';
var gCatetoryName = '';

// Biến toàn cục
const gPAGE_FIRST = 0;
const gPAGE_LOCAL_STORAGE = 'PAGE';
const gPAGE_RATE_LOCAL_STORAGE = 'PAGE_RATE';
var gTotalPages = 0;
var gTotalPagesRate = 0;
var gCurrentPage = 0;
var gFilterProduct = {
    productName: '',
    priceMin: '',
    priceMax: '',
    categoryId: ''
}

// Array Object product
var gProductDB = {
    products: [], // biến lưu data product khi load page

    // method
    /**
     * Hàm xử lý create product
     * @param {*} pProduct dữ liệu insert
     * Output: thông báo thêm thành công
     */
    insert: function (pProduct) {
        $.ajax({
            url: gPRODUCTS_URL + pProduct.idCategory + '/' + pProduct.idMaterial + '/' + pProduct.idColor,
            type: 'POST',
            headers: gHeaders,
            contentType: 'application/json',
            data: JSON.stringify(pProduct),
            async: false,
            success: function (responseObject) {
                // console.log('Insert product: ', responseObject);
                toastr.success('Insert success product: ' + responseObject.productName); // show modal thông báo
            },
            error: function (error) {
                console.assert(error.responseText);
            }
        });
    },

    /**
     * Hàm xử lý update product
     * @param {*} pProduct dữ liệu update
     * Output: thông báo update thành công
     */
    update: function (pProduct) {
        $.ajax({
            url: gPRODUCTS_URL + gProductId + '/' + pProduct.idCategory + '/'
                + pProduct.idMaterial + '/' + pProduct.idColor,
            type: 'PUT',
            headers: gHeaders,
            contentType: 'application/json',
            data: JSON.stringify(pProduct),
            async: false,
            success: function (responseObject) {
                // console.log('Update product: ', responseObject);
                toastr.success('Update success product: ' + responseObject.productName); // show modal thông báo
            },
            error: function (error) {
                console.assert(error.responseText);
            }
        });
    },

    /**
     * Hàm xử lý xóa product
     * @param {*} pProductId id cần truy vấn để xóa
     * Output: thông báo xóa thành công
     */
    delete: function (pProductId) {
        $.ajax({
            url: gPRODUCTS_URL + pProductId,
            type: 'DELETE',
            headers: gHeaders,
            async: false,
            success: function (responseObject) {
                toastr.success('Delete success product: ' + gProductId); // show modal thông báo
            },
            error: function (error) {
                var vError = JSON.parse(error.responseText);
                toastr.error(vError.notification);
            }
        });
    }
};

// Định nghĩa table product
var gProductTable = $('#table-product').DataTable({
    // Khai báo các cột của datatable
    columns: [
        { data: gPRODUCT_COLUMNS[gCOLUMN_STT] },
        { data: gPRODUCT_COLUMNS[gCOLUMN_IMAGE] },
        { data: gPRODUCT_COLUMNS[gCOLUMN_PRODUCT_NAME] },
        { data: gPRODUCT_COLUMNS[gCOLUMN_COLOR] },
        { data: gPRODUCT_COLUMNS[gCOLUMN_CATEGORY] },
        { data: gPRODUCT_COLUMNS[gCOLUMN_MATERIAL] },
        { data: gPRODUCT_COLUMNS[gCOLUMN_PRICE] },
        { data: gPRODUCT_COLUMNS[gCOLUMN_PRICE_DISCOUNT] },
        { data: gPRODUCT_COLUMNS[gCOLUMN_QUANTITY_IN_STOCK] },
        { data: gPRODUCT_COLUMNS[gCOLUMN_ACTION] }
    ],
    columnDefs: [
        {   // map column STT
            targets: gCOLUMN_STT,
            render: function () {
                return gStt++;
            }
        },
        {   // map column gCOLUMN_IMAGE
            targets: gCOLUMN_IMAGE,
            render: function (data) {
                return data ?
                    '<img class="img-table cursor-pointer review-product" src="../' + data + '">' :
                    null;
            }
        },
        {   // map column gCOLUMN_PRICE
            targets: gCOLUMN_PRICE,
            render: function (data) {
                return data.toLocaleString();
            }
        },
        {   // map column gCOLUMN_PRICE_DISCOUNT
            targets: gCOLUMN_PRICE_DISCOUNT,
            render: function (data) {
                return data.toLocaleString();
            }
        },
        {   // map column Action
            targets: gCOLUMN_ACTION,
            class: "text-center",
            defaultContent: `
        <i class="fas fa-edit text-primary edit-product" 
        style="cursor: pointer;" data-toggle="tooltip" title="Edit product">&nbsp;</i>
        <i class="fas fa-trash-alt text-danger delete-product" 
        style="cursor: pointer;" data-toggle="tooltip" title="Delete product"></i>&nbsp;</i>
        <i class="fas fa-upload text-success upload-image" 
        style="cursor: pointer;" data-toggle="tooltip" title="Upload image"></i>
        `
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

// template review
const gReviewTemplate = (rate) => {
    return `
    <div class = "card bg-light" id="heading${rate.id}">
        <div class ="row form-group pt-2 pl-2">
            <div class="col-sm-2 text-info">
                <lable>${rate.commentDate}</lable>
            </div>
            <div class="col-sm-2">
                <lable>${rate.fullName}</lable>
            </div>
            <div class="col-sm-4 text-center text-success cursor-pointer view-reply" 
            data-rate-id="${rate.id}" data-toggle="collapse"
            data-target="#collapse${rate.id}" aria-expanded="false"
            aria-controls="collapse${rate.id}">
                <lable>${rate.comment}</lable>
            </div>
            <div class="col-sm-2">
                <lable>${rate.rate}</lable>
            </div>
            <div class="col-sm-2">
                <lable>${rate.statusRateName}</lable>
            </div>
        </div>
    </div>

    <div id="collapse${rate.id}" class=" collapse" aria-labelledby="heading${rate.id}"
        data-parent="#div-review">
    </div>
    `
}

// template reply
const gReplyReviewTemplate = (replyRate) => {
    return `
    <div class="row form-group pt-2 pl-2">
        <div class="col-sm-2 text-danger">
            <lable>${replyRate.reCommentDate}</lable>
        </div>
        <div class="col-sm-2 text-center">
            <lable>${replyRate.fullName}</lable>
        </div>
        <div class="col-sm-8 text-center text-primary">
            <lable>${replyRate.reCommnent}</lable>
        </div>
    </div>`
}

//Khai báo xác thực ở headers
var gHeaders = { Authorization: "Token " + getCookie("token") };

// Call event khi page đã được load
$(document).ready(function () {

    // Initialize Select2 Elements
    $('.select2bs4').select2({
        theme: 'bootstrap4'
    })

    onPageLoading();

    // click button open modal form INSERT product
    $('#btn-add-product').on('click', onBtnAddProductClick);

    // click icon edit product open form UPDATE product
    $('#table-product').on('click', '.edit-product', function () {
        onIconEditProductClick(this);
    });

    // click button save product
    $('#btn-save-data').on('click', onBtnSaveDataClick);

    // click icon delete product
    $('#table-product').on('click', '.delete-product', function () {
        onIconDeleteProductClick(this);
    });

    // click button delete
    $('#btn-delete').on('click', onBtnDeleteClick);

    // upload imge detail
    $('#table-product').on('click', '.upload-image', function () {
        onIconUploadImageClick(this);
    });

    // reset form khi close modal
    $('#modal-product').on('hidden.bs.modal', resetFormToStart);
    $('#modal-delete').on('hidden.bs.modal', resetFormToStart);
    $('#modal-image-product').on('hidden.bs.modal', resetFormToStart);

    // click button upload image - thêm mới hoặc sửa product
    $('#btn-upload-image').on('change', function () {
        onBtnUploadImageProductClick(this);
    });

    // click button upload image - thêm ảnh phụ của 1 sản phẩm
    $('#btn-upload-img-new').on('change', function () {
        onBtnUploadImageNewProductClick(this);
    });

    // click button save image phụ
    $('#btn-save-image').on('click', function () {
        onBtnSaveImageClick(this);
    });

    // event select
    $('#select-category').on('change', function () {
        gCatetoryName = $(this).find("option:selected").text();
        // console.log('gCatetoryName: ', gCatetoryName);
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

    // click row table product xem rate
    $('#table-product').on('click', '.review-product', function () {
        // get data row from table
        var vDataRow = getDataOnTable($(this), gProductTable);
        gProductId = vDataRow.id;
        getRatesByProductId(gProductId, gPAGE_FIRST);
        $('#modal-review').modal('show');
        $('#div-spinner').hide();
        // show phân trang
        buildReadMore();
        // set localStorage
        setReadMore();
    });

    // event click button read more
    $('#div-read-more').on('click', '.read-more', function () {
        onBtnReadMoreClick(this);
    });

    // xem reply rate
    $('#div-review').on('click', '.view-reply', function () {
        var vRateId = $(this).data('rate-id');
        getReplyRatesByRateId(vRateId);
    });

    // event click search
    $('#btn-search-product').on('click', onBtnSearchProductClick);
});

/**
 * Hàm load paga khi khởi chạy web
 * Input/start: data chưa có
 * Output/end: fill data to table product và các select
 */
function onPageLoading() {
    "use strict";
    console.log(gFormMode);
    // load select category
    getCategories($('#select-filter-category'));
    // Read data filter
    readDataFilter(gFilterProduct);
    // load data product filter
    getProductsFilter(gPAGE_FIRST, gFilterProduct);
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
        val: '0',
        text: 'Loại sản phẩm'
    }).appendTo(pSelect);
    pCategories.forEach(category => {
        $('<option>', {
            val: category.id,
            text: category.categoryName
        }).appendTo(pSelect);
    });
}

/**
 * Hàm thu thập dữ liệu filter product
 * @param {*} pFilterProduct chứa dữ liệu thu thập
 * @returns pFilterProduct đã có dữ liệu
 */
function readDataFilter(pFilterProduct) {
    "use strict";
    pFilterProduct.productName = $('#inp-filter-product-name').val().trim();
    pFilterProduct.priceMin = $('#inp-filter-price-min').val().trim();
    pFilterProduct.priceMax = $('#inp-filter-price-max').val().trim();
    pFilterProduct.categoryId = $('#select-filter-category').val().trim();
    // console.log(pFilterProduct);
    return pFilterProduct;
}

/**
 * Hàm xử lý đổ dữ liệu product lên table
 * Input/start: read data, validate, call api
 * Output/end: show table đã đổ dữ liệu
 */
function getProductsFilter(pPage, pFilterProduct) {
    "use strict";
    // gọi API lấy data từ server
    var vUrl = gPRODUCTS_URL + 'filter?page=' + pPage +
        '&productName=' + pFilterProduct.productName + '&category=' + pFilterProduct.categoryId +
        '&priceMin=' + pFilterProduct.priceMin + '&priceMax=' + pFilterProduct.priceMax;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
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
 * @param {*} pProducts từ server trả về
 * Output: đổ được dữ liệu vào table
 */
function fillDataTable(pProducts) {
    "use strict";
    gStt = 1;
    gProductTable.clear();
    gProductTable.rows.add(pProducts);
    gProductTable.draw();
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
 * Hàm set page hiện tại khi load request mới
 * @param {*} pCurrentPage page hiện tại
 */
function setCurrentPage(pCurrentPage) {
    "use strict";
    var vPage = {
        currentPage: 0,
        size: 6,
        totalPages: 0
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

    // set show hide button read more
    var vPage = getPage();
    if (vPage.currentPage < vPage.totalPages - 1) {
        $('#div-read-more').find('.read-more').show();
    } else {
        $('#div-read-more').find('.read-more').hide();
    }
}

/**
 * Hàm mở form modal insert hoặc update product
 * Input: chưa mở form
 * Output: Hiện form
 */
function onBtnAddProductClick() {
    "use strict";
    // update status form mode
    gFormMode = gFORM_MODE_INSERT;
    console.log(gFormMode);
    openFormProductDetail();
}

// Hàm xử lý khi click icon edit product
function onIconEditProductClick(pIconEdit) {
    "use strict";
    gFormMode = gFORM_MODE_UPDATE;
    console.log(gFormMode);
    openFormProductDetail(pIconEdit);
}

/**
 * Hàm xử lý open form product detail
 * @param {*} pIconEdit icon được click
 * output: Show data vào form product
 */
function openFormProductDetail(pIconEdit) {
    "use strict";
    // open modal product
    $('#modal-product').modal("show");
    // gán title modal
    $('#h5-modal-title-product').html(gFORM_MODE_INSERT);
    // load select
    getColors($('#select-color'));
    getCategories($('#select-category'));
    getMaterials($('#select-material'))
    if (gFormMode === gFORM_MODE_UPDATE) {
        // gán title modal
        $('#h5-modal-title-product').html(gFORM_MODE_UPDATE);
        mapDataFormProduct(pIconEdit)
    }
}

/**
 * Hàm đổ dữ liệu từ server đổ vào select
 * @param {*} pSelect select cần đổ dữ liệu
 * Output: select có dữ liệu
 */
function getMaterials(pSelect) {
    "use strict";
    // gọi API lấy data từ server
    $.ajax({
        url: gMATERIALS_URL,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            fillDataSelectMaterial(pSelect, responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm đổ dữ liệu vào select
 * @param {*} pMaterials select cần đổ dữ liệu
 * @param {*} pColors dữ liệu sẽ đổ vào select
 * Output: select chứa dữ liệu
 */
function fillDataSelectMaterial(pSelect, pMaterials) {
    "use strict";
    pSelect.empty();
    $('<option>', {
        val: gVALUE_SELECT,
        text: gTEXT_SELECT
    }).appendTo(pSelect);
    pMaterials.forEach(material => {
        $('<option>', {
            val: material.id,
            text: material.materialName
        }).appendTo(pSelect);
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
        val: gVALUE_SELECT,
        text: gTEXT_SELECT
    }).appendTo(pSelect);
    pColors.forEach(color => {
        $('<option>', {
            val: color.id,
            text: color.colorName
        }).appendTo(pSelect);
    });
}

/**
 * Hàm xử lý fill data vào form product
 * @param {*} pIconEdit icon được chọn trên 1 dòng table
 * outout: form được map dữ liệu
 */
function mapDataFormProduct(pIconEdit) {
    "use strict";
    // get data row from table
    var vDataRow = getDataOnTable(pIconEdit, gProductTable);
    // get id product
    gProductId = vDataRow.id;
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
 * @param {*} pProduct chứa dữ liệu cần map
 * Output: các trường input có dữ liệu 
 */
function fillDataToForm(pProduct) {
    "use strict";
    gProductId = pProduct.id;
    $('#inp-product-code').val(pProduct.productCode);
    $('#inp-product-name').val(pProduct.productName);
    $('#select-color').val(pProduct.idColor);
    $('#select-category').val(pProduct.idCategory);
    $('#select-material').val(pProduct.idMaterial);
    $('#inp-price').val(pProduct.price);
    $('#inp-price-discount').val(pProduct.priceDiscount);
    $('#inp-quantity-in-stock').prop('readonly', true).val(pProduct.quantityInStock);
    $('#inp-image-url').val(pProduct.imageUrl);
    $('#img-image-product').prop('src', '../' + pProduct.imageUrl);
}

/**
 * Hàm xử lý upload và hiển thị hình ảnh trên modal
 * @param {*} paramUpload 
 */
function onBtnUploadImageProductClick(paramUpload) {
    "use strict";
    // read file
    var vFile = $(paramUpload).prop('files')[0];
    // get URL
    var vFileUrl = URL.createObjectURL(vFile);
    // load img
    $('#img-image-product').prop('src', vFileUrl);
    if (gCatetoryName === 'Áo') {
        $('#inp-image-url').val('dist/img/products/shirt/' + vFile.name);
    } else if (gCatetoryName === 'Quần') {
        $('#inp-image-url').val('dist/img/products/shorts/' + vFile.name);
    } else if (gCatetoryName === 'Please select') {
        $('#inp-image-url').val('Please select category');
    }
    // console.log('File: ', vFile);
    // console.log('URL: ', vFileUrl);
}

/**
 * Hàm xử lý khi click button save Customer
 * Input: read data, validate, xử lý data
 * Ouput: insert data vào CSDL bằng API
 */
function onBtnSaveDataClick() {
    "use strict";
    // khai báo Object
    var vProduct = {
        productCode: '',
        productName: '',
        idColor: '',
        idCategory: '',
        idMaterial: '',
        price: 0,
        priceDiscount: 0,
        quantityInStock: 0,
        imageUrl: ''
    }
    // read data
    readDataProduct(vProduct);
    // validate data
    if (validateProduct(vProduct)) {
        // save product
        saveProduct(vProduct)
        // Read data
        readDataFilter(gFilterProduct);
        // reload product
        getProductsFilter(gCurrentPage, gFilterProduct);
        // hide modal product when insert success
        $('#modal-product').modal('hide');
    }
}

/**
 * Hàm thu thập dữ liệu nhập
 * @param {*} pProduct chứa dữ liệu nhập
 * @returns pProduct dữ liệu đã được nhập
 */
function readDataProduct(pProduct) {
    "use strict";
    pProduct.productCode = $.trim($('#inp-product-code').val());
    pProduct.productName = $.trim($('#inp-product-name').val());
    pProduct.idColor = $.trim($('#select-color').val());
    pProduct.idCategory = $.trim($('#select-category').val());
    pProduct.idMaterial = $.trim($('#select-material').val());
    pProduct.price = $.trim($('#inp-price').val());
    pProduct.priceDiscount = $.trim($('#inp-price-discount').val());
    pProduct.quantityInStock = $.trim($('#inp-quantity-in-stock').val());
    pProduct.imageUrl = $.trim($('#inp-image-url').val());
    // console.log(pProduct);
    return pProduct;
}

/**
 * Hàm kiểm tra dữ liệu nhập
 * @param {*} pProduct dữ liệu người dùng nhập
 * @returns true nếu hợp lệ, ngược lại return false
 */
function validateProduct(pProduct) {
    "use strict";
    var vMess = '';
    if (!pProduct.productCode) {
        vMess = 'Please input product code';
        console.assert(false, '100: ' + vMess);
        toastr.error(vMess);
        $('#inp-product-code').focus();
        return false;
    } else {
        if (gFormMode === gFORM_MODE_INSERT) {
            if (isProductCode(pProduct.productCode)) {
                vMess = 'Product code ' + pProduct.productCode + ' already exists';
                console.assert(false, '110: ' + vMess);
                toastr.error(vMess);
                $('#inp-product-code').focus();
                return false;
            }
        } else if (gFormMode === gFORM_MODE_UPDATE) {
            if (isIdAndProductCode(gProductId, pProduct.productCode)) {
                vMess = 'Product code ' + pProduct.productCode + ' already exists';
                console.assert(false, '110: ' + vMess);
                toastr.error(vMess);
                $('#inp-product-code').focus();
                return false;
            }
        }
    }

    if (!pProduct.productName) {
        vMess = 'Please input product name';
        console.assert(false, '200: ' + vMess);
        toastr.error(vMess);
        $('#inp-product-name').focus();
        return false;
    }
    if (pProduct.idColor === gVALUE_SELECT ||
        pProduct.idCategory === gVALUE_SELECT ||
        pProduct.idMaterial === gVALUE_SELECT) {
        vMess = 'Please choose all 3 color, category, material';
        console.assert(false, '300: ' + vMess);
        toastr.error(vMess);
        $('#select-color').focus();
        $('#select-category').focus();
        $('#select-material').focus();
        return false;
    }
    if (!pProduct.price) {
        vMess = 'Please input price';
        console.assert(false, '400: ' + vMess);
        toastr.error(vMess);
        $('#inp-price').focus();
        return false;
    }
    if (!pProduct.priceDiscount) {
        vMess = 'Please input price discount';
        console.assert(false, '500: ' + vMess);
        toastr.error(vMess);
        $('#inp-price-discount').focus();
        return false;
    }
    if (!pProduct.quantityInStock) {
        vMess = 'Please input quantity in stock';
        console.assert(false, '600: ' + vMess);
        toastr.error(vMess);
        $('#inp-quantity-in-stock').focus();
        return false;
    }
    if (!pProduct.imageUrl) {
        vMess = 'Please select 1 image';
        console.assert(false, '700: ' + vMess);
        toastr.error(vMess);
        $('#btn-upload-image').focus();
        return false;
    }
    return true;
}

/**
 * Hàm kiểm tra product code có tồn tại hay chưa
 * @param {*} pProductCode người dùng nhập
 * @returns true nếu tồn tại, ngược lại return false
 */
function isProductCode(pProductCode) {
    "use strict";
    var vExists = false;
    $.ajax({
        url: gPRODUCT_CODE_EXISTS_URL + pProductCode,
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
 * Hàm kiểm tra product code có tồn tại hay chưa
 * @param {*} pId người dùng nhập
 * @param {*} pProductCode người dùng nhập
 * @returns true nếu tồn tại, ngược lại return false (bỏ qua trường hợp cập nhật không xét chính nó)
 */
function isIdAndProductCode(pId, pProductCode) {
    "use strict";
    var vExists = false;
    $.ajax({
        url: gPRODUCT_CODE_EXISTS_URL + pId + '/' + pProductCode,
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
 * Hàm xử lý save product
 * @param {*} pProduct 
 */
function saveProduct(pProduct) {
    "use strict";
    if (gFormMode === gFORM_MODE_INSERT) {
        gProductDB.insert(pProduct);
    } else if (gFormMode === gFORM_MODE_UPDATE) {
        gProductDB.update(pProduct);
    }
}

/**
 * Hàm xử lý sự kiện khi click vào icon delete trên table
 * @param {*} pIconDelete icon được click
 * Output: open form delete
 */
function onIconDeleteProductClick(pIconDelete) {
    "use strict";
    gFormMode = gFORM_MODE_DELETE;
    console.log(gFormMode);
    // show modal delete
    openFormDelete(pIconDelete)
}

/**
 * Hàm open form modal delete
 * @param {*} pIconDelete icon được click
 * Output: open form được gọi
 */
function openFormDelete(pIconDelete) {
    "use strict";
    $('#modal-delete').modal('show');
    var vDataRow = getDataOnTable(pIconDelete, gProductTable);
    $('#h5-modal-title-delete').html('PRODUCT');
    $('#lbl-name-delete').html(vDataRow.productName);
    gProductId = vDataRow.id;
    gProductName = vDataRow.productName;
}

/**
 * Hàm xử lý xóa Customer khi click icon delete
 * Input: show thông báo hỏi xóa
 * Ouput: xóa thành công
 */
function onBtnDeleteClick() {
    "use strict";
    // delete customer
    gProductDB.delete(gProductId)
    // close modal delete
    $('#modal-delete').modal('hide');
    // Read data
    readDataFilter(gFilterProduct);
    // reload product
    getProductsFilter(gCurrentPage, gFilterProduct);
    // reset form
    resetFormToStart();
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
    gProductId = 0;
    $('#inp-product-code').val('');
    $('#inp-product-name').val('');
    $('#select-color').val('');
    $('#select-category').val('');
    $('#select-material').val('');
    $('#inp-price').val('');
    $('#inp-price-discount').val('');
    $('#inp-quantity-in-stock').prop('readonly', false).val('');
    $('#inp-image-url').val('');
    $('#img-image-product').prop('src', '../dist/img/no-image.jpg');
    $('#img-new').prop('src', '../dist/img/no-image.jpg');
    $('#inp-image-url-new').val('');
}

/**
 * open fomr modal upload image detail
 * @param {*} pIconUpload icon được click
 */
function onIconUploadImageClick(pIconUpload) {
    "use strict";
    $('#modal-image-product').modal('show');
    // get data row from table
    var vDataRow = getDataOnTable(pIconUpload, gProductTable);
    gCatetoryName = vDataRow.categoryName;
    gProductId = vDataRow.id;
    console.log(gCatetoryName);
    $('#lbl-product-name').html(vDataRow.productName + ' ' + vDataRow.materialName);
    $('#lbl-color').html(vDataRow.colorName);
    $('#img-main').prop('src', '../' + vDataRow.imageUrl);
}

/**
 * Hàm xử lý upload và hiển thị hình ảnh trên modal
 * @param {*} paramUpload button được chọn
 */
function onBtnUploadImageNewProductClick(paramUpload) {
    "use strict";
    // read file
    var vFile = $(paramUpload).prop('files')[0];
    // get URL
    var vFileUrl = URL.createObjectURL(vFile);
    // load img
    $('#img-new').prop('src', vFileUrl);
    if (gCatetoryName === 'Áo') {
        $('#inp-image-url-new').val('dist/img/products/shirt/' + vFile.name);
    } else if (gCatetoryName === 'Quần') {
        $('#inp-image-url-new').val('dist/img/products/shorts/' + vFile.name);
    }
    // console.log('File: ', vFile);
    // console.log('URL: ', vFileUrl);
}

// Hàm xử lý save image
function onBtnSaveImageClick() {
    "use strict";
    var vImage = {
        url: ''
    }
    vImage.url = $('#inp-image-url-new').val();
    $.ajax({
        url: gIMAGES_URL + gProductId,
        type: 'POST',
        headers: gHeaders,
        contentType: 'application/json',
        data: JSON.stringify(vImage),
        success: function (responseObject) {
            console.log(responseObject);
            toastr.success('Insert image product success');
            $('#modal-image-product').modal('hide');
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm lấy currentPage  từ localStorage
 * @returns vResult Object chứa currentPage, size
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
    // get CurrentPage
    var vPage = getPage();
    // Read data
    readDataFilter(gFilterProduct);
    // process data send request API
    getProductsFilter(vCurrentPage, gFilterProduct);
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
    // set currentPage
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
        readDataFilter(gFilterProduct);
        getProductsFilter(vPage.currentPage - 1, gFilterProduct);
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
        readDataFilter(gFilterProduct);
        getProductsFilter(vPage.currentPage + 1, gFilterProduct);
        setCurrentPage(vPage.currentPage + 1);
        gCurrentPage = vPage.currentPage + 1;
    }
}

/**
 * hàm lấy danh sách đánh giá của 1 sản phẩm
 * @param {*} pProductId id khi chọn row trên table
 */
function getRatesByProductId(pProductId, pCurrentPage) {
    "use strict"
    // gọi API lấy data từ server
    var vUrl = gRATES_URL + pProductId + '?page=' + pCurrentPage;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            buildRates(responseObject.content);
            gTotalPagesRate = responseObject.totalPages;

        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm load danh sách đánh giá của 1 sản phẩm
 * @param {*} pRates dữ liệu cần load
 */
function buildRates(pRates) {
    "use strict";
    $('#div-review').empty();
    pRates.forEach(rate => {
        const vRate = gReviewTemplate(rate);
        $('#div-review').append(vRate);
    });
}

/**
 * Hàm vẽ button readmore khi có TotalPages
 * Input: Chưa vẽ button
 * Output: Vẽ được button readmore nếu vẫn còn trang tiếp theo
 */
function buildReadMore() {
    "use strict";
    // template cần vẽ
    const vReadMore = '<button class="btn btn-danger read-more">Read more</button>';
    // thêm vào thẻ parent div 
    $('#div-read-more').empty();
    $('#div-read-more').append(vReadMore);
}

/**
 * Hàm set page hiện tại khi load request mới
 * @param {*} pCurrentPage page hiện tại
 */
function setReadMore(pCurrentPage) {
    "use strict";
    var vPage = {
        currentPage: 0,
        size: 5,
        totalPages: 0
    };
    vPage.currentPage = pCurrentPage;
    vPage.totalPages = gTotalPagesRate;
    localStorage.setItem(gPAGE_RATE_LOCAL_STORAGE, JSON.stringify(vPage));

    // set show hide button read more
    var vPage = getPageRate();
    if (vPage.currentPage < vPage.totalPages - 1) {
        $('#div-read-more').find('.read-more').show();
    } else {
        $('#div-read-more').find('.read-more').hide();
    }
}

/**
 * Hàm lấy currentPage  từ localStorage
 * @returns vResult Object chứa currentPage, size
 */
function getPageRate() {
    var vResult = localStorage.getItem(gPAGE_RATE_LOCAL_STORAGE);
    return JSON.parse(vResult);
}

/**
 * Hàm xử lý khi click button read more
 * Input: chưa load trang
 * Ouput: load trang mới
 */
function onBtnReadMoreClick() {
    "use strict";
    // show element spinner
    $('#div-spinner').show();
    var vPage = getPageRate();
    if (vPage.currentPage < vPage.totalPages - 1) {
        // set time show spinner
        setTimeout(function () {
            // load product with currentPage
            getRatesByProductId(gProductId, vPage.currentPage + 1);
            // set currentPage up localStorage
            setReadMore(vPage.currentPage + 1);
            // hide element spinner
            $('#div-spinner').hide();
        }, 1000);
    }
}

/**
 * Hàm lấy danh sách trả lời của một đánh giá
 * @param {*} pRateId 
 */
function getReplyRatesByRateId(pRateId) {
    "use strict"
    // gọi API lấy data từ server
    var vUrl = gREPLY_RATES_URL + pRateId;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            buildReplyRates(pRateId, responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

// Hàm vẽ giao diện load các đánh giá
function buildReplyRates(pRateId, pReplyRates) {
    "use strict";
    $('#collapse' + pRateId).empty();
    pReplyRates.forEach(replyRate => {
        const vReplyRate = gReplyReviewTemplate(replyRate);
        $('#collapse' + pRateId).append(vReplyRate);
    });
}

/**
 * Hàm xử lý filter product by productName, price, category
 */
function onBtnSearchProductClick() {
    "use strict";
    // Read data
    readDataFilter(gFilterProduct);
    // process data send request API
    getProductsFilter(gPAGE_FIRST, gFilterProduct);
    // vẽ paging
    buildPaging();
    // set page
    setCurrentPage(gPAGE_FIRST);
}



