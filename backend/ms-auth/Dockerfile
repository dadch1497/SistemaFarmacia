# Stage 1: Build with Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy parent and module pom.xml for caching dependencies
COPY pom.xml .
COPY ms-auth/pom.xml ms-auth/
RUN mvn -B dependency:go-offline -pl ms-auth -am || true

# Copy source and build
COPY ms-auth/src ms-auth/src
RUN mvn -B clean package -DskipTests -pl ms-auth -am

# Stage 2: Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/ms-auth/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
