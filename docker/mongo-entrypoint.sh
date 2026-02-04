#!/bin/sh
set -e
mongod --replSet rs0 --bind_ip_all --noauth &
MONGOD_PID=$!
until mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null; do
  sleep 1
done
HOST="${MONGO_REPLICA_HOST:-localhost:27017}"
mongosh --eval "const c = db.getSiblingDB('admin').getCollection('system.replset').findOne(); if (!c) { rs.initiate({_id:'rs0', members:[{_id:0, host:'$HOST'}]}); }" --quiet
until [ "$(mongosh --eval "rs.status().myState === 1" --quiet 2>/dev/null)" = "true" ]; do
  sleep 1
done
wait $MONGOD_PID
