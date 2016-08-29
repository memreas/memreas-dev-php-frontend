#Purpose = ssh or sftp into ec2 instance
#Created on 1-AUG-2016
#Author = John Meah
#Version 1.0
git push
cp module/Application/src/Application/Model/MemreasConstants.shyam.php module/Application/src/Application/Model/MemreasConstants.php
curl https://memreasdev.memreas.com/index?action=clearlog
curl https://memreasdev.memreas.com/index?action=gitpull
