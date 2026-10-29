# Introduction

Hey! I'm Daniel Marchi, and this is my project, Grand Tale.

Grand Tale is a long-term goal, currently developed in my personal time alongside other professional work, as it is not yet funded. For now, this documentation serves as a portfolio piece to showcase my abilities.

I am responsible for all narrative, game design, code, and documentation in this project.

You can learn more about me and my collaborators in the Team section below.

## Before You Read

- This is a work in progress. Any names, designs, or implementations described may not represent the final output.
- The project currently uses multiple placeholder artworks, which will be replaced over time.
- This documentation is updated every day, so you may find empty or incomplete sections.

Welcome to the official technical documentation of the franchise _Grand Tale_, by [Rimelight Entertainment](https://rimelight.com/).

It describes how the project works internally, and sets guidelines for how it should be maintained and expanded.

## How to Read This Documentation

- The project is not officially in production, so this documentation is openly accessible without sign-in. There are plans to keep it public after release.
- It is written by developers, for developers. It uses plenty of technical jargon and is not meant for marketing or other user-facing material.
- Any developer with sufficient authorization may edit it, so it should not be read as coming from one specific person, except where noted.
- Developer commentary appears in separate blocks.
- Text in a distinct colour indicates a direct quote.

## What Is Grand Tale?

Grand Tale is an entertainment media franchise centred on a video game of the same name. Development started in 2020 as an experimental venture and grew into a full-scale project.

The franchise is built on a base game made of social, narrative, and progression systems. It is expanded through sub-games called "Tales". Each Tale is a different gameplay experience, but all are wrapped in the same shared Grand Tale systems.

Other media expand the game's world and characters from different perspectives. All of it is canon to one overall narrative.

- **Base game:** a multiplayer isometric [life sim](https://en.wikipedia.org/wiki/Life_simulation_game) with social and idle elements.
- **Tales:** live-service massively multiplayer games.
- **Elevator pitch:** [Club Penguin](https://en.wikipedia.org/wiki/Club_Penguin) + [Stardew Valley](https://en.wikipedia.org/wiki/Stardew_Valley), but with large, complex sub-games instead of Club Penguin's mini-games.

When a player first enters the world, they customize an avatar and receive an Island, which they can also customize later. They can explore the world to interact with other players or gather resources to improve their Island. The whole experience is tied to idle progression and extensive collection logs of narrative and completionist content.

From the interface, players can engage with the various Tales. Each is either lobby-based or takes place in the shared overworld.

The Grand Tale experience is richer if you play multiple Tales, but not everyone enjoys multiple types of game, so many design choices keep players from feeling held back by skipping a given Tale.

- **Tale M:** an isometric MMORPG set in the same overworld as the base game. Players enter as one of many Heroes to slay monsters and complete quests for the Grand Tale.
- **Heartbringer:** an isometric match-based MOBA set in various arenas. Players face each other as one of many Champions in competitive team matches hosted by the Grand Tale.
- **Tale R:** an isometric RTS set across numerous battlefields.
- **Tale C:** a CCG set in various taverns. Players take the role of a Seeker.
- **Tale A:** an auto battler.

What sets Grand Tale apart is integration. The Tales differ in gameplay, but the systems that wrap them are the same. This makes opportunities possible that are not normally available.

Sub-games are common in the industry, but they are often disconnected from each other and added as an afterthought. Grand Tale is designed around its expansions from the start. This avoids the user-experience problems other titles have faced, and lets the project use the strengths of a shared environment.

The base game is a real gameplay experience in its own right, not just a client for accessing the other games.

## How Does Grand Tale Make It Work?

Grand Tale is a very large project, so it needs careful planning to be feasible and to deliver a cohesive experience.

Several titles have followed similar formats or ambitions. After studying their development history and market impact, these conclusions were reached:

- Keeping an IP within one ecosystem brings engagement benefits.
- Extending an IP across multiple forms of entertainment, such as different game genres or TV shows, brings engagement benefits.
- Different forms of entertainment can compensate for each other's gaps, such as storytelling, player identity, or progression.
- Not designing for expansion creates problems that can hinder a later project's success.

Grand Tale's design uses these observations. Its format poses challenges but also simplifies some processes. Many features that would normally be built separately for each Tale are shared as part of the base game. This makes development simpler, faster, and cheaper than if each Tale were a standalone game:

- Structural system code is written only once.
- Art and sound assets can be reused in many places, including player customization.
- Narrative and meta-progression systems cover areas that an individual Tale might struggle with.

> Plenty of games with this format work very well. The point is that they could be even more successful without these issues.

Many games with sub-games or sequels follow the same pattern:

1. A title is funded, developed, and launched.
2. It exceeds revenue expectations, and stakeholders rush to capitalize on the IP.
3. A sequel or spin-off begins production, either standalone or attached to the original.

Because the original project didn't expect a sequel, many parts of its narrative, gameplay, or implementation don't account for expansion. Each new entry then needs many adaptations. This rarely goes smoothly and can lead to narrative inconsistencies, user-experience problems, and technical debt.

Grand Tale avoids this by planning for expansion from the start of its design. The model depends on a hopeful assumption that the project will succeed enough to expand. The base game still stands on its own without any additional Tales.

## Why Is Grand Tale Being Made?

### Additional Ambition: Development Transparency

Many obstacles came up during development. One of the most frustrating was how hard it is to find information about how large-scale projects are run.

Companies often keep operations secret for legal, security, or game-integrity reasons. That unfortunately hinders the wider developer ecosystem.

The goal is for Grand Tale to be a reference for running a complex project, so others can learn from it and avoid the same struggles. Options under study include publishing internal operations such as issue trackers, and keeping this entire documentation publicly available.

## Team

- Daniel Marchi

## Tools

Grand Tale is developed and managed with:

- [Unreal Engine 5](https://www.unrealengine.com/)
- [Space](https://www.jetbrains.com/space/)
- [Rider](https://www.jetbrains.com/rider/)
- [DataGrip](https://www.jetbrains.com/datagrip/)
- [WebStorm](https://www.jetbrains.com/webstorm/)
- [Writerside](https://www.jetbrains.com/writerside/)
- [Blender](https://www.blender.org/)

The project is hosted in a [Git](https://git-scm.com/) repository, with plans to migrate to [Perforce](https://www.perforce.com/) in the future. Related files are hosted in [Google Drive](https://www.google.com/drive).

Still to write: why Unreal Engine, why JetBrains, and why Blender.

## Frequently Asked Questions

### When will Grand Tale release?

Grand Tale is in constant development but is not officially funded. Efforts to secure funding and begin production are in progress, but no timeline can be estimated yet.

### How can I participate?

Voluntary contributions are always welcome, provided your skills match what the project currently needs.

The project occasionally hires freelance developers, but is not currently hiring full-time employees.

To support the project financially or otherwise, contact [danielmarchi@rimelight.com](mailto:danielmarchi@rimelight.com).
