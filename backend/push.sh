set -e

docker build -t prototestv0 --platform=linux/amd64 .
docker tag prototestv0 registry.digitalocean.com/prototest/prototestv0
docker push registry.digitalocean.com/prototest/prototestv0