# FROM denoland/deno:2.5.4

# WORKDIR /app

# # Copia todo primero
# COPY . .

# # Luego cachea las dependencias
# RUN deno cache -r --lock=deno.lock src/main.ts

# EXPOSE 3000
# CMD ["run", "--allow-write","--allow-net", "--allow-read", "--allow-env", "--allow-ffi", "--unstable-kv", "src/main.ts"]
FROM denoland/deno:2.5.4

WORKDIR /app

# Copiar dependencias primero para aprovechar el caché de Docker
COPY deno.json deno.lock ./
RUN deno install

# Copiar el resto del código
COPY . .

# Cachear las dependencias
RUN deno cache src/main.ts

# Exponer el puerto
EXPOSE 3000

# Ejecutar con permisos necesarios
CMD ["deno", "run", "--allow-all",  "--unstable-kv", "src/main.ts"]