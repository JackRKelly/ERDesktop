const stopVideo = document.getElementById("stopVideo");
const startVideo = document.getElementById("startVideo");
const selectVideo = document.getElementById("selectVideo");
const videoPreview = document.getElementById("videoPreview");

selectVideo.addEventListener("click", () => {
  getSources();
});

startVideo.onclick = (e) => {
  mediaRecorder.start();
  startVideo.classList.add("is-danger");
  startVideo.innerText = "Recording";
};

stopVideo.onclick = (e) => {
  mediaRecorder.stop();
  startVideo.classList.remove("is-danger");
  startVideo.innerText = "Start";
};

const { desktopCapturer, remote } = require("electron");
const { Menu } = remote;
const { writeFile } = require("fs");
const { dialog } = remote;

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
  mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
};

const handleDataAvailable = (e) => {
  console.log("data available");
  recordedChunks.push(e.data);
};

const handleStop = async (e) => {
  const blob = new Blob(recordedChunks, {
    type: "video/webm; codecs=vp9",
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: "Save video",
    defaultPath: `vid-${Date.now()}.webm`,
  });

  console.log(filePath);

  writeFile(filePath, buffer, () => {
    console.log("video save successful");
  });
};
