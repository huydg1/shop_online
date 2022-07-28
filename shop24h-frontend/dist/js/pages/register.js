"use strict";
// API
const gUSERS_URL = 'http://localhost:8080/api/users/';
const gREGISTER_URL = 'http://localhost:8080/api/register/';

$(document).ready(function () {
    
    // Click button link đến page login.html
    $('#btn-login').on('click', function () {
        window.location.href = 'login.html';
    });

    // Click button resgiter
    $('#btn-register').on('click', onBtnRegisterClick);
});

// Hàm xử lý sự kiện khi click button đăng ký
function onBtnRegisterClick() {
    "use strict";
    // khai bao Object
    var vUser = {
        username: '',
        fullName: '',
        phone: '',
        email: '',
        address: '',
        password: '',
        rePassword: ''
    }
    // read data
    readUser(vUser);
    // validate
    if (validate(vUser)) {
        // tạo user
        registerUser(vUser);
        // thông báo
        toastr.success('Bạn đã đăng ký thành công !');
        // chuyển đến page đăng nhập
        window.location.href = 'login.html';
    }
}

/**
 * Hàm thu thập dữ liệu user
 * @param {*} pUser chứa dữ liệu cần thu thập
 * @returns đã chứa dữ liệu user
 */
function readUser(pUser) {
    "use strict";
    pUser.username = $('#inp-phone').val().trim();
    pUser.fullName = $('#inp-full-name').val().trim();
    pUser.phone = $('#inp-phone').val().trim();
    pUser.email = $('#inp-email').val().trim();
    pUser.address = $('#inp-address').val().trim();
    pUser.password = $('#pwd-password').val().trim();
    pUser.rePassword = $('#pwd-re-password').val().trim();
    return pUser;
}

/**
 * Hàm kiểm tra dữ liệu nhập
 * @param {*} pUser dữ liệu cần kiểm tra
 * @returns true nếu hợp lệ, ngược lại return false
 */
function validate(pUser) {
    "use strict";
    var vMess = '';
    if (!pUser.fullName) {
        vMess = 'Bạn chưa nhập họ tên !';
        console.assert(false, '100: ', vMess);
        toastr.error(vMess);
        $('#inp-full-name').focus();
        return false;
    }
    if (!pUser.phone) {
        vMess = 'Bạn chưa nhập số điện thoại!';
        console.assert(false, '200: ', vMess);
        toastr.error(vMess);
        $('#inp-phone').focus();
        return false;
    } else if (isExistsPhone(pUser.phone)) {
        vMess = 'Số điện thoại ' + pUser.phone + ' đã tồn tại !';
        console.assert(false, '210: ', vMess);
        toastr.error(vMess);
        $('#inp-phone').focus();
        return false;
    }
    if (!pUser.email) {
        vMess = 'Bạn chưa nhập email !';
        console.assert(false, '300: ', vMess);
        toastr.error(vMess);
        $('#inp-email').focus();
        return false;
    } else if (!validateEmail(pUser.email)) {
        vMess = 'Email không đúng định dạng !';
        console.assert(false, '310: ', vMess);
        toastr.error(vMess);
        $('#inp-email').focus();
        return false;
    } else if (isExistsEmail(pUser.email)) {
        vMess = 'Email ' + pUser.email + ' đã tồn tại !';
        console.assert(false, '320: ', vMess);
        toastr.error(vMess);
        $('#inp-email').focus();
        return false;
    }
    if (!pUser.address) {
        vMess = 'Bạn chưa nhập địa chỉ !';
        console.assert(false, '400: ', vMess);
        toastr.error(vMess);
        $('#inp-address').focus();
        return false;
    }
    if (!pUser.password) {
        vMess = 'Bạn chưa nhập mật khẩu !';
        console.assert(false, '500: ', vMess);
        toastr.error(vMess);
        $('#pwd-password').focus();
        return false;
    }
    if (!pUser.rePassword) {
        vMess = 'Bạn chưa nhập lại mật khẩu !';
        console.assert(false, '600: ', vMess);
        toastr.error(vMess);
        $('#pwd-re-password').focus();
        return false;
    } else if (pUser.password !== pUser.rePassword) {
        vMess = 'Mật khẩu nhập lại không khớp !';
        console.assert(false, '610: ', vMess);
        toastr.error(vMess);
        $('#pwd-re-password').focus();
        return false;
    }
    return true;
}

/**
 * Hàm kiểm tra email có đúng định chưa
 * @param {*} pEmail người dùng nhập
 * @returns 
 */
function validateEmail(pEmail) {
    const vRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return vRegex.test(String(pEmail).toLowerCase());
}

/**
 * Hàm kiểm tra phone có tồn tại hay không
 * @param {*} pPhone người dùng nhập
 * @returns true nếu tồn tại, ngược lại return false
 */
function isExistsPhone(pPhone) {
    "use strict";
    var vExists = false;
    $.ajax({
        url: gUSERS_URL + 'phone/' + pPhone,
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
 * Hàm kiểm tra email có tồn tại hay không
 * @param {*} pEmail người dùng nhập
 * @returns true nếu tồn tại, ngược lại return false
 */
function isExistsEmail(pEmail) {
    "use strict";
    var vExists = false;
    $.ajax({
        url: gUSERS_URL + 'email/' + pEmail,
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
 * Hàm tạo một user mới
 * @param {*} pUser là Object chứa info user
 * @returns pUser vừa tạo do server trả về
 */
function registerUser(pUser) {
    "use strict";
    $.ajax({
        url: gREGISTER_URL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(pUser),
        async: false,
        success: function (responseObject) {
            console.log(responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}




