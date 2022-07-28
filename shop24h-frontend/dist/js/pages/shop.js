"use strict";
// Link API
const gPRODUCTS_URL = 'http://localhost:8080/api/products/filter';
const gCATEGORYS_URL = 'http://localhost:8080/api/categories/';

// Template products
const gProductTemplate = (product) => {
    return `
    <div class="col-xs-12 col-sm-6 col-lg-4">
    <div class="item-box-blog-image">
        <!--Image-->
        <figure> <img class="btn-product-detail" data-product-id="${product.id}" src="../${product.imageUrl}" >
        </figure>
    </div>
    <div class="item-box-blog-body text-center">
        <!--Heading-->
        <div class="item-box-blog-heading">
            <h5 class="text-primary">${product.productName}</h5>
            <label class="font-weight-bold">${product.materialName}</label>
        </div>
        <!--Data-->
        <div class="item-box-blog-data" style="padding: px 15px;">
            <label id="p-discountPrice" class="font-weight-bold">${product.priceDiscount.toLocaleString()}đ</label>
            <small id="sml-price" class="text-decoration-line-through text-secondary">${product.price.toLocaleString()}đ</small>
        </div>
    </div>
</div>
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

// create template paging
const gPagingTemplate = (page) => {
    return `
    <li class="page-item">
    <input class="page-link current-page" value ="${page + 1}" type="button"></li>`
}

// Biến toàn cục
const gPAGE_FIRST = 0;
const gPAGE_LOCAL_STORAGE = 'PAGE';
var gTotalPages = 0;

// Đối tượng lưu các thuộc tính để filter data
var gFilterProduct = {
    productName: '',
    priceMin: '',
    priceMax: '',
    categoryId: ''
}

// các event khi load page
$(document).ready(function () {

    // Initialize Select2 Elements
    $('.select2bs4').select2({
        theme: 'bootstrap4'
    })

    onPageLoading();

    // event click image product link to page detail
    $('#product-list').on('click', '.btn-product-detail', function () {
        openPageProductDetail(this);
    })

    // event click current page
    $('#ul-paging').on('click', '.current-page', function () {
        onCurrentPageClick(this);
    })

    // event click previous page
    $('#ul-paging').on('click', '.previous-page', function () {
        onPreviousPageClick(this);
    })

    // event click next page
    $('#ul-paging').on('click', '.next-page', function () {
        onNextPageClick(this);
    })

    // event click filter
    $('#btn-filter-product').on('click', onBtnFilterProductClick);
});

/**
 * Hàm chạy khi trang web được load
 * Input: chưa có data
 * Output: có data 
 */
function onPageLoading() {
    "use strict";
    // load username khi đã đăng nhập
    var vUser = getUser();
    if (vUser.fullName !== '') {
        $('#a-user-name').html('Xin chào! ' + vUser.fullName);
    }

    // load select category
    getCategories($('#select-category'));
    // Read data filter
    readDataFilter(gFilterProduct);
    // load product
    getProducts(gPAGE_FIRST, gFilterProduct);
    // vẽ paging
    buildPaging();
    // set page
    setCurrentPage(gPAGE_FIRST);
}

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
 * Hàm get list category từ API
 * @param {*} pSelect 
 */
function getCategories(pSelect) {
    "use strict";
    // gọi API lấy data từ server
    $.ajax({
        url: gCATEGORYS_URL,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            fillDataCategory(pSelect, responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm đổ dữ liệu vào select
 * @param {*} pSelect select cần đổ dữ liệu
 * @param {*} pCategories dữ liệu sẽ đổ vào select
 * Output: select chứa dữ liệu
 */
function fillDataCategory(pSelect, pCategories) {
    "use strict";
    pSelect.empty();
    $('<option>', {
        val: 0,
        text: 'Chọn loại sản phẩm'
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
    pFilterProduct.productName = $('#inp-product-name').val().trim();
    pFilterProduct.priceMin = $('#inp-price-min').val().trim();
    pFilterProduct.priceMax = $('#inp-price-max').val().trim();
    pFilterProduct.categoryId = $('#select-category').val().trim();
    return pFilterProduct;
}

/**
 * Hàm xử lý đổ dữ liệu product lên template
 * @param {*} pCurrentPage 
 * @param {*} pFilterProduct
 */
function getProducts(pCurrentPage, pFilterProduct) {
    "use strict";
    var vUrl = gPRODUCTS_URL + '?page=' + pCurrentPage +
        '&productName=' + pFilterProduct.productName + '&category=' + pFilterProduct.categoryId +
        '&priceMin=' + pFilterProduct.priceMin + '&priceMax=' + pFilterProduct.priceMax;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (res) {
            buildProducs(res.content);
            gTotalPages = res.totalPages;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm vẽ load list product và vẽ theo template
 *  khi có dữ liệu truyền vào
 * @param {*} pProducts dữ liệu server trả về
 * Output: show giao diện có dữ liệu
 */
function buildProducs(pProducts) {
    "use strict";
    $('#product-list').empty();
    pProducts.forEach(product => {
        const vProduct = gProductTemplate(product);
        $('#product-list').append(vProduct);
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
    // Read data filter
    readDataFilter(gFilterProduct);
    // load product từ data filter
    getProducts(vCurrentPage, gFilterProduct);

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
        // Read data filter
        readDataFilter(gFilterProduct);
        // load product
        getProducts(vPage.currentPage - 1, gFilterProduct);
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
        // Read data
        readDataFilter(gFilterProduct);
        // load product
        getProducts(vPage.currentPage + 1, gFilterProduct);
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
 * hàm xử lý khi click filter
 * Input: dữ liệu chưa lọc
 * Output: dữ liệu đã lọc
 */
function onBtnFilterProductClick() {
    "use strict";
    // Read data filter
    readDataFilter(gFilterProduct);
    // load product theo data filter
    getProducts(gPAGE_FIRST, gFilterProduct);
    // vẽ paging
    buildPaging();
    // set current page
    setCurrentPage(gPAGE_FIRST);
}

/**
 * Hàm xử lý link đến trang chi tiết 'product.html' khi nhấn 1 image product
 * @param {*} pThis là đối tượng được click
 * Output: open page 'product.html' và truyền pProductId dưới dạng query
 */
function openPageProductDetail(pThis) {
    "use strict";
    // get data từ dataset
    var vProductId = $(pThis).data('product-id');
    const vProductFormUrl = '../pages/product.html';
    var vUrlSiteToOpen = vProductFormUrl + '?id=' + vProductId;
    window.location.href = vUrlSiteToOpen;
}