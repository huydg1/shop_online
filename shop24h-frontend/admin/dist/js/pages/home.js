"use strict";
const gUSER_INFO_URL = 'http://localhost:8080/api/users/me';
const gUSERS_ROLE_URL = 'http://localhost:8080/api/users/role';

var gUserId = 0;

//Khai báo xác thực ở headers
var gHeaders = { Authorization: "Token " + getCookie("token") };

// Nơi xử lý sự kiện khi trang web đã được load giao diện
$(document).ready(function () {
    hideChucNang();
    // Lấy info user
    getInfomation(gHeaders);

    //Set sự kiện cho nút logout
    $("#btn-logout").on("click", onBtnLogoutClick);
});

/**
 * Hàm lấy thông tin user trả về nếu đăng nhập thành công
 * @param {*} pHeader báo cáo xác thực
 * Output: info user được gán vào form
 * Nếu token hết hạn redirect về trang login
 */
function getInfomation(pHeader) {
    "use strict";
    var vUrl = gUSER_INFO_URL;
    $.ajax({
        url: vUrl,
        method: "GET",
        headers: pHeader,
        success: function (responseObject) {
            // debugger;
            displayUser(responseObject);
            // console.log(responseObject);
        },
        error: function (xhr) {
            console.log(xhr);
            // Khi token hết hạn, AJAX sẽ trả về lỗi 
            // khi đó sẽ redirect về trang login để người dùng đăng nhập lại
            onBtnLogoutClick();
        }
    });
}

// Hàm logout tài khoản
function onBtnLogoutClick() {
    // Trước khi logout cần xóa token đã lưu trong cookie
    setCookie("token", "", 1);
    setNullUser();
    window.location.href = "login.html";
}

/**
 * Hiển thị thông tin người dùng
 * @param {*} pData dữ liệu server trả về
 * output: show ra form
 */
function displayUser(pData) {
    setUser(pData); // set localStorage
    // gUserId = pData.id;
    $('#lbl-user-name').html('Hello ! ' + pData.fullName);
}

function setUser(pUser) {
    "use strict";
    var vUser = {
        id: 0,
        fullName: ''
    }
    vUser.id = pUser.id;
    vUser.fullName = pUser.fullName
    localStorage.setItem('USER_NAME', JSON.stringify(vUser));
    // var test = localStorage.getItem('USER_NAME');
    // console.log(JSON.parse(test));
}

function setNullUser() {
    "use strict";
    var vUser = {
        id: 0,
        fullName: ''
    }
    localStorage.setItem('USER_NAME', JSON.stringify(vUser));
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

// Hàm get role by token khi đăng nhập thành công
function getRoleByToken() {
    "use strict";
    var vRole = '';
    $.ajax({
        url: gUSERS_ROLE_URL,
        type: "GET",
        headers: gHeaders,
        contentType: 'application/json',
        async: false,
        success: function (responseObject) {
            // console.log(responseObject);
            vRole = responseObject;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
    return vRole;
}

// Ẩn chức năng nếu không phải là admin
function hideChucNang() {
    "use strict";
    var vRole = getRoleByToken();
    if (vRole === 'ROLE_STAFF') {
        $('#li-user').hide();
    } else {
        $('#li-user').show();
    }
}