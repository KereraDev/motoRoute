from pathlib import Path

# Contenido del README
readme_content = """
# 🏍️ MotoRoutes

**MotoRoutes** es una aplicación móvil desarrollada con React Native y Expo, pensada para motociclistas que desean registrar, visualizar y compartir sus rutas de viaje de manera simple e intuitiva.

## 🚀 Funcionalidades

- 📍 Registro de rutas con geolocalización en tiempo real
- 🖼️ Creación de publicaciones con imagen, título y descripción
- 📚 Historias tipo Instagram (una o varias por usuario)
- 💬 Comentarios en publicaciones (modal estilo TikTok)
- 🌙 Modo claro/oscuro automático
- 🧠 Almacenamiento local de imágenes
- 🧭 Navegación con pestañas (home, historias, añadir, amigos, perfil)

## 🛠️ Tecnologías

- **React Native** con **Expo**
- **TypeScript**
- **Zustand** para manejo de estado
- **React Navigation**
- **react-native-maps** y **expo-location**

## 📂 Estructura del proyecto

/app
/components
/screens
/store ← Zustand stores
/types
...


## 🔄 En desarrollo

- 🧑‍💼 Pantalla de perfil de usuario

## 📸 Capturas

*(Aquí puedes agregar imágenes si deseas mostrar UI de la app)*

## 📌 Notas

- No se requiere autenticación
- No tiene backend
- No está desplegada (solo entorno local)

## 🧑‍💻 Autor

Mario Navarro Allende  
📫 [github.com/KereraDev](https://github.com/KereraDev)  
📧 marion.n.navarro@live.com  
📍 Santiago, Chile
"""

# Guardar el archivo como README.md
readme_path = Path("/mnt/data/README_MotoRoutes.md")
readme_path.write_text(readme_content.strip(), encoding="utf-8")

readme_path.name
