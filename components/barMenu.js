import { StyleSheet, Text, View,TouchableOpacity ,TextInput,Image} from 'react-native';
import { createAppContainer,createSwitchNavigator } from 'react-navigation';
import {DrawerItems} from 'react-navigation-drawer';
import React from 'react';
import firebase from 'firebase';
import db from '../config';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from 'react-native-elements';

export default class Menu extends React.Component{
    constructor(){
        super();
        this.state={
            img:'#',
            userId:firebase.auth().currentUser.email,
            userName:'',
            docid:''
        }
    }
    getuserprofile=async()=>{
        db.collection('users').where("email_id",'==',this.state.userId)
        .onSnapshot((snapshot)=>{
            snapshot.forEach((doc)=>{
                this.setState({
                    userName:doc.data().first_name.toUpperCase()+' '+doc.data().last_name.toUpperCase(),
                       docid:doc.id,
                       //img:doc.data().image()
                 
               })
            
            })
            
        
        })    
       
    }
    uploadimage=async(uri,imagename)=>{
        var response=await fetch(uri)
        var blob=await response.blob();
        const ref=firebase.storage().ref().child("user_profile"+imagename)
    
        return ref.put(blob).then((response)=>{
            this.fetchimage(imagename)
        })
    }

    fetchimage=async(imagename)=>{
        const storageref= firebase.storage().ref().child("user_profile"+imagename)

        //get the downlaod url
    storageref
    .getDownloadURL()
    .then((url)=>{this.setState({img:url})
    })
    .catch((error)=>{
        this.setState({image:'#'})
    } 
    )
    }
    selectimage=async()=>{
        const{cancel,uri}=await ImagePicker.launchImageLibraryAsync({
            mediaTypes:ImagePicker.MediaTypeOptions.All,
            allowsEditing:true,
            aspect:[5,5],
            quality:1
 
 
        })
        if(!cancel){
          this.uploadimage(uri,this.state.userId)
        }
 
     }
     componentDidMount(){
        this.fetchimage(this.state.userId)
        this.getuserprofile()
    }
    
    render(){
        return(
            <View>
                  <View
          style={{
            flex: 0.5,

            alignItems: "center",
            backgroundColor: "orange",
          }}
        >
                 <Avatar
            rounded
            source={{
             uri:this.state.img
            }}
            size='large'
            onPress={
               ()=>{
               this.selectimage()
               }
                
            }
            containerStyle={styles.imagecontainer}
            
            showEditButton
            />
         
             <Text style={{ fontWeight: "100", fontSize: 20, paddingTop: 10}}>{this.state.userName}</Text>
             </View>
             <View style={styles.drawerItemsContainer}>
                <DrawerItems {...this.props}/>
               <TouchableOpacity
               
               style={styles.button}
               onPress={()=>{
                this.props.navigation.navigate('logIn')
                firebase.auth().signOut()
               }
                 

               
               }
               
               ><Text style={styles.text}>LogOut</Text></TouchableOpacity>
               </View>
            </View>
        )
    }
}

const styles=StyleSheet.create({
    button:{
        width:80,
        height:90,
       
        marginTop:400
        
    },
    text:{
fontSize:20,
fontWeight:"bold",
color:"black"
    },
    imagecontainer: {
        flex: 0.75,
        width: "50%",
        height: "20%",
        marginLeft: 20,
        marginTop: 30,
        borderRadius: 40,
      },
      drawerItemsContainer: {
        flex: 0.8,
      },
})