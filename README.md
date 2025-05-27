# Simple Card Maker

Very, very simple card-and-lorebook-making studio with an okay-ish UI.

## Features

- Export Character Cards as V2 Spec PNG
- Export Character Cards as V2 Spec JSON
- Export Lorebooks as V2 Spec
- Editing in a straightforward UI
- Search Functions in some places
- Properties-Format Definition (Inspired by StatuoTW's Botmaking Guide)

### Pending Features

- Import Character Card V2 Spec PNG
- Import Character Card V2 Spec JSON
- Import Lorebook V2 Spec
- Card Roleplay Testing Playground
- Property-Fields Presets (Soon!)
- V3 Support (I'm very hesitant about this one because it doesn't seem like most people are using it, so V3 Support is a very capitalized **IF**.)

## Philosophy

There isn't much to the design philosophy. I just wanted to make character cards and lorebooks without having my eyes destroyed
along the way.

The point is I wanted the thing to be simple, in terms of UI, UX, and other user actions. And also I'm bored and want to
play with the Tauri v2 framework a bit. Tauri V2's very cool in some ways but I find its Permissions management very goddamn annoying.
Hopefully someone would bring that up in their repo and get that damn thing improved or fixed.

## Credits & Inspirations

- Nuxt v3
- Nuxt UI v3
- TailwindCSS v4
- Tauri v2
- Tauri JS APIs
- StatuoTW's Rentry Guides (Very helpful)
- [gaffe-buck/tavern-v2-character-creator](https://github.com/gaffe-buck/tavern-v2-character-creator) for the PNG export part
- [malfoyslastname/character-card-spec-v2](https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md#new-fields) for the V2 Spec TypeScript Types part

# Installations

## Build From Source
1. Make sure you have Rust installed and a good internet connection
2. Clone the Repository
3. Make sure there is a `dist` folder under the repository folder; otherwise create one
4. Run `pnpm run tauri:build`
5. Go to `./src-tauri/target/release/bundle/dmg/` for the Installation Image on MacOS (Idk about other OS-es but I suppose its all under the `bundle/` folder)
6. Run and install and start the app

## Official Images

**Not Yet Supported Officially (I don't have a website yet, still working on it). Though I can drop in a few application images in the Repository's Release pages every now and then.**