# Stage 1: Build with Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy parent and module pom.xml for caching dependencies
COPY pom.xml .
COPY ms-ventas/pom.xml ms-ventas/
RUN mvn -B dependency:go-offline -pl ms-ventas -am || true

# Copy source and build
COPY ms-ventas/src ms-ventas/src
RUN mvn -B clean package -DskipTests -pl ms-ventas -am

# Stage 2: Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/ms-ventas/target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
