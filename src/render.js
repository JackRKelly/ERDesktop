const stopVideo = document.getElementById("stopVideo");
const startVideo = document.getElementById("startVideo");
const selectVideo = document.getElementById("selectVideo");
const videoPreview = document.getElementById("videoPreview");

selectVideo.addEventListener("click", () => {
  getSources();
});

const { desktopCapturer, remote } = require("electron");

const { Menu } = remote;

const getSources = async () => {
  const inputSources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });

  console.log(inputSources);

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((source) => {
      return {
        label: source.name,
        click: () => selectSource(source),
      };
    })
  );

  videoOptionsMenu.popup();
};

let mediaRecorder;
const recordedChunks = [];

const selectSource = async (source) => {
  selectVideo.innerText = source.name;

  const contstraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
    },
  };

  const stream = await navigator.mediaDevices.getUserMedia(contstraints);

  videoPreview.srcObject = stream;
  videoPreview.play();

  const options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new mediaRecorder(stream, options);

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
};
