enum HexplorationState {
    Unexplored = "Unexplored",
    Explored = "Explored",
    Claimed = "Claimed"
}

const hexplorationStateColor: { [key in keyof typeof HexplorationState]: string } = {
    [HexplorationState.Unexplored]: "black",
    [HexplorationState.Explored]: "black",
    [HexplorationState.Claimed]: "#4169e1"
}

const hexplorationStateOpacity: { [key in keyof typeof HexplorationState]: number } = {
    [HexplorationState.Unexplored]: 0.8,
    [HexplorationState.Explored]: 0.125,
    [HexplorationState.Claimed]: 0.3
}

export { HexplorationState, hexplorationStateColor, hexplorationStateOpacity }