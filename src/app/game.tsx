export enum PlayerState {
    SelectAction,
    ReadMessage
}

export enum PlayerAction {
    Fight,
    Escape,
}

export enum PlayerActionCommand {
    Fight,
    Escape,
    NextMessage
}

export enum GamePhase {
    Playing,
    Cleared,
    GameOver
}

enum ControllerAction {
    ChangeAction,
    Confirm
}

type GlobalState = {
    selectedAction: PlayerAction,
    playerState: PlayerState,
    message: string | null,
    messages: string[],
    enemyHealth: number,
    gamePhase: GamePhase
    playerHealth: number
    playerInitialHealth: number
    drawHandler: () => void
}

const PlayerPower = 100
const EnemyPower = 20

function reserveMessage(state: GlobalState, message: string) {
    state.messages = [...state.messages, message]
}

function changeState(state: GlobalState) {
    if (state.message) {
        state.playerState = PlayerState.ReadMessage
    } else {
        state.playerState = PlayerState.SelectAction
    }

    if (state.enemyHealth <= 0 && state.playerState != PlayerState.ReadMessage) {
        state.gamePhase = GamePhase.Cleared
    }
    if (state.playerHealth <= 0 && state.playerState != PlayerState.ReadMessage) {
        state.gamePhase = GamePhase.GameOver
    }
}

function fight(state: GlobalState) {
    const enemyDamage = PlayerPower + Math.floor(Math.random() * PlayerPower / 10)
    state.enemyHealth = state.enemyHealth - enemyDamage
    state.drawHandler()
    reserveMessage(state, `ゆうしゃのこうげき\nスライムに${enemyDamage}のダメージ`)

    if (state.enemyHealth > 0) {
        const playerDamage = EnemyPower + Math.floor(Math.random() * EnemyPower / 10)
        state.playerHealth =  Math.max(state.playerHealth - playerDamage, 0)
        reserveMessage(state, `スライムのこうげき\nゆうしゃに${playerDamage}のダメージ`)
    }
    if (state.enemyHealth <= 0) {
        reserveMessage(state, 'スライムをたおした')
    }
    if (state.playerHealth <= 0) {
        reserveMessage(state, 'ゆうしゃはしんでしまった')
    }
}

function consumeMessage(state: GlobalState){
    const message = state.messages[0]
    state.messages = state.messages.slice(1)
    state.message = message
}

function executePlayerAction(command: PlayerActionCommand, state: GlobalState) {
    if (command === PlayerActionCommand.Fight) {
        fight(state)
    } else if (command === PlayerActionCommand.Escape) {
        reserveMessage(state, 'しかしにげることはできない')
    } else if (command === PlayerActionCommand.NextMessage) {
        // do nothing
    }

    consumeMessage(state)
}

export const globalStateReducer: React.Reducer<GlobalState, {type: string}> = (state: GlobalState, action: {type: string}) => {
    let newState = {...state}

    if (action.type === 'changeAction') {
        const nextAction = state.selectedAction === PlayerAction.Fight ? PlayerAction.Escape : PlayerAction.Fight

        newState.selectedAction = nextAction
    } else if (action.type === 'confirm') {
        let command;

        if (state.playerState == PlayerState.ReadMessage) {
            command = PlayerActionCommand.NextMessage
        } else {
            command  = state.selectedAction === PlayerAction.Fight ?
                PlayerActionCommand.Fight :
                PlayerActionCommand.Escape
        }

        executePlayerAction(command, newState)
    }
    changeState(newState)

    return newState
}

export const initialState : GlobalState= {
    selectedAction: PlayerAction.Fight,
    playerState: PlayerState.SelectAction,
    message: null,
    messages: [],
    enemyHealth: 1000,
    gamePhase: GamePhase.Playing,
    playerInitialHealth: 240,
    playerHealth: 240,
    drawHandler: () => {}
}
