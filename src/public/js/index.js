const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

call.hidden = true;

let myPeerConnection;
let roomName;
let myStream;
let muted = false;
let cameraOff = false;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label === camera.label) {
                option.selected = true;
              }
            camerasSelect.appendChild(option);
        }) 
    } catch(e){
        console.log(e);
    }
}

async function getMedia(deviceId){
    const initialConstrains = {
        audio: true,
        video: { facingMode: "user" },
      };
      const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
      };
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstrains
        );
        myFace.srcObject = myStream;
        if(!deviceId){
        await getCameras();
        }
    } catch(e){
        console.log(e);
    }
}

getMedia();

function handleMuteClick() {
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled)); 
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick() {
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

async function handleCameraChange(){
   await getMedia(camerasSelect.value)
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

const welcomeForm = welcome.querySelector("form");

async function startMEdia(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    socket.emit("join_room", input.value, startMEdia);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer)
    socket.emit("offer", offer, roomName);
    console.log(offer);
});

socket.on("offer", (offer) => {
    console.log(offer);
})

function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    myStream
    .getTracks()
    .forEach(track => myPeerConnection.addTrack(track, myStream));
}