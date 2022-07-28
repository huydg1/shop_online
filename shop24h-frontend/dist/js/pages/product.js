"use strict";
// Link API
const gPRODUCTS_URL = 'http://localhost:8080/api/products/';
const gRATES_URL = 'http://localhost:8080/api/rates/product/';
const gREPLY_RATES_URL = 'http://localhost:8080/api/reply-rates?rateId=';

// Create template image product
const gImageFristLargeTemplate = (product) => {
    return `
    <div class="active carousel-item" data-slide-number="${product.id}">
        <img src="../${product.url}" class="img-fluids">
    </div>
    `
};

const gImageLargeTemplate = (product) => {
    return `
    <div class="carousel-item" data-slide-number="${product.id}">
        <img src="../${product.url}" class="img-fluids">
    </div>
    `
};

const gImageFirstSmallTemplate = (product) => {
    return `
    <li class=" active list-inline-item">
        <a id="carousel-selector-${product.id}" class="selected" data-slide-to="${product.id}" data-target="#myCarousel">
            <img src="../${product.url}" class="img-thumbnails">
        </a>
    </li>
    `
};

const gImageSmallTemplate = (product) => {
    return `
    <li class="list-inline-item">
        <a id="carousel-selector-${product.id}" data-slide-to="${product.id}" data-target="#myCarousel">
            <img src="../${product.url}" class="img-thumbnails">
        </a>
    </li>
    `
};

// template review
const gReviewTemplate = (rate) => {
    return `
    <div id="heading${rate.id}" class="card row form-group bg-light rounded cursor-pointer view-reply"
            data-rate-id = "${rate.id}" 
            data-toggle="collapse" 
            data-target="#collapse${rate.id}" 
            aria-expanded="false"
            aria-controls="collapse${rate.id}">
        <div class="col-sm-12 p-3">
            <div class="row">
                <div class="col-sm-1 text-right text-secondary p-2">
                    <i class="fas fa-user-circle fa-2x"></i>
                </div>
                <div class="col-sm-11">
                    <span id="sp-fullname">${rate.fullName}</span> &nbsp;-&nbsp;
                    <span id="sp-date-comment">${rate.commentDate}</span>
                    <p id="p-rate">${rate.rate}&nbsp;<i class="fas fa-star text-warning"></i></p>
                </div>
               
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <span id="sp-comment">${rate.comment}</span>
                </div>
            </div>
        </div>
    </div>

    <div id="collapse${rate.id}" class="collapse" aria-labelledby="heading${rate.id}"
        data-parent="#div-review">
    </div>`
}

// template reply review
const gReplyReviewTemplate = (replyRate) => {
    return `
    <div class="row form-group">
        <div class="col-sm-1"></div>
        <div class=" card col-sm-11 p-3 bg-light rounded">
            <div class="row">
                <div class="col-sm-1 text-right text-secondary p-2">
                    <i class="fas fa-user-circle fa-2x"></i>
                </div>
                <div class="col-sm-11">
                    <span id="sp-fullname">${replyRate.fullName}</span>
                    <p id="sp-date-comment">${replyRate.reCommentDate}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <span id="sp-comment">${replyRate.reCommnent}</span>
                </div>
            </div>
        </div>
    </div>`
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

// Biến hằng
const gZERO = 0;
// const gCART = 'CART';
const gPAGE_FIRST = 0;
const gPAGE_LOCAL_STORAGE = 'PAGE';

// Biến toàn cục
var gProductId = 0;
var gProductObject = {};
var gTotalPages = 0;
var gTotalElements = 0;

$(document).ready(function () {

    // load username khi đã đăng nhập
    var vUser = getUser();
    if (vUser.fullName !== '') {
        $('#a-user-name').html('Xin chào! ' + vUser.fullName);
    }

    // get query string
    queryString();

    // get data product detail
    getProductDetail(gProductId);

    // get avg rate 
    getAvgRatesByProductId(gProductId);

    // get rates of product
    getRatesByProductId(gPAGE_FIRST, gProductId);

    // Show tổng số đánh giá
    showCountRate();

    // show paging đánh giá
    buildPaging();

    // set currentpage lên localStorage
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

    // xem reply rate
    $('#div-review').on('click', '.view-reply', function () {
        getReplyRatesByRateId(this);
    });

    // event click button add cart
    $('#btn-add-cart').on('click', onBtnAddCartClick);

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
  * Hàm lấy dữ liệu từ query string
  * Input: chưa có dữ liệu
  * Output: lấy được dữ liệu từ query string lưu vào biến global
  */
function queryString() {
    "use strict";
    var vUrlString = window.location.href;
    var vUrl = new URL(vUrlString);
    gProductId = vUrl.searchParams.get('id');
}

/**
 * Hàm lấy dữ liệu chi tiết product
 * @param {*} pProductId id truyền vào lấy từ query string
 * Output: lấy được info product từ server trả về
 */
function getProductDetail(pProductId) {
    "use strict";
    // gọi API lấy data từ server
    $.ajax({
        url: gPRODUCTS_URL + pProductId,
        type: "GET",
        dataType: 'json',
        success: function (responseObject) {
            gProductObject = responseObject;
            buildProducDetail(gProductObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm map data vào giao diện
 * @param {*} pProduct dữ liệu cần map
 * Output: giao diện được load dữ liệu
 */
function buildProducDetail(pProduct) {
    "use strict";
    $('#lbl-product-name').html(pProduct.productName);
    $('#lbl-material-name').html(pProduct.materialName);
    $('#lbl-discountPrice').html(pProduct.priceDiscount.toLocaleString() + 'đ');
    $('#lbl-price').html(pProduct.price.toLocaleString() + 'đ');
    $('#lbl-color').html(pProduct.colorName);
    $('#p-description').html(pProduct.description);
    buildImageLarge(pProduct.images);
    buildImageSmall(pProduct.images);
}

/**
 * Hàm xây dựng template khi có dữ liệu truyền vào
 * @param {*} pProduct dữ liệu lấy từ server
 * Output: show giao diện có dữ liệu
 */
function buildImageLarge(pProduct) {
    "use strict";
    const vProduct = gImageFristLargeTemplate(pProduct[0]);
    $('#image-large').append(vProduct);
    for (let bIndex = 1; bIndex < pProduct.length; bIndex++) {
        const vElement = pProduct[bIndex];
        const vProduct = gImageLargeTemplate(vElement);
        $('#image-large').append(vProduct);
    }
}

/**
 * Hàm xây dựng template khi có dữ liệu truyền vào
 * @param {*} pProduct dữ liệu lấy từ server
 * Output: show giao diện có dữ liệu
 */
function buildImageSmall(pProduct) {
    "use strict";
    const vProduct = gImageFirstSmallTemplate(pProduct[0]);
    $('#image-small').append(vProduct);
    for (let bIndex = 1; bIndex < pProduct.length; bIndex++) {
        const vElement = pProduct[bIndex];
        const vProduct = gImageSmallTemplate(vElement);
        $('#image-small').append(vProduct);
    }
}

/**
 * Hàm tính điểm trung bình các đánh giá của một sản phẩm
 * @param {*} pProductId sản phẩm được đanh giá
 */
function getAvgRatesByProductId(pProductId) {
    "use strict"
    // gọi API lấy data từ server
    var vUrl = gRATES_URL + 'avg/' + pProductId;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        success: function (responseObject) {
            // show điểm đánh giá
            $('#lbl-avg-rate').html(responseObject + '/' + 5);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm lấy danh sách đánh giá của 1 sản phẩm
 * @param {*} pCurrentPage số trang hiện tại
 * @param {*} pProductId sản phẩm được chọn
 * output: show đánh giá nếu có
 */
function getRatesByProductId(pCurrentPage, pProductId) {
    "use strict"
    // gọi API lấy data từ server
    var vUrl = gRATES_URL + pProductId + '?page=' + pCurrentPage;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (res) {
            // console.log(res);
            // Tổng số trang hiển thị đánh giá
            gTotalPages = res.totalPages;
            // Tổng số dòng các đánh giá
            gTotalElements = res.totalElements;
            // load giao diện các đánh giá
            buildRates(res.content);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm vẽ giao diện các đánh giá
 * @param {*} pRates data cần đổ vào giao diện
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
 * Hàm lấy danh sách trả lời đánh giá của một sản phẩm
 * @param {*} pThis đối tượng cần truy vấn
 */
function getReplyRatesByRateId(pThis) {
    "use strict"
    var vRateId = $(pThis).data('rate-id');
    // gọi API lấy data từ server
    var vUrl = gREPLY_RATES_URL + vRateId;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            buildReplyRates(vRateId, responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm vẽ giao diện các trả lờiđánh giá
 * @param {*} pRateId id được truy vấn
 * @param {*} pReplyRates danh sách nội dung trả lời
 */
function buildReplyRates(pRateId, pReplyRates) {
    "use strict";
    $('#collapse' + pRateId).empty();
    pReplyRates.forEach(replyRate => {
        const vReplyRate = gReplyReviewTemplate(replyRate);
        $('#collapse' + pRateId).append(vReplyRate);
    });
}

// Hàm show tổng số lượng các đánh giá của sản phẩm hiện tại
function showCountRate() {
    "use strict";
    if (gTotalElements === gZERO) {
        $('#a-count-rate')
            .html('(Chưa có đánh giá)')
            .prop('disabled', true);
    } else {
        $('#a-count-rate')
            .html('(Xem ' + gTotalElements + ' đánh giá)')
            .prop('disabled', false);
    }
}

/**
 * Hàm vẽ paging khi có TotalPages
 * Input: chưa phân trang
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
        size: 10,
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
 * Hàm lấy currentPage và totalPages từ localStorage
 * @returns vResult Object chứa currentPage, size và totalPages
 */
function getPage() {
    // get Object from localStorage
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
    // get currentPage đang chọn
    var vCurrentPage = $(pThis).val() - 1;
    // get currentPage từ localStorage
    var vPage = getPage();
    // Load rate
    getRatesByProductId(vCurrentPage, gProductId);
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

    // set currentPage lên localStorage 
    setCurrentPage(vCurrentPage);
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
        // Load rate
        getRatesByProductId(vPage.currentPage - 1, gProductId);
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
    // console.log('vCurrentPage: ', vPage.currentPage);
    if (vPage.currentPage < vPage.totalPages - 1) {
        // Load rate
        getRatesByProductId(vPage.currentPage + 1, gProductId);
        // set currentPage lên localStorage 
        setCurrentPage(vPage.currentPage + 1);
    }
}

/**
 * Hàm thêm sản phẩm vào giỏ hàng
 * Input: giỏ hàng chưa có sản phẩm
 * Output: giỏ hàng có sản phẩm
 */
function onBtnAddCartClick() {
    "use strict";
    // Khai báo biến
    var vProduct = {
        productId: 0,
        quantityOrder: 0,
        priceEach: 0
    };
    // Read data
    readProduct(vProduct);
    // Process
    addCart(vProduct);
    // Show notification
    buildNotification();
    // Thông báo
    toastr.success('Sản phẩm đã thêm vào giỏ hàng');
}

/**
 * hàm thu thập dữ liệu 1 sản phẩm
 * @param {*} pProduct object để chứa data
 * @returns pProduct đã có data
 */
function readProduct(pProduct) {
    "use strict";
    pProduct.productId = parseInt(gProductId, 10);
    pProduct.quantityOrder = parseInt($('#inp-quantity-order').val(), 10);
    if (gProductObject.priceDiscount === gZERO) {
        pProduct.priceEach = gProductObject.price;

    } else {
        pProduct.priceEach = gProductObject.priceDiscount;
    }
    // console.log('read product: ', pProduct);
    return pProduct;
}

/**
 * Hàm thêm mới giỏ hàng
 * @param {*} pProduct sản phẩm người dùng chọn
 * output: add sản phẩm được vào giỏ hàng và lưu tại localStorage
 */
function addCart(pProduct) {
    "use strict";
    // Khai báo card
    var vCart = {
        items: []
    };
    // get cart
    var vGetCart = getCart();
    if (vGetCart === null) {
        // add cart
        vCart.items.push(pProduct);
        // console.log('Cart add: ', vCart);
    } else {
        // update cart
        vCart.items = updateCart(vGetCart, pProduct);
        // console.log('Cart update: ', vCart);
    }
    // set cart
    localStorage.setItem(gCART, JSON.stringify(vCart));
}

/**
 * Hàm lấy giá trị được lưu trong giỏ hàng từ localStorage
 * @returns lấy được object chứa list product
 */
function getCart() {
    var vResult = localStorage.getItem(gCART);
    // console.log('Cart: ', JSON.parse(vResult));
    return JSON.parse(vResult);
}

/**
 * Hàm cập nhật cart
 * @param {*} pCart giỏ hàng lấy từ localStorage
 * @param {*} pProduct sản phẩm người dùng chọn
 * @returns giỏ hàng đã thêm sản phẩm
 */
function updateCart(pCart, pProduct) {
    "use strict";
    var vProducts = pCart.items;
    var vCheck = false;
    var bIndex = 0;
    while (!vCheck && bIndex < vProducts.length) {
        if (vProducts[bIndex].productId === pProduct.productId) {
            vCheck = true;
        } else {
            bIndex++;
        }
    }
    if (vCheck) {
        vProducts[bIndex].quantityOrder += pProduct.quantityOrder;
    } else {
        vProducts.push(pProduct);
    }
    return vProducts;
}