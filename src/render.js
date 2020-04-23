const stopVideo = document.getElementById("stopVideo");
const startVideo = document.getElementById("startVideo");
const selectVideo = document.getElementById("selectVideo");
const videoPreview = document.getElementById("videoPreview");

selectVideo.addEventListener("click", () => {
  getSources();
});

const { desktopCapturer, remote } = require("electron");

const { Menu } = remote;
