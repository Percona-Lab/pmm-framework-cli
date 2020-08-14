#!/bin/bash
echo -e "\nIP(s) of current machine are:  $(hostname -I)\n"

# yum update

sudo dnf config-manager --set-enabled PowerTools >> framework_log # required for lynx
sudo yum install -y lynx >> framework_log
sudo yum install -y git >> framework_log
sudo yum install -y curl >> framework_log

sudo dnf install -y https://download.docker.com/linux/centos/7/x86_64/stable/Packages/containerd.io-1.2.6-3.3.el7.x86_64.rpm >> framework_log
# sudo dnf install docker-ce    # Docker installation is done using get.docker.com script instead

sudo curl -fsSL https://get.docker.com -o get-docker.sh >> framework_log
chmod +x get-docker.sh
sudo sh get-docker.sh >> framework_log
sudo rm get-docker.sh

sudo systemctl enable --now docker

# Run docker without root
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker

echo -e "\n\n****** Provisioning Upto Docker done********\n\n"

mkdir pmm-qa-scripts && cd pmm-qa-scripts
echo "downloading pmm-framework..."
curl https://raw.githubusercontent.com/percona/pmm-qa/GSOC-2020/pmm-tests/pmm-framework.sh -o pmm-framework.sh 
chmod +x pmm-framework.sh

echo -e "\n\n****** Provisioning done********\n\n"