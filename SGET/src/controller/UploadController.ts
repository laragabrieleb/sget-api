import { AppDataSource } from "../data-source";
import { Templates, descricaoTemplateEhValida, nomeTemplateEhValido } from "../entity/Templates";
import { NextFunction, Request, Response } from "express"
import { Usuarios } from "../entity/Usuarios";
import { Uploads } from "../entity/Uploads";
import { Colunas } from "../entity/Colunas";


export class UploadsController {
    private uploadsRepository = AppDataSource.getRepository(Uploads);
    private templatesRepository = AppDataSource.getRepository(Templates);
    private usuarioRepository = AppDataSource.getRepository(Usuarios);
    private colunasRepository = AppDataSource.getRepository(Colunas);
    //lógica para pegar apenas templates ativas
    //mostrar no select

    async listarArquivos(request: Request, response: Response, next: NextFunction) {
        let uploads = await this.uploadsRepository.find();

        return response.status(200).send({
            mensagem: 'Uploads obtidos com sucesso.',
            status: 200,
            uploads: uploads
         });
    }

    async listarArquivosParaDashboard(request: Request, response: Response, next: NextFunction) {
        let uploads = await this.uploadsRepository
              .createQueryBuilder('uploads')
              .leftJoinAndSelect('uploads.template', 'template')
              .where('uploads.templateId = template.id')
              .getMany();

        console.log(uploads);

        const spawn = require('child_process').spawn;
        const path = require('path'); 

        //caminho para o script em py
        const caminhoScript = path.join(__dirname, '../scripts/get-file-lines.py');

            //spawn para iniciar um novo processo Python
            let jsonUploads = JSON.stringify(uploads);
            const script = spawn('python', [caminhoScript, jsonUploads ]);


            script.stdout.on('data', async (data) => {
                //uploads com a propriedade qtdLinhas preenchida,
                //o python retorna como JSON então converto de volta pra objeto

                //filtrar apenas o json na mensagem de retorno
                const regex = /\[\{.*?\}\]/s;
                let result = data.toString();
                const match = result.match(regex);

                if (match) {
                    const jsonString = match[0];
                    uploads = JSON.parse(jsonString);
                } 
              });

            script.stderr.on('data', (data) => {
              console.log(`erro: ${data}`);
            });

            script.on('close', async (code) => {
              console.log(`python finalizou com código:  ${code}`);
             
              return response.status(200).send({
                mensagem: 'Uploads obtidos com sucesso.',
                status: 200,
                uploads: uploads
             });
            });
    }

    async listarArquivosUsuario(request: Request, response: Response, next: NextFunction){
        //pegar id do usuário logado
        //vem pela url quando é get = em obter template
        const idUsuario = request.query.id;

        const arquivosDoUsuario = await this.uploadsRepository.find({
            where: {
              usuarioId: idUsuario,
            },
          });

          return response.status(200).json({
            mensagem: 'Arquivos encontrados com sucesso.', 
            uploads: arquivosDoUsuario,

            status: 200 
           });
   
        } catch (error) {
        
            console.error('Erro ao encontrar arquivos.', error);
        }

    async alterarStatusArquivo(request: Request, response: Response, next: NextFunction) {
        try{

        const { aprovado, idArquivo } = request.body;
        const arquivo = await this.uploadsRepository.findOneBy({
            id: idArquivo
        });

        if (!arquivo) {
            return response.status(400).send({
                mensagem: 'Arquivo inexistente!',
                status: 400
            });
        }

        if(aprovado)
            arquivo.status = 'aprovado';
        else
            arquivo.status = 'negado';
        
        await this.uploadsRepository.save(arquivo);

        return response.status(200).send({
            mensagem: 'Status do arquivo atualizado com sucesso!',
            status: 200
        });

    }
    catch (error) {
        return response.status(500).send({
            mensagem: 'Erro ao alterar o status do arquivo, tente novamente mais tarde.',
            status: 500
         });
    }
}

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

    async publicarArquivo(request: Request, response: Response, next: NextFunction) {

        const { nome, descricao, templateId, base64, idUsuario } = request.body;

        let usuarios = await this.usuarioRepository.findBy({
            id: idUsuario
        });

        if(usuarios == undefined){
            return response.status(400).send({
                mensagem: 'Usuário não encontrado!',
                status: 400
             });
        }
        
        let usuario = usuarios[0];

        if(!usuario.situacao){

            //401 é não autorizado(a)
            return response.status(401).send({
                mensagem: 'Usuário desativado!',
                status: 401
             });
        }

        let templates = await this.templatesRepository.findBy({
            id: templateId
        });

        if(templates == undefined){
            return response.status(400).send({
                mensagem: 'Template não encontrada!',
                status: 400
             });
        }
        
        let template = templates[0];

        if(!template.situacao){

            //401 é não autorizado(a)
            return response.status(401).send({
                mensagem: 'Template desativada!',
                status: 401
             });
        }

        let colunas = await this.colunasRepository.findBy({
            templateId: templateId
        });
        

        let urlArquivo = '';

        const spawn = require('child_process').spawn;
        const path = require('path'); 

        //caminho para o script em py
        const caminhoScript = path.join(__dirname, '../scripts/upload-arquivo.py');

            //spawn para iniciar um novo processo Python
            let jsonColunas = JSON.stringify(colunas);
            console.log(jsonColunas);
            const script = spawn('python', [caminhoScript, JSON.stringify(template), nome, base64, jsonColunas ]);
            let erros = '';
            //tratamento 
            let url = '';
            script.stdout.on('data', async (data) => {
                console.log(`url do arquivo: ${data}`);
                let text = data.toString();

                if(text.includes('\r')){
                    let lines = text.split('\r')
                    url = lines[lines.length - 2]

                }

                
              });

            script.stderr.on('data', (data) => {
              console.log(`erro: ${data}`);
              erros += data;
            });

            script.on('close', async (code) => {
              console.log(`python finalizou com código:  ${code}`);
             
              if(code == 1){
                return response.status(400).send({
                    mensagem: erros,
                    status: 400
                 });
              }

              try {

                const upload = new Uploads();
                upload.nome = nome;
                upload.descricao = descricao;
                upload.caminho = url;
                upload.criadopor = usuario.matricula;
                upload.dataUpload = new Date();
                upload.template = template;
                upload.status = 'pendente';
                upload.usuario = usuario;

                let uploadDatabase = await this.uploadsRepository.create(upload);

                await this.uploadsRepository.save(uploadDatabase);
          
              return response.status(201).json({
                mensagem: 'Arquivo enviado com sucesso.', 
                status: 201 
               });
            } catch (error) {
              console.error('Erro ao salvar a URL do template:', error);
          
              // Retorne uma resposta de erro mais detalhada
              return response.status(500).json({ mensagem: 'Erro ao criar template: ' + error.message, status: 500 });
            }
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