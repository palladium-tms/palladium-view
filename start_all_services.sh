#!/usr/bin/env bash
docker build -t palladium .
docker run -itd  -p 80:80 palladium  /bin/bash
