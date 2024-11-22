#!/usr/bin/env bash
docker build -t palladium_view_builder -f docker-build/Dockerfile .
docker run -it --name palladium_view_builder_tmp palladium_view_builder
docker cp palladium_view_builder_tmp:/palladium-view/dist .
docker rm palladium_view_builder_tmp
