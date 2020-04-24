import React, { useRef } from "react";
import "./App.css";
const electron = window.require("electron");
const fs = electron.remote.require("fs");
const ipcRenderer = electron.ipcRenderer;

function App() {
  const videoPreview = useRef(null);

  const { desktopCapturer, remote } = require("electron");
  const { Menu } = remote;
  const { writeFile } = require("fs");
  const { dialog } = remote;
  let mediaRecorder;
  const recordedChunks = [];

  const startVideo = () => {
    mediaRecorder.start();
    startVideo.classList.add("is-danger");
    startVideo.innerText = "Recording";
  };
  const stopVideo = () => {
    mediaRecorder.stop();
    startVideo.classList.remove("is-danger");
    startVideo.innerText = "Start";
  };

  const getSources = async () => {
    const inputSources = await desktopCapturer.getSources({
      types: ["window", "screen"],
    });

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

    writeFile(filePath, buffer, () => {
      console.log("video save successful");
    });
  };

  return (
    <div className="App">
      <main>
        <h1>ERDesktop</h1>

        <video id="videoPreview" ref={videoPreview}></video>

        <div class="button-container">
          <button id="startVideo" onclick={startVideo}>
            Start
          </button>
          <button id="stopVideo" onclick={stopVideo}>
            Stop
          </button>
          <button id="selectVideo" onclick={getSources}>
            Select Source
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
