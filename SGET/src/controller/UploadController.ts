import { AppDataSource } from "../data-source";
import { Templates, descricaoTemplateEhValida, nomeTemplateEhValido } from "../entity/Templates";
import { NextFunction, Request, Response } from "express"
import { Usuarios } from "../entity/Usuarios";
import { Uploads } from "../entity/Uploads";


export class UploadsController {
    private uploadsRepository = AppDataSource.getRepository(Uploads);
    private templatesRepository = AppDataSource.getRepository(Templates);
    
    //lógica para pegar apenas templates ativas
    //mostrar no select

    async listarTemplatesAtivas(request: Request, response: Response, next: NextFunction) {

        let templates = await this.templatesRepository.findBy({
            situacao: true
        });

        return response.status(200).send({
            mensagem: 'Templates obtidas com sucesso.',
            status: 200,
            templates: templates
         });
    }

    //tenho que ver a parte de armazenamento
    async dadosUpload(request: Request, response: Response, next: NextFunction) {

        const { nome, descricao, caminho } = request.body;

        if(!nomeTemplateEhValido(nome)){
            return response.status(400).send({
                mensagem: 'O nome do template deve conter no máximo 50 caracteres',
                status: 400
             });
        }

        if(!descricaoTemplateEhValida(descricao)){
            return response.status(400).send({
                mensagem: 'A descrição do template deve conter no máximo 100 caracteres',
                status: 400
             });
        }

        return response.status(200).send({
            mensagem: 'Upload feito com sucesso.',
            status: 200,
            uploads: nome
         });
    }

    
}