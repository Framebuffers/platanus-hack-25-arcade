I attached an `AGENTS.md` for context.

Inside the `game.js`, perform the following tasks. For each stage, create a new artifact, as to prepare if tokens run out:

Stage 0: Modify the laser routine:

- Change the laser firing behaviour in such a way that: its end is offset at least 128px from the ship (let it be a global, configurable variable), it follows the ship (changing the angle pivoting from the start of the ray), and make the ray glow white (similar to the one for the grid, like a laser beam).
- every animation must be smoothly interpolated, starting fast and slowing down.


Stage 1: Clean up code

- Consider that a new audio feature will be added at a later time, which will generate music using a state machine synced to the beat and user input, at a later stage. You must change the structure of the game to accommodate for this.
- Clean the structure of the file separating each part by its corresponding part on a game, by the most general to the more specific: global variables (separated by category), game engine methods, gameplay, rendering, player, audio, helper methods. Choose the structure you feel is best to understand the game's structure. Focus all the custom gameplay behaviour inside the main loop only, using the global variables to construct the game.
- When cleaning the structure, consider condensating all code into clean methods, where the custom level behaviour is condensated on the main loop only. If Claude thinks that it's a good idea to introduce very minimal OOP concepts, make sure to compose instead of inherit as much as possible, wherever it's needed, considering the aforementioned design choices.
- Considering the cabinet follows the following keybinds, add support for a second player. Colours for both ships are complimentary shades of `GRID_BOT_COLOR`. They must be inside a global `const`.

```md
Player 1:

    Joystick: P1U, P1D, P1L, P1R (Up, Down, Left, Right)
    Joystick Diagonals: P1DL, P1DR (Down-Left, Down-Right)
    Action Buttons: P1A, P1B, P1C (top row) / P1X, P1Y, P1Z (bottom row)
    Start: START1

Player 2:

    Joystick: P2U, P2D, P2L, P2R
    Joystick Diagonals: P2DL, P2DR
    Action Buttons: P2A, P2B, P2C / P2X, P2Y, P2Z
    Start: START2
```

- Make every single time-related events, like when to fire a ray, the time it stays on screen, follow the time signature of the beat. Rays must be a full bar long.
- following the logic of a four-on-the-floor electronic music beat, change the opacity of the grid by 25% on each kick. Use the audio feature to sync up to the rest of the game.

Stage 2: add game over state

- If any Playr 2 button is pressed, spawn the new ship.
- Add vector font characters needed to display "game over" and numbers only.
- Add, on the top of the screen, offset by 25px, a beat counter. This will be the "score" of the game. For each 32th note, increase the counter by one. Player 1 is at the top left, Player 2 is at the top right.
- Add a losing state where: upon hitting the player, turn the ray red, fade the screen to 25% opacity, display "game over" centered on the screen, add the subtitle "press any key to restart".
- When the way intersects the ship. using the same style of font than the title, write "game over". as a subtitle, write "press any button to continue".

Stage 3: music engine, similar to a tracker, programmatically generating music.

- This engine has three main channels, similar to an 8-bit chip: triangle wave (for kicks) three square wave channels for music.
- An instrument are variations of the volume of each
- The main inputs will be: a song, composed a list of dictionaries (composition) of arrays (bar) containing, on each entry: `[note_length, channel, instrument, is_change_point]`.
- The main measurement for a step will be a full bar, subdividing by each note (`note_length`: 0 = 4/4 silence, 1 = 4/4, -1 = 4/4 silence, 2 = 1/2, -2 = -1/2 silence, each other note goes up, silence notes go negative, 1/32 notes max). format it as compactly as possible.
- A step is a 1/32 note.
- A state machine reads the song, at a 1/32 resolution, playing each note on its corresponding instrument.
- The engine checks the state of the player input.
- Choose a random number between 1 and 4. This is the amount of bars the game will wait between `is_change_point` is true and the player is pressing a key.
- If the user is pressing a key, and the note has `is_change_point` as `true`, queue jumping to another bar in the song after the set amount of random bars are played.






