# Stage 1: Build with Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy parent and module pom.xml for caching dependencies
COPY pom.xml .
COPY api-gateway/pom.xml api-gateway/
RUN mvn -B dependency:go-offline -pl api-gateway -am || true

# Copy source and build
COPY api-gateway/src api-gateway/src
RUN mvn -B clean package -DskipTests -pl api-gateway -am

# Stage 2: Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
