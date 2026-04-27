# widget_cloning_request

widget para clonar solicitações entre servidores

## Como usar o widget

os botões de escolha são preenchidos automaticamente com os servidores de produção de cada solicitação. isso é feito atraves das variáveis de ambiente VITE*CONSUMER_KEY*_ e VITE*CONSUMER_SECRET*_ e VITE*ACCESS_TOKEN*_ e VITE*TOKEN_SECRET*_. portanto, para utilizar o widget, você precisa ter as variáveis de ambiente definidas.

## Como funciona o widget

![alt text](./assets/image.png)

como a imagem mostra, o widget clona solicitações entre servidores. para isso, é necessário que o usuário preencha os campos de solicitação e servidor de destino. depois, o usuário clica no botão de clonagem e o widget realiza a solicitação para o servidor de destino.

para funcionar corretamente:

- O dataset **dsGetParamsClone** deve estar disponível no servidor onde será puxado a solicitação.
- A widget deve ter sido exportado para o servidor onde irá receber a solicitação clonada.
- O processo ao qual o usuário irá clonar deve estar disponível no servidor onde será iniciado o processo de clonagem e liberar a versão.
- Tem que ter o serviço do fluig API cadastrado no servidor de origem e com o nome do serviço igual a **Fluig API**

O que faz o **dsGetParamsClone**?

Este dataset é responsavel por obter os parametros nescessarios para iniciar um processo de clonagem usando o endpoint **start process** do fluigHub. os dados obtidos pelo dataset são os seguintes:

- processInstanceId: identificador do processo de clonagem
- targetState: estado do processo de clonagem
- targetAssignee: usuário que inicia o processo de clonagem
- formFields: dados do formulário de solicitação
- processID: identificador do processo de clonagem
