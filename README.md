# web-lexica

## A web version of Lexica!

The goal of this project is to fully replicate everything Lexica can do.

It is a far way off from this, so right now, it's main goal is to allow more people to join in multiplayer games.

There are still a lot of rough edges with the project, but, all in all, it is in a playable state for both desktop and mobile users.

Currently, this is what the web version of Lexica can do:

1. Play multiplayer games in most, maybe all, supported languages
1. Play `Letter Score` and `Word Lenght` games.
1. Play games of grid sizes 4, 5, and 6

Here are a list of its shortcomings:

1. It cannot handle boards with letter suffixes in them. To be fair though, at the time of writing, Lexica Multiplayer games can't handle this either
1. It has not been translated to other languages, despite being able to play games in other languages

The app currently uses the excellent [`Solarized`](https://github.com/altercation/solarized) color scheme, the licence to which can be found [here](https://raw.githubusercontent.com/altercation/solarized/master/LICENSE)

Some changes to the layout have been made depending on the device being used. If the game is in portrait, it will display very similarly to what the lexica app will display:

![Portrait Image](/portrait.png)

When the game is being played in landscape, it will display like so:

![Landscape Image](/landscape.png)

Other similar changes have been made to the results page.

## Contributing

### Reporting issues

Please report any issues or suggest features on the [issue tracker](https://github.com/lexica/web-lexica/issues).


## Development

You will need [`NodeJS`](https://nodejs.org/) in order to run and compile this project

This project uses `create-react-app` and can be spun up by running `yarn start` for development.

For production-ready builds, `yarn build` can be run.

The project also uses [`Storybook`](https://storybook.js.org) for individual `React` component tweaking and documentation. this can be started by running `yarn storybook`

The app uses `lexica.github.io`'s language API in order to load dictionaries and other language metadata. If you wish to develop offline, you can use the `populate-mock-api.sh` script to populate the `mock-api` folder with a local copy retreieved from `lexica.github.io`. you will then need to host that folder (`npx serve ./mock-api` for example) and, unfortunately, change the `proxy` field in `package.json` to point to your static server.

Currently, since game boards cannot be generated using the web client, the query-string from a multiplayer invite url must be appended to the host of the development server to see a board. Here is an example query string appended to an example url: `http://localhost:3000/?b=nbtmiwoarahaolvexwertasdskdlveszshef&l=en_US&t=180&s=l&m=3&mv=0&v=0`

The query string is fairly straight forward, but a reference of what the different fields represent can be found either [here in the web app](https://github.com/lexica/web-lexica/blob/30226f1b9517ccb2dc2281c25f5eadb4034ab741/src/game/rules.ts#L21) or [here in the Android app](https://github.com/lexica/lexica/blob/e6d636a5d1df5beb5a7d4d63c79903fb751c5d50/app/src/main/java/com/serwylo/lexica/share/SharedGameData.kt#L66)
