#Purpose = ssh or sftp into ec2 instance
#Created on 1-NOV-2014
#Author = John Meah
#Version 1.0

echo -n "Enter the details of your deployment (i.e. 4-FEB-2014 Updating this script.) > "
read comment
echo "You entered $comment"

#copy fe settings to push to git...
cp ./module/Application/src/Application/Model/MemreasConstants.fe.production.php ./module/Application/src/Application/Model/MemreasConstants.php

#Push to AWS
echo "Committing to git..."
git add .
git commit -m "$comment"
echo "Pushing to github..."
set -v verbose #echo on
git push

#cp module/Application/src/Application/Model/MemreasConstants.localhost.php module/Application/src/Application/Model/MemreasConstants.php

curl https://memreas-dev-deploy.memreas.com/prod_pull_n_aws_push.php?repo=frontend

