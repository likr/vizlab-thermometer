#!/bin/sh

curl -X POST -d "{\"timestamp\": {\".sv\": \"timestamp\"}, \"temperature\": $1}" 'https://vizlab-thermometer.firebaseio.com/records.json'
