async function getVersion(package) {
  var version = await fetch("https://registry.npmjs.org/" + package)
    .then((response) => response.json())
    .then((data) => data["dist-tags"].latest)
    .catch((error) => {
      console.error(error);
    });

  return version;
}
var packages = [
  "remark",
  "remark-html",
  "remark-preset-lint-markdown-style-guide",
  "vfile-reporter",
];

async function getVersions(packages) {
  versions = {};
  for (var i = 0; i < packages.length; i++) {
    versions[packages[i]] = await getVersion(packages[i]);
  }

  return versions;
}
function getOutput() {
  var output = "\n/Users/tilde/example";
  packages =
    document
      .getElementsByClassName("npm")[0]
      ?.children[0].textContent.replace("npm install ", "")
      .split(" ") ?? packages;
  getVersions(packages).then((versions) => {
    for (var i = 0; i < packages.length; i++) {
      const lineStart = i == packages.length - 1 ? "└── " : "├── ";
      output += "\n" + lineStart + packages[i] + "@" + versions[packages[i]];
    }
    var code = document.getElementsByClassName("npm")[0].children[1];
    code.innerHTML = output;
  });
}

getOutput();
