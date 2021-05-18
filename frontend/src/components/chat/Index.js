import React, { useState, useEffect, useRef, Fragment } from 'react'
import { Image, Text, View, StyleSheet, Dimensions, TextInput, Alert,
    TouchableOpacity, ToastAndroid, AsyncStorage, FlatList, Button, ImageBackground } from "react-native"
import helpers from '../../helpers/index'
import axios from 'axios'

import Message from './Message'
import * as ImagePicker from 'expo-image-picker';

const URL_API = helpers.URL_API
const widthDimension = Dimensions.get('window').width
const heightDimension = Dimensions.get('window').height

import { useSelector, useDispatch } from 'react-redux'

import * as DocumentPicker from 'expo-document-picker';
import AudioComponent from './Audio'
import { Video } from 'expo-av'

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'

import CameraFriends from './Camera'


export default props => {

    const user = useSelector(state => state.user)
    const talk = useSelector(state => state.talk)
	const socket1 = useSelector(state => state.socket)
    const dispatch = useDispatch({})

    const [ messages, setMessages ] = useState([])
    const [ message, setMessage ] = useState('')
    const [ enableLoadCenter, setEnableLoadCenter ] = useState(true)
    const [ enableLoadNewMessage, setEnableLoadNewMessage ] = useState(false)
    const [ medias, setMedias ] = useState(null)
    const [ showCreateAudio, setShowCreateAudio ] = useState(false)
    const [ showMoreMedias, setShowMoreMedias ] = useState(false)
    const [ showCamera, setShowCamera ] = useState(false)
    const [ initWithVideo, setInitWithVideo ] = useState(false)
    const [ isBottomScroll, setIsBottomScroll ] = useState(true)
    const [ loadSendMedias, setLoadSendMedias ] = useState(false)
    const [ progressSendMidia, setProgressSendMidia ] = useState({
        percent: 0,
        loaded: 0,
        total: 0
    })

    let scrollMessages = useRef(null)

    useEffect(() => {

        updateMessagesUnread()
        
        getMessages(true)
            .then(() => {
                onSomeEvent(100)
            })

        socket1.socket.on(`socket-message-${talk._id}`, data => {
            messageReceived(data.message)
            onSomeEvent(100)
        })

        // socket de mensagens visualizadas
        socket1.socket.on(`socket-messages-views-${talk._id}`, data => {
            data.messages.forEach(mess => {
                updateMessageReceivedComponent(mess)
            })
        })

        //mensagem editada
        socket1.socket.on(`socket-message-edit-${talk._id}`, data => {
            data.messages.forEach(mess => {
                updateMessageEditComponent(mess)
            })
        })

    }, [])

    const showToast = (text, time = 'LONG') => {
        ToastAndroid.show(String(text), ToastAndroid[time])
    }

    const getMessages = async (enableLoadCenter = false) => {

        if(enableLoadCenter) {
            setEnableLoadCenter(true)
        }
        try {
            const response = await axios.get(`${URL_API}/messages/all/${talk._id}?limit=${messages.length+30}&skip=${0}`)
            setMessages(messages => response.data.reverse())
            
        } catch (error) {
            showToast('Erro ao buscar conversas')
        } finally {
            setEnableLoadCenter(false)
            setEnableLoadNewMessage(false)
        }
    }

    const handleScroll = async (event) => {
        let scrollIsTop = event.nativeEvent.contentOffset.y == 0
        if (scrollIsTop) {
            setEnableLoadNewMessage(true)
            await getMessages()
        }

        let scrollIsBottom = String(event.nativeEvent.contentOffset.y + event.nativeEvent.layoutMeasurement.height).split(".")[0]

        let heightScroll = String(event.nativeEvent.contentSize.height).split(".")[0]

        if (scrollIsBottom == heightScroll) {
            setIsBottomScroll(true)
        } else {
            setIsBottomScroll(false)
        }
    }

    const scrollToTop = () => {
        if (scrollMessages) {
        }
    }

    const removeMessage = async messageId => {
        try {
            const response = await axios.delete(`${URL_API}/messages/${messageId}`)
            const messageRemove = response.data.messageId
            setMessages(messages => messages.filter(m => m._id !== messageRemove))
            showToast('mensagen deletada')
        } catch (error) {
            showToast('Erro ao deletar mensagem')
        }
    }

    const sendMessage = async content => {

        if(!content.trim()) {
            showToast('mensagem vazia...')
            setMessage('')
            return false
        }

        try {
            const requestBody = {
                sentBy: user._id,
                talkId: talk._id,
                content: content.trim(),
                type: 'text',
                temp: `${Math.random()-Date.now()}`
            }

            setMessages(messages => [...messages, requestBody])

            onSomeEvent(0)
            const response = await axios.post(`${URL_API}/messages`, requestBody)

            let messageCreate = response.data.message
            setMessages(messages => messages.map(message => {
                if (message.temp === response.data.temp) {
                    message = messageCreate
                    return message
                } else {
                    return message
                }
            }))
            
            setMessage('')
        } catch (error) {
            showToast('Erro ao enviar mensagem')
            setMessage('')
        }
    }

    const mimeTypeMedia = media => {
        let typeMessage = media.uri.split('.').reverse()[0]
        let mimeReturn = typeMessage
        if (typeMessage === 'mp4') {
            mimeReturn = 'video/mp4'
        } else if (typeMessage === 'jpg' || typeMessage === 'jpeg' || typeMessage === 'png') {
            mimeReturn = `image/${typeMessage}`
        }

        return mimeReturn
    }

    const sendMedias = async () => {

        if (!medias) {
            showToast('Mídias não selecionada.')
            return
        }

        setLoadSendMedias(true)

        const data = new FormData();
      
        data.append('medias', {
            name: 'post',
            type: mimeTypeMedia(medias),
            uri: Platform.OS === "android" ? medias.uri : medias.uri.replace("file://", "")
        })
        data.append('sentBy', user._id)
        data.append('talkId', talk._id)

        try {
            const response = await axios.post(`${URL_API}/messages/medias`, data, {
                onUploadProgress: (event) => {
                    const { loaded, total } = event
                    let percent = Math.floor( (loaded * 100) / total )
                    setProgressSendMidia({
                        percent,
                        loaded,
                        total
                    })
                  }
            })
            showToast('Midia  enviada.')

            let messageCreate = response.data
            setMessages(messages => [...messages, messageCreate])
            setMedias(null)

            onSomeEvent(500)
            setLoadSendMedias(false)

        } catch (error) {
            showToast('ERROR ao enviar midia.')
            setLoadSendMedias(false)
        } 
    };

    const messageReceived = newMessage => {
        if(newMessage.sentBy !== user._id) {
            updateMessageReceived(newMessage)
            setMessages(messages => [...messages, newMessage])
        }
    }

    const imageLoad = () => (
        <ImageBackground style={{ flex: 1,  width: widthDimension, height: heightDimension, justifyContent: 'center', alignItems: 'center' }} 
            source={require('./../../../assets/background-chat2.jpg')} >
            <Image style={{ width: 70, height: 70}} source={require('./../../../assets/load-palet.gif')} />
        </ImageBackground>
    )

    const renderMessages = () => (
        <ImageBackground style={styles.chatCenter} source={require('./../../../assets/background-chat2.jpg')} >
            { messages.length === 0 ? 
                <Text style={{marginTop: heightDimension/2.5}}></Text> 
                :
                <Fragment>
                    {
                        enableLoadNewMessage && 
                        <View style={{width: widthDimension, alignItems: 'center',}}>
                            <Image style={{ width: 70, height: 70}} source={require('./../../../assets/load-spinner.gif')} />
                        </View>
                    }
                    <FlatList style={styles.scrollMessages}
                        data={messages}
                        renderItem={({ item }) => (
                            <Message 
                                message={{...item}}
                                removeMessage={removeMessage}
                                user={{...user}}
                                talk={talk}
                                updateMessageEdit={updateMessageEdit}
                            /> 
                            )
                        }
                        keyExtractor={item => item._id}
                        ref={scrollMessages}
                        onScroll={handleScroll}
                    />
                </Fragment>

            }
            
            <View style={styles.buttonsTopBottomMessages}>
                {/* <TouchableOpacity style={styles.btnTopMessage}
                    onPress={() => scrollToTop()}>
                    <FontAwesome name={'angle-double-up'} size={20} color='#FFF' />      
                </TouchableOpacity> */}
                {!isBottomScroll && <TouchableOpacity style={styles.btnBottomMessage}
                    onPress={() => onSomeEvent(10)}>
                    <FontAwesome name={'angle-double-down'} size={20} color='#FFF' />      
                </TouchableOpacity>}
            </View>
            
        </ImageBackground>
    )

    const userTalk = () => talk.users.filter(u => u._id !== user._id)[0]

    const onSomeEvent = time => {
        setTimeout(() => {
            if (scrollMessages && scrollMessages.current) {
                scrollMessages.current.scrollToEnd()
            }
        }, time)
    }

    const _pickImage = async () => {
        try {

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [50, 50],
                quality: 1,
                allowsMultipleSelection: true
            });

            if (!result.cancelled) {
                setMedias(result)
            }

        } catch (E) {
            console.log(E);
        }
    };

    const _pickFiles = async () => {
        // Pick a single file
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                multiple: true
            })

            if (result.type !== 'cancel') {
                setMedias(result)
            }
        } catch (err) {
            console.log(err)
        }
    }
    
    const renderImageOrVideo = (file) => {
        let type = mimeTypeMedia(file).split('/')[0]
        if (type == 'image') {
            return <Image style={styles.previewSendMedia} source={{ uri: file.uri }} />
        } else {
            return <Video
                style={styles.previewSendMedia} 
                source={{uri: file.uri}}
                rate={1.0}
                volume={1.0}
                resizeMode="stretch"
                shouldPlay={false}
                isLooping={false}
                useNativeControls={true}
                positionMillis={10}
            />
        }
    }

    const renderMediasView = () => {
        return (medias && 
        <View style={styles.containerRenderMedias}> 
            {
                loadSendMedias && 
                <View style={styles.loadSendMedias}>
                    <Image style={{ width: 70, height: 70}} source={require('./../../../assets/load-spinner.gif')} />
                    <Text style={{ color: '#FFF', fontSize: 16}}>Enviando Mídia... {progressSendMidia.percent}%</Text>
                </View>
            }
            <View onResponderStart={true} style={styles.mediasView}>
                {renderImageOrVideo(medias)}  
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 90 }}>
                    <TouchableOpacity style={styles.btnCloseSendMedia} onPress={() => setMedias(null)}>
                        <Feather name="x" size={20} color='#FFF' /> 
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnSendMedia} onPress={() => sendMedias()}>
                        <MaterialCommunityIcons name="send" size={25} color='#FFF' />  
                    </TouchableOpacity>
                </View>
            </View>
        </View>)
    }

    const sendFileAudio = async fileAudio => {

        if (!fileAudio) {
            showToast('Audio não gravado...')
            return
        }

        const data = new FormData();
      
        data.append('medias', {
            name: 'audio',
            type: 'audio/mpeg',
            uri: Platform.OS === "android" ? fileAudio.uri : fileAudio.uri.replace("file://", "")
        })
        data.append('sentBy', user._id)
        data.append('talkId', talk._id)

        try {
            const response = await axios.post(`${URL_API}/messages/medias`, data)
            showToast('Midia  enviada.')

            let messageCreate = response.data
            setMessages(messages => [...messages, messageCreate])
            setMedias(null)

            onSomeEvent(100)

        } catch (error) {
            console.log(error)
            showToast('ERROR ao enviar midia.')
        } 

    }

    const renderMoreMedias = () => {
        return <View style={styles.moreMedias}>
            <TouchableOpacity style={styles.btnDocument}
                onPress={() => [_pickImage(), executeShowMoreMedias()]}>
                <Feather name="image" size={20} color='#FFF' />    
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnDocument}
                onPress={() => [setShowCamera(!showCamera), setInitWithVideo(true), executeShowMoreMedias()]}>
                <Feather name="video" size={20} color='#FFF' />   
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnDocument}
                onPress={() => [setShowCamera(!showCamera), setInitWithVideo(false), executeShowMoreMedias()]}>
                <Feather name="camera" size={20} color='#FFF' />    
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnDocument}
                onPress={() => [_pickFiles(), executeShowMoreMedias()]}>
                <Feather name="music" size={20} color='#FFF' />    
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnDocument}
                onPress={() => [_pickFiles(), executeShowMoreMedias()]}>
                <SimpleLineIcons name="paper-clip" size={20} color='#FFF' />     
            </TouchableOpacity>
        </View>
    }

    const executeShowMoreMedias = () => {
        if (showMoreMedias) {
            setShowMoreMedias(false)
        } else {
            setShowMoreMedias(true)
            setTimeout(() => {
                setShowMoreMedias(false)
            }, 5000)
        }
    }

    const takePicture = (picture) => {
        setMedias(picture)
        setShowCamera(false)
        setInitWithVideo(false)
    }

    const exitCamera = () => {
        setShowCamera(false)
    }

    const updateMessageReceived = async (messageReceiveUpdate) => {
        try {
            let response = await axios.put(`${URL_API}/messages/user-view/${messageReceiveUpdate._id}/${user._id}/${talk._id}`)
            // console.log(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    // atualizar mensagem visualizada 
    const updateMessageReceivedComponent = (messageViewUpdate) => {
        setMessages(messages => messages.map(message => {
            if (message._id === messageViewUpdate._id) {
                message = messageViewUpdate
                return message
            } else {
                return message
            }
        }))
    }

    const updateMessagesUnread = async () => {
        try {
            const response = await axios.put(`${URL_API}/messages/update-messages-unread/${user._id}/${talk._id}`)
            
        } catch (error) {
            console.log(error)
        }
    }

    const updateMessageEdit = async (messageId, newContent) => {
        try {
            const response = await axios.put(`${URL_API}/messages/update-message/${messageId}/${talk._id}`, {
                content: newContent
            })

        } catch (error) {
            console.log(error)
        }
    }

    // atualizar mensagem visualizada 
    const updateMessageEditComponent = (messageEditUpdate) => {
        setMessages(messages => messages.map(message => {
            if (message._id === messageEditUpdate._id) {
                message = messageEditUpdate
                return message
            } else {
                return message
            }
        }))
    }

    return (
        <View style={styles.container}>
            <View style={styles.chatHeader}>
                <TouchableOpacity style={styles.btnReturnTalks}
                    onPress={() => props.navigation.navigate('Talks')}>
                    <FontAwesome name="angle-left" size={20} color="#FFF"/>         
                    {/* <View style={styles.containerAvatar}> */}
                        <Image style={styles.imageAvatar} source={{ uri: `${URL_API}/files?file=${userTalk().avatar}` }} />  
                    {/* </View> */}
                    <Text style={styles.nameAuthor}>{userTalk().name}</Text>
                </TouchableOpacity>
                <View></View>
            </View>

            {enableLoadCenter ? imageLoad() : renderMessages()}

            {renderMediasView()}

            { showMoreMedias && renderMoreMedias()}

            <View style={styles.chatBottom}>
                <TextInput
                    style={styles.inputTextMessage}
                    value={message}
                    placeholder="Escreva..."
                    multiline={true}
                    // numberOfLines={4}
                    onChangeText={message => setMessage(message)}
                />
                <TouchableOpacity style={styles.btnAttach}
                    onPress={() => executeShowMoreMedias()}>
                    <Feather name={showMoreMedias ? 'x': 'more-vertical'} size={20} color='#FFF' />      
                </TouchableOpacity>
                {   message.trim() !== '' ?
                    <TouchableOpacity style={styles.btnSendMessage}
                        onPress={() => sendMessage(message)}>
                        <MaterialCommunityIcons name="send" size={20} color='#FFF' />     
                    </TouchableOpacity>
                    :
                    <TouchableOpacity style={styles.btnSendMessage}
                        onPress={() => setShowCreateAudio(!showCreateAudio)}>
                        {/* <FontAwesome name="microphone" color="#FFF" size={20} /> */}
                        <Feather name={showCreateAudio ? 'mic-off': 'mic'} size={20} color='#FFF' />      
                    </TouchableOpacity>
                }
            </View>

            {
                showCreateAudio && <AudioComponent executeEventSend={sendFileAudio}/>
            }

            {
                showCamera && 
                <View style={styles.containerCamera}>
                    <CameraFriends 
                        takePicture={takePicture} 
                        initWithVideo={initWithVideo}
                        exitCamera={exitCamera}
                    />
                </View>
            }

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: widthDimension,
        height: heightDimension,
        color: '#FFF',
        backgroundColor: '#FFF',
    },

    containerRenderMedias: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: widthDimension,
        height: heightDimension,
        backgroundColor: 'rgba(0, 0, 0, .9)',
        zIndex: 10000,
        left: 0,
        top: 0
    },

    mediasView: {
        justifyContent: 'flex-start',
        width: widthDimension,
        height: heightDimension-250,
        borderRadius: 1,
    },

    btnCloseSendMedia: {
        position: 'absolute',
        left: 10,
        bottom: 10,
        borderWidth: 1,
        padding: 17,
        borderRadius: 50,
        borderColor: '#FFF',

        shadowColor: '#90caf9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
        zIndex: 10000000

    },

    btnSendMedia: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        borderWidth: 1,
        padding: 15,
        borderRadius: 50,
        borderColor: '#FFF',

        shadowColor: '#90caf9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
        zIndex: 10000000
    },

    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // borderWidth: 1,
        paddingHorizontal: 4,
        width: widthDimension,
        height: 50,
        color: '#FFF',
        backgroundColor: '#5d99c6'
    },

    chatCenter: {
        flex: 1,
        width: widthDimension, 
        height: heightDimension, 
        paddingVertical: 5,  
    },

    chatBottom: {
        maxHeight: 150,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingVertical: 5,
        paddingHorizontal: 5,
        alignItems: 'flex-end',
        width: widthDimension,
        backgroundColor: '#5d99c6',
    },

    scrollMessages: {
        flex: 1,
        position: 'relative'
    },

    btnShowMore: {
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 10,
        borderRadius: 50
    },

    inputTextMessage: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#0001',
        backgroundColor: '#FFF',
        color: '#000',
        padding: 10,
        fontSize: 15,
        borderRadius: 10,
        maxHeight: 100
    },

    btnSendMessage: {
        // borderWidth: 1.5,
        borderColor: "#FFF",
        padding: 10,
        marginLeft: 1,
        // paddingVertical: 16,
        borderRadius: 1000,
        marginBottom: 5
    },

    btnAttach: {
        // borderWidth: 1.5,
        borderColor: "#FFF",
        padding: 10,
        marginLeft: 2,
        // paddingVertical: 16,
        borderRadius: 1000,
        marginBottom: 5
    },

    btnReturnTalks: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginHorizontal: 10,
        marginRight: 10
    },

    containerAvatar: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    imageAvatar: {
        width: 34,
        height: 34,
        borderRadius: 40,
        marginRight: 7,
        resizeMode: 'contain',
        marginHorizontal: 10
    },  

    imageTeste: {
        width: 50,
        height: 50,
        // borderRadius: 40,
        marginRight: 7,
        marginHorizontal: 10
    },

    nameAuthor: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    },

    moreMedias: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

        width: widthDimension - 10,
        height: 60,
        // borderWidth: 1,
        borderColor: '#0001',
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 5,
        
        shadowColor: '#90caf9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 3,
    },

    btnDocument: {
        borderWidth: 1,
        borderColor: '#90caf9',
        backgroundColor: '#5d99c6',
        borderRadius: 50,
        padding: 12,
        marginHorizontal: 2,
        
        shadowColor: '#90caf9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },

    containerCamera: {
        position: 'absolute',
        width: widthDimension,
        height: heightDimension
    },

    buttonsTopBottomMessages: {
        right: 10,
        bottom: 10, 
        position: 'absolute',
        // borderWidth: 1,
        // padding: 3,
    },

    btnTopMessage: {
        padding: 10,
        paddingHorizontal: 13.5,
        backgroundColor: 'rgba(93, 153, 198, .5)',
        borderRadius: 20,
    },

    btnBottomMessage: {
        marginTop: 5,
        padding: 7,
        paddingHorizontal: 11,
        backgroundColor: 'rgba(93, 153, 198, .5)',
        borderRadius: 20,
    },

    previewSendMedia: {
        flex: 1,
        height: heightDimension-80,
        borderWidth: 1,
        borderColor: '#474747',
        // resizeMode: 'contain'
        shadowColor: '#90caf9',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 3,
    },

    loadSendMedias: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        width: widthDimension,
        height: heightDimension,
        backgroundColor: 'rgba(0, 0, 0, .7)',
        zIndex: 10000000000
    }
})