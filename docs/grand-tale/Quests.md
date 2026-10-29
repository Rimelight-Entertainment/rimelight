# Quests

Quests are the main narrative experience in Grand Tale, and one of the main sources of unlocks and rewards. They mostly follow a linear story and are meant to be played once. They can include puzzles, combat encounters, skilling segments, and dialogue.

Design note: there is no need for a Quest Bag or similar. The quest itself tracks any progress it needs. Objects can be abstracted: for "collect 10 items," the quest tracks the count, and its appearance in the UI implies you have the item.

## Quest Properties

- Quest giver
- Type
- Length
- Difficulty
- Timeline
- Series
- Requirements
- Description

## Quest Giver

A quest giver is an NPC you must talk to in order to start a quest. An NPC with an available quest shows an exclamation mark above its head. The mark is grey if the player doesn't yet meet the quest's requirements, and yellow if they do.

## Quest Types

### Encounter Quest

Related to the current content, for example "Destroy the enemy Heart" in a Heartbringer match. Given automatically when an encounter begins.

### Story Quest

Story quests make up the majority of quests. They are not tied to a specific aspect of the game. They are narrative experiences that follow different people, cultures, and world events. Requirements and rewards vary widely, with no set formula.

### Character Quest

Character quests can only be completed by a specific character.

- **Hero quests:** exclusive to a specific Hero, and a personal narrative for that character. The first quest in each series is the game's tutorial, and a player's first action when they first play a Hero. Later quests gate further abilities for the Hero, and require the Hero to be above certain levels.
- **Artisan quests:** similar in purpose to Hero quests, but for Artisans. They show a player's progress through a skill and its guild. The first quest is a mandatory tutorial for the skill. Later quests gate further functionality in the guild. Requirements include specific skill levels and amounts of reputation in the guild.

### Relationship Quest

Not yet written.

### Guide Quest

Teaches a system or mechanic. Open question: should these be world quests, or "main storyline" quests like Genshin's Archon quests?

- **Area quests:** not yet written.
- **Activity quests:** act as tutorials for activities, and situate them in the world narratively. Like skill quests, the first quest in a series is required to access the activity. Later quests unlock more content and benefits.

## Quest Length

Quest length is an estimate of the time a player should expect to invest. Quests fall into three tiers: Short, Medium, and Long. Length is independent of difficulty.

## Quest Difficulty

Quests have four difficulty levels: Novice, Adept, Veteran, and Master. Difficulty gives players a rough idea of the challenges and rewards to expect. It also indicates the intended storyline and gameplay significance of the quest and its requirements.

## Quest Timeline

All quests are part of the world's storyline. They can be played out of chronological order, but each quest has a timeline date for player comprehension. Dates are given by year only, to leave room for adjusting the precise chronology.

## Quest Series

Every quest belongs to a series. A series is a narrative storyline that follows a sequence of four quests, from Novice to Master. Later quests in a series are direct sequels to earlier ones. Multiple series can form a larger overarching narrative, with each series treated as its own arc.

Open question: should series be split into acts?

## Requirements

Most quests have several requirements before they can start. These may include:

- Skill levels
- Other quest completions
- Fame
- Achievements
- Progress in activities
- Owning characters above a certain combat level

All requirements must be met before starting, even if they refer to events later in the quest. Quests in a series require the previous quests to be completed.

Guidelines for combat and skill requirements, by difficulty:

| Difficulty | Level Range |
| ---------- | ----------- |
| Novice     | 1 to 25     |
| Adept      | 25 to 50    |
| Veteran    | 50 to 75    |
| Master     | 75 to 100   |

## Rewards

### Experience Tomes

Every quest gives two experience tomes. Size depends on difficulty:

| Difficulty | Tomes                     |
| ---------- | ------------------------- |
| Novice     | Small Experience Tome x2  |
| Adept      | Medium Experience Tome x2 |
| Veteran    | Large Experience Tome x2  |
| Master     | Huge Experience Tome x2   |

### Fame

Fame is a points system awarded when a quest is completed. It measures how accomplished a player is in quests, and gates rewards and benefits across the game. Fame depends on difficulty:

- Novice: 1
- Adept: 2
- Veteran: 3
- Master: 4

### Attribute Points

Completing a Master quest also grants 5 attribute points to all characters.

### Other Rewards

Quest rewards may also include content unlocks, special items, regular items, titles, skins, and other items.

## Quest Journal

The Quest Journal shows the quest list and a step-by-step progress view for active quests. After a quest is completed, that section shows a recap of what happened.
