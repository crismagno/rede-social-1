import React from 'react'
import { Image, Text, View, StyleSheet, Dimensions, TouchableOpacity, ToastAndroid } from "react-native";
import helpers from '../../helpers/index'
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons'
import IconFT from 'react-native-vector-icons/Feather'
import IconSimple from 'react-native-vector-icons/SimpleLineIcons'
import axios from 'axios'
import { Video } from 'expo-av'
import moment from 'moment'
import 'moment/locale/pt-br'

const URL_API = helpers.URL_API
const widthDimension = Dimensions.get('window').width
const heightDimension = Dimensions.get('window').height

import { useSelector, useDispatch } from 'react-redux'

export default props => {

    let { talk } = props

    const user = useSelector(state => state.user)
	const dispatch = useDispatch({})

    const getUser = () => {
        return talk.users.filter(u => u._id !== user._id)[0]
    }

    const previewMessage = type => {
        
        switch(type) {
            case 'text': 
                return <Text style={styles.textDescription}>{helpers.truncate(talk.lastMessageInteraction.content, 20)}</Text>  
            case 'image': 
                return ( <View style={styles.previewMessage}>
                    <IconFT name="image" size={15} color='#0005' />  
                    <Text style={styles.textPreview}>Imagem</Text>
                </View> )
            case 'video': 
                return ( <View style={styles.previewMessage}>
                    <IconFT name="video" size={15} color='#0005' /> 
                    <Text style={styles.textPreview}>Video</Text>
                </View> )
            case 'audio': 
                return ( <View style={styles.previewMessage}>
                    <IconSimple name="microphone" size={14} color='#0005' /> 
                    <Text style={styles.textPreview}>Audio</Text>
                </View> )
            case 'document': 
                return ( <View style={styles.previewMessage}>
                    <IconMCI name="document" size={18} color='#0005' />
                    <Text style={styles.textPreview}>Documento</Text>
                </View> )
            default:
                return <Text style={styles.textDescription}>{helpers.truncate(talk.lastMessageInteraction.content, 20)}</Text>  
        }
    }


    return (
        <TouchableOpacity style={styles.container} onPress={() => props.goChat(props.talk)}>
            <TouchableOpacity onPress={() => props.previewTalk(getUser())}>
                <Image style={styles.imageAvatar} source={{ uri: `${URL_API}/files?file=${getUser().avatar}` }} /> 
            </TouchableOpacity>
            <View style={styles.TalkCenter}>
                <Text style={styles.textName}>{getUser().name}</Text>
                {previewMessage(talk.lastMessageInteraction.contentType)} 
            </View> 
            <View style={styles.TalkRight}>
                <Text style={styles.timeLastInteraction}>{moment(talk.lastMessageInteraction.timestamp).format('HH:mm')}</Text>
                {talk.countUnread > 0 ? 
                    <Text style={styles.countNewMessages}>{helpers.truncate(String(talk.countUnread), 4)}</Text>
                    :
                    <View />
                }
                <View></View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: "center",
        width: widthDimension - 20,
        backgroundColor: '#FFF',
        // borderBottomWidth: 1,
        borderColor: "#0001",
        paddingHorizontal: 5,
        height: 80,
        marginBottom: 8,
        borderRadius: 5,

        shadowColor: '#0005',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },

    imageAvatar: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 7,
    },  

    TalkCenter: {
        flex: 4,
        justifyContent: 'center',
        alignItems: "flex-start",
        height: 70,
        // borderTopWidth: 1,
        // borderBottomWidth: 1,
        // borderColor: "#0001", 
        // backgroundColor: '#0001'

    },

    TalkRight: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: "center", 
    },

    textName: {
        color: '#0009',
        fontWeight: 'bold'
    },

    textDescription: {
        color: '#0009',
        fontSize: 11
    },

    btnGoChat: {
        justifyContent: 'center',
        alignItems: "center", 
        marginVertical: 3
    },

    timeLastInteraction: {
        fontSize: 11,
        color: '#0005'
    },

    previewMessage: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    textPreview: {
        color: '#0006',
        fontSize: 13,
        marginLeft: 5
    },

    countNewMessages: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#90caf9',
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        paddingVertical: 3.6,
        paddingHorizontal: 8,
        borderRadius: 100,
        marginVertical: 5,
        // minWidth: 23
    }
})
