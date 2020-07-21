#!/bin/bash

# apt-get update
# apt-get upgrade

# Install required packages
apt-get install -y git
apt-get install -y lynx

# Install Docker # This is needed if not already provisioned through Vagrantfile
# curl -fsSL https://get.docker.com -o get-docker.sh
# sh get-docker.sh
# rm get-docker.sh

# Clone pmm-qa git repository
# NOTE: cloning may take a while. Prefer downloading just the pmm-framework script for speed
echo "Cloning pmm-qa to $(pwd)"
git clone https://github.com/percona/pmm-qa.git
cd ./pmm-qa/pmm-tests
chmod -R +x ../

# Change branch to GSOC-2020
git branch GSOC-2020

# pmm-framework execution command with flags will be inserted by Node script (index.js)
