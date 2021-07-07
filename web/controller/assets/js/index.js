// stepeer

var steps = document.getElementsByClassName('step');
var has = false;
var iframeis = false;
steps[0].style.display = 'block';

var socketId = null;

$(document).ready(function () {
    if (window.location.search.substr(1).split("=")[1]) {
        $('#suc').addClass('show');
    }

    if (getCookie('id') != "") {
        $('#recoder_data_title').text("Alredy JOB Runing  ID is (If you have some issue pese stop it) -" + getCookie('id'));
        $('#recoder_data_title').append(`</br><small>Your ID is <b> ${getCookie('id')} </b> Remember IT</small>`);
        $('#state').attr("src", "/assets/images/recoder.gif");
        $('#state').attr("width", "40px");
        $('#recoder_data').modal('toggle');
    }
});


$('#recoder_data').on('show.bs.modal', function (e) {
    var id = getCookie('id');
    console.log("EVENT FIRE >>", id);
    $('#stop').val(id);
})

document.getElementById('pin').addEventListener('change', (e) => {
    e.preventDefault()
    if (e.target.value == "Lanka@5008") {
        has = true;
        document.getElementById('verify').classList.remove("has-validation");
        document.getElementById('verify').classList.add("was-validated");
    } else if (e.target.value == "@5008") {
        has = true;
    } else {
        has = false;
        document.getElementById('verify').classList.remove("was-validated");
        document.getElementById('verify').classList.add("has-validation");
    }
})


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}


function step(e, event) {
    console.log(e);

    if (e == 1) {

        if (validate() && checkIFrame()) {
            steps[0].style.display = 'none';
            steps[1].style.display = 'block';

        }
    } else if (e == 2) {
        if (has) {
            start();
        } else {
            window.alert("Enter Valid license code")
        }
    } else if (e == 0) {
        steps[1].style.display = 'none';
        steps[0].style.display = 'block';
    }
}

window.onmessage = function (event, data) {
    if (event.data == 'error') {
        iframeis = false;
        $("#iframe_res").text("Check Your Meeting Details" + `<small>${data}</small>`);
        $('#iframe_img').attr("src", "/assets/images/data.gif");
        $('#iframe_img').attr("width", "90px");
        window.alert('check Your Meeting Details')
        console.log('Reply received!', event);
    } else if (event.data == 'ok') {
        iframeis = true;
        console.log("************ SATA OK", event)
        window.alert("DATA OK");
        $('#collapse').toggle();
        $("#cframe").attr("src", '');
    }
};


function checkIFrame() {
    if (iframeis != true) {
        var iframe = document.getElementById('cframe');
        $('.collapse').collapse()
        $("#cframe").attr("src", `/client?name=$lab24TestApiNODEJS&id=${meetingId.value}&passcode=${passcode.value}&email=${email
            .value}`);
        iframe.onload = function () {
            console.log("The iframe is loaded");
            $("#iframe_res").text("    Waitng For Meeting Config");
            $('#iframe_img').attr("src", "/assets/images/loder.gif");
            $('#iframe_img').attr("width", "200px");
        }
        iframe.onerror = function () {
            iframeis = false;
            $("#iframe_res").text("Please Check Your Internet Connection ");

        }
        return iframeis
    } else {
        return iframeis;
    }



}

// ---------------------------]
// step 1
var names = document.getElementsByClassName('name');
var email = document.getElementById('email');
var meetingId = document.getElementById('meetingid');
var passcode = document.getElementById('passcode');
// step 2
var pin = document.getElementById("pin");
var feedback = document.getElementById('valid-feedback');
var modal = false;
var local = false;
// step 3


$('#recodes_spinner').hide()
function loginAjax(e) {

    $.post("/login", { email: e.email.value, password: e.password.value }, function (data) {
        if (data.result == 1) {
            $('#loginModal').modal('toggle');
            window.location.replace("/#setup");

        } else {
            shakeModal();
        }
    });

}




function onRegister(e) {
    e.fname.classList.remove('is-invalid');
    e.email.classList.remove('is-invalid');
    e.pn.classList.remove('is-invalid');
    e.password.classList.remove('is-invalid');
    e.password_confirmation.classList.remove('is-invalid');
    if (e.fname.value == "" || e.email.value == "" || e.pn.value == "" || e.password.value == "") {
        e.fname.classList.add(e.fname.value == '' ? 'is-invalid' : 'is-valid');
        e.email.classList.add(e.email.value == '' ? 'is-invalid' : 'is-valid');
        e.password.classList.add(e.password.value == '' ? 'is-invalid' : 'is-valid');
        e.pn.classList.add(e.pn.value == '' ? 'is-invalid' : 'is-valid');
        return false;
    } else if (e.password.value != e.password_confirmation.value) {
        e.password.classList.add('is-invalid');
        e.password_confirmation.classList.add('is-invalid');
        return false;
    } else if (e.password.value == e.password_confirmation.value) {
        e.password.classList.add('is-valid');
        e.password_confirmation.classList.add('is-valid');
    }
    else {
        return true;
    }

}



$('#stopload').hide();

function stop() {
    var id = $("#stop").val();
    console.log(id);
    $('#stopload').show();
    $('#stopbtn').text("stoping")
    var id = $('#stop').val();
    var jqxhr = $.post("/stop", { 'id': id, 'socketId': getSocketId() }, function (e) {
        console.log(e);
    }).done(function (r) {
        $('#stopbtn').text("Stoped");
        $('#stopload').hide();
    }).fail(function (r) {
        $('#stopbtn').text("tryAgain");
        console.error(r);
        window.alert("SomeThing Went Wrong Try Again")

    }).always(function () {
        modal = false;
    });
}



function validate() {
    console.log(names[0].value == '' ? 'is-invalid' : 'is-valid');
    names[0].classList.remove('is-invalid');
    names[0].classList.add(names[0].value == '' ? 'is-invalid' : 'is-valid')
    email.classList.add('is-valid')
    meetingId.classList.remove('is-invalid');
    meetingId.classList.add(meetingId.value == '' ? 'is-invalid' : 'is-valid')
    passcode.classList.remove('is-invalid');
    passcode.classList.add(passcode.value == '' ? 'is-invalid' : 'is-valid')
    if (names[0].value == "" || meetingId.value == "" || passcode.value == "") {
        window.alert("All Fields are required With Out Email");
        return false;
    } else {
        return true;
    }
}




function show_log() {
    console.log('SHOW LOG');
    $('#recoder_data').modal('toggle');
    $('#recoder_data_title').text("Terminal Output");
    $('#state').attr("src", "/assets/images/data.gif");
    $('#state').attr("width", "90px");
}

function show_recodes() {
    console.log("SHOW RECODES", getCookie('uid'));
    if (getCookie('uid')) {
        console.log('SHOW LOG');
        $('#recodes').modal('toggle');
        refresh()

    } else {
        $('#loginModal').modal('toggle');
    }

}

function show_start() {
    if (getCookie('uid')) {
        $('#startJOB').modal('toggle');
    } else {
        $('#loginModal').modal('toggle');
    }
}


function refresh() {
    console.log("Refersh")
    $('#recodes_spinner').show();
    $('#recodes_body').html('')
    $.ajax({
        url: "/getrows",
        type: 'GET',
        dataType: 'json', // added data type
        success: (r) => {
            $('#recodes_spinner').hide();
            r.forEach(element => {
                console.log(element)
                var dt = new Date(element.timestamp)
                var diff = (new Date().getTime() - dt.getTime()) / 1000;
                diff /= 60;
                diff = Math.abs(Math.round(diff));
                $('#recodes_body').append(`
      <tr class="${element.state ? 'table-success' : ''}">
      <th scope="row">${element.targetid}</th>
      <td>${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getDate().toString().padStart(2, '0')}/${dt.getFullYear().toString().padStart(4, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}</td>
      <td>${element.username}</td>
      <td>${element.meetingid}</td>
      <td>
      ${element.state ? '<span class="bg-success text-white">Runnng</span>' : '<span class="bg-secondary text-white">Idle</span>'}</td >
      <td><b>${diff}</b> minutes Left</td>
      <td><a class="bg-danger p-1 rounded-5 text-white" onclick="show_log()">Stop</a></td>
      <td><a href="${element.down}">Downlod</a> <a href="${element.view}">View </a></td>
  </tr > `)

            });
        },
    });
}


function start() {

    if (modal == false) {
        $("#start").hide();
        $('#recoder_data_title').text("Loading..... (Waiting for server Responce)");
        $('#state').attr("src", "/assets/images/loder.gif");
        $('#state').attr("width", "200px");
        $('#recoder_data').modal('toggle');
        var meetingConfig = {
            'meetingId': meetingId.value,
            'userName': names[0].value + names[1].value,
            'email': email.value,
            'passcode': passcode.value,
            role: 0,
            'socketId': getSocketId(),
        }
        console.log(meetingConfig);


        $.ajax({
            type: "POST",
            url: "/start",
            timeout: 600000,
            data: meetingConfig,
            success: ok,
            error: fail
        });

        modal = true;
        function ok(r) {

        }



        function fail(xmlhttprequest, textstatus, message) {
            console.log("Request Fil in ", textstatus);
            window.alert("Disconnected From Server")
        }


    } else {
        $('#recoder_data').modal('toggle');
        window.alert("Your Job Is Alredy runing If You Want send new request stop Current Job");
    }
}


// Socket
function getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    return str;
}

var socket = io();

function getSocketId() {
    console.log("GET SOCKET ID id is", socket.id)
    socketId = socket.id;
    return socketId;
}

socket.on("connect", () => {
    getSocketId();

});


socket.on('out', function (data) {
    console.log("SOCKET_IO", data);
    var fdata = '';
    if (data[0] == 'info') {
        fdata = `<font color = "#cc00cc" > ${getFormattedDate()} </font >: mesaage : -[<font color="#00CD00">${data[0]}</font>] <font color = "#CDCD00" > ${data[1]}</font > `;
    } else {
        fdata = `<font color = "#cc00cc" > ${getFormattedDate()} </font >: mesaage : -[<font color="#00CD00">${data[0]}</font>] <font color = "#e81b54" > ${data[1]}</font > `;
    }
    $("#model_body").append(`<pre id = 'term' style = "color:white;" > ${fdata}</pre ><br>`);

    // // Insert some line breaks where they belong

    // // Append the data to our terminal
    try {

        $("#model_body").animate({ scrollTop: $("#model_body")[0].scrollHeight }, 1);

    } catch (error) {
        console.error(error);
    }

});


socket.on('client_changed', function (data) {
    console.log("lient online", data)
    $("#online").text(data);
    $('#users').text(60 + data);
});

socket.on('exit', function (data) {
    document.cookie = "id= ; expires = Thu, 01 Jan 2029 00:00:00 GMT"
});

socket.on('start', function (data) {
    setCookie('id', data, 2);
    $('#recoder_data_title').text("REcoder Stared Your ID is -" + data);
    $('#recoder_data_title').append(`</br><small>Your ID is <b> ${data} </b> Remember IT</small>`);
    $('#state').attr("src", "/assets/images/recoder.gif");
    $('#state').attr("width", "40px");
    $('#stop').val(r);

});
socket.on('error', function (data) {
    $('#recoder_data_title').text("Request Fail Try Again");
    $('#recoder_data_title').append(`</br > <small>Error <b> ${data[0]} </b> At _main.start() </small>`);
    $('#state').attr("src", "/assets/images/error.gif");
    console.log("FAIL", data);
    window.alert("SomeThing Went Wrong Try Again")

});
socket.on('job', function (data) {
    console.log("On job changed", data);
    $('#completed').text(30 + data);
    $('#jobs').text(data);
})

socket.on('uploadEvent', function (data) {
    socket.emit('ack', data[2]);
    if (data[0] == "wait") {
        $('#recoder_data_title').text("Uploading File Please Wait a Moment ......");
        $('#recoder_data_title').append(`</br > <small>Your ID is <b> ${data[2]} </b> Remember IT</small>`);
        $('#state').attr("src", "/assets/images/upload.gif");
        $('#state').attr("width", "90px");
    } else if (data[0] == "ok") {
        console.log(data)
        $('#recoder_data_title').text("Uploading Finished -");
        $('#recoder_data_title').append(`< small > Your File IS</small > <br> <a target="_blank" href="${data[1].webContentLink}">Downlod File</a>
                <br> <a target="_blank" href="${data[1].webViewLink}">View File</a>`);
        $('#state').attr("src", "/assets/images/recoder.gif");
        $('#state').attr("width", "60px");
    } else if (data[0] == "exit") {
        console.error("CLEARING cookieis")
        document.cookie = "id= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    } else {
        $('#recoder_data_title').text("Somehing Went Wrong Contact developer to Recover File ");
        $('#recoder_data_title').append(`</br><small>Your ID is <b> ${data[2]} </b> Remember IT</small>`);
        $('#state').attr("src", "/assets/images/error.gif");
        $('#state').attr("width", "100px");
    }
})
