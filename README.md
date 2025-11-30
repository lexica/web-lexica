# `web-lexica` (beta)


## Table Of Contents

- [Web Lexica](#a-web-version-of-lexica)
- [Project Goals](#project-goals)
- [News](#news)
- [Contributing](#contributing)
- [Development](#development)
- [Attribution](#attribution)
## A web version of Lexica

[Try Web-Lexica!](https://lexica.github.io/web-lexica)

The following is mostly taken from [`Lexica`](https://github.com/lexica/lexica)'s `readme`:

Lexica is a word game available online an don the Android platform. Players are given 3 to 30 minutes to find as many words as possible on a grid of random letters. 

Features:
- Several international dictionaries, with a combined total of millions of words
- Multiplayer mode (send challenges to friends via SMS/Email/etc)
- Customisable game modes:
- 4x4, 5x5, and 6x6 sized boards
- Different durations
- Various scoring modes


Features unique to `web-lexica`:

- Time attack mode (Gain more time for each word guessed)
- Lexicle (A `wordle` inspired game-mode)
- Cross-platform: `web-lexica` is compatible with most reasonably modern browsers with `javascript` enabled.

## Project Goals

The goal of this project is to fully replicate everything Lexica can do.

There are still a lot of rough edges with the project, but, all in all, it is in a playable state for both desktop and mobile users.

While it is still in beta, `web-lexica` is compatible with the core features of Lexica: game modes, languages, and game-play

Here are some things that `web-lexica` adds to Lexica:

1. Visual feedback: When guessing, the letters will flash to show if the guess is correct, incorrect, or a repeat guess
1. Time Attack game mode
1. Visible game details while in-game. Never forget the minimum word length again
1. Cross-platform compatibility. Anyone with a modern browser and a web connection can join in the fun.

Some missing functionality:

1. Several poor App layouts/styles/interactions. If you enjoy `web-lexica`, but get tripped up by something in the design, please feel free to [submit an issue](https://github.com/lexica/web-lexica/issues) detailing the problem and suggested improvements
1. When creating a multiplayer game, the QR code leads to the Android App's landing page, with no option for a direct link to a `web-lexica` game (The page's URL does dynamically update though, and can be used to share games)
1. Board rotation has not been implemented
1. A post-game `Share` option has not been implemented
1. The post-game summary does not not include dictionary links or a preview board


Some changes to the layout have been made depending on the device being used. If the game is in portrait, it's display is very reminicient of Lexica's layout:

![Portrait Image](/portrait.png)

When the game is being played in landscape, it will display like so:

![Landscape Image](/landscape.png)

Other similar changes have been made to the results page.

## News

News is organized by most recent news first

### Minor bug fixes, tooling modernization, and thoughts

It's been a very long time this time! Life has been very busy and I've needed to step back from this project for a while.

Here's some highlights of the bug fixes:

- `Found Words`: The result screen has been using `Missed Words` for both the `Found Words` and `Missed Words` section :face-palm:
- `QR Code`: The QR code has been broken for a while now. Probably in the android refactor. That is now fixed!

Highlights of the tooling modernization:

#### Dropped `yarn` in favor of `npm`

While `yarn` is (imo) a bit more ergonomic than `npm`, we were stuck on a very old version of `yarn` that just wasn't useful enough to justify its use. `npm` on the other hand is a good fit for this smaller project and lowers the barrier to entry.

#### Upgraded from node `v16.x` all the way to `v24.x`

This was a fairly easy change because this is a web-app, so we weren't using `node` that much except for local development.

#### Moving from `create-react-app` to `vite`

Web development is a constant cycle it seems. There's always a new tool, always a new framework. It's enough to make ditching `react` entirely and just using `javascript+html+css` an attractive idea. That would require a lot of work tho, so I'll refrain. For now.

Earlier this year, the React Project [officially deprecated `create-react-app`](https://react.dev/blog/2025/02/14/sunsetting-create-react-app) ([archived](https://web.archive.org/web/20250218090142/https://react.dev/blog/2025/02/14/sunsetting-create-react-app)).

This was not a huge concern for this project due to its nature, but switching from `create-react-app` to `vite` allowed us to smooth out some of the really clunky aspects of `cra` like `WebWorkers`.

Before `create-react-app`, `WebWorkers` needed a special loader (at least when they were added) and weren't very recognizable as a standard `WebWorker`. `vite`, because it assumes fairly modern browser usage, just loads `WebWorkers` normally, which is nice.

The migration did require a sweeping change to the project (5k lines of code changed) due to minor differences between `cra` and `vite`. Due to limited focus time, a single huge PR was made, which is messy, but quicker.


#### Thoughts on Moving forward

So far, beyond weblate contributions (which are deeply appreciated), I've (`MattRCole`) been the principal maintainer of the `web-lexica` project. I've loved working on `web-lexica`, but I do feel bad that I can't give this project the amount of care and attention that it deserves. So, I'm interested in being more inviting to community contributions. I think there's a few different reasons for low contributions, but the main one that I can influence is: Complexity.

I built this project w/o a framework making most components "by hand". This, along with some of my design choices have left quite a bit of cruft. I believe that cruft has made it hard for anyone but me to contribute to this project.

With that in mind I will try (no promises) to focus future work on simplifying the project:

- Removing unused files
- Consolidating components
- Following established patterns better
- etc

Something else I'd like to do is also minimize the reliance on outside tools since (especially in web development) these can change much more rapidly than I can feasibly keep up with.

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

## Contributing

Pull requests are appreciated!

Note, since this project is still in beta, it is highly volitile with sweeping changes being made on a regular basis

### Reporting issues

Please report any issues or suggest features on the [issue tracker](https://github.com/lexica/web-lexica/issues).

## Development

You will need to install [`NodeJS`](https://nodejs.org/) `v24` in order to run and compile this project

This project uses `vitea` and, after running `npm i` at the project's root folder, can be spun up by running `npm run start` for development.

For production-ready builds, `npm build` can be run.

The app uses `lexica.github.io`'s language API in order to load dictionaries and other language metadata.

For offline development, you can use the `populate-mock-api.sh` script to populate the `mock-api` folder with a local copy of `Lexica`'s api retreieved from `lexica.github.io`. you will then need to host that folder (`npx serve ./mock-api` for example) and, unfortunately, change the `proxy` field in `vite.config.ts` to point to your static server.

## Attribution

[Wordle word list: Valid words](https://gist.github.com/cfreshman/cdcdf777450c5b5301e439061d29694c)

[Wordle word list: Answers](https://gist.github.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b)

The app currently uses the excellent [`Solarized`](https://github.com/altercation/solarized) color scheme, the license to which can be found [here](https://raw.githubusercontent.com/altercation/solarized/master/LICENSE)