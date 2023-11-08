export enum PlayerState {
    SelectAction,
    ReadMessage
}

export enum PlayerAction {
    Fight,
    Escape,
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
}

const PlayerPower = 100
const EnemyPower = 20

function reserveMessage(state: GlobalState, message: string) {
    state.messages = [...state.messages, message]
}

function takeMessage(state: GlobalState): string {
    const message = state.messages[0]
    state.messages = state.messages.slice(1)

    return message
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
export const globalStateReducer: React.Reducer<GlobalState, {type: string}> = (state: GlobalState, action: {type: string}) => {
    let newState = {...state}

    if (action.type === 'changeAction') {
        const nextAction = state.selectedAction === PlayerAction.Fight ? PlayerAction.Escape : PlayerAction.Fight

        newState.selectedAction = nextAction
    } else if (action.type === 'confirm') {
        const playerAction = state.selectedAction === PlayerAction.Fight ? PlayerAction.Fight : PlayerAction.Escape
        if (state.playerState == PlayerState.ReadMessage) {
            // do nothing
        } else if (playerAction === PlayerAction.Fight) {
            fight(newState)
        } else if (playerAction === PlayerAction.Escape) {
            reserveMessage(newState, 'しかしにげることはできない')
        }

        const message = takeMessage(newState)
        newState.message = message
    }
    changeState(newState)

    console.log(newState)
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
    playerHealth: 240
}
