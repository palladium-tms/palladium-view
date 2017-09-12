#!/usr/bin/env bash
  echo "Start waiting"
while [ ! -d "./host_dist/" ]; do
  sleep 3
  echo "Waiting for volume"
done
  echo "Folder is found"

rm -rf ./host_dist/*
cp -R ./dist/* ./host_dist
