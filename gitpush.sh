#Purpose = ssh or sftp into ec2 instance
#Created on 1-NOV-2014
#Author = John Meah
#Version 1.0

echo -n "Do you want to point to local after push (y\n) > "
read local
echo "You entered $local"


echo -n "Enter the details of your deployment (i.e. 4-FEB-2014 Updating this script.) > "
read comment
echo "You entered $comment"

#copy fe settings to push to git...
cp ./module/Application/src/Application/Model/MemreasConstants.fe.php ./module/Application/src/Application/Model/MemreasConstants.php

#Push to AWS
echo "Committing to git..."
git add .
git commit -m "$comment"
echo "Pushing to github..."
set -v verbose #echo on
git push

cp module/Application/src/Application/Model/MemreasConstants.localhost.php module/Application/src/Application/Model/MemreasConstants.php

#eb events -f

#curl https://memreasdev.memreas.com:9001/index?action=clearlog
curl https://memreasdev.memreas.com:9001/index?action=gitpull
