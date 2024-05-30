# Discordia Project

## Descrição do Projeto

Este projeto é um clone simplificado do Twitter, desenvolvido com foco em um design responsivo utilizando Vuejs. O sistema inclui funcionalidades de front-end para os utilizadores, um backoffice para administração e para guardar dados foi usaddo o Firebase.

## Funcionalidades Principais ⚙️

### Utilizadores 👤

- **Registo de utilizadores:** Os utilizadores podem se registar fornecendo um e-mail e password, posteriormente podem adiconar um nome na opção **Perfil** ao entrar no site.
- **Login de utilizadores:** Os utilizadores podem fazer login utilizando seu email e password.

### Tweets #️⃣

- **Ver Tweet:** Os utilizadores apenas vêm tweets dos utilizadores que segue, na sua página principal.
- **Publicar Tweet:** Os utilizadores autenticados podem criar tweets.
- **Publicar Imagem:** Os utilizadores podem incluir imagens em seus tweets.
- **Comentar Tweet:** Os utilizadores podem comentar nos tweets.
- **Eliminar Tweet:** Os utilizadores podem eliminar os seus tweets.
- **Eliminar Comentários:** Os utilizadores podem eliminar os seus comentários.


### Interações 👨🏼‍💻

- **Seguir Utilizadores:** Os utilizadores podem seguir outros utilizadores.
- **Feed:** Os utilizadores têm um feed que mostra os tweets dos utilizadores que eles seguem, em ordem cronológica inversa.
- **Gostar tweets:** Os utilizadores podem “gostar” dos tweets de outros utilizadores.

### Backoffice 👨‍💼

- **Gestão de utilizadores:** O administrador pode visualizar, editar e excluir utilizadores.
- **Gestão de tweets:** O administrador pode visualizar, editar e excluir tweets de todos os utilizadores.

### Funcionalidades Extras ➕

- **Pesquisar Utilizadores** Os utilizadores podem pesquisar por utilizadores e ver tanto os seus tweets como segui-los.
- **Tendencias:** Os utilizadores conseguem visualizar quais os três tweets com mais gostos.
- **Quem Seguir** Os utilizadores tem a opção de ver os utilizadores que ainda não seguem.

## Para testar 🔍

Para acessar ao Backoffice tem de iniciar com o email: admin@gmail.com e password: 123456.

No site por motivos de estética todos o site é funcional com a exceção dos botões na lateral esquerda: Explorar, Notificações, Mensagens , Itens Salvos, Comunidades, Premium, Mais, Postar.

## Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas na sua máquina:

Node.js (versão 14.x ou superior)
npm (versão 6.x ou superior)

## Executar o Servidor de Desenvolvimento

Para iniciar o servidor de desenvolvimento, execute:

npm run serve
