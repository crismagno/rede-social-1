const INITIAL_STATE = {
    name: '',
    avatar: '',
    online_at: false
}

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case 'CHANGE_NAME':
            return { ...state, name: action.payload }
        case 'CHANGE_AVATAR':
            return { ...state, avatar: action.payload }
        case 'CHANGE_PASSWORD':
            return { ...state, password: action.payload }
        case 'CHANGE_ONLINE':
            return { ...state, online_at: action.payload }
        case 'CHANGE_USER':
            return { ...action.payload }
        default: 
            return state
    }
}