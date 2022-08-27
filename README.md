# Don't cut the rope, a js13kgames game

This is my game entry for [js13kgames](https://js13kgames.com/) 2022 game jam. This years theme is "DEATH". I decided to create a rope physics game with a death theme. The game prototype can be played here https://js13kgames2022.netlify.app/ (It's subject to change as the game is still in development)

The game uses Verlet Intergration. I've followed this article, [Simulate Tearable Cloth and Ragdolls With Simple Verlet Integration](https://gamedevelopment.tutsplus.com/tutorials/simulate-tearable-cloth-and-ragdolls-with-simple-verlet-integration--gamedev-519), and watched this video series, [Coding Math: Episode 36 - Verlet Integration Part I](https://www.youtube.com/watch?v=3HjO_RGIjCU&feature=youtu.be) trying to understand “Verlet Integration”, and implement it accordingly. I highly recomend taking a look at those resources to understand how it works.

## Challanges

### NEAR and OP Games

Use NEAR to connect to https://paras.id/. Players can unlock new levels by minting NFTs

### Arcadian

Players can select cool headwear from the Arcadians

### Web monetization

Players can adjust the color palette, and also unlock "hard" mode for levels with extra challanges.

## How to run and build the game

Install dependencies and start a dev server

```
npm install
npm run start
```

Build and create a zip file

```
npm run build:roadroller
```

## How to play

You're a lost soul, and need to find your grave to rest in peace. Your rope is your lifeline. Protect it, sacrifice it, find your peace.

The goal is to reach your grave, the circle.

- Use the arrow keys to move back and forth
- Press space to get a boost upwards
- Try to collect hearts
