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
}, {
    method: "get",
    route: "/users/:id",
    controller: UsuarioController,
    action: "buscarUsuario"
}, {
    method: "post",
    route: "/users",
    controller: UsuarioController,
    action: "save"
}, {
    method: "delete",
    route: "/users/:id",
    controller: UsuarioController,
    action: "remove"
}]