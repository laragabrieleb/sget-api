import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Usuarios } from "../entity/Usuarios"
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

export class UsuarioController {

    private userRepository = AppDataSource.getRepository(Usuarios);

    //buscar todos os registros dentro do repositório
    async todosUsuarios(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find();
    }

    //buscar um único registro de usuário com base no ID fornecido como parâmetro de rota
    async buscarUsuario(request: Request, response: Response, next: NextFunction) {
        const idusuario = request.params.id; 

        const user = await this.userRepository.findOneBy({
        id: idusuario
        });

        //Status
        // - 400 BadRequest (Requisição mal sucedida - houve algum erro do lado do cliente, como dados
        // mal preenchidos ou nulos)

        // - 404 NotFound (Recurso não encontrado - o cliente buscou um recurso (rota) do meu servidor
        // que não existe, ex: buscou rota /usuarie ao invés de /usuarios)

        // - 500 InternalServerError (Erro de servidor - ocorreu algum erro do lado do servidor que não
        // foi culpa do cliente)

        // - 200  Succcess (Sucesso - o cliente conseguiu se comunicar com o servidor.)

        // - 201  Succcess (Sucesso - o cliente conseguiu se criar algo no servidor.)


        // Request e response - sempre em JSON, é o padrão de comunicação de dados entre servidor e cliente
        
        if (!user) {
            return response.status(400).send({
                message: 'Usuário não encontrado.',
                status: 400
             });
        }
        return user;
    }

    //método usado para criar um novo registro de usuário no banco de dados
    async cadastrarUsuario(request: Request, response: Response, next: NextFunction) {
        try{
            const { nome, matricula, senha, criadopor } = request.body;

            //senha deve ter no minimo 8 caracteres
            if(senha.length < 8){
                return response.status(400).send({
                    message: 'A senha deve conter no mínimo 8 caracteres',
                    status: 400
                 });
            }

            //não pode haver outro usuário com a mesma matrícula
            var usuarioDatabase = await this.userRepository.findOneBy({
                matricula: matricula
            });

            if(usuarioDatabase){
                return response.status(400).send({
                    message: 'Já existe um usuário com esta matrícula!',
                    status: 400
                 });
            }
            
            // Criptografar a senha antes de salvá-la no banco de dados
            const hashedPassword = await bcrypt.hash(senha, 10);

            const usuario =  this.userRepository.create({
                nome,
                matricula,
                senha: hashedPassword,
                datacriacao: new Date(),
                situacao: true,
                criadopor
            });

            await this.userRepository.save(usuario);
            
            return response.status(201).send({
                message: 'Usuário criado com sucesso.',
                status: 201
             });
        } 
        catch (error) {
            return response.status(500).send({
                message: 'Erro ao criar usuário, tente novamente mais tarde.',
                status: 500
             });
        }
    }
    

    //excluir um registro de usuário com base no ID fornecido como parâmetro de rota.
    async removerUsuario(request: Request, response: Response, next: NextFunction) {
        const id = request.params.id;

        const usuario = await this.userRepository.findOneBy({
        id: id
        });

        if (!usuario) {
            return "Este usuário não existe";
        }

        await this.userRepository.remove(usuario);

        return "Usuário foi removido";
    }
}