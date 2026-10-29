# Control Scheme

## Enhanced Input

Grand Tale uses the [Enhanced Input Plugin](https://dev.epicgames.com/documentation/unreal-engine/enhanced-input-in-unreal-engine) by Epic Games.

- Modifier keys give a secondary and tertiary action on the same key. By default these are Ctrl and Shift.
- With the current Enhanced Input implementation, modifiers can be remapped.
- The Alt key is avoided where possible, because it is tied to many operating system functions.
- NumPad keys are used, but assigned non-vital functions, because many keyboards don't have them.
- The top row Function Keys are reserved for (not yet defined).

## Key Groups

The keyboard (standard QWERTY, 100% layout) is split into two groups:

- **General Grand Tale keys:** work the same across all contexts in the game.
- **Tale-specific keys:** context-dependent.

## Implementation

- The `IMC_GT_InputMappingContext` class should contain all input mappings (not yet complete).
- Any player controller should inherit from `BP_GT_PlayerController` and add new Input Mapping Contexts as needed.
