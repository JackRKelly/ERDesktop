import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [selectContent, setSelectContent] = useState("Select Source");
  const videoPreview = useRef(null);

  const { desktopCapturer, remote } = window.require("electron");
  const { Menu } = remote;
  const { writeFile } = require("fs");
  const { dialog } = remote;
  let mediaRecorder;
  const recordedChunks = [];

  const startVideo = () => {
    mediaRecorder.start();
    console.log("start video");
  };
  const stopVideo = () => {
    mediaRecorder.stop();
    console.log("stop video");
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
    setSelectContent(source.name);

    const contstraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: source.id,
        },
      },
    };

    await navigator.mediaDevices
      .getUserMedia(contstraints)
      .then((stream) => {
        console.log(stream);
        videoPreview.current.srcObject = stream;
        videoPreview.current.play();

        const options = { mimeType: "video/webm; codecs=vp9" };
        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleStop;
      })
      .catch((err) => console.error(err));
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

        <video id="videoPreview" autoPlay ref={videoPreview}></video>

        <div className="button-container">
          <button id="startVideo" onClick={startVideo}>
            Start
          </button>
          <button id="stopVideo" onClick={stopVideo}>
            Stop
          </button>
          <button id="selectVideo" onClick={getSources}>
            {selectContent}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
