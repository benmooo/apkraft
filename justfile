tag:="crpi-wcfdnsi88pmwqij1.cn-hangzhou.personal.cr.aliyuncs.com/akatsukii/apkraft-cli"
node0:="47.96.141.100"

build-docker-image:
    docker build -t apkraft-cli-image .

tag:
    docker tag apkraft-cli-image {{tag}}:latest

push-docker-image:
    docker push {{tag}}:latest

pull-docker-image:
    docker pull {{tag}}:latest

run-docker-image:
    docker run -d -p 80:3000  {{tag}}

up:
    docker-compose up -d

# copy the docker compose file to node0
copy-docker-compose:
    scp docker-compose.yml aka@{{node0}}:/home/aka/source/repos/apkraft
