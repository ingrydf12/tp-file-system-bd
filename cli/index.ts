import * as readline from "readline";
import { createFolder } from "../service/folderService";
import { createUser, simularLogin } from "../service/userService";
import * as folderService from "../service/folderService";

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
    console.log("3 - Criar pasta");
    console.log("4 - Visualizar ...");
    console.log("5 - Editar ...");
    console.log("6 - Editar permissões");
    console.log("7 - Deletar pasta ou arquivo");
    console.log("8 - Deletar ...");
    console.log("9- Sair");

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
        if (!sessao) {
          console.log("Você precisa estar logado para criar pasta");
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

        console.log(`Pasta "${nome}" criada com sucesso`);
        break;
      }

      case "4": {
        await menuVisualizar(sessao);
        break;
      }

      case "5": {
        console.log("rs, editar pasta");
      }

      case "6": {
        console.log("rs, editar permissões");
      }

      case "7": {
        console.log("rs, deletar pasta ou arquivo");
      }

      case "8": {
        console.log("rs, deletar usuario");
      }

      case "9":
        rl.close();
        return;

      default:
        console.log("Opção inválida");
    }
  }
}

async function menuVisualizar(sessao: number | null) {
  if (!sessao) {
    console.log("❌ Você precisa estar logado");
  }

  while (true) {
    console.log("\n📂 Visualizar");
    console.log("1 - Minhas pastas");
    console.log("2 - Pastas públicas");
    console.log("3 - Detalhes de uma pasta");
    console.log("4 - Voltar");

    const opcao = await perguntar("Escolha: ");

    switch (opcao) {
      case "1": {
        if (!sessao) {
          console.log("Você precisa estar logado");
          break;
        }

        const pastas = await folderService.listUserFolders(sessao);

        if (!pastas || pastas.length === 0) {
          console.log("📭 Nenhuma pasta encontrada");
          break;
        }

        break;
      }

      case "2":
        // select pastas publicas
        break;

      case "3": {
        if (!sessao) {
          console.log("❌ Você precisa estar logado");
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

      case "4":
        return; // ← volta para o menu principal

      default:
        console.log("Opção inválida");
    }
  }
}

async function menuEdicoes(sessao: number | null) {

}