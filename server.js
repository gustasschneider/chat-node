const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000);

//Ao startar o servidor o arquivo index da pasta public é a que vai ser chamada
app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = [];

io.on('connection', (socket)=>{
    console.log('Conexão detectada...');

    socket.on('join-request', (username)=>{
        socket.username = username;
        connectedUsers.push(username);
        console.log(connectedUsers);

        //Função emitir, chamamos esse lado de Servidor para responder ao cliente
        socket.emit('user-ok', connectedUsers);
        // Mensagem para todos que tiverem no chat, menos pro proprio que entrou. Mensagem de que saiu e entrou
        socket.broadcast.emit('list-update', {
            //quem entrou
            joined: username,
            list: connectedUsers
        });
    });

    //Momento em que o usuario sair do chat
    socket.on('disconnect', ()=>{
        //Pego o array dos usuarios e aplico o filtro, se for false atualizo o novo array
        connectedUsers = connectedUsers.filter(u => u != socket.username);
        console.log(connectedUsers);

        //Aviso ao cliente quem saiu, gravando em 'left' e atualizo a lista
        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        });

    });

    //Msg recebida do cliente
    socket.on('send-msg', (txt)=>{
        let obj = {
            username: socket.username,
            message: txt
        }
        //Metodo de enviar a msg p/ todos
        socket.broadcast.emit('show-msg', obj);
    });
});