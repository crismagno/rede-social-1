const INITIAL_STATE = {
    socket: null
}

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case 'CREATE_SOCKET':
            return { socket: action.payload }
        case 'DELETE_SOCKET':
            return { socket: null }
        default: 
            return state
    }
}