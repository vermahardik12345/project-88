import * as React from 'react';
import { StyleSheet, Text, View,TouchableOpacity ,TextInput,Image,KeyboardAvoidingView,SafeAreaP} from 'react-native';
import db from '../config';
import firebase from 'firebase';

import { SafeAreaProvider} from 'react-native-safe-area-context';
import MyHeader from '../components/header';
export default class Request extends React.Component{

    constructor(){
        super();
        this.state={
            userId: firebase.auth().currentUser.email,
            itemName:"",
            reasonToRequest:"",
            requestId:"",
            requestedBookName:'',
             bookStatus:"",
             docId:"",
             IsItemRequestStatus:'',
             userDocId:'',
             currencyCode:''  ,
             itemValue:''     
             }
    }
    createUniqueId=()=>{
        return Math.random().toString(36).substring(7);
    }

    addRequest=async(itemName,reasonToRequest)=>{
        var userId=this.state.userId
        var randomRequestId=this.createUniqueId()
        db.collection('requesteditems').add({
            "user_id":userId,
            "item_name":itemName,
            "reason_To_Request":reasonToRequest,
            "request_id":randomRequestId,
            "request_status":"requested",
            "item_value":this.state.itemValue
        })
        await  this.getItemRequest()
        db.collection('users').where("email_id","==",userId).get()
        .then()
        .then((snapshot)=>{
          snapshot.forEach((doc)=>{
            db.collection('users').doc(doc.id).update({
               Is_Item_Request_Active: true
          })
        })
      })
           
        this.setState({
            bookName:"",
            reasonToRequest:""
        })
        
        return alert("Item requested Successfully ")
        }

        getIsItemRequestActive(){
            db.collection('users')
            .where('email_id','==',this.state.userId)
            .onSnapshot(querySnapshot => {
              querySnapshot.forEach(doc => {
                this.setState({
                  IsItemRequestStatus:doc.data().Is_Item_Request_Active,
                  userDocId : doc.id,
                  currencyCode: doc.data().currency_code
                })
              })
            })
          }

          getItemRequest =()=>{
            // getting the requested book
          var bookRequest=  db.collection('requesteditems')
            .where('user_id','==',this.state.userId)
            .get()
            .then((snapshot)=>{
              snapshot.forEach((doc)=>{
              
                if(doc.data().request_status !== "received"){
                  this.setState({
                    requestId : doc.data().request_id,
                    requestedBookName: doc.data().item_name,
                    bookStatus:doc.data().request_status,
                    docId     : doc.id,
                    item_Value:doc.data().item_value
                  })
                }
              })
          })}
          componentDidMount(){
            this.getItemRequest()
            this.getIsItemRequestActive()
            console.log(this.state.currencyCode)
            this.getData()
          }
          receivedItems=(itemName)=>{
            var userId = this.state.userId
            var requestId = this.state.requestId
            db.collection('received_items').add({
                "email_id": userId,
                "item_name":itemName,
                "request_id"  : requestId,
                "item_status"  : "received",
        
            })
          }
          updateItemRequestStatus=()=>{
            //updating the book status after receiving the book
            db.collection('requesteditems').doc(this.state.docId)
            .update({
              request_status : 'received'
            })
        
            //getting the  doc id to update the users doc
            db.collection('users').where('email_id','==',this.state.userId).get()
            .then((snapshot)=>{
              snapshot.forEach((doc) => {
                //updating the doc
                db.collection('users').doc(doc.id).update({
                  Is_Item_Request_Active: false
                })
              })
            })
        
        }
          sendNotification=async()=>{
            db.collection('users').where("email_id",'==',this.state.userId).get()
            .then((snapshot)=>{
              snapshot.forEach((doc)=>{
                var name=doc.data().first_name
                var lastName=doc.data().last_name

                db.collection("all_notification").where('request_id','==',this.state.requestId).get()
                .then((snapshot)=>{
                  snapshot.forEach(doc=>{
                    var donorId=doc.data().donor_id
                    var ItemName=doc.data().item_name
  
                    db.collection('all_notification').add({
                      "donor_id":donorId,
                      "message": name +" "+ lastName + " recieved the item " +ItemName,
                      "notifaction_status":"unread",
                      "item_name":ItemName,
                      "recieverID":donorId
                   
                    })
                   
                  })
                })
              })
            })
          }
          getData=()=>{
            fetch('http://data.fixer.io/api/latest?access_key=5b44dccee8c8937c7d6ef82f664c34b9').then((response)=>{
              return response.json();
            }).then(responseData=>{
              var currencyCode=this.state.currencyCode
              var currency=responseData.rates.INR
              var value=69/currency
              console.log(value)
            })
          }
    render(){
        if(this.state.IsItemRequestStatus===false){
        return(
            <View style={{flex:1}}>
                  <MyHeader title="RequestItems" navigation ={this.props.navigation}/>
                <SafeAreaProvider>
           
               <KeyboardAvoidingView >
                <TextInput
                style={styles.formTextInput}
                placeholder="enter item Name"
                onChangeText={(text)=>this.setState({bookName:text})}  
                value={this.state.bookName}
                />
                
                <TextInput
                
                style={styles.formTextInput}
                placeholder="enter item value"
                onChangeText={(text)=>this.setState({itemValue:text})}  
                value={this.state.itemValue}
                
                
                
                />
                <TextInput
                style={[styles.formTextInput,{height:100}]}
                multiline
                numberOfLines={8}
                placeholder="why do you need the item"
                onChangeText={(text)=>this.setState({reasonToRequest:text})}  
                value={this.state.reasonToRequest}
                />

                 <TouchableOpacity
                 style={styles.button}
                 onPress={()=>{this.addRequest(this.state.bookName,this.state.reasonToRequest)}}
                 
                 >
                <Text>Request</Text> 
                     
                </TouchableOpacity>                 

               </KeyboardAvoidingView>
             
</SafeAreaProvider>
            </View>
 
 )
        }
        else{
            return(
           
              <View style = {{flex:1,justifyContent:'center'}}>
                 
                <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
                <Text>Item Name</Text>
                     <Text>{this.state.requestedBookName}</Text>
                     </View>
                     <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
                     <Text>Item Status</Text>
                     <Text>{this.state.bookStatus}</Text>
                     </View>
                     <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
                     <Text>Item value</Text>
                     <Text>{this.state.item_Value}</Text>
                     </View>
    
                       <TouchableOpacity style={{borderWidth:1,borderColor:'orange',backgroundColor:"orange",width:200,alignSelf:'center',alignItems:'center',height:50,marginTop:30,
                       borderBottomLeftRadius:10,borderBottomRightRadius:10,borderTopLeftRadius:10,borderTopRightRadius:10
                      }}
                     onPress={
                         ()=>{
                             this.sendNotification()
                             this.updateItemRequestStatus()
                             this.receivedItems(this.state.requestedBookName)
                         }
                     }
                      ><Text style={{marginTop:16}}>I recieved the item</Text></TouchableOpacity>
                     
          
                     
                      
                  </View>
              )
            
        }
    }
}

const styles=StyleSheet.create({
    formTextInput:{
      width:"75%",
      height:35,
      alignSelf:"center",
      borderColor:'#ffab91',
      borderRadius:10,
      borderWidth:1,
      marginTop:90,
      padding:10,
    },
    button:{
        width:'75%',
        height:50,
       marginLeft:40,
       marginTop:70,
        alignItems:"center",
        borderRadius:10,
        backgroundColor:'#ff5722',
        shadowColor:'#000',
        shadowOffset:{
            width:0,
            height:8
        },
        shadowOpacity:0.44,
        shadowRadius:10.32,
        elevation:16,
        marginTop:20
    },
})