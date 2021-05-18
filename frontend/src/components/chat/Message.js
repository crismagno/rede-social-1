import React, { useState } from 'react'
import { Image, Text, View, StyleSheet, Dimensions, TouchableOpacity, TouchableWithoutFeedback, ToastAndroid, TextInput } from "react-native";
import helpers from '../../helpers/index'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import axios from 'axios'
import { Video } from 'expo-av'
import moment from 'moment'
import 'moment/dist/locale/pt-br'

const URL_API = helpers.URL_API
const widthDimension = Dimensions.get('window').width
const heightDimension = Dimensions.get('window').height

import * as Speech from 'expo-speech';
import MessageAudio from './MessageAudio'

import { useSelector, useDispatch } from 'react-redux'
import Talk from '../talk/Talk';

export default props => {

    const user = useSelector(state => state.user)

    const [showRemove, setShowRemove] = useState(false)
    const [showMessage, setShowMessage] = useState(false)
    const [objStyleImage, setObjStyleImage] = useState({})
    const [objStyleImageView, setObjStyleImageView] = useState({})

    const [showEditMessage, setShowEditMessage] = useState(false)
    const [message, setMessage] = useState(props.message.content)
    

    const { _id, sentBy, receivedBy, type, createdAt, content, temp, usersViewMessage } = props.message
    const { _id: myId } = props.user
    const { removeMessage } = props

    const messageIsMy = sentBy['_id'] === myId || sentBy === myId 

    const verifyMessageIsView = () => {
        if (usersViewMessage && props.talk.users.length == usersViewMessage.length) {
            return <MaterialCommunityIcons name="check-circle-outline" size={11} color="#197F4F"/>
        } else {
            return <MaterialCommunityIcons name="check-circle-outline" size={11} color="#0004"/>
        }
    }

    const timeEditMessage = () => {
        let timeMessage = moment().diff(props.message.createdAt, 'minutes')

        return timeMessage < 2
    }

    const execRemoveMessage = (
        <TouchableOpacity style={styles.btnRemove} 
            onPress={() => removeMessage(_id)}> 
            <EvilIcons name="trash" size={30} color="#f44336"/>
        </TouchableOpacity>
    ) 

    const showBigImageMessage = () => {
        if (showMessage) {
            setObjStyleImage({})
            setObjStyleImageView({})
            setShowMessage(false)
        } else {
            setObjStyleImage({
                width: widthDimension - 16,
                height: 400
            })

            setObjStyleImageView({
                width: widthDimension - 10,
                height: 406
            })
            setShowMessage(true)
        }
    }

    function speak() {
        var thingToSay = 'oi tudo bom como vai'
        Speech.speak(content)
    }

    const renderMedia = () => {
        if (type == 'text') {
            return <TouchableOpacity style={bubbleStyleText}> 
                <View style={styles.textSpeak}>
                    {/* <TouchableOpacity style={styles.speak}
                        onPress={speak}>
                        <Feather name="speaker" size={13} />
                    </TouchableOpacity> */}
                    <Text style={styles.textContent}>{content}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginRight: -3}}>
                    <TouchableOpacity style={styles.speak}
                        onPress={speak}>
                        <MaterialIcons name="record-voice-over" size={12} />
                    </TouchableOpacity>
                    {   timeEditMessage() && 
                        messageIsMy && <TouchableOpacity 
                            onPress={() => setShowEditMessage(!showEditMessage)}>
                            <Feather name="edit" size={11} style={{ marginRight: 3 }} />
                        </TouchableOpacity> 
                    }
                    <Text style={styles.textDate}>{ moment(createdAt).format('hh:mm') }</Text>
                    {
                        temp ? <EvilIcons name="clock" size={12} color="#000"/> :
                            verifyMessageIsView()
                    }
                </View>
            </TouchableOpacity>
        } else if (type == 'image') {
            return <TouchableOpacity style={[bubbleStyleImage, objStyleImageView]}
                onPress={() => [showBigImageMessage()] }> 
                <Image style={[styles.messageImage, objStyleImage]} source={{ uri: `${URL_API}/files/messages?file=${content}` }} />  
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginRight: 2}}>
                    <Text style={styles.textDate}>{ moment(createdAt).format('hh:mm') }</Text>
                    {
                        temp ? <EvilIcons name="clock" size={12} color="#000"/> :
                            verifyMessageIsView()
                    }
                </View>
            </TouchableOpacity>
        } else if (type == 'video') {
            return <TouchableOpacity style={[bubbleStyleVideo, objStyleImageView]}
                onPress={() => [showBigImageMessage()]}> 
                <Video
                    style={[styles.messageVideo, objStyleImage]}
                    source={{ uri: `${URL_API}/files/messages?file=${content}` }}
                    rate={1.0}
                    volume={1.0}
                    resizeMode="stretch"
                    shouldPlay={false}
                    isLooping={true}
                    useNativeControls={true}
                    positionMillis={10}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginRight: 2}}>
                    <Text style={styles.textDate}>{ moment(createdAt).format('hh:mm') }</Text>
                    {
                        temp ? <EvilIcons name="clock" size={12} color="#000"/> :
                            verifyMessageIsView()
                    }
                </View>
            </TouchableOpacity>
        } else if (type == 'audio') {
            return <TouchableOpacity style={bubbleStyleAudio}> 
                    <Image style={styles.imageAvatar} source={{ uri: `${URL_API}/files?file=${user.avatar}` }} />  
                    <MessageAudio content={content} date={moment(createdAt).format('hh:mm')} />
                </TouchableOpacity>
        }
    }

    const messageStyles = [
        styles.containerMessage,
        messageIsMy ? styles.containerRight : styles.containerLeft,
        showRemove && styles.removeMessage
    ]

    const bubbleStyleText = [
        messageIsMy ? styles.bubbleRight : styles.bubbleLeft 
    ]

    const bubbleStyleImage = [
        messageIsMy ? styles.bubbleRightImage : styles.bubbleLeftImage 
    ]

    const bubbleStyleVideo = [
        messageIsMy ? styles.bubbleRightVideo : styles.bubbleLeftVideo
    ]

    const bubbleStyleAudio = [
        messageIsMy ? styles.bubbleRightAudio : styles.bubbleLeftAudio
    ]

    const updateMessageEdit = () => {

        props.updateMessageEdit(props.message._id, message)
        setShowEditMessage(false)
    }


    return (
        <TouchableOpacity style={messageStyles}
            onPress={() => [setShowRemove(false)]}
            onLongPress={() => setShowRemove(true)}
            delayLongPress={0.5}>
            { 
                showEditMessage && 
                <View style={styles.viewEditMessage}>
                    <TextInput
                        style={styles.inputEditMessage}
                        value={message}
                        placeholder="Escreva..."
                        multiline={true}
                        // numberOfLines={4}
                        onChangeText={message => setMessage(message)}
                    />
                    <TouchableOpacity 
                        style={{ marginLeft: 3}}
                        onPress={() => updateMessageEdit()}>
                        <MaterialCommunityIcons name="send" size={15} color="#5d99c6" />  
                    </TouchableOpacity>
                </View>
            }
            { showRemove ? execRemoveMessage : <View></View> }
            {renderMedia()}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    containerMessage: {
        width: widthDimension,
        minHeight: 30,
        paddingHorizontal: 5,
        marginBottom: 4,
    },

    removeMessage: {
        backgroundColor: '#0002'
    },  

    containerLeft: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: "center",
    },

    containerRight: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
    },

    bubbleLeft: {
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: "flex-end",
        maxWidth: widthDimension - 100,
        paddingHorizontal: 10,
        paddingVertical: 3,
        backgroundColor: '#c3fdff',
        borderRadius: 8,
        borderTopLeftRadius: 0,

        shadowColor: '#0005',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },

    bubbleRight: {
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: "flex-end",
        maxWidth: widthDimension - 100,
        paddingHorizontal: 10,
        paddingVertical: 3,
        backgroundColor: '#90caf9',
        borderRadius: 8,
        borderTopRightRadius: 0,
        
        shadowColor: '#0005',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },

    bubbleLeftImage: {
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: "flex-end",
        // maxWidth: widthDimension - 100,
        padding: 3,
        backgroundColor: '#c3fdff',
        borderRadius: 8,
        borderTopLeftRadius: 0,

        shadowColor: '#0005',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },

    bubbleRightImage: {
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: "flex-end",
        // maxWidth: widthDimension - 100,
        padding: 3,
        backgroundColor: '#90caf9',
        borderRadius: 8,
        borderTopRightRadius: 0,
        
        shadowColor: '#0005',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },

    bubbleLeftVideo: {
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: "flex-end",
        // maxWidth: widthDimension - 100,
        padding: 3,
        backgroundColor: '#c3fdff',
        borderRadius: 8,
        borderTopLeftRadius: 0,

        shadowColor: '#0005',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },

    bubbleRightVideo: {
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: "flex-end",
        // maxWidth: widthDimension - 100,
        padding: 3,
        backgroundColor: '#90caf9',
        borderRadius: 8,
        borderTopRightRadius: 0,
        
        shadowColor: '#0005',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },

    bubbleRightAudio: {
        maxWidth: 275,
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: "center",
        // maxWidth: widthDimension - 100,
        padding: 5,
        backgroundColor: '#90caf9',
        borderRadius: 8,
        borderTopRightRadius: 0,
        
        shadowColor: '#0005',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },

    bubbleLeftAudio: {
        maxWidth: 275,
        position: 'relative',
        flexDirection: 'row-reverse',
        justifyContent: 'flex-end',
        alignItems: "center",
        // maxWidth: widthDimension - 100,
        padding: 5,
        backgroundColor: '#c3fdff',
        borderRadius: 8,
        borderTopLeftRadius: 0,

        shadowColor: '#0005',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },

    textDate: {
        fontSize: 9,
        // marginLeft: 40,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        // color: '#FFF'
    },

    textImageDate: {
        position: 'absolute',
        fontSize: 9,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        color: '#FFF',
        bottom: 4,
        right: 7,
    },

    textVideoDate: {
        position: 'absolute',
        fontSize: 9,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        color: '#FFF',
        bottom: 4,
        right: 7,
    },

    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 5
    },

    messageVideo: {
        width: 200,
        height: 200,
        borderRadius: 5
    },

    textContent: {
        // color: '#FFF'
    },

    btnRemove: {
        // borderWidth: 1,
        padding: 6.2,
        marginLeft: 10
    },

    imageAvatar: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginLeft: 2,
        marginRight: 5
    },

    textSpeak: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },

    speak: {
        // marginLeft: -5,
        marginRight: 3,
        // marginTop: 3
    },

    viewEditMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        width: 200,
        borderWidth: 1,
        borderColor: '#0001',
        backgroundColor: '#FFF',
        color: '#000',
        padding: 5,
        fontSize: 15,
        borderRadius: 10,
        maxHeight: 50,
        marginRight: 3
    },

    inputEditMessage: {
        flex: 1,
        width: 200,
        borderWidth: 1,
        borderColor: '#0001',
        backgroundColor: '#FFF',
        color: '#000',
        fontSize: 15,
        borderRadius: 10,
        maxHeight: 50,
        paddingHorizontal: 2
    }
}) 