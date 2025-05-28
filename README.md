# AO3 Tracker - React Native

## [Todo](TODO.md)

## Get started

1. Install dependencies

   ```bash
   bun install
   ```

2. Start the app

   ```bash
   expo start
   ```

## Development

### Windows

https://github.com/ninja-build/ninja/issues/1900#issuecomment-1817532728 \
didnt work for me. I just moved latest ninja.exe into the sdk dir:
C:\\Users\\\<user\>\\AppData\\Local\\Android\\Sdk\\cmake\\3.22.1\\bin\\

## Notes

- Drizzle
    - https://orm.drizzle.team/docs/connect-expo-sqlite - Expo SQLite migrations with Drizzle Kit
- Webview
    - https://formidable-webview.github.io/webshell/docs/tooling - inline .webjs to import script as string from file
        - Note that with metro, you will need to change the file importing the webjs extension in order to invalidate
          the cache;

## Build

Env
Setup: https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=physical&mode=development-build&buildEnv=local

Building: https://docs.expo.dev/guides/local-app-production/