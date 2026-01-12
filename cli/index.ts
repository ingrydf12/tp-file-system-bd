import * as readline from "readline";
import { createFolder } from "../service/folderService";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function perguntar(pergunta: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(pergunta, resolve);
  });
}

async function menu() {
  let sessao: number | null = null;
  console.log("\n📁 Sistema de Arquivos");
  console.log("1 - Criar usuário");
  console.log("2 - Fazer login");
  console.log("3 - Criar pasta");
  console.log("4 - Editar pasta");
  console.log("5 - Deletar pasta ou arquivo");
  console.log("6 - Deletar usuário");
  console.log("7 - Sair");

  const opcao = await perguntar("Escolha uma opção: ");

  switch (opcao) {
    case "1": {
      console.log("rs, criar usuário")
    }

    case "2": {
      if (!sessao) {
        console.log("❌ Você precisa estar logado para criar pasta");
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

    case "3": {
      const id = await perguntar("ID do usuário: ");
      sessao = Number(id);

      if (isNaN(sessao)) {
        sessao = null;
        console.log("ID inválido");
      } else {
        console.log("Login realizado");
      }
      break;
    }

    case "5":
      rl.close();
      return;

    default:
      console.log("Opção inválida");
  }

  menu();
}

menu();
