# sftp-dump

This is a simple script that I am using in few of my node.js projects. It takes all of the files ( also nested ones ) from given directory and uploads on specified remote server.
Useful to quickly deploy some bundled files on your test machine.

## Installation
`$ npm install --save sftp-dump`

## Usage

```js
const client = require('sftp-dump');
const sftpDump = client.SftpDump( hostname, port, username, password);
sftpDump.dumpFiles(from, uploadDirectory);

```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)