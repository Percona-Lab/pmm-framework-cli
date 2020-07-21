#!/bin/bash

yum update

yum install -y lynx
yum install -y git
yum install -y curl

curl -fsSL https://get.docker.com -o get-docker.sh
chmod +x get-docker.sh
sh get-docker.sh
rm get-docker.sh
