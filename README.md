# `web-lexica` (beta)

## A web version of Lexica


## News

### Android App Support/Language Settings

It's been a while, but development has resumed on `web-lexica` with two new features:

- Android App support
- Language Setting

#### Language Setting

You can now explicitly set your preferred language in the preferences menu! This is a small update, but I'm sure that it will be helpful for you if your preferred language was not automatically chosen.

Again, many thanks to those who continue to provide translations via Weblate!

#### Android App Support

This is a minor feature, but if you've been annoyed that your friends continue to send `web-lexica` game links instead of app links, you will enjoy this: There is now the option to open the `Lexica` app when you open a shared multiplayer game.

You can also choose to always open shared games in the `Lexica` app, however, due to safety reasons, most browsers will not allow a web page to open an app without some sort of user input, so, as a good second option, you will now be presented with a big button to open the shared game in the `Lexica` app.

### Translations working again!

Sorry for the lack of updates on the locked weblate translations. A few settings needed to be adjusted, and now Weblate translations are truely implemented. We apreciate the community support!

### Now with translations!

Web Lexica now has translations! This is a new feature and may have some bugs. If you find any, please [create an issue](https://github.com/lexica/web-lexica/issues/new).

If you would like to contribute to translations, check out the [Web Lexica Weblate Project](https://hosted.weblate.org/projects/web-lexica/), and please [see these instructions for using Weblate](https://hosted.weblate.org/engage/web-lexica/) to hlep translate `web-lexica`.

Many of the current translations have been re-used from [Lexica](https://github.com/lexica/lexica). A deep thank you to all who have previously given there time to help translate `lexica`.



### New game/game mode: Lexicle

Love playing [Wordle](https://www.nytimes.com/games/wordle/index.html)? Try playing with a Lexica twist! [Give it a try](https://lexica.github.io/web-lexica/lexicle/).

### New game mode: Time Attack

Race against the clock, gaining more time with each word found! [Give it a try](https://lexica.github.io/web-lexica/multiplayer?b=cix4LGcsZSx0LHQscCxzLG4saSxvLHosbCxuLHIsYSxvLGUsaSx1LGEsdyxuLHYscw&l=en_US&t=120&s=w&m=4&mv=20017&v=20017&ta=3).

Note, this game mode is not currently compatible with [Lexica](https://github.com/lexica/lexica), but this could change in the future.

### [Try Web-Lexica!](https://lexica.github.io/web-lexica)

The goal of this project is to fully replicate everything Lexica can do.

There are still a lot of rough edges with the project, but, all in all, it is in a playable state for both desktop and mobile users.

While it is still in beta, `web-lexica` is compatible with the core features of Lexica: game modes, languages, and game-play

Here are some things that `web-lexica` adds to Lexica:

1. Visual feedback: When guessing, the letters will flash to show if the guess is correct, incorrect, or a repeat guess
1. Time Attack game mode
1. Visible game details while in-game. Never forget the minimum word length again
1. Cross-platform compatibility. Anyone with a modern browser and a web connection can join in the fun.

Here are a list of its noteworthy shortcomings:

1. There are no preferences (Language, theme, etc)

Less important, but still missing, items are:

1. Several poor App layouts/styles/interactions. If you enjoy `web-lexica`, but get tripped up by something in the design, please feel free to [submit an issue](https://github.com/lexica/web-lexica/issues) detailing the problem and suggested improvements
1. When creating a multiplayer game, the QR code leads to the Android App's landing page, with no option for a direct link to a `web-lexica` game (The page's URL does dynamically update though, and can be used to share games)
1. Board rotation has not been implemented
1. A post-game `Share` option has not been implemented
1. The post-game summary does not not include dictionary links or a preview board

The app currently uses the excellent [`Solarized`](https://github.com/altercation/solarized) color scheme, the licence to which can be found [here](https://raw.githubusercontent.com/altercation/solarized/master/LICENSE)

Some changes to the layout have been made depending on the device being used. If the game is in portrait, it's display is very reminicient of Lexica's layout:

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

You will need to install [`NodeJS`](https://nodejs.org/) as well as [`YarnJS`](https://classic.yarnpkg.com/en/docs/install) in order to run and compile this project

This project uses `create-react-app` and, after running `yarn` at the project's root folder, can be spun up by running `yarn start` for development.

For production-ready builds, `yarn build` can be run.

The project also uses [`Storybook`](https://storybook.js.org) for individual `React` component tweaking and documentation. The `Storybook` stories have been neglected lately and may or may not have up-to-date settings and documentation. `Storybook` can be started by running `yarn storybook`

The app uses `lexica.github.io`'s language API in order to load dictionaries and other language metadata.

For offline development, you can use the `populate-mock-api.sh` script to populate the `mock-api` folder with a local copy of `Lexica`'s api retreieved from `lexica.github.io`. you will then need to host that folder (`npx serve ./mock-api` for example) and, unfortunately, change the `proxy` field in `package.json` to point to your static server.

## Attribution

[Wordle word list: Valid words](https://gist.github.com/cfreshman/cdcdf777450c5b5301e439061d29694c)

[Wordle word list: Answers](https://gist.github.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b)
