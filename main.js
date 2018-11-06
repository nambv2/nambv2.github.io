const socket = io('https://server-node-rtc.herokuapp.com/');
// const socket = io('http://localhost:3000');
$('#div-chat').hide();
$('#currentUser').hide();
var currentPeerId;

socket.on('DANH_SACH_ONLINE', arrUserInfo => {
    $('#div-chat').show();
    $('#div-dang-ky').hide();
    arrUserInfo.forEach(user => {
        const { ten, peerId } = user;
        if (peerId !== currentPeerId) {
          $('#ulUser').append(`<li id="${peerId}" style="color: #2ECC71;cursor: pointer;">${ten}</li>`);
        }
    });

    socket.on('CO_NGUOI_DUNG_MOI', user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}" style="color: #2ECC71;cursor: pointer;">${ten}</li>`);
    });

    socket.on('AI_DO_NGAT_KET_NOI', peerId => {
        $(`#${peerId}`).remove();
    });
});

socket.on('DANG_KY_THAT_BAT', () => alert('Vui long chon username khac!'));


function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

// openStream()
// .then(stream => playStream('localStream', stream));

const peer = new Peer({ 
    key: 'peerjs', 
    host: 'vaio-peer2018.herokuapp.com', 
    secure: true, 
    port: 443
});

peer.on('open', id => {
    // $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#username').val();
        const password = $('#password').val();
        login(username, password, id);
    });
});

//Caller
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

//Callee
peer.on('call', call => {
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

function login(user, pass, peerId) {
    const postData = {
    'username': user,
    'password': pass
    };
    currentPeerId = peerId;
    $('.login').hide();
    $('#currentUser').show();
    $('#currentUser').append(`<b class="${peerId}">${user}</b>`);
    socket.emit('NGUOI_DUNG_DANG_KY', { ten: user, peerId: peerId });
    // $.post('https://server-node-rtc.herokuapp.com/login', postData, function (res){
    // // $.post('http://127.0.0.1:3000/login', postData, function (res){
    //   if (res) {
    //     currentPeerId = peerId;
    //     $('.login').hide();
    //     $('#currentUser').show();
    //     $('#currentUser').append(`<b class="${peerId}">${user}</b>`);
    //     socket.emit('NGUOI_DUNG_DANG_KY', { ten: user, peerId: peerId });
    //   }
    // });
}