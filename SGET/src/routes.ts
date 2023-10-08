import { UsuarioController } from "./controller/UsuarioController"

export const Routes = [{
    //DEFINE as rotas que o cliente pode requisitar ao servidor.

    //tipo de requisicao (GET, POST, PUT, DELETE)
    method: "get",
    //rota informada na url pelo cliente
    route: "/usuarios",
    //classe que o servidor deve procurar 
    controller: UsuarioController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "todosUsuarios"
}, 
{
    method: "get",
    route: "/usuario/:id",
    controller: UsuarioController,
    action: "buscarUsuario"
}, 
{
    method: "post",
    route: "/usuario/cadastro-usuario",
    controller: UsuarioController,
    action: "cadastrarUsuario"
}, 
{
    method: "delete",
    route: "/usuario/remover-usuario/:id",
    controller: UsuarioController,
    action: "removerUsuario"
},
{
    method: "post",
    route: "/usuario/login",
    controller: UsuarioController,
    action: "loginUsuario"
}]