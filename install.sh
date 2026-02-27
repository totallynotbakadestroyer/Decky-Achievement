#!/usr/bin/bash
# Based on SimpleTDP install script by aarron-lee, thanks!

if [ "$EUID" -eq 0 ]
  then echo "Please do not run as root"
  exit
fi

cd $HOME

sudo rm -rf $HOME/homebrew/plugins/Decky-Achievement

echo "Downloading Decky-Achievement"

curl -L $(curl -s https://api.github.com/repos/totallynotbakadestroyer/decky-achievement/releases/latest | grep "browser_download_url" | cut -d '"' -f 4) -o $HOME/Decky-Achievement.zip
sudo unzip -o $HOME/Decky-Achievement.zip -d $HOME/homebrew/plugins

rm  $HOME/Decky-Achievement.zip
sudo systemctl restart plugin_loader.service

echo "Installation complete"
