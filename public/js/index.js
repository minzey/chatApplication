var socket=io();
var chatTemplate = $.templates("#chatTemplate");
var privateChatTemplate = $.templates("#privateChatTemplate");
var imageSelectedSrc = "";    
    

var data={
      
      addOnlineUsers: function(users){
        $.observable(this.online).insert(0,users);
      },
      removeOfflineUser: function(index){
        $.observable(this.online).remove(index);        
      },      
      addMessage: function(index,msg){
        $.observable(this.online[index].chat).insert(msg);        
      },
      incrementUnseen: function(index,e){
        $.observable(data.online[index]).setProperty("unseen",data.online[index].unseen+1);
      },
      sendPrivateMessage: function(e){
        // e.preventDefault();
        console.log(this.currentPrivate);
        if($('#mprivate').val()!=""){
          var date = new Date();
          var hours = date.getHours();
          var minutes = date.getMinutes();        
          var msg={type:'sent', content:$('#mprivate').val(), time:hours+":"+minutes};
          $('#mprivate').val("");        
          socket.emit('private message',{msg:msg, to:this.online[this.currentPrivate].socket});        
          data.addMessage(this.currentPrivate,msg);
          $(".chatContainer").scrollTop($(".chatContainer").children().height());
        }        
      },

      
      
      name:'',
      avatarsrc:'',
      myAvatar:'',
      online:[],
      currentPrivate:''
    }

$(document).ready(function () {
   chatTemplate = $.templates("#chatTemplate");
   privateChatTemplate = $.templates("#privateChatTemplate");
   imageSelectedSrc = "";

  
  
    $('.userInfo').submit(function(e){
      e.preventDefault();     
      //data.name=$('#name').val();     
      if(imageSelectedSrc===''){
        alert("Please select an avatar to login!");
      }
      else if($('#name').val()==''){
        alert("Username cannot be empty!");
      }      
      else{
        data.name=$('#name').val();     
        data.avatarsrc=imageSelectedSrc.substr(imageSelectedSrc.length-5)[0];
        socket.emit('username',{username:$('#name').val(), avatar:data.avatarsrc});
        chatTemplate.link('.mainContainer',data);
        $(".userAvatar").attr("src","images/avatar-"+data.avatarsrc+".png");
        data.myAvatar="<img class=\"myAvatar\" src=\"images/avatar-"+data.avatarsrc+".png\">";
      }
      
      
    });

    function selectAvatar(e){
      imageSelectedSrc = e.path[0].src;
      this.style.border = "0.25rem solid white";
      for(i in avatars){
        if(avatars[i]!=this){
          // console.log(avatars[i].style.border);
          avatars[i].style.border="none";
        }
      } 
    }

    const avatars = document.querySelectorAll('img');
    avatars.forEach(avatar => avatar.addEventListener('click',selectAvatar));

    socket.on('show online users',function(response){
      console.log('show online users');
      var users = response.users;
      var startindex = data.online.length;
      var temp=[];

      for(i=0; i<users.length; i++){
        users[i].avatar="<img class=\"onlineUserAvatar\" src=\"images/avatar-"+users[i].avatar+".png\">";
        users[i].chat=[];
        users[i].unseen=0;
        if(users[i].socket == socket.id){
          users[i].name="You";
        }
        
          var alreadyPresent=false;
          for(var j=0; j<data.online.length; j++){
            if(data.online[j].socket==users[i].socket || users[i].socket==socket.id){
              alreadyPresent = true;
              break;
            }

          }


          if(!alreadyPresent && users[i].socket!=socket.id){
            temp.push(users[i]);
          }
        }       
        
      
      data.addOnlineUsers(temp);
      
    });

    socket.on('remove disconnected users',function(socketID){
      console.log(socketID+'someone went offline!');
      for(i in data.online){
        if(data.online[i].socket==socketID){
          data.removeOfflineUser(i);
        }
      }
    });

    socket.on('private message', function(msg){      
      msg.type="received";
      for(i in data.online){
        if(data.online[i].socket === msg.fromID){
          data.addMessage(i,msg);
          $(".chatContainer").scrollTop($(".chatContainer").children().height());
          if(data.currentPrivate != i){
            data.incrementUnseen(i);
          }                    
          break;
        }        
      }
      console.log(msg);
    });

   

});

$.views.helpers({
  navigatePrivateChat:function(e){
        var index = $.view(e.target).index;
        console.log('Chatting with '+ data.online[index].name);
        data.currentPrivate = index;
        data.online[index].unseen=0;
        $.templates("#privateChatTemplate").link('.mainContainer',data);
        $(".chatContainer").scrollTop($(".chatContainer").children().height());
  },
  navigateBefore:function(e){
        e.preventDefault();
        $.templates("#chatTemplate").link('.mainContainer',data);
        $(".userAvatar").attr("src","images/avatar-"+data.avatarsrc+".png");
        data.currentPrivate='';
  },
  checkKeyPress: function(event){
      console.log('key press detected!');
        if(event.keyCode == 13){
            data.sendPrivateMessage();
        }
  }
});