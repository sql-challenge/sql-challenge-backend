# Configuração de Infraestrutura VPS do Zero

> Guia completo com hardening, firewall, isolamento por usuário, múltiplos domínios, SSL e boas práticas de segurança para Ubuntu 22.04 LTS.

---

## Índice

1. [Acesso inicial e atualização do sistema](#1-acesso-inicial-e-atualização-do-sistema)
2. [Criar usuário administrador e desabilitar root](#2-criar-usuário-administrador-e-desabilitar-root)
3. [Hardening do SSH](#3-hardening-do-ssh)
4. [Proteção contra força bruta com Fail2Ban](#4-proteção-contra-força-bruta-com-fail2ban)
5. [Firewall com UFW](#5-firewall-com-ufw)
6. [Grupos e usuários por projeto](#6-grupos-e-usuários-por-projeto)
7. [Estrutura de pastas e permissões](#7-estrutura-de-pastas-e-permissões)
8. [Instalar e configurar o Docker com segurança](#8-instalar-e-configurar-o-docker-com-segurança)
9. [Nginx como reverse proxy](#9-nginx-como-reverse-proxy)
10. [SSL com Let's Encrypt e renovação automática](#10-ssl-com-lets-encrypt-e-renovação-automática)
11. [Segurança do banco de dados PostgreSQL](#11-segurança-do-banco-de-dados-postgresql)
12. [Atualizações automáticas de segurança](#12-atualizações-automáticas-de-segurança)
13. [Monitoramento e logs](#13-monitoramento-e-logs)
14. [Adicionar um novo projeto](#14-adicionar-um-novo-projeto)
15. [Resumo: portas, usuários e domínios](#15-resumo-portas-usuários-e-domínios)

---

## 1. Acesso inicial e atualização do sistema

### 1.1 Primeiro acesso

```bash
ssh root@IP_DA_VPS
```

### 1.2 Atualizar todos os pacotes

```bash
apt update && apt upgrade -y
```

### 1.3 Instalar pacotes essenciais

```bash
apt install -y \
  curl \
  git \
  ufw \
  nano \
  htop \
  fail2ban \
  unattended-upgrades \
  apt-listchanges \
  logwatch \
  auditd
```

---

## 2. Criar usuário administrador e desabilitar root

Trabalhar diretamente como root é uma má prática. Crie um usuário administrador e desative o login root.

### 2.1 Criar o usuário admin

```bash
adduser admin
```

Preencha nome e senha quando solicitado.

### 2.2 Conceder permissão de sudo

```bash
usermod -aG sudo admin
```

### 2.3 Copiar as chaves SSH do root para o admin

Se você acessou como root com chave SSH, copie-a para o novo usuário:

```bash
rsync --archive --chown=admin:admin ~/.ssh /home/admin
```

### 2.4 Testar o acesso com o novo usuário

**Abra um novo terminal** (não feche o root ainda) e teste:

```bash
ssh admin@IP_DA_VPS
sudo whoami   # deve retornar: root
```

Só prossiga se o acesso funcionou.

### 2.5 Desabilitar login direto como root via SSH

```bash
sudo passwd -l root   # bloqueia a senha do root localmente
```

O root via SSH será desabilitado na etapa de hardening do SSH.

---

## 3. Hardening do SSH

### 3.1 Gerar chave SSH no seu computador local (se ainda não tiver)

No seu computador (não na VPS):

```bash
ssh-keygen -t ed25519 -C "seu-email@exemplo.com" -f ~/.ssh/vps_key
```

Copiar a chave pública para a VPS:

```bash
ssh-copy-id -i ~/.ssh/vps_key.pub admin@IP_DA_VPS
```

### 3.2 Editar a configuração do SSH

Na VPS:

```bash
sudo nano /etc/ssh/sshd_config
```

Aplique as seguintes configurações:

```
# ─── Porta ────────────────────────────────────────────────────────
# Trocar de 22 para uma porta não-padrão dificulta scans automáticos.
# Escolha qualquer porta entre 1024 e 65535. Ex: 2222
Port 2222

# ─── Protocolo e versão ───────────────────────────────────────────
Protocol 2

# ─── Acesso root ──────────────────────────────────────────────────
PermitRootLogin no

# ─── Autenticação ─────────────────────────────────────────────────
# Desabilitar senha — apenas chave SSH
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes

# ─── Chave pública ────────────────────────────────────────────────
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys

# ─── Limites de sessão ────────────────────────────────────────────
LoginGraceTime 30
MaxAuthTries 3
MaxSessions 5
MaxStartups 3:50:10

# ─── Usuários permitidos ──────────────────────────────────────────
# Somente o usuário admin pode conectar por SSH
AllowUsers admin

# ─── Segurança adicional ──────────────────────────────────────────
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no
PrintLastLog yes

# ─── Keepalive ────────────────────────────────────────────────────
ClientAliveInterval 300
ClientAliveCountMax 2
```

### 3.3 Reiniciar o SSH

```bash
sudo systemctl restart sshd
```

### 3.4 Atualizar o comando de acesso

A partir de agora, conecte assim:

```bash
ssh -i ~/.ssh/vps_key -p 2222 admin@IP_DA_VPS
```

Crie um alias no seu computador para facilitar:

```bash
# No seu computador, editar ~/.ssh/config
nano ~/.ssh/config
```

```
Host vps
    HostName IP_DA_VPS
    User admin
    Port 2222
    IdentityFile ~/.ssh/vps_key
```

Agora basta usar `ssh vps`.

---

## 4. Proteção contra força bruta com Fail2Ban

O Fail2Ban monitora logs e bloqueia IPs que fazem muitas tentativas de login.

### 4.1 Configurar o Fail2Ban para o SSH

```bash
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
# Banir por 1 hora após 3 tentativas falhas em 10 minutos
bantime  = 3600
findtime = 600
maxretry = 3
backend  = systemd

# Notificação por email (opcional)
# destemail = seu@email.com
# action = %(action_mwl)s

[sshd]
enabled  = true
port     = 2222
filter   = sshd
logpath  = /var/log/auth.log
maxretry = 3
bantime  = 86400   # 24 horas para SSH
```

```bash
sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# Verificar status
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

---

## 5. Firewall com UFW

### 5.1 Política padrão — negar tudo

```bash
# Bloquear todo tráfego de entrada por padrão
sudo ufw default deny incoming

# Permitir todo tráfego de saída
sudo ufw default allow outgoing
```

### 5.2 Liberar portas essenciais

```bash
# SSH (use a porta que configurou, ex: 2222)
sudo ufw allow 2222/tcp comment 'SSH'

# HTTP
sudo ufw allow 80/tcp comment 'HTTP'

# HTTPS
sudo ufw allow 443/tcp comment 'HTTPS'
```

### 5.3 Restringir acesso ao banco de dados

O PostgreSQL **nunca deve ser exposto publicamente**. Libere apenas o seu IP:

```bash
# Descobrir seu IP público (no seu computador)
curl ifconfig.me

# Na VPS: liberar PostgreSQL somente para o seu IP
sudo ufw allow from SEU_IP_PUBLICO to any port 5432 proto tcp comment 'PostgreSQL admin'
```

> Para administração sem abrir porta, use túnel SSH (mais seguro):
> ```bash
> ssh -L 5432:localhost:5432 vps
> ```

### 5.4 Ativar o firewall

```bash
sudo ufw enable

# Confirmar as regras
sudo ufw status verbose
```

Saída esperada:

```
Status: active

To                         Action      From
--                         ------      ----
2222/tcp                   ALLOW IN    Anywhere        # SSH
80/tcp                     ALLOW IN    Anywhere        # HTTP
443/tcp                    ALLOW IN    Anywhere        # HTTPS
5432/tcp                   ALLOW IN    SEU_IP          # PostgreSQL admin
```

### 5.5 Prevenir que o Docker contorne o UFW

Por padrão, o Docker manipula o iptables diretamente e pode expor portas de containers mesmo com o UFW bloqueando.

```bash
sudo nano /etc/docker/daemon.json
```

```json
{
  "iptables": false,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
sudo systemctl restart docker
```

> Com `iptables: false`, as portas dos containers só ficam acessíveis via Nginx, nunca diretamente pela internet.

---

## 6. Grupos e usuários por projeto

Cada projeto roda com um usuário do sistema dedicado, sem shell de login. Isso garante que um projeto comprometido não afeta os outros.

### 6.1 Criar o grupo de aplicações

```bash
sudo groupadd webapps
```

### 6.2 Criar usuário para o SQL Challenge

```bash
sudo useradd \
  --system \
  --no-create-home \
  --shell /usr/sbin/nologin \
  --gid webapps \
  --comment "SQL Challenge service user" \
  sqlchallenge
```

Flags utilizadas:
- `--system` — usuário de serviço (não aparece no login)
- `--no-create-home` — sem pasta home
- `--shell /usr/sbin/nologin` — não pode fazer login interativo
- `--gid webapps` — grupo primário é webapps

### 6.3 Adicionar o usuário admin ao grupo webapps

Para que o admin possa gerenciar arquivos dos projetos sem virar root:

```bash
sudo usermod -aG webapps admin
sudo usermod -aG docker admin
```

Faça logout e login para aplicar:

```bash
exit
ssh vps
groups   # deve incluir webapps e docker
```

### 6.4 Modelo para qualquer novo projeto

```bash
sudo useradd \
  --system \
  --no-create-home \
  --shell /usr/sbin/nologin \
  --gid webapps \
  --comment "NOME_PROJETO service user" \
  NOME_PROJETO
```

---

## 7. Estrutura de pastas e permissões

### 7.1 Estrutura base

```
/opt/apps/
├── sql-challenge/
│   ├── backend/            ← repositório clonado (dono: sqlchallenge:webapps, 750)
│   └── .env                ← variáveis de produção  (dono: sqlchallenge:webapps, 640)
├── projeto-dois/
│   ├── app/
│   └── .env
└── projeto-tres/
    ├── app/
    └── .env
```

### 7.2 Criar a estrutura para o SQL Challenge

```bash
# Criar diretório base
sudo mkdir -p /opt/apps/sql-challenge

# Definir dono e grupo
sudo chown sqlchallenge:webapps /opt/apps/sql-challenge

# Permissões:
# 7 (dono: lê, escreve, executa) 5 (grupo: lê, executa) 0 (outros: nada)
sudo chmod 750 /opt/apps/sql-challenge

# Clonar o repositório
sudo -u sqlchallenge git clone \
  https://github.com/sql-challenge/sql-challenge-backend.git \
  /opt/apps/sql-challenge/backend

# Criar o .env de produção
sudo nano /opt/apps/sql-challenge/.env
sudo chown sqlchallenge:webapps /opt/apps/sql-challenge/.env

# .env só pode ser lido pelo dono e pelo grupo — nunca por outros
sudo chmod 640 /opt/apps/sql-challenge/.env

# Linkar o .env para dentro do projeto
sudo ln -s /opt/apps/sql-challenge/.env /opt/apps/sql-challenge/backend/.env
```

### 7.3 Verificar as permissões

```bash
ls -la /opt/apps/
ls -la /opt/apps/sql-challenge/
```

Saída esperada:

```
drwxr-x--- sqlchallenge webapps  sql-challenge/
drwxr-x--- sqlchallenge webapps  backend/
-rw-r----- sqlchallenge webapps  .env
```

---

## 8. Instalar e configurar o Docker com segurança

### 8.1 Instalar o Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker admin
newgrp docker
```

### 8.2 Configurar o daemon do Docker

Já feito na seção 5.5. Confirmar:

```bash
cat /etc/docker/daemon.json
```

```json
{
  "iptables": false,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### 8.3 Subir os containers do SQL Challenge

```bash
cd /opt/apps/sql-challenge/backend
docker compose up --build -d

# Verificar
docker compose ps
docker compose logs api
```

### 8.4 Boas práticas no docker-compose.yml

O `docker-compose.yml` do projeto já segue as boas práticas abaixo. Confirme que estão presentes:

```yaml
services:
  api:
    # Reiniciar automaticamente se cair
    restart: unless-stopped

    # Não expor a porta diretamente — só o Nginx acessa
    # ports: NÃO listar aqui em produção
    expose:
      - "3000"

    # Limitar recursos para não derrubar outros projetos
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  db:
    restart: unless-stopped
    # Banco exposto só localmente — nunca para 0.0.0.0 em produção
    ports:
      - "127.0.0.1:5432:5432"
```

> A diferença entre `ports: "5432:5432"` e `ports: "127.0.0.1:5432:5432"` é crítica: a primeira expõe para o mundo, a segunda só para a própria VPS.

---

## 9. Nginx como reverse proxy

O Nginx recebe todo o tráfego externo e repassa para o container correto com base no domínio. Nenhuma porta de aplicação fica exposta diretamente.

### 9.1 Instalar o Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 9.2 Remover o site padrão

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 9.3 Criar configuração para o SQL Challenge

```bash
sudo nano /etc/nginx/sites-available/sql-challenge
```

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    # Segurança: tamanho máximo do body
    client_max_body_size 10M;

    # Timeout
    proxy_read_timeout 60s;
    proxy_connect_timeout 10s;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # Headers necessários para o backend
        proxy_set_header Upgrade          $http_upgrade;
        proxy_set_header Connection       'upgrade';
        proxy_set_header Host             $host;
        proxy_set_header X-Real-IP        $remote_addr;
        proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass                $http_upgrade;
    }

    # Ocultar versão do Nginx nos erros
    server_tokens off;
}
```

### 9.4 Adicionar cabeçalhos globais de segurança

```bash
sudo nano /etc/nginx/conf.d/security-headers.conf
```

```nginx
# Impede que o browser interprete o tipo MIME de forma errada
add_header X-Content-Type-Options    "nosniff"           always;

# Impede que a página seja carregada em iframe (clickjacking)
add_header X-Frame-Options           "DENY"              always;

# Ativa o filtro XSS do browser
add_header X-XSS-Protection          "1; mode=block"     always;

# Força HTTPS por 1 ano após o primeiro acesso seguro
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Controla quais origens podem carregar recursos
add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
```

### 9.5 Ativar o site e testar

```bash
sudo ln -s /etc/nginx/sites-available/sql-challenge /etc/nginx/sites-enabled/

# Testar a sintaxe
sudo nginx -t

# Recarregar
sudo systemctl reload nginx
```

### 9.6 Adicionar um segundo domínio (modelo)

```bash
sudo nano /etc/nginx/sites-available/projeto-dois
```

```nginx
server {
    listen 80;
    server_name api.outrodominio.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host             $host;
        proxy_set_header X-Real-IP        $remote_addr;
        proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    server_tokens off;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/projeto-dois /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 10. SSL com Let's Encrypt e renovação automática

### 10.1 Instalar o Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 10.2 Gerar certificado para o SQL Challenge

```bash
sudo certbot --nginx -d api.seudominio.com
```

O Certbot vai:
1. Verificar que o domínio aponta para a VPS
2. Gerar o certificado
3. Atualizar automaticamente o arquivo do Nginx com HTTPS
4. Configurar redirecionamento HTTP → HTTPS

### 10.3 Gerar para outros domínios

```bash
sudo certbot --nginx -d api.outrodominio.com
```

### 10.4 Verificar a renovação automática

```bash
# O Certbot instala um timer automático
sudo systemctl status certbot.timer

# Simular uma renovação para testar
sudo certbot renew --dry-run
```

Os certificados são renovados automaticamente quando faltam menos de 30 dias para expirar.

### 10.5 Configuração HTTPS resultante (gerada pelo Certbot)

Após o Certbot, o arquivo do Nginx fica assim:

```nginx
server {
    listen 443 ssl;
    server_name api.seudominio.com;

    ssl_certificate     /etc/letsencrypt/live/api.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seudominio.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        ...
    }
}

# Redirecionar HTTP para HTTPS automaticamente
server {
    listen 80;
    server_name api.seudominio.com;
    return 301 https://$host$request_uri;
}
```

---

## 11. Segurança do banco de dados PostgreSQL

### 11.1 Porta exposta apenas localmente

Confirmar no `docker-compose.yml` que o banco está vinculado ao `127.0.0.1`:

```yaml
db:
  ports:
    - "127.0.0.1:5432:5432"
```

### 11.2 Nunca usar senha padrão

No `.env` de produção use uma senha forte:

```bash
# Gerar senha aleatória de 32 caracteres
openssl rand -base64 32
```

### 11.3 Acessar o banco de fora da VPS com segurança

Sempre via túnel SSH — sem abrir a porta 5432 publicamente:

```bash
# No seu computador
ssh -L 5432:localhost:5432 vps
```

Depois conecte no DBeaver/TablePlus em `localhost:5432`.

### 11.4 Backup automático do banco

```bash
sudo nano /opt/apps/sql-challenge/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/apps/sql-challenge/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec sql-challenge-db pg_dump \
  -U challenge_user \
  -d db_gestao \
  --no-password \
  | gzip > $BACKUP_DIR/db_gestao_$DATE.sql.gz

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup concluído: db_gestao_$DATE.sql.gz"
```

```bash
sudo chmod +x /opt/apps/sql-challenge/backup.sh
sudo chown sqlchallenge:webapps /opt/apps/sql-challenge/backup.sh
```

Agendar via cron para rodar todo dia às 3h:

```bash
sudo crontab -u sqlchallenge -e
```

```
0 3 * * * /opt/apps/sql-challenge/backup.sh >> /opt/apps/sql-challenge/backup.log 2>&1
```

---

## 12. Atualizações automáticas de segurança

### 12.1 Configurar unattended-upgrades

```bash
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Garantir que as linhas abaixo estão ativas:

```
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};

// Remover pacotes desnecessários após atualizar
Unattended-Upgrade::Remove-Unused-Dependencies "true";

// Reiniciar automaticamente se necessário (madrugada)
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:30";
```

### 12.2 Ativar

```bash
sudo nano /etc/apt/apt.conf.d/20auto-upgrades
```

```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
```

---

## 13. Monitoramento e logs

### 13.1 Verificar logs do sistema

```bash
# Logs de autenticação SSH
sudo tail -f /var/log/auth.log

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs dos containers
docker compose -f /opt/apps/sql-challenge/backend/docker-compose.yml logs -f
```

### 13.2 Verificar tentativas de invasão bloqueadas

```bash
# IPs banidos pelo Fail2Ban
sudo fail2ban-client status sshd

# Desbanir um IP manualmente (se necessário)
sudo fail2ban-client set sshd unbanip IP_A_DESBANIR
```

### 13.3 Monitorar uso de recursos

```bash
# Uso geral da VPS
htop

# Uso dos containers Docker
docker stats

# Espaço em disco
df -h

# Espaço usado por cada projeto
du -sh /opt/apps/*
```

---

## 14. Adicionar um novo projeto

Checklist completo para adicionar qualquer projeto à mesma VPS:

```bash
# ─── 1. Usuário de serviço ────────────────────────────────────────
sudo useradd \
  --system \
  --no-create-home \
  --shell /usr/sbin/nologin \
  --gid webapps \
  NOME_PROJETO

# ─── 2. Pasta e permissões ────────────────────────────────────────
sudo mkdir -p /opt/apps/NOME_PROJETO
sudo chown NOME_PROJETO:webapps /opt/apps/NOME_PROJETO
sudo chmod 750 /opt/apps/NOME_PROJETO

# ─── 3. Clonar repositório ────────────────────────────────────────
sudo -u NOME_PROJETO git clone URL_DO_REPO /opt/apps/NOME_PROJETO/app

# ─── 4. Criar e proteger o .env ───────────────────────────────────
sudo nano /opt/apps/NOME_PROJETO/.env
sudo chown NOME_PROJETO:webapps /opt/apps/NOME_PROJETO/.env
sudo chmod 640 /opt/apps/NOME_PROJETO/.env
sudo ln -s /opt/apps/NOME_PROJETO/.env /opt/apps/NOME_PROJETO/app/.env

# ─── 5. Subir os containers ───────────────────────────────────────
cd /opt/apps/NOME_PROJETO/app
docker compose up --build -d

# ─── 6. Nginx ─────────────────────────────────────────────────────
sudo nano /etc/nginx/sites-available/NOME_PROJETO
sudo ln -s /etc/nginx/sites-available/NOME_PROJETO /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# ─── 7. SSL ───────────────────────────────────────────────────────
sudo certbot --nginx -d dominio.do.projeto.com

# ─── 8. Backup ────────────────────────────────────────────────────
# Criar script de backup e agendar no cron do usuário do projeto
```

---

## 15. Resumo: portas, usuários e domínios

### Projetos e usuários

| Projeto | Usuário do sistema | Pasta | Porta API | Porta DB |
|---|---|---|---|---|
| SQL Challenge | sqlchallenge | /opt/apps/sql-challenge | 3000 | 5432 |
| Projeto Dois | projetodois | /opt/apps/projeto-dois | 3001 | 5433 |
| Projeto Três | projetotres | /opt/apps/projeto-tres | 3002 | 5434 |

### Portas abertas no firewall

| Porta | Protocolo | Origem | Motivo |
|---|---|---|---|
| 2222 | TCP | Qualquer | SSH (porta não-padrão) |
| 80 | TCP | Qualquer | HTTP → redirecionado para HTTPS |
| 443 | TCP | Qualquer | HTTPS (Nginx) |
| 5432 | TCP | Seu IP | PostgreSQL (administração remota) |

> Nenhuma porta de API (3000, 3001, etc.) fica exposta. Todo acesso externo passa pelo Nginx na 443.

### Fluxo de uma requisição

```
Internet
    │
    ▼
VPS :443 (HTTPS)
    │
    ▼
Nginx (reverse proxy)
    │
    ├── api.dominio1.com  →  localhost:3000  →  container sql-challenge-api
    ├── api.dominio2.com  →  localhost:3001  →  container projeto-dois-api
    └── api.dominio3.com  →  localhost:3002  →  container projeto-tres-api
```

---

> Este guia foi escrito para **Ubuntu 22.04 LTS**. Para outras distribuições, os caminhos de arquivos e gerenciador de pacotes podem variar.
