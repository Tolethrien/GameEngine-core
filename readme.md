#### Misa Misa Game Engine! - Core

NOTE! Everything presented in each repository of the Misy modules is in the prototyping phase. There is no guarantee that a given module will function correctly(or even at all) in its current state. modules may be unoptimized, and the code may be cumbersome and unclear in places. The documentation will not be provided until the end of this phase. The goal of the prototyping phase is to efficiently add and iterate over the most important engine functionalities and “stitch” them together to work in harmony, rather than focusing on the quality of the code which most likely will be subject to change during constant iterations. You are delving into this at your own risk. :)

### What's that brootha?!

Misa is a game engine focusing on 2D graphics, its main premise is the short time and simplicity of creating your own projects. It is primarily intended for making simple 2D games that anyone can build, even without specialized knowledge about Game Dev. It aims to show that even with basic knowledge, you can build interactive and interesting applications. It is written in TypeScript to increase the footprint of game development in the “web” world. Its core is based on Electron technology, which allows you to export a finished project as a native application for PC and thus share your project with the world, whether through itch.io or by uploading it to Steam. Ultimately, after the full implementation of WebGPU in browsers, this engine is also intended to allow the creation of games that run directly in browser.

### Modules

Engine is designed to consist of several modules which will eventually be combined into one application.”

| Misa
| ----> Editor - main graphical interface for Misa
| ----> Core - Core elements of engine
| ----> Aurora - WebGPU based custome 2D renderer
| ----> Cello - Sound Module
| ----> Dogma - ECS system
| ----> MapMaker - module for the ease of creating worlds.
| ----> FontParser - ttf font reader and creator
| ----> NaviGPU - ingame GUI based on gpu

### More

You can read more about Misa or specific modules in the documentation at https://game-engine-page.vercel.app. There, you can also track the current development progress.
