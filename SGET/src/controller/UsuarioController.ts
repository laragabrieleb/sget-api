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
    async save(request: Request, response: Response, next: NextFunction) {
        const { nome, matricula, senha, datacriacao, situacao, criadopor } = request.body;

        // Gerar um UUID para o novo usuário
        const id = uuidv4();

        // Criptografar a senha antes de salvá-la no banco de dados
        const hashedPassword = await bcrypt.hash(senha, 10);

        const user = this.userRepository.create({
            id,
            nome,
            matricula,
            senha: hashedPassword,
            datacriacao,
            situacao,
            criadopor
        });

        await this.userRepository.save(user);
        return "Usuário criado com sucesso";
    }

    //excluir um registro de usuário com base no ID fornecido como parâmetro de rota.
    async remove(request: Request, response: Response, next: NextFunction) {
        const id = request.params.id; // UUID como chave primária

        const userToRemove = await this.userRepository.findOne(id);

        if (!userToRemove) {
            return "Este usuário não existe";
        }

        await this.userRepository.remove(userToRemove);

        return "Usuário foi removido";
    }
}