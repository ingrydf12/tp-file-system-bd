import * as readline from "readline";
import { createFolder } from "../service/folderService";
import { createUser, simularLogin } from "../service/userService";
import * as folderService from "../service/folderService";
import * as fileService from "../service/fileService";
import * as logService from "../service/logService";
import * as userService from "../service/userService";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function perguntar(pergunta: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(pergunta, resolve);
  });
}

export async function menu() {
  let sessao: number | null = null;
  while (true) {
    console.log("\n📁 Sistema de Arquivos");
    console.log("1 - Criar usuário");
    console.log("2 - Fazer login");
    console.log("3 - Criar ...");
    console.log("4 - Visualizar ...");
    console.log("5 - Atualizar ...");
    console.log("6 - Deletar ...");
    console.log("7 - Sair");

    const opcao = await perguntar("Escolha uma opção: ");

    switch (opcao) {
      case "1": {
        const nome = await perguntar("Nome de usuário: ");
        const login = await perguntar(
          "Crie seu login para entrar (ex: iduarte1): "
        );
        const senha = await perguntar("Crie uma senha: ");

        if (!login || !senha) {
          console.error("É necessário criar um login para criar um usuário.");
        }

        const payload = {
          nome,
          login,
          senha,
        };

        await createUser(payload);

        console.log(`Usuário "${nome}" de login "${login}" criado com sucesso`);
        break;
      }

      // Simular o login ai
      case "2": {
        const login = await perguntar("Login do usuário: ");
        const senha = await perguntar("Senha: ");

        try {
          sessao = await simularLogin(login, senha);
          console.log("[Sistema_Arquivos UFC] Voce logou com sucesso.");
        } catch (error: any) {
          sessao = null;
          console.error(error.message);
        }

        break;
      }

      case "3": {
        await menuCriar(sessao);
        break;
      }

      case "4": {
        await menuVisualizar(sessao);
        break;
      }

      case "5": {
        await menuAtualizar(sessao);
        break;
      }

      case "6": {
        await menuDeletar(sessao);
        break;
      }

      case "7":
        rl.close();
        return;

      default:
        console.log("Opção inválida");
    }
  }
}

async function menuCriar(sessao: number | null) {
  if (!sessao) {
    console.log("Você precisa estar logado");
  }

  while (true) {
    console.log("\n🚗 Criar");
    console.log("1 - Uma nova pasta");
    console.log("2 - Um novo arquivo");
    console.log("3 - Voltar");

    const opcao = await perguntar("Escolha: ");

    switch (opcao) {
      case "1": {
        if (!sessao) {
          console.log("[Sistema_Arquivo UFC] Você precisa estar logado");
          break;
        }

        const nome = await perguntar("Nome da pasta: ");
        const isPublicResposta = await perguntar("Pública? (s/n): ");

        const isPublic = isPublicResposta.toLowerCase() === "s";
        let pin: string | undefined;

        if (!isPublic) {
          pin = await perguntar("Insira um PIN numérico: ");
        }

        const payload = {
          nome,
          isPublic,
          ...(pin !== undefined ? { pin } : {}),
        };

        await createFolder(sessao, payload);

        await logService.createLogHistory(sessao, `Pasta ${nome} foi criada`);

        console.log(`Pasta "${nome}" criada com sucesso`);
        break;
      }
      case "2": {
        if (!sessao) {
          console.log("[Sistema_Arquivo UFC] Você precisa estar logado");
          break;
        }

        const pastas = await folderService.listUserFolders(sessao);

        if (!pastas || pastas.length === 0) {
          console.log("📭 Você não possui pastas. Crie uma antes.");
          break;
        }

        console.log("\n📂 Suas pastas:");
        pastas.forEach((p) => {
          console.log(`• [${p.id}] ${p.nome}`);
        });

        const pastaIdStr = await perguntar("\nDigite o ID da pasta: ");
        const pasta_id = Number(pastaIdStr);

        if (isNaN(pasta_id)) {
          console.log("ID inválido");
          break;
        }

        const nome = await perguntar("Nome do arquivo: ");
        const tamanhoStr = await perguntar("Tamanho do arquivo (bytes): ");
        const tipo = await perguntar("Tipo do arquivo (.pdf, .docx): ");

        const tamanho = Number(tamanhoStr);

        if (isNaN(tamanho)) {
          console.log("Tamanho inválido");
          break;
        }

        try {
          const file = await fileService.createFile(sessao, {
            nome,
            tamanho,
            tipo,
            pasta_id,
          });

          console.log("📄 Arquivo criado com sucesso:");
        } catch (error: any) {
          console.log("Erro ao criar arquivo:", error.message);
        }

        break;
      }
      case "3":
        return;
      default:
        console.log("Opcao inválida. Tente novamente.");
    }
  }
}

async function menuVisualizar(sessao: number | null) {
  if (!sessao) {
    console.log("Você precisa estar logado");
  }

  while (true) {
    console.log("\n🥽 Visualizar");
    console.log("1 - Minhas pastas");
    console.log("2 - Pastas públicas");
    console.log("3 - Detalhes de uma pasta");
    console.log("4 - Log do sistema");
    console.log("5 - Voltar");

    const opcao = await perguntar("Escolha: ");

    switch (opcao) {
      case "1": {
        if (!sessao) {
          console.log("[Sistema_Arquivo UFC] Você precisa estar logado");
          break;
        }

        const pastas = await folderService.listUserFolders(sessao);

        if (!pastas || pastas.length === 0) {
          console.log("📭 Nenhuma pasta encontrada");
          break;
        }

        console.log("\n📂 Minhas pastas:");
        pastas.forEach((p) => {
          console.log(`• [${p.id}] ${p.nome}`);
        });

        break;
      }

      case "2": {
        if (!sessao) {
          console.log("[Sistema_Arquivo UFC] Você precisa estar logado");
          break;
        }

        const pastasPublic = await folderService.listAllPublic(sessao);

        if (!pastasPublic || pastasPublic.length === 0) {
          console.log("Nenhuma pasta pública foi encontrada");
          break;
        }

        console.log("\n📂 Pastas públicas do sistema:");
        pastasPublic.forEach((p) => {
          console.log(`• [${p.id}] ${p.nome}`);
        });
        break;
      }

      case "3": {
        if (!sessao) {
          console.log("[Sistema_Arquivo UFC] Você precisa estar logado");
          break;
        }

        const idStr = await perguntar("ID da pasta: ");
        const folderId = Number(idStr);

        if (isNaN(folderId)) {
          console.log("ID inválido");
          break;
        }

        const detalhes = await folderService.getFolderDetails(folderId);

        if (!detalhes) {
          console.log("📭 Pasta não encontrada");
          break;
        }

        const { pasta, arquivos } = detalhes;

        console.log("\n📁 Detalhes da Pasta");
        console.log(`ID: ${pasta.id}`);
        console.log(`Nome: ${pasta.nome}`);
        console.log(`Visibilidade: ${pasta.isPublic ? "Pública" : "Privada"}`);

        console.log("\n📄 Arquivos:");
        if (arquivos.length === 0) {
          console.log("Nenhum arquivo nesta pasta");
        } else {
          arquivos.forEach((a) => {
            console.log(`• [${a.id}] ${a.nome} (${a.tamanho} bytes)`);
          });
        }

        break;
      }

      case "4": {
        if (!sessao) {
          console.log("[Sistema_Arquivo UFC] Você precisa estar logado");
          break;
        }

        const logs = await logService.getLogHistory();

        if (!logs || logs.length === 0) {
          console.log("📭 Nenhum log encontrado");
          break;
        }

        console.log("\n📜 Log do sistema:\n");

        logs.forEach((log) => {
          console.log(
            `• [${new Date(log.data_hora).toLocaleString()}] ` +
              `${log.usuario_nome} → ${log.action}`
          );
        });

        break;
      }

      case "5":
        return;

      default:
        console.log("Opção inválida");
    }
  }
}

async function menuAtualizar(sessao: number | null) {
  if (!sessao) {
    console.log("[Sistema_Arquivo UFC] Você precisa estar logado");
  }

  while (true) {
    console.log("\n🚧 Atualizar no sistema");
    console.log("1 - Um arquivo pelo ID");
    console.log("2 - Meu usuário");
    console.log("3 - Permissoes de um usuário sobre uma pasta");
    console.log("4 - Voltar");

    const opcao = await perguntar("Escolha: ");

    switch (opcao) {
      case "1": {
        if (!sessao) {
          console.log("[Sistema_Arquivo UFC] Você precisa estar logado");
          break;
        }

        const idStr = await perguntar("ID do arquivo: ");
        const fileId = Number(idStr);

        if (isNaN(fileId)) {
          console.log("ID inválido");
          break;
        }

        const file = await fileService.findById(fileId);
        if (!file) {
          console.log("Arquivo não encontrado");
          break;
        }

        const nome = await perguntar("Novo nome (enter para manter): ");
        const tamanhoStr = await Number(
          perguntar("Novo tamanho (enter para manter): ")
        );
        const tipo = await perguntar("Novo tipo (enter para manter): ");

        try {
          const updated = await fileService.updateFile(file, {
            nome: nome,
            tamanho: tamanhoStr,
            tipo: tipo,
          });

          console.log("Arquivo atualizado com sucesso:");
          console.log(updated);

          await logService.createLogHistory(
            sessao,
            `Arquivo ${file.id} atualizado`
          );
        } catch (error: any) {
          console.log("Erro ao atualizar arquivo:", error.message);
        }

        break;
      }
      case "2": {
        if (!sessao) {
          console.log("❌ Você precisa estar logado");
          break;
        }

        const nome = await perguntar("Novo nome (enter para manter): ");
        const login = await perguntar("Novo login (enter para manter): ");
        const senha = await perguntar("Nova senha (enter para manter): ");

        const dto: any = {};
        if (nome.trim() !== "") dto.nome = nome;
        if (login.trim() !== "") dto.login = login;
        if (senha.trim() !== "") dto.senha = senha;

        try {
          const updatedUser = await userService.updateUserById(sessao, dto);

          console.log("✅ Usuário atualizado com sucesso:");
          console.log(`ID: ${updatedUser.id}`);
          console.log(`Nome: ${updatedUser.nome}`);
          console.log(`Login: ${updatedUser.login}`);

          await logService.createLogHistory(sessao, `Usuário atualizado`);
        } catch (error: any) {
          console.log("❌ Erro ao atualizar usuário:", error.message);
        }
      }
      case "3": {
        // ATUALIZAR PERMISSOES DE PASTA PARA UM USUARIO
      }
      case "4":
        return;

      default:
        console.log("Opçao inválida. Tente novamente.");
    }
  }
}

async function menuDeletar(sessao: number | null) {
  if (!sessao) {
    console.log("[Sistema_Arquivo UFC] Você precisa estar logado");
  }

  while (true) {
    console.log("\n🕳 Excluir do sistema");
    console.log("1 - Pasta pelo ID");
    console.log("2 - Arquivo enviado por voce");
    console.log("3 - Voltar");

    const opcao = await perguntar("Escolha: ");

    switch (opcao) {
      case "1": {
        if (!sessao) {
          console.log("[Sistema_Arquivo UFC] Você precisa estar logado");
          break;
        }
        const idStr = await perguntar("Id da pasta a excluir: ");
        const folderId = Number(idStr);
        if (isNaN(folderId)) {
          console.log("❌ ID inválido");
          break;
        }
        try {
          await folderService.deleteFolder(folderId, sessao);
          console.log(`✅ Pasta "${folderId}" deletada com sucesso`);

          await logService.createLogHistory(
            sessao,
            `Pasta "${folderId}" deletada`
          );
        } catch (error: any) {
          console.log("❌ Erro ao deletar pasta:", error.message);
        }
        break;
      }

      case "2": {
        const idStr = await perguntar("ID do arquivo a excluir: ");
        const fileId = Number(idStr);

        if (isNaN(fileId)) {
          console.log("❌ ID inválido");
          break;
        }

        try {
          await fileService.deleteFile(fileId);
          console.log(`✅ Arquivo ${fileId} deletado com sucesso`);

          await logService.createLogHistory(
            sessao,
            `Arquivo ${fileId} deletado`
          );
        } catch (error: any) {
          console.log("❌ Erro ao deletar arquivo:", error.message);
        }
        break;
      }

      case "3":
        return;

      default:
        console.log("❌ Opção inválida. Tente novamente.");
    }
  }
}
