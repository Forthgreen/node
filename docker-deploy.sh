#!/bin/sh
# endpoints configuration
REMOTE='ubuntu@3.22.243.209'
REMOTE_DEVELOPMENT='ubuntu@3.15.254.192'
REMOTE_STAGING='ubuntu@3.23.147.117'
REMOTE_BETA='ubuntu@52.14.88.170'
# docker-compose configurations
DOCKER_COMPOSE_DEVELOPMENT='docker-compose-development.yml'
DOCKER_COMPOSE_STAGING='docker-compose-staging.yml'
DOCKER_COMPOSE_BETA='docker-compose-beta.yml'
DOCKER_COMPOSE='docker-compose.yml'
# config files
ENV_FILE='./.env'
NGINX_CONF='./configurations'

if [ "$1" != "" ]; then
	BUILD=$1
else
	BUILD=''
fi

DEFAULT_PEM_PATH='ssh/forthgreen.pem'
DEVELOPMENT_PEM_PATH=$DEFAULT_PEM_PATH

# Triggers the development build
dev_build()
{
	echo "Pushing the docker-compose.yml on development server"
	scp -i $DEVELOPMENT_PEM_PATH $DOCKER_COMPOSE_DEVELOPMENT $REMOTE_DEVELOPMENT:~/docker-compose.yml

	echo "Pushing the environment files to server"
	scp -i $DEVELOPMENT_PEM_PATH $ENV_FILE $REMOTE_DEVELOPMENT:~/


	echo "Push the nginx configurations"
	scp -r -i $DEVELOPMENT_PEM_PATH $NGINX_CONF $REMOTE_DEVELOPMENT:~/

	# the docker-compose up command to run the docker apps
	ssh -i $DEVELOPMENT_PEM_PATH $REMOTE_DEVELOPMENT "sudo docker-compose pull"
	ssh -i $DEVELOPMENT_PEM_PATH $REMOTE_DEVELOPMENT "sudo docker-compose down"
	ssh -i $DEVELOPMENT_PEM_PATH $REMOTE_DEVELOPMENT "sudo docker-compose -f docker-compose.yml up -d --force-recreate --remove-orphans"

	echo "Dev deployment complete!"
}

# triggers the stage build
stage_build()
{
	echo "Pushing the docker-compose.yml on stage server"
	scp -i $DEVELOPMENT_PEM_PATH $DOCKER_COMPOSE_STAGING $REMOTE_STAGING:~/docker-compose.yml

	echo "Pushing the environment files to server"
	scp -i $DEVELOPMENT_PEM_PATH $ENV_FILE $REMOTE_STAGING:~/


	echo "Push the nginx configurations"
	scp -r -i $DEVELOPMENT_PEM_PATH $NGINX_CONF $REMOTE_STAGING:~/

	# the docker-compose up command to run the docker apps
	ssh -i $DEVELOPMENT_PEM_PATH $REMOTE_STAGING "sudo docker-compose pull"
	ssh -i $DEVELOPMENT_PEM_PATH $REMOTE_STAGING "sudo docker-compose down"
	ssh -i $DEVELOPMENT_PEM_PATH $REMOTE_STAGING "sudo docker-compose -f docker-compose.yml up -d --force-recreate --remove-orphans"

	echo "Stage deployment complete!"
}

# triggers the stage build
beta_build()
{
	echo "Pushing the docker-compose.yml on beta server"
	scp -i $DEVELOPMENT_PEM_PATH $DOCKER_COMPOSE_BETA $REMOTE_BETA:~/docker-compose.yml

	echo "Pushing the environment files to server"
	scp -i $DEVELOPMENT_PEM_PATH $ENV_FILE $REMOTE_BETA:~/


	echo "Push the nginx configurations"
	scp -r -i $DEVELOPMENT_PEM_PATH $NGINX_CONF $REMOTE_BETA:~/

	# the docker-compose up command to run the docker apps
	ssh -i $DEVELOPMENT_PEM_PATH $REMOTE_BETA "sudo docker-compose pull"
	ssh -i $DEVELOPMENT_PEM_PATH $REMOTE_BETA "sudo docker-compose down"
	ssh -i $DEVELOPMENT_PEM_PATH $REMOTE_BETA "sudo docker-compose -f docker-compose.yml up -d --force-recreate --remove-orphans"

	echo "Beta deployment complete!"
}
# triggers the prod build
prod_build()
{
	echo "Pushing the docker-compose.yml on prod server"
	scp -i $DEVELOPMENT_PEM_PATH $DOCKER_COMPOSE $REMOTE:~/docker-compose.yml

	echo "Pushing the environment files to server"
	scp -i $DEVELOPMENT_PEM_PATH $ENV_FILE $REMOTE:~/


	echo "Push the nginx configurations"
	scp -r -i $DEVELOPMENT_PEM_PATH $NGINX_CONF $REMOTE:~/

	# the docker-compose up command to run the docker apps
	ssh -i $DEVELOPMENT_PEM_PATH $REMOTE "sudo docker-compose pull"
	ssh -i $DEVELOPMENT_PEM_PATH $REMOTE "sudo docker-compose down"
	ssh -i $DEVELOPMENT_PEM_PATH $REMOTE "sudo docker-compose -f docker-compose.yml up -d --force-recreate --remove-orphans"

	echo "Prod deployment complete!"
}

if [ "$BUILD" != "" ]; then
	if [ "$BUILD" == 'dev' ]; then
		dev_build
	elif [ "$BUILD" == 'stage' ]; then
		stage_build
		elif [ "$BUILD" == 'beta' ]; then
		beta_build
	elif [ "$BUILD" == 'prod' ]; then
		prod_build
	else
		echo "Invalid environment. Expects either of dev, stage or prod"
	fi
else
	# build all
    echo "Usage docker-deploy.sh <env> (env: dev | stage | prod)"
    echo "If no env provided, the script will deploy all environments"
    echo "Are you sure you want to redeploy all environments (y/n)? "
    old_stty_cfg=$(stty -g)
    stty raw -echo ; answer=$(head -c 1) ; stty $old_stty_cfg # Careful playing with stty
    if echo "$answer" | grep -iq "^y" ;then
        dev_build
        stage_build
        prod_build
		beta_build
    else
        echo 'Termination on No prompt'
    fi
fi