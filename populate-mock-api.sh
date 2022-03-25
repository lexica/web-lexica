#! /bin/sh

API_URL=https://lexica.github.io/lexica/api/v1
MOCK_PATH=./mock-api/lexica/api/v1

populate_base_languages_file() {
  LANGUAGE_FILE=$MOCK_PATH/languages.json
  if [ -f $LANGUAGE_FILE ]; then
    echo $LANGUAGE_FILE exists!
    return
  fi
  curl -s "$API_URL/languages.json" > $LANGUAGE_FILE
}

get_available_languages() {
  # We can reasonably rely on people having nodejs, but jq would be better here
  cat $MOCK_PATH/languages.json |
  node -e "const fs = require('fs'); JSON.parse(fs.readFileSync(0).toString()).forEach(w => console.log(w))"
}

print_available_languages() {
  for language in $AVAILABLE_LANGUAGES
  do
    echo $language
  done
}

mkdir -p $MOCK_PATH

populate_base_languages_file

AVAILABLE_LANGUAGES=`get_available_languages`

# echo $AVAILABLE_LANGUAGES

populate_language() {
  echo "populating $1..."
  mkdir -p $MOCK_PATH/language/$1
  curl -s "$API_URL/language/$1/metadata.json">$MOCK_PATH/language/$1/metadata.json
  curl -s "$API_URL/language/$1/dictionary.json">$MOCK_PATH/language/$1/dictionary.json
  echo "done"
}


if [ -z "$1" ]
then
  echo "Language(s) needed. (or enter all to populate all languages)"
  echo "./populate-mock-api.sh ['all' or language] [language]..."
  echo "Valid languages:"
  print_available_languages
  exit 1
fi

mkdir -p $MOCK_PATH

if [ "all" = "$1" ]
then
  print_available_languages |
  while IFS= read -r language; do
    populate_language $language
  done
  exit 0
fi

invalid_language() {
  echo "WARNING: $1 is not a valid language. Exiting."
  exit 1
}

for var in $@
do
  echo validating $var...
  print_available_languages | grep -Eq ^$var$ && echo valid || invalid_language $var

  populate_language $var
done
