#!/bin/bash

basedir="../$(basename `pwd`)Store"

echo 'move mode_modules and modules.json to Store'
mv ./node_modules $basedir
mv ./modules.json $basedir