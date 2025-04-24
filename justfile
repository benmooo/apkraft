
build-docker-image:
    docker build -t apkraft-cli-image .

tag:
    docker tag apkraft-cli-image crpi-wcfdnsi88pmwqij1.cn-hangzhou.personal.cr.aliyuncs.com/akatsukii/apkraft-cli:latest

push-docker-image:
    docker push crpi-wcfdnsi88pmwqij1.cn-hangzhou.personal.cr.aliyuncs.com/akatsukii/apkraft-cli:latest

pull-docker-image:
    docker pull crpi-wcfdnsi88pmwqij1.cn-hangzhou.personal.cr.aliyuncs.com/akatsukii/apkraft-cli:latest
