const INITIAL_STATE = {}

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case 'INSERT_TALK_CHAT':
            return { ...action.payload }
        default: 
            return state
    }
}