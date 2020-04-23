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
