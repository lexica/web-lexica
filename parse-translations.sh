#! /bin/sh

TRANSLATIONS_REMOTE_DIR=temp-`date +%s`

curl 'https://hosted.weblate.org/download/lexica/?format=zip' > temp-translations.zip
unzip -d $TRANSLATIONS_REMOTE_DIR temp-translations.zip && rm temp-translations.zip

node ./parse-translations.js $TRANSLATIONS_REMOTE_DIR && rm -r $TRANSLATIONS_REMOTE_DIR
