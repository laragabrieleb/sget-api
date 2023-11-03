import { PermissoesController } from "../controller/PermissoesController";
import { TemplateController } from "../controller/TemplateController";
import { UploadsController } from "../controller/UploadController";

export const routesUploads = [{
    //DEFINE as rotas que o cliente pode requisitar ao servidor.

    //tipo de requisicao (GET, POST, PUT, DELETE)
    method: "get",
    //rota informada na url pelo cliente
    route: "/template/listar-ativas",
    //classe que o servidor deve procurar 
    controller: UploadsController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "listarTemplatesAtivas"
}]