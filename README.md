# pmm-framework-cli
User friendly & cross-platfrom CLI tool to use pmm-framework and quickly deploy PMM architecture.

### Requirements:
* `NodeJS`
* `Vagrant`
* `VirtualBox`

## Usage:
Upon execution, a series of queries will be asked and according to them the required parameters will be passed to `pmm-framework.sh`. This can be used to set up PMM on the current host or Vagrant Box guest.  
To install `pmm-framework-cli` in current directory:
```
npm i pmm-framework-cli
npx pmm-framework-cli
```
Or (to install globally)
```
sudo npm i pmm-framework-cli
sudo pmm-framework-cli
```
Or
```
git clone https://github.com/meet59patel/pmm-framework-cli.git
cd pmm-framework-cli
npm install
npm start
```

* For installation on Vagrant box:
  * `Ubuntu 18.04 (LTS)` and `CentOS 8` guest are supported, with Docker inside them
  * Vagrantfile and provisioning script will be placed under the directory: `src/vagrantboxes/server/` or `src/vagrantboxes/client/`
  * Vagrant Box will be set up and provisioned according to user's choices
  * Base `Vagrantfile` and `provision.sh` are available under `/src/vagrantfiles`
  * By default, guest `port 80` is forwarded to host `port 8080` (Can be changed from Vagrantfile)
  
### Directory Structure

```
src
  ├── index.js
  ├── questions.js
  └── vagrantfiles  
      ├── client  
      │   ├── centos  
      │   │   ├── Vagrantfile  
      │   │   └── provision.sh  
      │   └── ubuntu  
      │       ├── Vagrantfile  
      │       └── provision.sh  
      └── server  
          ├── centos  
          │   ├── Vagrantfile  
          │   └── provision.sh  
          └── ubuntu  
              ├── Vagrantfile  
              └── provision.sh
```

## Screenshots
![Screenshot](https://user-images.githubusercontent.com/45785817/88704751-2c497800-d12c-11ea-8a81-61f0fc3b7115.png)

***
* This CLI tool is made using:
  * [enquirer](https://www.npmjs.com/package/enquirer)
  * [commander](https://www.npmjs.com/package/commander)
  * [shelljs](https://www.npmjs.com/package/shelljs)
