"use strict";
const gUSERS_URL = 'http://localhost:8080/api/users/';
const gUSERS_ROLE_URL = 'http://localhost:8080/api/users/role';

const gCLOSE_FORM = 'CLOSE_FORM';
const gOPEN_FORM = 'OPEN_FORM';

// Trạng thái form change password
var gFormMode = gCLOSE_FORM;
var gUserId = 0;

//Khai báo xác thực ở headers
var gHeaders = { Authorization: "Token " + getCookie("token") };

// Nơi xử lý sự kiện khi trang web đã được load giao diện
$(document).ready(function () {
    // ẩn chức năng
    hideChucNang();
    
    // Lấy info user
    getInfomation(gHeaders);

    //Set sự kiện cho nút logout
    $("#btn-logout").on("click", onBtnLogoutClick);

    // use input mask
    $('[data-mask]').inputmask();

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

    // event click show or hide form change password
    $('#lbl-change-password').on('click', onLblChangePasswordClick);

    // defaul close form change password
    hideFormChangePassword();

    // event click update user
    $('#btn-update-user').on('click', onBtnUpdateUserClick);


});

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

/**
 * Hàm lấy thông tin user trả về nếu đăng nhập thành công
 * @param {*} pHeader báo cáo xác thực
 * Output: info user được gán vào form
 * Nếu token hết hạn redirect về trang login
 */
function getInfomation(pHeader) {
    "use strict";
    var vUrl = gUSERS_URL + 'me';
    $.ajax({
        url: vUrl,
        method: "GET",
        headers: pHeader,
        success: function (responseObject) {
            displayUser(responseObject);
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
    window.location.href = "login.html";
}

/**
 * Hiển thị thông tin người dùng
 * @param {*} pData dữ liệu server trả về
 * output: show ra form
 */
function displayUser(pData) {
    gUserId = pData.id;
    $('#lbl-user-name').html('Hello ! ' + pData.fullName);
    $('#a-user-name').html(pData.fullName);
    $('#inp-full-name').val(pData.fullName);
    $('#inp-phone').val(pData.phone);
    $('#inp-email').val(pData.email);
    $('#inp-address').val(pData.address);
    $('#radio-' + pData.gender).prop('checked', true);
    $('#inp-birthday').val(pData.birthday);
    $('#inp-slider-height').val(pData.height);
    $('#lbl-height').html(pData.height);
    $('#inp-slider-weight').val(pData.weight);
    $('#lbl-weight').html(pData.weight);
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

/**
 * Hàm xử lý khi click label change password
 * Input: form change password hide or show
 * Output: if form hide thì show, ngược lại
 */
function onLblChangePasswordClick() {
    "use strict";
    if (gFormMode === gCLOSE_FORM) {
        showFormChangePassword();
    } else {
        hideFormChangePassword();
    }
}

/**
 * Hàm xử lý hide form change password
 * Input: form show
 * Output: form hide
 */
function hideFormChangePassword() {
    "use strict";
    gFormMode = gCLOSE_FORM;
    console.log(gFormMode);
    $('#div-change-password').hide();
}

/**
 * Hàm xử lý show form change password
 * Input: form hide
 * Output: form show
 */
function showFormChangePassword() {
    "use strict";
    gFormMode = gOPEN_FORM;
    console.log(gFormMode);
    $('#div-change-password').show();
}

// Hàm xử lý update user
function onBtnUpdateUserClick() {
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
        weight: '',
        password: '',
        passwordNew: '',
        rePasswordNew: ''
    }
    // read data
    readDataUser(vUser);
    // validate data
    if (validateUser(vUser)) {
        // save User
        updateUser(vUser);
        if (gFormMode === gOPEN_FORM) {
            readPassword(vUser);
            if (validatePassword(vUser)) {
                updatePassword(vUser);
            }
        } else {
            // thông báo
            toastr.success('Cập nhật tài khoản thành công !');
        }
    }
}

/**
 * Hàm thu thập dữ liệu nhập
 * @param {*} pUser chứa dữ liệu nhập
 * @returns pUser dữ liệu đã được nhập
 */
function readDataUser(pUser) {
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
function validateUser(pUser) {
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
    } else if (isExistsIdAndPhone(gUserId, pUser.phone)) {
        vMess = 'Phone ' + pUser.phone + ' already exists';
        console.assert(false, '210: ' + vMess);
        toastr.error(vMess);
        $('#inp-phone').focus();
        return false;
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
    } else if (isExistsIdAndEmail(gUserId, pUser.email)) {
        vMess = 'Email ' + pUser.email + ' already exists';
        console.assert(false, '320: ' + vMess);
        toastr.error(vMess);
        $('#inp-email').focus();
        return false;
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
 * Hàm kiểm tra phone đã tồn tại hay không khi update
 * @param {*} pUserId id khi update 
 * @param {*} pPhone người dùng nhập
 * @returns true nếu tồn tại, ngược lại return false (bỏ qua chính nó)
 */
function isExistsIdAndPhone(pUserId, pPhone) {
    "use strict";
    var vExists = false;
    var vUrl = gUSERS_URL + 'exists/id-phone/' + pUserId + '/' + pPhone;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            // console.log(responseObject);
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
 * Hàm kiểm tra email có tồn tại hay không khi update
 * @param {*} pUserId id khi update
 * @param {*} pEmail  người dùng nhập
 * @returns true nếu tồn tại, ngược lại return false (bỏ qua chính nó)
 */
function isExistsIdAndEmail(pUserId, pEmail) {
    "use strict";
    var vExists = false;
    $.ajax({
        url: gUSERS_URL + 'exists/id-email/' + pUserId + '/' + pEmail,
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
 * Hàm xử lý update User
 * @param {*} pUser dữ liệu update
* Output: thông báo update thành công
 */
function updateUser(pUser) {
    $.ajax({
        url: gUSERS_URL + gUserId,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(pUser),
        success: function (responseObject) {

        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm thu thập dữ liệu nhập
 * @param {*} pUser chứa dữ liệu nhập
 * @returns pUser dữ liệu đã được nhập
 */
function readPassword(pUser) {
    "use strict";
    pUser.password = $('#pwd-password-old').val().trim();
    pUser.passwordNew = $('#pwd-password-new').val().trim();
    pUser.rePasswordNew = $('#pwd-re-password-new').val().trim();
    // console.log(pUser);
    return pUser;
}

/**
 * Hàm kiểm tra dữ liệu nhập
 * @param {*} pUser dữ liệu người dùng nhập
 * @returns true nếu hợp lệ, ngược lại return false
 */
function validatePassword(pUser) {
    "use strict";
    var vMess = '';
    if (!pUser.password) {
        vMess = 'Bạn chưa nhập mật khẩu cũ';
        console.assert(false, '100: ' + vMess);
        toastr.error(vMess);
        $('#pwd-password-old').focus();
        return false;
    }
    if (!pUser.passwordNew) {
        vMess = 'Bạn chưa nhập mật khẩu mới';
        console.assert(false, '200: ' + vMess);
        toastr.error(vMess);
        $('#pwd-password-new').focus();
        return false;
    }
    if (!pUser.rePasswordNew) {
        vMess = 'Bạn chưa nhập lại mật khẩu mới';
        console.assert(false, '300: ' + vMess);
        toastr.error(vMess);
        $('#pwd-re-password-new').focus();
        return false;
    } else if (pUser.passwordNew !== pUser.rePasswordNew) {
        vMess = 'Mật khẩu mới nhập lại không khớp';
        console.assert(false, '310: ' + vMess);
        toastr.error(vMess);
        $('#pwd-re-password-new').focus();
        return false;
    }
    return true;
}

/**
 * Hàm xử lý update User
 * @param {*} pUser dữ liệu update
* Output: thông báo update thành công
 */
function updatePassword(pUser) {
    $.ajax({
        url: gUSERS_URL + 'change-password/' + gUserId,
        type: 'PUT',
        headers: gHeaders,
        contentType: 'application/json',
        data: JSON.stringify(pUser),
        success: function (responseObject) {
            hideFormChangePassword();
            toastr.success('Cập nhật tài khoản thành công !');
        },
        error: function (error) {
            toastr.error(error.responseText);
        }
    });
}

