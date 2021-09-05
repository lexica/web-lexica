## web-lexica

The point of this repo is to create a web client that can make a game when given a [Lexica](https://github.com/lexica/lexica) multiplayer game link.

As of right now, the scope of the project is not to fully replicate everything Lexica can do, but rather just allow more people to join in multiplayer games.

There are still a lot of rough edges with the project, but, all in all, it is in a playable state for both desktop and mobile users.

Currently, this is what the web version of Lexica can do:

1. Play English (US, but maybe other variants) games
1. Play `Letter Score` games.
1. Play games of grid sizes 4, 5, and 6

This is what the website cannot currently do:

1. Play languages other than english
1. Play `Word Length Score` games.
1. Handle boards with the letter `q` in them. To be fair though, at the time of writing, Lexica Multiplayer games can't handle `q` either

The app currently uses the excellent [`Solarized`](https://github.com/altercation/solarized) color scheme, the licence to which can be found [here](https://raw.githubusercontent.com/altercation/solarized/master/LICENSE)

Some changes to the layout have been made depending on the device being used. If the game is in portrait, it will display very similarly to what the lexica app will display:

![Portrait Image](/portrait.png)

When the game is being played in landscape, it will display like so:

![Landscape Image](/landscape.png)

Other similar changes have been made to the results page.
