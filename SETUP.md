# ECK Chat Manager — Setup

Basado en [Altus](https://github.com/amanharwara/altus) (GPL-3.0).

## Repos necesarios en GitHub

1. **Código (privado)**: `CarlosTorrezC/eck-chat-manager`
2. **Releases (público)**: `CarlosTorrezC/eck-chat-manager-releases`

## Secret necesario en el repo de código

Settings → Secrets and variables → Actions → New repository secret:

- Nombre: `RELEASES_TOKEN`
- Valor: Personal Access Token con permiso de escritura al repo de releases
  - Crear en: https://github.com/settings/personal-access-tokens/new
  - Fine-grained token
  - Repository access: solo `eck-chat-manager-releases`
  - Permissions → Repository → Contents: **Read and write**

## Desarrollo local (Mac)

```bash
corepack enable
yarn install
yarn start
```

## Publicar nueva versión

```bash
# 1. Subir cambio
git commit -am "fix: descripcion del cambio"
git push

# 2. Subir versión
npm version patch    # 1.0.0 → 1.0.1
git push --tags      # dispara GitHub Actions → build + release automático
```

El admin recibe la actualización automáticamente dentro de 1 hora
(o al reiniciar la app).

## Instalador inicial para el admin

Después del primer release, descargar el `.exe` desde:
https://github.com/CarlosTorrezC/eck-chat-manager-releases/releases

Al ejecutar: Windows Defender mostrará "Windows protegió tu PC".
→ "Más información" → "Ejecutar de todos modos"
