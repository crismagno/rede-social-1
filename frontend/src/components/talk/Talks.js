import React, { useState, useEffect, Fragment } from 'react'
import { Image, Text, View, StyleSheet, Dimensions, 
    TouchableOpacity, ToastAndroid, AsyncStorage, FlatList } from "react-native"
import helpers from '../../helpers/index'
import IconFW from 'react-native-vector-icons/FontAwesome'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import axios from 'axios'
import Talk from "./Talk"

const URL_API = helpers.URL_API
const widthDimension = Dimensions.get('window').width
const heightDimension = Dimensions.get('window').height
import { useSelector, useDispatch } from 'react-redux'

export default props => {

    const user = useSelector(state => state.user)
	const socket1 = useSelector(state => state.socket)
    const dispatch = useDispatch({})
    const [ talks, setTalks ] = useState([])

    useEffect(() => {
        getTalks()
    }, [])

    const [enableLoadCenter, setEnableLoadCenter] = useState(true)
    const [showPreviewTalk, setShowPreviewTalk] = useState(false)
    const [talkPreview, setTalkPreview] = useState({})
    

    const showToast = (text, time = 'LONG') => {
        ToastAndroid.show(String(text), ToastAndroid[time])
    }

    const getTalks = async () => {
        try {
            setEnableLoadCenter(true)
            
            const response = await axios.get(`${URL_API}/talks/all/${user._id}`)

            setTalks(response.data)
            setEnableLoadCenter(false)

        } catch (error) {
            showToast('Erro ao buscar conversas')
        }
    }

    const goChat = async userTalk => {
        
        dispatch({
            type: 'INSERT_TALK_CHAT',
            payload: userTalk
        })
        props.navigation.navigate('Chat')
    }

    const goHome = async userTalk => {
        props.navigation.navigate('Home')
    }

    const goCreateTalks = () => {
        props.navigation.navigate('CreateTalks')
    }

    const previewTalk = talkUser => {
        setTalkPreview(talkUser)
        setShowPreviewTalk(true)
    }

    const closePreview = () => {
        setTalkPreview({})
        setShowPreviewTalk(false)
    }

    const showTalks = () => (

        talks.length > 0 ?
        <React.Fragment>
            <FlatList style={styles.scrollTalks}
                data={talks}
                renderItem={({ item }) => (
                    <Talk 
                        talk={item}
                        goChat={goChat}
                        previewTalk={previewTalk}
                    /> 
                    )
                }
                keyExtractor={item => item.id}
            />
        </React.Fragment>
        : <View style={{flex: 1, justifyContent: 'center'}}>
            <Text>Nenhum chat encontrado</Text>
        </View>
   
    )

    const imageLoad = (
        <View style={{flex: 1, justifyContent: 'center'}}>
            <Image style={{ width: 70, height: 70}} source={require('./../../../assets/load-palet.gif')} />
        </View>
    )

    return (
        <View style={styles.container}>
            <View style={styles.talksHeader}>
                <TouchableOpacity style={styles.btnGoHome}
                    onPress={() => goHome()}>
                    <IconFW name="angle-left" size={20} />       
                </TouchableOpacity>
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity style={styles.btnGoCreateTalk}
                        onPress={() => goCreateTalks()}>
                        <SimpleLineIcons name="user-follow" size={20} />       
                    </TouchableOpacity>
                </View>
             </View>

            {enableLoadCenter ? imageLoad : showTalks()}
            
            <TouchableOpacity style={styles.btnShowMore}
                onPress={() => getTalks()}>
                <IconFW name="angle-down" size={20} />       
            </TouchableOpacity>


            {/* =========== PARTE DOS PREVIEWS ============== */}

            { showPreviewTalk && 
                <View style={styles.containerPreviewTalk}>
                    <TouchableOpacity style={styles.closePreview}
                        onPress={() => closePreview()}>
                    </TouchableOpacity>
                    <View style={styles.previewTalk}>
                        <Image style={styles.imageAvatarPreview} source={{ uri: `${URL_API}/files?file=${talkPreview.avatar}` }} />
                        <View>

                        </View>
                    </View>
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: widthDimension,
        height: heightDimension,
        backgroundColor: '#f5f5f5',
    },

    talksHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: widthDimension,
        height: 45,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20
    },  

    btnGoHome: {
        padding: 10
    },

    btnGoCreateTalk: {
        padding: 10
    },  

    scrollTalks: {

    },

    btnShowMore: {
        // borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 10,
        borderRadius: 1000,
        // borderColor: '#fff',
    },

    containerPreviewTalk: {
        position: 'absolute',
        width: widthDimension,
        height: heightDimension,
        backgroundColor: '#0005'
    },

    previewTalk: {
        width: widthDimension - 100,
        height: 400,
        borderWidth: 1,
        borderColor: '#0007',
        position: 'absolute',
        left: 50,
        top: 100,
        backgroundColor: '#FFF3'
    },

    closePreview: {
        position: 'absolute',
        width: widthDimension,
        height: heightDimension,
        backgroundColor: '#0005'
    },

    imageAvatarPreview: {
        flex: 1,
        alignItems: 'stretch'
    }

})