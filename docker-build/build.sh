#!/usr/bin/env bash
docker build -t palladium_view_builder .
docker run -itd --rm --name palladium_view_builder palladium_view_builder /bin/bash
docker cp palladium_view_builder:/palladium-view/dist/ dist
docker stop palladium_view_builder

