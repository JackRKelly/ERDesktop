import React, { useState, useRef } from "react";
import "./App.scss";

function App() {
  const [selectContent, setSelectContent] = useState("Select Source");
  const [isRecording, setIsRecording] = useState(false);
  const videoPreview = useRef(null);
  const { desktopCapturer, remote } = window.require("electron");
  const { Menu } = remote;
  const { writeFile } = window.require("fs");
  const { dialog } = remote;
  let [mediaRecorder, setMediaRecorder] = useState(null);
  const recordedChunks = [];

  const startVideo = () => {
    if (mediaRecorder == null) {
      alert("Select a source to record.");
    } else if (mediaRecorder.state === "recording") {
      alert("You must stop recording first.");
    } else {
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopVideo = () => {
    if (mediaRecorder == null) {
      alert("Select a source and start recording first.");
    } else if (mediaRecorder.state === "inactive") {
      alert("You must start recording first.");
    } else {
      mediaRecorder.stop();
      setIsRecording(false);
    }
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
        videoPreview.current.srcObject = stream;
        videoPreview.current.play();

        const options = { mimeType: "video/webm; codecs=vp9" };
        mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleStop;
        setMediaRecorder(mediaRecorder);
      })
      .catch((err) => console.error(err));
  };

  const handleDataAvailable = (e) => {
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
      console.log("Video saved successfully");
    });
  };

  return (
    <div className="App">
      <main>
        <h1>
          ERDesktop
          {selectContent === "Select Source" ? "" : ` - ${selectContent}`}
        </h1>

        <video id="videoPreview" autoPlay ref={videoPreview}></video>

        <div className="button-container">
          <button
            id="startVideo"
            onClick={startVideo}
            style={{ backgroundColor: isRecording ? "gray" : "white" }}
          >
            Start
          </button>
          <button
            id="stopVideo"
            onClick={stopVideo}
            style={{ backgroundColor: isRecording ? "white" : "gray" }}
          >
            Stop
          </button>
          <button id="selectVideo" onClick={getSources}>
            Source: {selectContent}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
