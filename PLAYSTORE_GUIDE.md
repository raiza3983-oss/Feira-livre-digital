# Guia para Publicação na Play Store & Configuração Final

Seu aplicativo está pronto para ser empacotado! Aqui estão os passos para transformá-lo em um aplicativo Android e garantir que o login do Google e as notificações funcionem corretamente.

## 1. Transformando em App Android (Capacitor)

Este projeto é baseado em React. Para colocá-lo na Play Store, o caminho mais rápido é usar o **Capacitor**.

1. Instale o Capacitor no seu projeto baixado:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init
   ```
2. Gere o build de produção:
   ```bash
   npm run build
   ```
3. Adicione a plataforma Android:
   ```bash
   npx cap add android
   npx cap copy
   npx cap open android
   ```

## 2. Configuração no Console do Firebase

Para que o **Login com Google** funcione no Android, você precisa registrar o app Android no seu projeto Firebase:

1. Vá para o [Console do Firebase](https://console.firebase.google.com/).
2. Adicione um novo app **Android**.
3. Use o "Package Name" que você definiu no `npx cap init` (ex: `com.meuapp.app`).
4. **IMPORTANTE:** Você deve fornecer o certificado **SHA-1** da sua chave de assinatura (debug e release). Sem isso, o Google Login será bloqueado com erro 12500 ou similar.
5. Baixe o arquivo `google-services.json` e coloque-o na pasta `android/app/`.

## 3. Domínios Autorizados

Se você for usar o app via Web ou em um domínio próprio:
1. No Console do Firebase, vá em **Authentication** > **Settings** > **Authorized Domains**.
2. Adicione seu domínio (ex: `meuapp.com.br`).

## 4. Notificações Push (FCM)

O código já possui a lógica básica para pedir permissão de notificações. Para notificações reais (Push) enviadas pelo seu servidor:
1. Use o plugin `@capacitor/push-notifications`.
2. Configure o Firebase Cloud Messaging no console.
3. Siga o guia do Capacitor para registrar os tokens de cada dispositivo no seu banco de dados Firestore.

## 6. Portabilidade do Entrar com Google (APK/Android)

Para que o login funcione quando você transformar seu site em um app (.apk), siga estas regras fundamentais:

*   **Identidade do App:** O Firebase precisa saber que o seu APK é oficial. Para isso, você deve gerar uma chave de assinatura no Android Studio (ou via linha de comando `keytool`) e pegar o código **SHA-1**.
*   **Registro no Console:** No Console do Firebase, nas configurações do seu App Android, você **deve** inserir esse SHA-1. Sem isso, o Google vai negar o acesso com uma mensagem de erro genérica.
*   **Configuração de Redirect:** Como o APK não é acessado por uma URL (como `meuapp.com`), o Firebase Auth usa um mecanismo especial. No Android, o arquivo `google-services.json` cuida disso para você.

**Dica Pro:** Se o `signInWithPopup` não funcionar bem dentro do APK, considere mudar para `signInWithRedirect` no seu arquivo `src/firebase.ts` quando estiver rodando em ambiente mobile, ou utilize o plugin `@capacitor-firebase/authentication` que oferece o login nativo (aquele que abre a janelinha do Android diretamente com suas contas do celular).

---
Boa sorte com o lançamento na Play Store!
