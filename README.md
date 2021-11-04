# web-lexica

## A web version of Lexica!

### [Try it out!](https://lexica.github.io/web-lexica)

The goal of this project is to fully replicate everything Lexica can do.

There are still a lot of rough edges with the project, but, all in all, it is in a playable state for both desktop and mobile users.

Currently, this is what the web version of Lexica can do:

1. Play singleplayer games in most, maybe all, Lexica supported languages
1. Play, and share multiplayer games in most, maybe all, Lexica supported languages
1. Play `Letter Score` and `Word Lenght` games.
1. Play games of grid sizes 4, 5, and 6

Here are a list of its noteworthy shortcomings:

1. It has not been translated to other languages, despite being able to play games in other languages
1. There are no preferences (Language, theme, etc)
1. There are no ways of creating custom game modes
1. When creating a multiplayer game, there is no option for a web-lexica version of the code (although the URL can be copied and sent)

The app currently uses the excellent [`Solarized`](https://github.com/altercation/solarized) color scheme, the licence to which can be found [here](https://raw.githubusercontent.com/altercation/solarized/master/LICENSE)

Some changes to the layout have been made depending on the device being used. If the game is in portrait, it will display very similarly to what the lexica app will display:

![Portrait Image](/portrait.png)

When the game is being played in landscape, it will display like so:

![Landscape Image](/landscape.png)

Other similar changes have been made to the results page.

## Contributing

Pull requests are appreciated!

Note, since this project is still in beta, it is highly volitile with sweeping changes being made on a regular basis

### Reporting issues

Please report any issues or suggest features on the [issue tracker](https://github.com/lexica/web-lexica/issues).

## Development

You will need [`NodeJS`](https://nodejs.org/) in order to run and compile this project

This project uses `create-react-app` and can be spun up by running `yarn start` for development.

For production-ready builds, `yarn build` can be run.

The project also uses [`Storybook`](https://storybook.js.org) for individual `React` component tweaking and documentation. this can be started by running `yarn storybook`

The app uses `lexica.github.io`'s language API in order to load dictionaries and other language metadata.

For offline development, you can use the `populate-mock-api.sh` script to populate the `mock-api` folder with a local copy of `Lexica`'s api retreieved from `lexica.github.io`. you will then need to host that folder (`npx serve ./mock-api` for example) and, unfortunately, change the `proxy` field in `package.json` to point to your static server.
