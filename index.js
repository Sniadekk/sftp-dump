const { lstatSync, readdirSync, existsSync } = require("fs");
const { join } = require("path");
const fs = require("fs");
const resolve = require("path").resolve;
const colors = require('colors');

let Client = require("ssh2-sftp-client");

const isDirectory = source => {
  return lstatSync(source).isDirectory();
};

const getFiles = path => {
  return crawleDirectory(path, []);
};

const crawleDirectory = (path, pathArr) => {
  const files = readdirSync(path);
  files.forEach(file => {
    const filePath = `${path}/${file}`;
    if (isDirectory(filePath)) {
      pathArr.push({ path: filePath, isDirectory: true });
      return crawleDirectory(filePath, pathArr);
    } else {
      pathArr.push({ path: filePath, isDirectory: false });
    }
  });
  return pathArr;
};

const relativeToAbsolute = path => resolve(path);

function SftpDump(host, port, username, password) {
  this.host = host;
  this.port = port;
  this.username = username;
  this.password = password;
  this.sftp = new Client();

  this.dumpFiles = function(from, uploadDirectory) {
    this.sftp
      .connect({
        host: this.host,
        port: this.port,
        username: this.username,
        password: this.password
      })
      .then(data => {
        this.uploadDirectory = uploadDirectory;
        this.from = from;
        this.uploadFiles(from);
      })
      .catch(err => {
        console.log(err, "catch error".red);
      });
  };

  this.uploadFiles = function(from) {
    const files = getFiles(from);
    const pendingFiles = files.map(f => {
      if (f.isDirectory) {
        return this.createDirectory(f.path);
      } else {
        return this.uploadFile(f.path);
      }
    });
    Promise.all(pendingFiles).then(data => {
      console.log("Finished uploading files".green);
      process.exit();
    });
  };

  this.createDirectory = function(path) {
    const pathWithoutStartingDirectory = path.replace(this.from, "");
    return this.sftp
      .mkdir(pathWithoutStartingDirectory, false)
      .then(e => {
        console.log(`Succesfully created directory : ${pathWithoutStartingDirectory}`.green);
        return { file: path, uploaded: true };
      })
      .catch(e => {
        console.log(`There was a problem creating ${pathWithoutStartingDirectory} directory. This directory probably already exists.`.orange);
        return { file: path, uploaded: false };
      });
  };

  this.uploadFile = function(file) {
    const fileName = file.replace(this.from, ""); // remove ./build from path, so we have filename without unknown directories on server
    const absolutePath = relativeToAbsolute(file);

    return this.sftp
      .fastPut(absolutePath, `${this.uploadDirectory}${fileName}`)
      .then(e => {
        console.log(`Successfully uploaded - ${file} `.green);
        return { file, uploaded: true };
      })
      .catch(e => {
        console.log(`There was an error during upload of - ${file} to ${this.uploadDirectory}${fileName}- error : ${e}`.red);
        return { file, uploaded: false };
      });
  };
  return this;
}


module.exports = {
    SftpDump
}