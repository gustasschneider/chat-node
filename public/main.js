const socket = io();
let username = '';
let userList = [];

//Pegando as informações do html
let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');
let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

function renderUserList(){
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';

    userList.forEach(i => {
        ul.innerHTML += '<li>'+i+'</li>';
    });
}

//Função com dois tipos de retorno, um de aviso aos usuarios, saiu e entrou e os das msgs.
function addMessage(type, user, msg){
    let ul = document.querySelector('.chatList');

    switch(type){
        case 'status':
            ul.innerHTML += '<li class="m-status">'+msg+'</li>';
            break;

        case 'msg':
            if(username == user){
                ul.innerHTML += '<li class="m-txt"><span class="me">'+user+'</span> '+msg+'</li>';
            }else {
                ul.innerHTML += '<li class="m-txt"><span>'+user+'</span> '+msg+'</li>';
            }
            break;
    }

    ul.scroll = ul.scrollHeight;
}

//Ao inserir o nome do usuario e digitar enter (13) vai emitir a msg pro servidor
loginInput.addEventListener('keyup', (e)=>{
    //13 é o numero do enter
    if(e.keyCode === 13){
        let name = loginInput.value.trim();
        if(name != ''){
            username = name;
            document.title = 'Chat ('+username+')';

            //Função emitir, chamamos esse lado de cliente ao mandar uma msg pro servidor
            socket.emit('join-request', username);
        }
    }
});


//Campo input das msgs do cliente p/ servidor
textInput.addEventListener('keyup', (e)=>{
    if(e.keyCode === 13){
        let txt = textInput.value.trim();
        textInput.value = '';

        if(txt != ''){
            addMessage('msg', username, txt);
            //Envia uma msg pro servidor
            socket.emit('send-msg', txt);
        }
    }
});


//Usuario logado no chat
socket.on('user-ok', (list)=>{
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    addMessage('status', null, 'Conectado!');

    userList = list;
    renderUserList();
});

//Fuunção de atualizar a lista enviada do servidor para o cliente de usuarios logados
socket.on('list-update', (data)=>{

    if(data.joined){
        addMessage('status', null, data.joined+' entrou no chat.');
    }

    if(data.left){
        addMessage('status', null, data.left+' saiu do chat.');
    }

    userList = data.list;
    renderUserList();
});

//Exibindo msg do retorno do servidor
socket.on('show-msg', (dados)=>{
    addMessage('msg', dados.username, dados.message);
});


//Msg desfault desconectado
socket.on('disconnect', ()=>{
    addMessage('status', null, 'Voce foi desconectado!');
    userList = [];
    renderUserList();
});
//Tentando reconectar
socket.on('connect_error', ()=>{
    addMessage('status', null, 'Tentando restabelecer a conexão!');
});
//Reconectado
socket.on('reconnect', ()=>{
    addMessage('status', null, 'Reconectado!');

    if(username != ''){
        socket.emit('join-request', username);
    }
});

