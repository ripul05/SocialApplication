const socket = io();
const online = document.getElementById("active-users")

socket.emit("user-Active", {
    
    email: window.sessionStorage.email
});


socket.on('userAddedOrRemoved', (res)=>{
    console.log("userAdded")
    
    let msg=""

    res.forEach((element)=>{
        msg+=`${element}<br>`;
    })

    online.innerHTML = msg
    console.log(res)
})
