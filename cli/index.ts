import * as readline from "readline";
import { createFolder } from "../service/folderService";
import { createUser, simularLogin } from "../service/userService";
import * as folderService from "../service/folderService";
import * as fileService from "../service/fileService";
import * as logService from "../service/logService";
import * as userService from "../service/userService";
import * as permissaoService from "../service/permissaoService";
import { NivelPermissao } from "../model/permissao";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function perguntar(pergunta: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(pergunta, resolve);
  });
}

// Pra amostragem de permissáo
async function listarUsuarios(sessao: number) {
  try {
    const usuarios = await userService.getAllUsers(sessao);
    console.log("\n👥 Usuários do sistema:");
    usuarios.forEach((u: any) => {
      console.log(`• [${u.id}] ${u.nome} (${u.login})`);
    });
    return usuarios;
  } catch (error) {
    console.log("Erro ao listar usuários:", error);
    return [];
  }
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
            console.log(`• [${a.id}] ${a.nome}${a.tipo} (${a.tamanho} bytes)`);
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

        const nomeInput = await perguntar("Novo nome (enter para manter): ");
        const tamanhoInput = await perguntar(
          "Novo tamanho (enter para manter, ex: 123 ou 123 bytes): "
        );
        const tipoInput = await perguntar("Novo tipo (enter para manter): ");

        const payload: any = {};

        if (nomeInput.trim() !== "") {
          payload.nome = nomeInput.trim();
        }

        if (tamanhoInput.trim() !== "") {
          const valor = Number(tamanhoInput.trim().split(" ")[0]);
          if (isNaN(valor) || valor < 0) {
            console.log("Tamanho inválido");
            break;
          }
          payload.tamanho = valor;
        }

        if (tipoInput.trim() !== "") {
          payload.tipo = tipoInput.trim();
        }

        if (Object.keys(payload).length === 0) {
          console.log("Nenhum campo para atualizar.");
          break;
        }

        try {
          const updated = await fileService.updateFile(file, payload);

          console.log("Arquivo atualizado com sucesso:");
          console.log(updated);

          await logService.createLogHistory(
            sessao,
            `Arquivo ${file.id} de nome ${file.nome} atualizado`
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

          console.log("[Sistema_Arquivos UFC] Usuário atualizado com sucesso:");
          console.log(`ID: ${updatedUser.id}`);
          console.log(`Nome: ${updatedUser.nome}`);
          console.log(`Login: ${updatedUser.login}`);

          await logService.createLogHistory(sessao, `Usuário atualizado`);
        } catch (error: any) {
          console.log("[Sistema_Arquivos UFC] Erro ao atualizar usuário:", error.message);
        }
      }
      // No caso "3" do menuAtualizar:
      case "3": {
        if (!sessao) {
          console.log("[Sistema_Arquivo UFC] Você precisa estar logado");
          break;
        }

        console.log("\n🔑 Gerenciar Permissões");
        console.log("1 - Conceder permissão a um usuário");
        console.log("2 - Remover permissão de um usuário");
        console.log("3 - Listar permissões de uma pasta");
        console.log("4 - Ver minhas pastas compartilhadas");
        console.log("5 - Voltar");

        const subOpcao = await perguntar("Escolha: ");

        switch (subOpcao) {
          case "1": {
            const pastas = await folderService.listUserFolders(sessao);

            if (!pastas || pastas.length === 0) {
              console.log("📭 Você não possui pastas para compartilhar");
              break;
            }

            console.log("\n📂 Suas pastas:");
            pastas.forEach((p: any) => {
              console.log(`• [${p.id}] ${p.nome}`);
            });

            const pastaIdStr = await perguntar(
              "\nID da pasta para compartilhar: "
            );
            const pastaId = Number(pastaIdStr);

            if (isNaN(pastaId)) {
              console.log("❌ ID inválido");
              break;
            }

            const usuarios = await listarUsuarios(sessao);
            if (usuarios.length === 0) {
              console.log("Nenhum usuário encontrado no sistema");
              break;
            }

            const usuarioIdStr = await perguntar(
              "\nID do usuário para conceder permissão: "
            );
            const usuarioId = Number(usuarioIdStr);

            if (isNaN(usuarioId)) {
              console.log("ID do usuário inválido");
              break;
            }

            if (usuarioId === sessao) {
              console.log("❌ Você não pode conceder permissão a si mesmo");
              break;
            }

            // Escolher nível de permissão
            console.log("\n📊 Níveis de permissão:");
            console.log("1 - Leitura (apenas visualizar)");
            console.log("2 - Escrita (visualizar e modificar)");
            console.log("3 - Admin (todas as permissões)");

            const nivelStr = await perguntar("Escolha o nível (1-3): ");
            let nivel: NivelPermissao | null = null;

            switch (nivelStr) {
              case "1":
                nivel = NivelPermissao.LEITURA;
                break;
              case "2":
                nivel = NivelPermissao.ESCRITA;
                break;
              case "3":
                nivel = NivelPermissao.ADMIN;
                break;
              default:
                console.log("❌ Nível inválido");
                break;
            }

            try {
              await permissaoService.concederPermissao(
                usuarioId,
                pastaId,
                nivel!
              );

              console.log(`✅ Permissão concedida com sucesso!`);
              console.log(`Usuário: ${usuarioId}`);
              console.log(`Pasta: ${pastaId}`);
              console.log(`Nível: ${nivel}`);

              await logService.createLogHistory(
                sessao,
                `Permissão concedida: usuário ${usuarioId} na pasta ${pastaId}`
              );
            } catch (error: any) {
              console.log(`❌ Erro: ${error.message}`);
            }
            break;
          }

          case "2": {
            const pastas = await folderService.listUserFolders(sessao);

            if (!pastas || pastas.length === 0) {
              console.log("📭 Você não possui pastas");
              break;
            }

            console.log("\n📂 Suas pastas:");
            pastas.forEach((p: any) => {
              console.log(`• [${p.id}] ${p.nome}`);
            });

            const pastaIdStr = await perguntar("\nID da pasta: ");
            const pastaId = Number(pastaIdStr);

            if (isNaN(pastaId)) {
              console.log("❌ ID inválido");
              break;
            }

            // Listar permissões existentes na pasta
            try {
              const permissoes = await permissaoService.listarPermissoesPasta(
                pastaId
              );

              if (permissoes.length === 0) {
                console.log("📭 Nenhuma permissão encontrada para esta pasta");
                break;
              }

              console.log("\n👥 Usuários com acesso:");
              permissoes.forEach((p: any) => {
                console.log(
                  `• [${p.usuario_id}] ${p.usuario_nome} - ${p.tipo}`
                );
              });

              const usuarioIdStr = await perguntar(
                "\nID do usuário para remover permissão: "
              );
              const usuarioId = Number(usuarioIdStr);

              if (isNaN(usuarioId)) {
                console.log("❌ ID inválido");
                break;
              }

              const confirmacao = await perguntar(
                `Tem certeza que deseja remover a permissão do usuário ${usuarioId}? (s/n): `
              );

              if (confirmacao.toLowerCase() === "s") {
                const removido = await permissaoService.removerPermissao(
                  usuarioId,
                  pastaId
                );

                if (removido) {
                  console.log(
                    `Permissão de usuário ${usuarioId} removida com sucesso!`
                  );

                  await logService.createLogHistory(
                    sessao,
                    `Permissão removida: usuário ${usuarioId} da pasta ${pastaId}`
                  );
                } else {
                  console.log("Permissão não encontrada");
                }
              }
            } catch (error: any) {
              console.log(`❌ Erro: ${error.message}`);
            }
            break;
          }

          case "3": {
            const pastas = await folderService.listUserFolders(sessao);

            if (!pastas || pastas.length === 0) {
              console.log("📭 Você não possui pastas");
              break;
            }

            console.log("\n📂 Suas pastas:");
            pastas.forEach((p: any) => {
              console.log(`• [${p.id}] ${p.nome}`);
            });

            const pastaIdStr = await perguntar(
              "\nID da pasta para visualizar permissões: "
            );
            const pastaId = Number(pastaIdStr);

            if (isNaN(pastaId)) {
              console.log("❌ ID inválido");
              break;
            }

            try {
              const permissoes = await permissaoService.listarPermissoesPasta(
                pastaId
              );

              if (permissoes.length === 0) {
                console.log("📭 Nenhuma permissão encontrada para esta pasta");
              } else {
                console.log(`\n🔑 Permissões da pasta ${pastaId}:`);
                console.log("=".repeat(50));

                permissoes.forEach((p: any) => {
                  console.log(
                    `👤 Usuário: ${p.usuario_nome} (${p.usuario_login})`
                  );
                  console.log(`📊 Nível: ${p.tipo}`);
                  console.log(
                    `📅 Concedido em: ${new Date(p.criado_em).toLocaleString()}`
                  );
                  console.log("-".repeat(30));
                });
              }
            } catch (error: any) {
              console.log(`❌ Erro: ${error.message}`);
            }
            break;
          }

          case "4": {
            try {
              const pastasComPermissao =
                await permissaoService.listarPermissoesPasta(sessao);

              if (pastasComPermissao.length === 0) {
                console.log(
                  "📭 Você não tem acesso a nenhuma pasta compartilhada"
                );
              } else {
                console.log("\n📂 Pastas compartilhadas com você:");
                console.log("=".repeat(50));

                pastasComPermissao.forEach((p: any) => {
                  console.log(`📁 Pasta: ${p.pasta_nome} (ID: ${p.pasta_id})`);
                  console.log(`Dono: ${p.dono_nome}`);
                  console.log(`Pública: ${p.is_public ? "Sim" : "Não"}`);
                  console.log(`Tipo de permissao: ${p.permissao_tipo}`);
                  console.log(
                    `📅 Acesso concedido em: ${new Date(
                      p.criado_em
                    ).toLocaleString()}`
                  );
                  console.log("-".repeat(30));
                });
              }
            } catch (error: any) {
              console.log(`Erro: ${error.message}`);
            }
            break;
          }

          case "5":
            return;

          default:
            console.log("Opção inválida");
        }
        break;
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
          console.log(`[Sistema_Arquivos UFC] Pasta "${folderId}" deletada com sucesso`);

          await logService.createLogHistory(
            sessao,
            `Pasta "${folderId}" deletada`
          );
        } catch (error: any) {
          console.log("[Sistema_Arquivos UFC] Erro ao deletar pasta:", error.message);
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
          console.log(`[Sistema_Arquivos UFC] Arquivo ${fileId} deletado com sucesso`);

          await logService.createLogHistory(
            sessao,
            `Arquivo ${fileId} deletado`
          );
        } catch (error: any) {
          console.log("Erro ao deletar arquivo:", error.message);
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
