# Stage 1: Build with Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy parent and all module pom.xml files for complete module tree
COPY pom.xml .
COPY eureka-server/pom.xml eureka-server/
COPY api-gateway/pom.xml api-gateway/
COPY ms-auth/pom.xml ms-auth/
COPY ms-catalogo/pom.xml ms-catalogo/
COPY ms-inventario/pom.xml ms-inventario/
COPY ms-compras/pom.xml ms-compras/
COPY ms-ventas/pom.xml ms-ventas/
COPY ms-reportes/pom.xml ms-reportes/

# Copy source and build
COPY api-gateway/src api-gateway/src
RUN mvn -B clean package -DskipTests -pl api-gateway -am

# Stage 2: Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
